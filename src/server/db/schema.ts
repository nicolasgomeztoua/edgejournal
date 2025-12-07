import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	index,
	integer,
	pgEnum,
	pgTableCreator,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

/**
 * Multi-project schema prefix
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `edgejournal_${name}`);

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const instrumentTypeEnum = pgEnum("instrument_type", [
	"futures",
	"forex",
]);
export const tradeDirectionEnum = pgEnum("trade_direction", ["long", "short"]);
export const tradeStatusEnum = pgEnum("trade_status", ["open", "closed"]);
export const executionTypeEnum = pgEnum("execution_type", [
	"entry",
	"exit",
	"scale_in",
	"scale_out",
]);
export const emotionalStateEnum = pgEnum("emotional_state", [
	"confident",
	"fearful",
	"greedy",
	"neutral",
	"frustrated",
	"excited",
	"anxious",
]);
export const importSourceEnum = pgEnum("import_source", ["manual", "csv"]);
export const accountTypeEnum = pgEnum("account_type", [
	"live",
	"demo",
	"paper",
]);
export const tradingPlatformEnum = pgEnum("trading_platform", [
	"mt4", // MetaTrader 4
	"mt5", // MetaTrader 5
	"projectx", // ProjectX
	"ninjatrader", // NinjaTrader (future)
	"other", // Manual/Other
]);

// ============================================================================
// USERS TABLE
// ============================================================================

export const users = createTable(
	"user",
	{
		id: integer().primaryKey().generatedByDefaultAsIdentity(),
		clerkId: text("clerk_id").notNull().unique(),
		email: text("email").notNull(),
		name: text("name"),
		imageUrl: text("image_url"),
		role: userRoleEnum("role").notNull().default("user"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
			() => new Date(),
		),
	},
	(t) => [index("user_clerk_id_idx").on(t.clerkId)],
);

// ============================================================================
// TRADING ACCOUNTS TABLE
// ============================================================================

export const accounts = createTable(
	"account",
	{
		id: integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		name: text("name").notNull(), // e.g., "Main Account", "Prop Firm"
		broker: text("broker"), // e.g., "IBKR", "Oanda", "ICMarkets"
		platform: tradingPlatformEnum("platform").notNull().default("other"), // Trading platform for CSV parsing
		accountType: accountTypeEnum("account_type").notNull().default("live"),

		// Balance tracking
		initialBalance: decimal("initial_balance", {
			precision: 20,
			scale: 2,
		}).default("0"),
		currency: text("currency").default("USD"),

		// Account identifiers
		accountNumber: text("account_number"), // Optional external account number

		// Status
		isActive: boolean("is_active").default(true),
		isDefault: boolean("is_default").default(false), // Default account for new trades

		// Metadata
		notes: text("notes"),
		color: text("color").default("#6366f1"), // For UI distinction

		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
			() => new Date(),
		),
	},
	(t) => [
		index("account_user_id_idx").on(t.userId),
		index("account_is_default_idx").on(t.isDefault),
	],
);

// ============================================================================
// TRADES TABLE
// ============================================================================

export const trades = createTable(
	"trade",
	{
		id: integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		accountId: integer("account_id").references(() => accounts.id, {
			onDelete: "set null",
		}),

		// Instrument info
		symbol: text("symbol").notNull(), // e.g., "ES", "NQ", "EUR/USD"
		instrumentType: instrumentTypeEnum("instrument_type").notNull(),

		// Trade direction and status
		direction: tradeDirectionEnum("direction").notNull(),
		status: tradeStatusEnum("status").notNull().default("open"),

		// Entry details
		entryPrice: decimal("entry_price", { precision: 20, scale: 8 }).notNull(),
		entryTime: timestamp("entry_time", { withTimezone: true }).notNull(),

		// Exit details (null if trade is still open)
		exitPrice: decimal("exit_price", { precision: 20, scale: 8 }),
		exitTime: timestamp("exit_time", { withTimezone: true }),

		// Position size
		quantity: decimal("quantity", { precision: 20, scale: 8 }).notNull(), // lots or contracts

		// Risk management levels (planned)
		stopLoss: decimal("stop_loss", { precision: 20, scale: 8 }),
		takeProfit: decimal("take_profit", { precision: 20, scale: 8 }),

		// Actual outcome
		stopLossHit: boolean("stop_loss_hit").default(false),
		takeProfitHit: boolean("take_profit_hit").default(false),

		// P&L
		realizedPnl: decimal("realized_pnl", { precision: 20, scale: 2 }),
		fees: decimal("fees", { precision: 20, scale: 2 }).default("0"),
		netPnl: decimal("net_pnl", { precision: 20, scale: 2 }),

		// Trade metadata
		setupType: text("setup_type"), // e.g., "breakout", "reversal", "trend_continuation"
		emotionalState: emotionalStateEnum("emotional_state"),
		notes: text("notes"),

		// Import tracking
		importSource: importSourceEnum("import_source").notNull().default("manual"),
		externalId: text("external_id"), // For tracking imported trades

		// Soft delete
		deletedAt: timestamp("deleted_at", { withTimezone: true }),

		// Timestamps
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
			() => new Date(),
		),
	},
	(t) => [
		index("trade_user_id_idx").on(t.userId),
		index("trade_account_id_idx").on(t.accountId),
		index("trade_symbol_idx").on(t.symbol),
		index("trade_entry_time_idx").on(t.entryTime),
		index("trade_status_idx").on(t.status),
		index("trade_deleted_at_idx").on(t.deletedAt),
	],
);

// ============================================================================
// TRADE EXECUTIONS TABLE (for scaling in/out)
// ============================================================================

export const tradeExecutions = createTable(
	"trade_execution",
	{
		id: integer().primaryKey().generatedByDefaultAsIdentity(),
		tradeId: integer("trade_id")
			.notNull()
			.references(() => trades.id, { onDelete: "cascade" }),

		executionType: executionTypeEnum("execution_type").notNull(),
		price: decimal("price", { precision: 20, scale: 8 }).notNull(),
		quantity: decimal("quantity", { precision: 20, scale: 8 }).notNull(),
		executedAt: timestamp("executed_at", { withTimezone: true }).notNull(),
		fees: decimal("fees", { precision: 20, scale: 2 }).default("0"),

		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(t) => [index("execution_trade_id_idx").on(t.tradeId)],
);

// ============================================================================
// TAGS TABLE
// ============================================================================

export const tags = createTable(
	"tag",
	{
		id: integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		color: text("color").default("#6366f1"), // Default indigo
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(t) => [index("tag_user_id_idx").on(t.userId)],
);

// ============================================================================
// TRADE TAGS (junction table)
// ============================================================================

export const tradeTags = createTable(
	"trade_tag",
	{
		tradeId: integer("trade_id")
			.notNull()
			.references(() => trades.id, { onDelete: "cascade" }),
		tagId: integer("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
	},
	(t) => [
		primaryKey({ columns: [t.tradeId, t.tagId] }),
		index("trade_tag_trade_id_idx").on(t.tradeId),
		index("trade_tag_tag_id_idx").on(t.tagId),
	],
);

// ============================================================================
// TRADE SCREENSHOTS TABLE
// ============================================================================

export const tradeScreenshots = createTable(
	"trade_screenshot",
	{
		id: integer().primaryKey().generatedByDefaultAsIdentity(),
		tradeId: integer("trade_id")
			.notNull()
			.references(() => trades.id, { onDelete: "cascade" }),
		url: text("url").notNull(),
		caption: text("caption"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(t) => [index("screenshot_trade_id_idx").on(t.tradeId)],
);

// ============================================================================
// USER SETTINGS TABLE
// ============================================================================

export const userSettings = createTable("user_settings", {
	id: integer().primaryKey().generatedByDefaultAsIdentity(),
	userId: integer("user_id")
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: "cascade" }),

	// AI Provider API Keys (encrypted in application layer)
	openaiApiKey: text("openai_api_key"),
	anthropicApiKey: text("anthropic_api_key"),
	googleApiKey: text("google_api_key"),

	// Preferred AI provider
	preferredAiProvider: text("preferred_ai_provider").default("openai"),

	// Trading preferences
	defaultInstrumentType: instrumentTypeEnum("default_instrument_type").default(
		"futures",
	),
	timezone: text("timezone").default("UTC"),
	breakevenThreshold: decimal("breakeven_threshold", {
		precision: 10,
		scale: 2,
	}).default("3.00"), // P&L within ±$X is considered breakeven

	// Display preferences
	currency: text("currency").default("USD"),

	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
		() => new Date(),
	),
});

// ============================================================================
// AI CONVERSATIONS TABLE
// ============================================================================

export const aiConversations = createTable(
	"ai_conversation",
	{
		id: integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		title: text("title"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
			() => new Date(),
		),
	},
	(t) => [index("conversation_user_id_idx").on(t.userId)],
);

// ============================================================================
// AI MESSAGES TABLE
// ============================================================================

export const aiMessages = createTable(
	"ai_message",
	{
		id: integer().primaryKey().generatedByDefaultAsIdentity(),
		conversationId: integer("conversation_id")
			.notNull()
			.references(() => aiConversations.id, { onDelete: "cascade" }),
		role: text("role").notNull(), // "user" or "assistant"
		content: text("content").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(t) => [index("message_conversation_id_idx").on(t.conversationId)],
);

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many, one }) => ({
	accounts: many(accounts),
	trades: many(trades),
	tags: many(tags),
	settings: one(userSettings),
	aiConversations: many(aiConversations),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
	trades: many(trades),
}));

export const tradesRelations = relations(trades, ({ one, many }) => ({
	user: one(users, {
		fields: [trades.userId],
		references: [users.id],
	}),
	account: one(accounts, {
		fields: [trades.accountId],
		references: [accounts.id],
	}),
	executions: many(tradeExecutions),
	tradeTags: many(tradeTags),
	screenshots: many(tradeScreenshots),
}));

export const tradeExecutionsRelations = relations(
	tradeExecutions,
	({ one }) => ({
		trade: one(trades, {
			fields: [tradeExecutions.tradeId],
			references: [trades.id],
		}),
	}),
);

export const tagsRelations = relations(tags, ({ one, many }) => ({
	user: one(users, {
		fields: [tags.userId],
		references: [users.id],
	}),
	tradeTags: many(tradeTags),
}));

export const tradeTagsRelations = relations(tradeTags, ({ one }) => ({
	trade: one(trades, {
		fields: [tradeTags.tradeId],
		references: [trades.id],
	}),
	tag: one(tags, {
		fields: [tradeTags.tagId],
		references: [tags.id],
	}),
}));

export const tradeScreenshotsRelations = relations(
	tradeScreenshots,
	({ one }) => ({
		trade: one(trades, {
			fields: [tradeScreenshots.tradeId],
			references: [trades.id],
		}),
	}),
);

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id],
	}),
}));

export const aiConversationsRelations = relations(
	aiConversations,
	({ one, many }) => ({
		user: one(users, {
			fields: [aiConversations.userId],
			references: [users.id],
		}),
		messages: many(aiMessages),
	}),
);

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
	conversation: one(aiConversations, {
		fields: [aiMessages.conversationId],
		references: [aiConversations.id],
	}),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
export type TradeExecution = typeof tradeExecutions.$inferSelect;
export type NewTradeExecution = typeof tradeExecutions.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type TradeScreenshot = typeof tradeScreenshots.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
export type AiConversation = typeof aiConversations.$inferSelect;
export type AiMessage = typeof aiMessages.$inferSelect;
