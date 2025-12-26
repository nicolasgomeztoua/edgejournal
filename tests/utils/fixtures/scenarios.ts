import { type CreateTestAccountOptions, createTestAccount } from "./accounts";
import { type CreateTestTradeOptions, createTestTrades } from "./trades";
import { type CreateTestUserOptions, createTestUser } from "./users";

/**
 * Sets up a complete trader scenario with user, account, and optionally trades.
 * This is the most common setup for integration tests.
 */
export async function setupTrader(options?: {
	user?: CreateTestUserOptions;
	account?: CreateTestAccountOptions;
}) {
	const user = await createTestUser(options?.user);
	const account = await createTestAccount(user.id, {
		isDefault: true,
		...options?.account,
	});

	return { user, account };
}

/**
 * Sets up a trader with a specified number of closed trades.
 * Useful for testing statistics and analytics.
 */
export async function setupTraderWithTrades(
	tradeCount: number,
	options?: {
		user?: CreateTestUserOptions;
		account?: CreateTestAccountOptions;
		trade?: CreateTestTradeOptions;
	},
) {
	const { user, account } = await setupTrader({
		user: options?.user,
		account: options?.account,
	});

	const trades = await createTestTrades(user.id, account.id, tradeCount, {
		status: "closed",
		...options?.trade,
	});

	return { user, account, trades };
}

/**
 * Sets up a trader with multiple accounts.
 * Useful for testing account switching and multi-account features.
 */
export async function setupTraderWithMultipleAccounts(
	accountCount: number,
	options?: {
		user?: CreateTestUserOptions;
		account?: CreateTestAccountOptions;
	},
) {
	const user = await createTestUser(options?.user);

	const accounts = [];
	for (let i = 0; i < accountCount; i++) {
		const account = await createTestAccount(user.id, {
			name: `Account ${i + 1}`,
			isDefault: i === 0, // First account is default
			...options?.account,
		});
		accounts.push(account);
	}

	return { user, accounts };
}

/**
 * Sets up a prop firm challenge scenario.
 * Creates a user with a prop challenge account.
 */
export async function setupPropChallenge(options?: {
	user?: CreateTestUserOptions;
	initialBalance?: string;
	profitTarget?: string;
	maxDrawdown?: string;
}) {
	const user = await createTestUser(options?.user);
	const account = await createTestAccount(user.id, {
		name: "Prop Challenge",
		accountType: "prop_challenge",
		initialBalance: options?.initialBalance ?? "100000",
		profitTarget: options?.profitTarget ?? "10",
		maxDrawdown: options?.maxDrawdown ?? "6",
		isDefault: true,
	});

	return { user, account };
}

/**
 * Sets up a trader with mixed winning and losing trades.
 * Useful for testing win rate and P&L calculations.
 */
export async function setupTraderWithMixedTrades(options?: {
	user?: CreateTestUserOptions;
	account?: CreateTestAccountOptions;
	winCount?: number;
	lossCount?: number;
}) {
	const { user, account } = await setupTrader({
		user: options?.user,
		account: options?.account,
	});

	const winCount = options?.winCount ?? 3;
	const lossCount = options?.lossCount ?? 2;

	const winningTrades = await createTestTrades(user.id, account.id, winCount, {
		direction: "long",
		entryPrice: "5000.00",
		exitPrice: "5020.00", // +$1000 per contract for ES
		status: "closed",
	});

	const losingTrades = await createTestTrades(user.id, account.id, lossCount, {
		direction: "long",
		entryPrice: "5000.00",
		exitPrice: "4990.00", // -$500 per contract for ES
		status: "closed",
	});

	return {
		user,
		account,
		trades: [...winningTrades, ...losingTrades],
		winningTrades,
		losingTrades,
	};
}
