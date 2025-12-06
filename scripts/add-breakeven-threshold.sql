-- Add breakeven_threshold column to user_settings table
ALTER TABLE edgejournal_user_settings
ADD COLUMN IF NOT EXISTS breakeven_threshold DECIMAL(10, 2) DEFAULT '3.00';
