use crate::models::{match_entity, team_entity};
use crate::services::DatabaseService;
use crate::config::PandascoreConfig;
use sea_orm::*;
use serde::Deserialize;
use std::sync::Arc;
use chrono::{DateTime, Utc};
use reqwest::Client;
use anyhow::{Result, Context};

#[derive(Debug, Deserialize)]
struct PandascoreMatch {
    id: u32,
    league_id: u32,
    number_of_games: i32,
    begin_at: Option<DateTime<Utc>>,
    status: String,
    winner_id: Option<u32>,
    opponents: Vec<PandascoreOpponent>,
    streams_list: Vec<PandascoreStream>,
}

#[derive(Debug, Deserialize)]
struct PandascoreOpponent {
    opponent: PandascoreTeam,
}

#[derive(Debug, Deserialize)]
struct PandascoreTeam {
    id: u32,
    name: String,
    slug: String,
    image_url: Option<String>,
}

#[derive(Debug, Deserialize)]
struct PandascoreStream {
    embed_url: Option<String>,
    main: bool,
}

pub struct PandascoreService {
    db: Arc<DatabaseService>,
    config: PandascoreConfig,
    client: Client,
}

impl PandascoreService {
    pub fn new(db: Arc<DatabaseService>, config: PandascoreConfig) -> Self {
        Self {
            db,
            config,
            client: Client::new(),
        }
    }

    pub async fn sync_upcoming_matches(&self, league_id: Option<u32>) -> Result<usize> {
        let league_id = league_id.unwrap_or(self.config.default_league_id);
        let url = format!("{}/leagues/{}/matches/upcoming", self.config.api_url, league_id);
        
        println!("🔄 正在同步联赛 {} 的赛事...", league_id);

        let response = self.client.get(&url)
            .header("accept", "application/json")
            .header("Authorization", format!("Bearer {}", self.config.api_token))
            .query(&[("per_page", "5")])
            .send()
            .await
            .context("无法向 Pandascore API 发送请求")?;

        if !response.status().is_success() {
            let err_text = response.text().await?;
            return Err(anyhow::anyhow!("Pandascore API 返回错误: {}", err_text));
        }

        let ps_matches: Vec<PandascoreMatch> = response.json().await?;
        let match_count = ps_matches.len();
        println!("✅ 从接口获取到 {} 场赛事", match_count);

        let db = self.db.get_db();

        for ps_match in ps_matches {
            // 1. 同步战队
            if ps_match.opponents.len() < 2 {
                println!("⚠️ 赛事 {} 战队信息不足，跳过", ps_match.id);
                continue;
            }

            let opponent_a = &ps_match.opponents[0].opponent;
            let opponent_b = &ps_match.opponents[1].opponent;

            self.sync_team(opponent_a).await?;
            self.sync_team(opponent_b).await?;

            // 2. 同步赛事
            let embed_url = ps_match.streams_list.iter()
                .find(|s| s.main)
                .and_then(|s| s.embed_url.clone())
                .or_else(|| ps_match.streams_list.first().and_then(|s| s.embed_url.clone()));

            let existing_match = match_entity::Entity::find_by_id(ps_match.id)
                .one(db)
                .await?;

            let status = match ps_match.status.as_str() {
                "not_started" => "upcoming",
                "postponed" => "upcoming",
                "canceled" => "canceled",
                "running" => "running",
                "finished" => "finished",
                _ => "upcoming",
            };

            if let Some(m) = existing_match {
                let mut active: match_entity::ActiveModel = m.into();
                active.status = Set(status.to_string());
                active.winner_id = Set(ps_match.winner_id);
                active.embed_url = Set(embed_url);
                active.updated_at = Set(Utc::now());
                active.update(db).await?;
            } else {
                let new_match = match_entity::ActiveModel {
                    id: Set(ps_match.id),
                    league_id: Set(ps_match.league_id),
                    team_a_id: Set(opponent_a.id),
                    team_b_id: Set(opponent_b.id),
                    number_of_games: Set(ps_match.number_of_games),
                    start_at: Set(ps_match.begin_at.unwrap_or(Utc::now())),
                    status: Set(status.to_string()),
                    winner_id: Set(ps_match.winner_id),
                    is_featured: Set(false),
                    embed_url: Set(embed_url),
                    updated_at: Set(Utc::now()),
                    ..Default::default()
                };
                new_match.insert(db).await?;
                println!("✨ 已创建新赛事: {} (ID: {})", opponent_a.name, ps_match.id);
            }
        }

        Ok(match_count)
    }

    async fn sync_team(&self, team: &PandascoreTeam) -> Result<()> {
        let db = self.db.get_db();
        let existing_team = team_entity::Entity::find_by_id(team.id)
            .one(db)
            .await?;

        if let Some(t) = existing_team {
            let mut active: team_entity::ActiveModel = t.into();
            active.name = Set(team.name.clone());
            active.image_url = Set(team.image_url.clone());
            active.slug = Set(team.slug.clone());
            active.update(db).await?;
        } else {
            let new_team = team_entity::ActiveModel {
                id: Set(team.id),
                name: Set(team.name.clone()),
                image_url: Set(team.image_url.clone()),
                slug: Set(team.slug.clone()),
                ..Default::default()
            };
            new_team.insert(db).await?;
            println!("🛡️ 已同步战队: {}", team.name);
        }
        Ok(())
    }
}
