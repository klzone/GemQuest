-- Migration: Add is_limited column to rewards table

ALTER TABLE rewards 
ADD COLUMN IF NOT EXISTS is_limited BOOLEAN DEFAULT FALSE;

-- Update existing data (Make the 'Weekend' reward limited for demo)
UPDATE rewards 
SET is_limited = TRUE 
WHERE title LIKE '%周末%' OR cost >= 800;
