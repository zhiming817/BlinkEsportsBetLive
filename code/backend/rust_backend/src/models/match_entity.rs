use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "matches")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: u32,
    pub league_id: u32,
    pub team_a_id: u32,
    pub team_b_id: u32,
    pub number_of_games: i32,
    pub start_at: DateTimeUtc,
    pub status: String,
    pub winner_id: Option<u32>,
    pub solana_match_id: Option<String>,
    pub solana_match_pda: Option<String>,
    pub solana_tx_signature: Option<String>,
    pub is_featured: bool,
    pub embed_url: Option<String>,
    pub updated_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::team_entity::Entity",
        from = "Column::TeamAId",
        to = "super::team_entity::Column::Id"
    )]
    TeamA,
    #[sea_orm(
        belongs_to = "super::team_entity::Entity",
        from = "Column::TeamBId",
        to = "super::team_entity::Column::Id"
    )]
    TeamB,
}

impl Related<super::team_entity::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::TeamA.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
