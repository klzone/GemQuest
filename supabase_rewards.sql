-- Gem Quest Rewards & Achievements Schema (Tactical Edition)

-- 1. Rewards Table (Tactical Logistics)
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,         -- e.g., '30分钟游戏时间'
  cost INTEGER NOT NULL,       -- e.g., 500
  type TEXT DEFAULT 'REAL',    -- 'REAL' (Physical/Privilege) or 'DIGITAL' (Skin/Badge)
  icon TEXT,                   -- Emoji or SVG path reference
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Purchases Table (Requisition History)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards(id) ON DELETE SET NULL,
  cost_at_purchase INTEGER,
  redeemed BOOLEAN DEFAULT FALSE, -- Has the parent fulfilled this?
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Achievements Table (Service Medals)
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,         -- e.g., 'MEDAL-001'
  title TEXT NOT NULL,         -- e.g., '七日连续行动'
  description TEXT,
  icon TEXT, 
  condition_type TEXT,         -- 'STREAK', 'TOTAL_XP', 'MISSION_COUNT'
  condition_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Operator Achievements (Medal Case)
CREATE TABLE IF NOT EXISTS operator_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(operator_id, achievement_id)
);

-- Initial Rewards Data (Tactical Supply)
INSERT INTO rewards (title, cost, type, icon) VALUES
('战术休整 (30分钟游戏)', 300, 'REAL', '🎮'),
('额外补给 (选择零食)', 150, 'REAL', '🍫'),
('周末突击行动 (去公园)', 1000, 'REAL', '🌳'),
('装备升级 (新文具)', 500, 'REAL', '✏️'),
('最高指挥权 (决定晚餐)', 800, 'REAL', '🍔')
ON CONFLICT DO NOTHING;

-- Initial Achievements Data (Service Medals)
INSERT INTO achievements (id, title, description, condition_type, condition_value, icon) VALUES
('MEDAL-001', '新兵入伍', '完成第一个任务', 'MISSION_COUNT', 1, '🎖️'),
('MEDAL-007', '全勤战士', '连续7天完成所有战术指标', 'STREAK', 7, '⚡'),
('MEDAL-X10', '精英干员', '累计获得 1000 战备点', 'TOTAL_XP', 1000, '🌟')
ON CONFLICT DO NOTHING;
