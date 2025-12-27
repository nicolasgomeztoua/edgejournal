CREATE TYPE "public"."exit_reason" AS ENUM('manual', 'stop_loss', 'trailing_stop', 'take_profit', 'time_based', 'breakeven');--> statement-breakpoint
CREATE TYPE "public"."trading_platform" AS ENUM('mt4', 'mt5', 'projectx', 'ninjatrader', 'other');--> statement-breakpoint
ALTER TABLE "edgejournal_account" ADD COLUMN "platform" "trading_platform" DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "edgejournal_trade_execution" ADD COLUMN "realized_pnl" numeric(20, 2);--> statement-breakpoint
ALTER TABLE "edgejournal_trade_execution" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "edgejournal_trade" ADD COLUMN "trailed_stop_loss" numeric(20, 8);--> statement-breakpoint
ALTER TABLE "edgejournal_trade" ADD COLUMN "was_trailed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "edgejournal_trade" ADD COLUMN "exit_reason" "exit_reason";--> statement-breakpoint
ALTER TABLE "edgejournal_trade" ADD COLUMN "is_partially_exited" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "edgejournal_trade" ADD COLUMN "remaining_quantity" numeric(20, 8);--> statement-breakpoint
ALTER TABLE "edgejournal_trade" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "edgejournal_user_settings" ADD COLUMN "breakeven_threshold" numeric(10, 2) DEFAULT '3.00';--> statement-breakpoint
CREATE INDEX "trade_deleted_at_idx" ON "edgejournal_trade" USING btree ("deleted_at");