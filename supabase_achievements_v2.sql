-- Migration: Achievement System 2.0 (Tactical Badges)

-- 1. Add Stats tracking to Operators (JSON for flexibility: streaks, counts)
ALTER TABLE operators ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}'::jsonb;

-- 2. Update Achievements Schema
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS target_category TEXT; -- e.g., '[智力]'
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS target_substring TEXT; -- e.g., '阅读' (For specific title matches)
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS condition_subtype TEXT; -- 'STREAK' or 'TOTAL_COUNT'

-- 3. Reset Achievements Data
DELETE FROM operator_achievements;
DELETE FROM achievements;

-- 4. Seed New "Delta Force" Badges

-- === BEHAVIORAL (Streaks/Action) ===
INSERT INTO achievements (id, title, description, icon, condition_type, condition_subtype, condition_value, target_category, target_substring) VALUES
('BADGE-B01', '战术突入 (Tactical Breach)', '连续3天完成学习任务', '⚡', 'BEHAVIOR', 'STREAK', 3, '[智力]', NULL),
('BADGE-B02', 'A级情报官 (Intel Analyst)', '连续7天完成阅读任务', '📖', 'BEHAVIOR', 'STREAK', 7, '[智力]', '阅读'),
('BADGE-B03', '外勤精英 (Field Operator)', '连续5天完成运动任务', '🏃', 'BEHAVIOR', 'STREAK', 5, '[体能]', NULL),
('BADGE-B04', '战后复盘 (After Action)', '主动复习3次', '📝', 'BEHAVIOR', 'TOTAL_COUNT', 3, '[智力]', '复习');

-- === GROWTH (Accumulation) ===
INSERT INTO achievements (id, title, description, icon, condition_type, condition_subtype, condition_value, target_category, target_substring) VALUES
('BADGE-G01', '狙击专精 (Sniper Focus)', '完成30次深度学习', '🎯', 'GROWTH', 'TOTAL_COUNT', 30, '[智力]', '深度学习'),
('BADGE-G02', '任务指挥官 (Commander)', '完成50次计划任务', '🎖️', 'GROWTH', 'TOTAL_COUNT', 50, NULL, NULL), -- Any mission
('BADGE-G03', '后勤大师 (Logistics Master)', '完成20次家务', '📦', 'GROWTH', 'TOTAL_COUNT', 20, '[内务]', NULL);

-- === IDENTITY (Long Term) ===
INSERT INTO achievements (id, title, description, icon, condition_type, condition_subtype, condition_value, target_category, target_substring) VALUES
('BADGE-I01', '三角洲传奇 (Delta Legend)', '坚持90天核心习惯', '👑', 'IDENTITY', 'STREAK_ANY', 90, NULL, NULL);

-- 5. Helper function to initialize stats if null (Optional, handled in app logic usually)
UPDATE operators SET stats = '{}'::jsonb WHERE stats IS NULL;
