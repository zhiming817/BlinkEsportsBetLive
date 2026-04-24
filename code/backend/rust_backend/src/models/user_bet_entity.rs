use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "user_bets")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: u32,
    pub user_id: u32,
    pub wallet_address: String,
    pub match_id: u32,
    pub tx_hash: String,
    pub side: i8,
    pub amount: Decimal,
    pub claim_status: i8,
    pub created_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::match_entity::Entity",
        from = "Column::MatchId",
        to = "super::match_entity::Column::Id"
    )]
    Match,
    #[sea_orm(
        belongs_to = "super::user_entity::Entity",
        from = "Column::UserId",
        to = "super::user_entity::Column::Id"
    )]
    User,
}

impl Related<super::match_entity::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Match.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
