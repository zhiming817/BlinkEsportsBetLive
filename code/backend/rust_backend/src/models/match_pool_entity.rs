use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "match_pools")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: u32,
    pub match_id: u32,
    pub pda_address: String,
    pub total_pool_a: Decimal,
    pub total_pool_b: Decimal,
    pub is_settled: i8,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::match_entity::Entity",
        from = "Column::MatchId",
        to = "super::match_entity::Column::Id"
    )]
    Match,
}

impl Related<super::match_entity::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Match.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
