-- Migration: Age Groups & New Rule Set

-- 1. Schema Updates
ALTER TABLE operators ADD COLUMN IF NOT EXISTS age_group INTEGER DEFAULT 8;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS target_group INTEGER DEFAULT 0; -- 0=All, 8=8yo, 12=12yo

-- 2. Data Reset (Clean Slate for new rules)
DELETE FROM mission_progress;
DELETE FROM purchases;
-- Delete missions and rewards to re-seed
DELETE FROM missions;
DELETE FROM rewards;
DELETE FROM operator_achievements;
DELETE FROM operators;

-- 3. Seed Operators
INSERT INTO operators (code_name, security_rank, tac_xp, age_group) VALUES
('JUNIOR (8yo)', 'SR-01', 0, 8),
('SENIOR (12yo)', 'SR-03', 0, 12);

-- 4. Seed Missions (8yo)
-- Routine (Total 15 XP)
INSERT INTO missions (title, xp_reward, recurrence, category, target_group) VALUES
('深度学习 (30min)', 4, 'daily', '[智力]', 8),
('阅读 (20min)', 3, 'daily', '[智力]', 8),
('运动 (30min)', 3, 'daily', '[体能]', 8),
('独立完成作业', 3, 'daily', '[智力]', 8),
('复习课文', 2, 'daily', '[智力]', 8);

-- Bonus (8yo)
INSERT INTO missions (title, xp_reward, recurrence, category, target_group) VALUES
('连续3天全勤', 2, 'daily', '[特勤]', 8),
('情绪稳定/攻克困难', 2, 'daily', '[特勤]', 8),
('主动做家务', 5, 'daily', '[内务]', 8);

-- 5. Seed Missions (12yo)
-- Routine (Total 18 XP)
INSERT INTO missions (title, xp_reward, recurrence, category, target_group) VALUES
('深度学习 (40min)', 6, 'daily', '[智力]', 12),
('阅读 (40min)', 4, 'daily', '[智力]', 12),
('运动 (30min)', 4, 'daily', '[体能]', 12),
('复习课文', 2, 'daily', '[智力]', 12),
('预习课文', 2, 'daily', '[智力]', 12);

-- Bonus (12yo)
INSERT INTO missions (title, xp_reward, recurrence, category, target_group) VALUES
('自定目标并完成 (周)', 10, 'weekly', '[特勤]', 12),
('连续7天自律 (周)', 8, 'weekly', '[特勤]', 12),
('主动家务/帮弟弟', 5, 'daily', '[内务]', 12);

-- 6. Seed Rewards
-- Immediate (Small)
INSERT INTO rewards (title, cost, type, is_limited) VALUES
('游戏时间 (10min)', 10, 'REAL', FALSE),
('零食/玩具 (1元)', 10, 'REAL', FALSE);

-- Growth (Big)
INSERT INTO rewards (title, cost, type, is_limited) VALUES
('线下体验活动', 100, 'REAL', TRUE), -- Treat as "Limited/Special" for visibility
('周末大餐', 200, 'REAL', TRUE),
('小旅行 (300币)', 300, 'REAL', TRUE);
