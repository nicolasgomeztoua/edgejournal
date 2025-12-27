-- Migration: Add trailing stop and partial exit support
-- Run this manually if drizzle-kit push fails

-- 1. Create exit_reason enum (skip if exists)
DO $$ BEGIN
  CREATE TYPE exit_reason AS ENUM('manual', 'stop_loss', 'trailing_stop', 'take_profit', 'time_based', 'breakeven');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Add new columns to trade table
ALTER TABLE edgejournal_trade ADD COLUMN IF NOT EXISTS trailed_stop_loss numeric(20, 8);
ALTER TABLE edgejournal_trade ADD COLUMN IF NOT EXISTS was_trailed boolean DEFAULT false;
ALTER TABLE edgejournal_trade ADD COLUMN IF NOT EXISTS exit_reason exit_reason;
ALTER TABLE edgejournal_trade ADD COLUMN IF NOT EXISTS is_partially_exited boolean DEFAULT false;
ALTER TABLE edgejournal_trade ADD COLUMN IF NOT EXISTS remaining_quantity numeric(20, 8);

-- 3. Add new columns to trade_execution table
ALTER TABLE edgejournal_trade_execution ADD COLUMN IF NOT EXISTS realized_pnl numeric(20, 2);
ALTER TABLE edgejournal_trade_execution ADD COLUMN IF NOT EXISTS notes text;

