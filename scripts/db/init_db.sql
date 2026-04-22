-- BlinkBet Database Initialization Script
-- Version: v1.0
-- Database: MySQL 8.0+

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户内部 ID',
  `wallet_address` VARCHAR(44) NOT NULL COMMENT 'Solana 公钥',
  `username` VARCHAR(100) DEFAULT NULL COMMENT '用户名',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wallet_address` (`wallet_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ----------------------------
-- Table structure for leagues
-- ----------------------------
CREATE TABLE IF NOT EXISTS `leagues` (
  `id` INT UNSIGNED NOT NULL COMMENT 'PandaScore League ID',
  `slug` VARCHAR(100) NOT NULL COMMENT '联赛标识',
  `name` VARCHAR(100) NOT NULL COMMENT '联赛全名',
  `season` VARCHAR(50) DEFAULT NULL COMMENT '赛季',
  `year` INT DEFAULT NULL COMMENT '年度',
  `image_url` VARCHAR(255) DEFAULT NULL COMMENT '联赛 Logo URL',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='联赛表';

-- ----------------------------
-- Table structure for teams
-- ----------------------------
CREATE TABLE IF NOT EXISTS `teams` (
  `id` INT UNSIGNED NOT NULL COMMENT 'PandaScore Team ID',
  `name` VARCHAR(100) NOT NULL COMMENT '战队全称',
  `acronym` VARCHAR(20) DEFAULT NULL COMMENT '战队简称',
  `slug` VARCHAR(100) NOT NULL COMMENT '战队标识',
  `location` VARCHAR(10) DEFAULT NULL COMMENT '所在地',
  `image_url` VARCHAR(255) DEFAULT NULL COMMENT '常用 Logo',
  `dark_mode_image_url` VARCHAR(255) DEFAULT NULL COMMENT '深色模式 Logo',
  `modified_at` DATETIME DEFAULT NULL COMMENT '外部数据更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='战队表';

-- ----------------------------
-- Table structure for matches
-- ----------------------------
CREATE TABLE IF NOT EXISTS `matches` (
  `id` INT UNSIGNED NOT NULL COMMENT 'PandaScore 的赛事 ID',
  `league_id` INT UNSIGNED NOT NULL COMMENT '关联 leagues.id',
  `team_a_id` INT UNSIGNED NOT NULL COMMENT '关联 teams.id',
  `team_b_id` INT UNSIGNED NOT NULL COMMENT '关联 teams.id',
  `number_of_games` INT NOT NULL DEFAULT '1' COMMENT '局数 (1:BO1, 3:BO3, 5:BO5)',
  `start_at` DATETIME NOT NULL COMMENT '赛事开始/下注截止时间',
  `status` ENUM('upcoming', 'running', 'finished', 'canceled') NOT NULL DEFAULT 'upcoming' COMMENT '赛事状态',
  `winner_id` INT UNSIGNED DEFAULT NULL COMMENT '胜方 team_id',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_league_id` (`league_id`),
  KEY `idx_team_a_id` (`team_a_id`),
  KEY `idx_team_b_id` (`team_b_id`),
  KEY `idx_start_at` (`start_at`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_match_league` FOREIGN KEY (`league_id`) REFERENCES `leagues` (`id`),
  CONSTRAINT `fk_match_team_a` FOREIGN KEY (`team_a_id`) REFERENCES `teams` (`id`),
  CONSTRAINT `fk_match_team_b` FOREIGN KEY (`team_b_id`) REFERENCES `teams` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事表';

-- ----------------------------
-- Table structure for match_pools
-- ----------------------------
CREATE TABLE IF NOT EXISTS `match_pools` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `match_id` INT UNSIGNED NOT NULL COMMENT '关联 matches.id',
  `pda_address` VARCHAR(44) NOT NULL COMMENT '链上合约奖池地址',
  `total_pool_a` DECIMAL(20,9) NOT NULL DEFAULT '0.000000000' COMMENT '队 A 总奖池 (SOL)',
  `total_pool_b` DECIMAL(20,9) NOT NULL DEFAULT '0.000000000' COMMENT '队 B 总奖池 (SOL)',
  `is_settled` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '合约是否已调用 settle',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_match_id` (`match_id`),
  UNIQUE KEY `uk_pda_address` (`pda_address`),
  CONSTRAINT `fk_pool_match` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='奖池同步表';

-- ----------------------------
-- Table structure for user_bets
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user_bets` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '内部 ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '关联 users.id',
  `match_id` INT UNSIGNED NOT NULL COMMENT '关联 matches.id',
  `tx_hash` VARCHAR(88) NOT NULL COMMENT '链上交易 Signature',
  `side` TINYINT NOT NULL COMMENT '1: Team A, 2: Team B',
  `amount` DECIMAL(20,9) NOT NULL COMMENT '下注 SOL 数量',
  `claim_status` TINYINT NOT NULL DEFAULT '0' COMMENT '0:未开奖/不适用, 1:待领取, 2:已领取',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下注时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tx_hash` (`tx_hash`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_match_id` (`match_id`),
  KEY `idx_user_match` (`user_id`, `match_id`),
  CONSTRAINT `fk_bet_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_bet_match` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='下注记录表';

SET FOREIGN_KEY_CHECKS = 1;
