/**
 * Test data factories
 *
 * Provides functions to create test data in the database.
 * All factories return the created entity with its database ID.
 */

import type {
	Account,
	NewAccount,
	NewTrade,
	NewUser,
	Trade,
	User,
} from "@/server/db/schema";
import { accounts, trades, users } from "@/server/db/schema";
import { getTestDb } from "./db";

// Counter for generating unique IDs
let userCounter = 0;
let accountCounter = 0;

/**
 * Reset counters between test files
 */
export function resetFactoryCounters() {
	userCounter = 0;
	accountCounter = 0;
}

/**
 * Create a test user in the database
 */
export async function createTestUser(
	overrides?: Partial<Omit<NewUser, "id">>,
): Promise<User> {
	const db = getTestDb();
	userCounter++;

	const userData: NewUser = {
		clerkId: `test_clerk_${userCounter}_${Date.now()}`,
		email: `testuser${userCounter}@example.com`,
		name: `Test User ${userCounter}`,
		role: "user",
		...overrides,
	};

	const [user] = await db.insert(users).values(userData).returning();

	if (!user) {
		throw new Error("Failed to create test user");
	}

	return user;
}

/**
 * Create a test trading account
 */
export async function createTestAccount(
	userId: number,
	overrides?: Partial<Omit<NewAccount, "id" | "userId">>,
): Promise<Account> {
	const db = getTestDb();
	accountCounter++;

	const accountData: NewAccount = {
		userId,
		name: `Test Account ${accountCounter}`,
		broker: "Test Broker",
		platform: "other",
		accountType: "demo",
		initialBalance: "10000.00",
		currency: "USD",
		isActive: true,
		isDefault: accountCounter === 1, // First account is default
		...overrides,
	};

	const [account] = await db.insert(accounts).values(accountData).returning();

	if (!account) {
		throw new Error("Failed to create test account");
	}

	return account;
}

/**
 * Create a test trade
 */
export async function createTestTrade(
	userId: number,
	accountId: number,
	overrides?: Partial<Omit<NewTrade, "id" | "userId" | "accountId">>,
): Promise<Trade> {
	const db = getTestDb();

	const now = new Date();
	const entryTime = new Date(now.getTime() - 3600000); // 1 hour ago

	const tradeData: NewTrade = {
		userId,
		accountId,
		symbol: "ES",
		instrumentType: "futures",
		direction: "long",
		entryPrice: "5000.00",
		entryTime,
		quantity: "1",
		status: "open",
		importSource: "manual",
		...overrides,
	};

	const [trade] = await db.insert(trades).values(tradeData).returning();

	if (!trade) {
		throw new Error("Failed to create test trade");
	}

	return trade;
}

/**
 * Create a closed test trade with P&L
 */
export async function createClosedTestTrade(
	userId: number,
	accountId: number,
	overrides?: Partial<Omit<NewTrade, "id" | "userId" | "accountId">>,
): Promise<Trade> {
	const now = new Date();
	const entryTime = new Date(now.getTime() - 7200000); // 2 hours ago
	const exitTime = new Date(now.getTime() - 3600000); // 1 hour ago

	return createTestTrade(userId, accountId, {
		entryPrice: "5000.00",
		exitPrice: "5010.00",
		entryTime,
		exitTime,
		quantity: "1",
		status: "closed",
		realizedPnl: "500.00", // ES is $50/point, 10 points = $500
		fees: "4.50",
		netPnl: "495.50",
		...overrides,
	});
}

/**
 * Create multiple test trades for a user
 */
export async function createTestTrades(
	userId: number,
	accountId: number,
	count: number,
	overrides?: Partial<Omit<NewTrade, "id" | "userId" | "accountId">>,
): Promise<Trade[]> {
	const createdTrades: Trade[] = [];

	for (let i = 0; i < count; i++) {
		const trade = await createTestTrade(userId, accountId, {
			symbol: i % 2 === 0 ? "ES" : "NQ",
			direction: i % 2 === 0 ? "long" : "short",
			...overrides,
		});
		createdTrades.push(trade);
	}

	return createdTrades;
}

/**
 * Create a complete test setup with user, account, and trades
 */
export async function createCompleteTestSetup(tradeCount = 5) {
	const user = await createTestUser();
	const account = await createTestAccount(user.id);
	const openTrades = await createTestTrades(user.id, account.id, tradeCount);

	// Create some closed trades too
	const closedTrades = await Promise.all([
		createClosedTestTrade(user.id, account.id, {
			symbol: "ES",
			direction: "long",
			realizedPnl: "500.00",
			netPnl: "495.50",
		}),
		createClosedTestTrade(user.id, account.id, {
			symbol: "NQ",
			direction: "short",
			realizedPnl: "-200.00",
			netPnl: "-204.50",
		}),
	]);

	return {
		user,
		account,
		openTrades,
		closedTrades,
		allTrades: [...openTrades, ...closedTrades],
	};
}
