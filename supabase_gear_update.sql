-- 1. Add Gear columns to Rewards
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS gear_slot TEXT; -- 'HEAD', 'BODY', 'LEGS', 'FEET', 'WEAPON' or NULL
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS power_value INTEGER DEFAULT 0;

-- 2. Seed Initial Gear (Tier 1 & 2)
INSERT INTO rewards (title, cost, type, icon, gear_slot, power_value) VALUES
-- WEAPONS
('训练手枪 (M1911)', 500, 'GEAR', '🔫', 'WEAPON', 10),
('战术步枪 (M4A1)', 2000, 'GEAR', 'rifle_icon', 'WEAPON', 50),

-- HEAD
('战术通讯耳机', 300, 'GEAR', '🎧', 'HEAD', 5),
('防弹头盔 (Lv.2)', 1500, 'GEAR', '⛑️', 'HEAD', 30),

-- BODY
('轻型战术背心', 600, 'GEAR', '🦺', 'BODY', 15),
('重型防弹衣 (Lv.3)', 2500, 'GEAR', '🛡️', 'BODY', 60),

-- LEGS
('战术护膝', 200, 'GEAR', '🦵', 'LEGS', 5),

-- FEET
('作战靴 (Standard)', 400, 'GEAR', '🥾', 'FEET', 8)
ON CONFLICT DO NOTHING;
