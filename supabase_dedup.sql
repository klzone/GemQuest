-- CLEANUP SCRIPT: Remove Duplicate Rewards
-- This keeps the OLDEST record and removes newer duplicates based on Title + Cost + Type

DELETE FROM rewards
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY title, cost, type 
                   ORDER BY created_at ASC
               ) as row_num
        FROM rewards
    ) t
    WHERE t.row_num > 1
);

-- OPTIONAL: Add a unique constraint to prevent this in the future
-- uncomment the line below if you want to strictly enforce it
-- ALTER TABLE rewards ADD CONSTRAINT unique_reward_item UNIQUE (title, cost, type, gear_slot);
