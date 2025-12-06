-- Add soft delete column to trades table
ALTER TABLE edgejournal_trade ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient filtering of deleted trades
CREATE INDEX IF NOT EXISTS trade_deleted_at_idx ON edgejournal_trade(deleted_at);

