-- Insert Team Data from PandaScore
-- Document Date: 2026-04-22

INSERT INTO `teams` (
    `id`, 
    `name`, 
    `acronym`, 
    `slug`, 
    `location`, 
    `image_url`, 
    `dark_mode_image_url`, 
    `modified_at`
) VALUES 
(
    2574, 
    'Team WE', 
    'WE', 
    'we', 
    'CN', 
    'https://cdn-api.pandascore.co/images/team/image/2574/300px-Team_WElogo_square.png', 
    NULL, 
    '2026-04-21 20:51:40'
),
(
    129972, 
    'Weibo Gaming', 
    'WB', 
    'weibo-gaming-league-of-legends', 
    'CN', 
    'https://cdn-api.pandascore.co/images/team/image/129972/weibo_gaminglogo_profile.png', 
    'https://cdn-api.pandascore.co/dark_images/team/dark_image/129972/696px_weibo_gaming_full_darkmode.png', 
    '2026-03-29 16:56:20'
)
ON DUPLICATE KEY UPDATE 
    `name` = VALUES(`name`),
    `acronym` = VALUES(`acronym`),
    `slug` = VALUES(`slug`),
    `location` = VALUES(`location`),
    `image_url` = VALUES(`image_url`),
    `dark_mode_image_url` = VALUES(`dark_mode_image_url`),
    `modified_at` = VALUES(`modified_at`);
