-- Add full_name column to addresses table
ALTER TABLE addresses
ADD COLUMN full_name VARCHAR(100);

-- Set default value for existing records (optional)
UPDATE addresses
SET full_name = 'Unknown'
WHERE full_name IS NULL;

-- Make it NOT NULL after setting default values
ALTER TABLE addresses
ALTER COLUMN full_name SET NOT NULL;

-- Rollback (if needed)
-- ALTER TABLE addresses DROP COLUMN full_name;
