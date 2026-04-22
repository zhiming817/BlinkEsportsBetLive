use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "teams")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: u32,
    pub name: String,
    pub acronym: Option<String>,
    #[sea_orm(unique)]
    pub slug: String,
    pub location: Option<String>,
    pub image_url: Option<String>,
    pub dark_mode_image_url: Option<String>,
    pub modified_at: Option<DateTime>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl Related<super::match_entity::Entity> for Entity {
    fn to() -> RelationDef {
        super::match_entity::Relation::TeamA.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
