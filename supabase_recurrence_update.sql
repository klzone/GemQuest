-- 1. Alter Missions Table to support Recurrence
ALTER TABLE missions ADD COLUMN IF NOT EXISTS recurrence TEXT DEFAULT 'none'; -- 'none', 'daily', 'weekly'
ALTER TABLE missions ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 10; -- Ensure consistent naming if not already present (checking previous implicit assumptions)

-- 2. Alter Mission Progress to track completion date for resets
ALTER TABLE mission_progress ADD COLUMN IF NOT EXISTS last_completed_date DATE DEFAULT CURRENT_DATE;

-- 3. Add Sample Recurring Missions
INSERT INTO missions (title, category, xp_reward, recurrence) VALUES
('每日阅读 (Daily Reading)', '[训练]', 50, 'daily'),
('整理床铺 (Bed Making)', '[内务]', 20, 'daily'),
('每周大扫除 (Weekly Clean)', '[战备]', 200, 'weekly');
