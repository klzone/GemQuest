-- GEM QUEST: FINAL SETUP SCRIPT (v1.0)
-- Run this in Supabase SQL Editor to fully initialize or reset the game.

-- ==========================================
-- 1. SCHEMA DEFINITION
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old tables to ensure clean state (CASCADE for dependencies)
DROP TABLE IF EXISTS operator_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS mission_progress CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS operators CASCADE;

-- Operators (The Kids)
CREATE TABLE operators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_name TEXT UNIQUE NOT NULL, -- e.g., 'JUNIOR', 'SENIOR'
  security_rank TEXT DEFAULT 'SR-01',
  tac_xp INTEGER DEFAULT 0,
  age_group INTEGER DEFAULT 8,    -- 8 or 12
  stats JSONB DEFAULT '{}'::jsonb, -- Tracks streaks, counts
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missions (The Habits)
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  xp_reward INTEGER NOT NULL,
  category TEXT,      -- '[智力]', '[体能]', '[内务]', '[特勤]'
  recurrence TEXT DEFAULT 'daily',
  target_group INTEGER DEFAULT 0, -- 0=All, 8=8yo, 12=12yo
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mission Progress (Daily Status)
CREATE TABLE mission_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0,
  status TEXT DEFAULT 'IN_PROGRESS',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(operator_id, mission_id)
);

-- Rewards (The Shop)
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  cost INTEGER NOT NULL,
  type TEXT DEFAULT 'REAL', -- 'REAL', 'VIRTUAL', 'GEAR'
  icon TEXT,
  gear_slot TEXT,           -- 'HEAD', 'BODY', 'LEGS', 'FEET', 'WEAPON'
  power_value INTEGER DEFAULT 0,
  is_limited BOOLEAN DEFAULT FALSE, -- Weekly Rare
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases (Inventory/History)
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards(id) ON DELETE SET NULL,
  cost_at_purchase INTEGER,
  redeemed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements (Badges)
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, 
  condition_type TEXT,    -- 'BEHAVIOR', 'GROWTH', 'IDENTITY'
  condition_subtype TEXT, -- 'STREAK', 'TOTAL_COUNT'
  condition_value INTEGER,
  target_category TEXT,   -- e.g. '[智力]'
  target_substring TEXT,  -- e.g. '阅读'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operator Achievements (Unlocked Badges)
CREATE TABLE operator_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(operator_id, achievement_id)
);

-- ==========================================
-- 2. SEED DATA
-- ==========================================

-- Operators
INSERT INTO operators (code_name, security_rank, tac_xp, age_group) VALUES
('JUNIOR (8yo)', 'SR-01', 0, 8),
('SENIOR (12yo)', 'SR-03', 0, 12);

-- Missions (8yo - Junior)
INSERT INTO missions (title, xp_reward, category, target_group) VALUES
('深度学习 (30min)', 4, '[智力]', 8),
('阅读 (20min)', 3, '[智力]', 8),
('运动 (30min)', 3, '[体能]', 8),
('独立完成作业', 3, '[智力]', 8),
('复习课文', 2, '[智力]', 8),
('连续3天全勤', 2, '[特勤]', 8),
('情绪稳定/攻克困难', 2, '[特勤]', 8),
('主动做家务', 5, '[内务]', 8);

-- Missions (12yo - Senior)
INSERT INTO missions (title, xp_reward, category, target_group) VALUES
('深度学习 (40min)', 6, '[智力]', 12),
('阅读 (40min)', 4, '[智力]', 12),
('运动 (30min)', 4, '[体能]', 12),
('复习课文', 2, '[智力]', 12),
('预习课文', 2, '[智力]', 12),
('自定目标并完成 (周)', 10, '[特勤]', 12),
('连续7天自律 (周)', 8, '[特勤]', 12),
('主动家务/帮弟弟', 5, '[内务]', 12);

-- Rewards
-- Immediate
INSERT INTO rewards (title, cost, type, icon, is_limited) VALUES
('游戏时间 (10min)', 10, 'REAL', '🎮', FALSE),
('零食/玩具 (1元)', 10, 'REAL', '🍫', FALSE);
-- Limited / Big
INSERT INTO rewards (title, cost, type, icon, is_limited) VALUES
('线下体验活动', 100, 'REAL', '🎟️', TRUE),
('周末大餐', 200, 'REAL', '🍔', TRUE),
('小旅行 (300币)', 300, 'REAL', '✈️', TRUE);
-- Gear
INSERT INTO rewards (title, cost, type, icon, gear_slot, power_value, is_limited) VALUES
('战术头盔', 50, 'GEAR', '⛑️', 'HEAD', 10, FALSE),
('防弹背心', 80, 'GEAR', '🦺', 'BODY', 20, FALSE),
('外骨骼腿甲', 100, 'GEAR', '🦿', 'LEGS', 25, FALSE),
('光子战靴', 60, 'GEAR', '👢', 'FEET', 15, FALSE),
('脉冲步枪', 150, 'GEAR', '🔫', 'WEAPON', 50, FALSE);


-- Badges (Achievements V2)
INSERT INTO achievements (id, title, description, icon, condition_type, condition_subtype, condition_value, target_category, target_substring) VALUES
-- Behavior
('BADGE-B01', '战术突入 (Tactical Breach)', '连续3天完成学习任务', '⚡', 'BEHAVIOR', 'STREAK', 3, '[智力]', NULL),
('BADGE-B02', 'A级情报官 (Intel Analyst)', '连续7天完成阅读任务', '📖', 'BEHAVIOR', 'STREAK', 7, '[智力]', '阅读'),
('BADGE-B03', '外勤精英 (Field Operator)', '连续5天完成运动任务', '🏃', 'BEHAVIOR', 'STREAK', 5, '[体能]', NULL),
('BADGE-B04', '战后复盘 (After Action)', '主动复习3次', '📝', 'BEHAVIOR', 'TOTAL_COUNT', 3, '[智力]', '复习'),
-- Growth
('BADGE-G01', '狙击专精 (Sniper Focus)', '完成30次深度学习', '🎯', 'GROWTH', 'TOTAL_COUNT', 30, '[智力]', '深度学习'),
('BADGE-G02', '任务指挥官 (Commander)', '完成50次计划任务', '🎖️', 'GROWTH', 'TOTAL_COUNT', 50, NULL, NULL),
('BADGE-G03', '后勤大师 (Logistics Master)', '完成20次家务', '📦', 'GROWTH', 'TOTAL_COUNT', 20, '[内务]', NULL),
-- Identity
('BADGE-I01', '三角洲传奇 (Delta Legend)', '坚持90天核心习惯', '👑', 'IDENTITY', 'STREAK_ANY', 90, NULL, NULL);

