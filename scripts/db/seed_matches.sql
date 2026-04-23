-- Insert Match Data from PandaScore
-- Document Date: 2026-04-22

INSERT INTO `matches` (
    `id`, 
    `league_id`, 
    `team_a_id`, 
    `team_b_id`, 
    `number_of_games`, 
    `start_at`, 
    `status`, 
    `winner_id`
) VALUES 
(
    1420913, 
    294, 
    2574, 
    129972, 
    3, 
    '2026-04-22 09:00:00', 
    'running', 
    NULL
)
ON DUPLICATE KEY UPDATE 
    `league_id` = VALUES(`league_id`),
    `team_a_id` = VALUES(`team_a_id`),
    `team_b_id` = VALUES(`team_b_id`),
    `number_of_games` = VALUES(`number_of_games`),
    `start_at` = VALUES(`start_at`),
    `status` = VALUES(`status`),
    `winner_id` = VALUES(`winner_id`);



    INSERT INTO `matches` (
    `id`, 
    `league_id`, 
    `team_a_id`, 
    `team_b_id`, 
    `number_of_games`, 
    `start_at`, 
    `status`, 
    `winner_id`
) VALUES 
(
    1420915, 
    294, 
    408, 
    405, 
    3, 
    '2026-04-23 09:00:00', 
    'running', 
    NULL
)
ON DUPLICATE KEY UPDATE 
    `league_id` = VALUES(`league_id`),
    `team_a_id` = VALUES(`team_a_id`),
    `team_b_id` = VALUES(`team_b_id`),
    `number_of_games` = VALUES(`number_of_games`),
    `start_at` = VALUES(`start_at`),
    `status` = VALUES(`status`),
    `winner_id` = VALUES(`winner_id`);
