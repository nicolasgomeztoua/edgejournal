-- Rename traderx to projectx in the trading_platform enum
-- This script handles the enum value rename

-- First, update any existing accounts that use 'traderx' to a temporary value
-- Then rename the enum value
-- Note: PostgreSQL doesn't support renaming enum values directly, so we need to:
-- 1. Add the new value
-- 2. Update rows using old value to new value
-- 3. Remove old value (optional, PostgreSQL doesn't support this easily)

-- Add projectx value if it doesn't exist
DO $$ BEGIN
    ALTER TYPE trading_platform ADD VALUE IF NOT EXISTS 'projectx';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update any accounts using 'traderx' to 'projectx'
UPDATE edgejournal_account 
SET platform = 'projectx' 
WHERE platform = 'traderx';

-- Note: PostgreSQL doesn't easily allow removing enum values
-- The old 'traderx' value will remain in the enum but won't be used
-- This is safe and doesn't affect functionality

