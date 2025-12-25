-- Gem Quest Database Schema (Tactical Edition)

-- 1. Profiles Table (Operators)
CREATE TABLE IF NOT EXISTS operators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_name TEXT UNIQUE NOT NULL, -- e.g., 'LEO', 'MIA'
  security_rank TEXT DEFAULT 'SR-01',
  tac_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Missions Table (Quests)
CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY, -- e.g., 'OP-101'
  title TEXT NOT NULL,
  xp_reward INTEGER NOT NULL,
  category TEXT, -- e.g., '[REC]', '[COL]'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Progress Table (Mission Status)
CREATE TABLE IF NOT EXISTS mission_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  mission_id TEXT REFERENCES missions(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0,
  status TEXT DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'SUCCESS'
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(operator_id, mission_id)
);

-- Initial Data Setup
INSERT INTO missions (id, title, xp_reward, category) VALUES
('OP-101', '深度情报解析 (阅读)', 50, '[侦察]'),
('OP-102', '基地内务整理 (家务)', 30, '[收集]'),
('OP-103', '战术模拟推演 (练习)', 40, '[训练]'),
('OP-104', '生化补给作业 (饮水)', 20, '[战备]')
ON CONFLICT (id) DO NOTHING;
