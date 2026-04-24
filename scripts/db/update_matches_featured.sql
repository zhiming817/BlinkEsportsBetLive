-- 为 matches 表增加 feature 和 embed_url 字段
ALTER TABLE matches ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE matches ADD COLUMN embed_url TEXT;

-- 标记一些比赛为推荐赛事（示例）
-- 假设 ID 为 1420913 和 1420914 是我们要推荐的
UPDATE matches SET is_featured = TRUE, embed_url = 'https://www.bilibili.com/blackboard/live/live-activity-player.html?cid=7734200&quality=0' WHERE id = 1420913;
UPDATE matches SET is_featured = TRUE, embed_url = 'https://player.twitch.tv/?channel=lpl&parent=localhost' WHERE id = 1420914;
