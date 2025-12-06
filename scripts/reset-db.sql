-- Reset EdgeJournal Database
-- Run this if you get schema conflicts during development

-- Drop all tables in order (respecting foreign keys)
DROP TABLE IF EXISTS edgejournal_ai_message CASCADE;
DROP TABLE IF EXISTS edgejournal_ai_conversation CASCADE;
DROP TABLE IF EXISTS edgejournal_user_settings CASCADE;
DROP TABLE IF EXISTS edgejournal_trade_screenshot CASCADE;
DROP TABLE IF EXISTS edgejournal_trade_tag CASCADE;
DROP TABLE IF EXISTS edgejournal_tag CASCADE;
DROP TABLE IF EXISTS edgejournal_trade_execution CASCADE;
DROP TABLE IF EXISTS edgejournal_trade CASCADE;
DROP TABLE IF EXISTS edgejournal_account CASCADE;
DROP TABLE IF EXISTS edgejournal_user CASCADE;

-- Drop enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS instrument_type CASCADE;
DROP TYPE IF EXISTS trade_direction CASCADE;
DROP TYPE IF EXISTS trade_status CASCADE;
DROP TYPE IF EXISTS execution_type CASCADE;
DROP TYPE IF EXISTS emotional_state CASCADE;
DROP TYPE IF EXISTS import_source CASCADE;
DROP TYPE IF EXISTS account_type CASCADE;
DROP TYPE IF EXISTS trading_platform CASCADE;

