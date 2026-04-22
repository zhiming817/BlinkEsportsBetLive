-- 为 matches 表添加 Solana 关联字段
ALTER TABLE `matches` 
ADD COLUMN `solana_match_id` VARCHAR(64) DEFAULT NULL COMMENT 'Solana 链上的比赛 ID' AFTER `winner_id`,
ADD COLUMN `solana_match_pda` VARCHAR(44) DEFAULT NULL COMMENT 'Solana 比赛池 PDA 地址' AFTER `solana_match_id`,
ADD COLUMN `solana_tx_signature` VARCHAR(128) DEFAULT NULL COMMENT '初始化比赛的交易哈希' AFTER `solana_match_pda`;

-- 为 solana_match_id 添加索引，方便后续通过链上 ID 快速查询
CREATE INDEX `idx_solana_match_id` ON `matches`(`solana_match_id`);
