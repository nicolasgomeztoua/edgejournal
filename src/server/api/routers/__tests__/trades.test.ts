/**
 * Integration tests for the trades tRPC router
 *
 * These tests run against a real PostgreSQL container using Testcontainers.
 * Each test file gets a clean database state.
 */

import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
	cleanDatabase,
	closeTestDb,
	createClosedTestTrade,
	createCompleteTestSetup,
	createTestAccount,
	createTestContext,
	createTestContextWithUser,
	createTestTrade,
	createTestUser,
	resetFactoryCounters,
} from "@/test";
import { tradesRouter } from "../trades";

describe("trades router", () => {
	beforeAll(async () => {
		// Database is already set up by global setup
		resetFactoryCounters();
	});

	afterEach(async () => {
		// Clean database between tests for isolation
		await cleanDatabase();
		resetFactoryCounters();
	});

	afterAll(async () => {
		await closeTestDb();
	});

	describe("getAll", () => {
		it("should return empty list when user has no trades", async () => {
			const ctx = await createTestContext();
			const caller = tradesRouter.createCaller(ctx);

			const result = await caller.getAll();

			expect(result.items).toEqual([]);
			expect(result.nextCursor).toBeUndefined();
		});

		it("should return trades for the authenticated user", async () => {
			const ctx = await createTestContext();
			const account = await createTestAccount(ctx.user.id);
			await createTestTrade(ctx.user.id, account.id);
			await createTestTrade(ctx.user.id, account.id);

			const caller = tradesRouter.createCaller(ctx);
			const result = await caller.getAll();

			expect(result.items).toHaveLength(2);
		});

		it("should not return trades from other users", async () => {
			// Create first user with trades
			const user1 = await createTestUser();
			const account1 = await createTestAccount(user1.id);
			await createTestTrade(user1.id, account1.id);

			// Create second user
			const ctx = await createTestContext();
			const account2 = await createTestAccount(ctx.user.id);
			await createTestTrade(ctx.user.id, account2.id);

			const caller = tradesRouter.createCaller(ctx);
			const result = await caller.getAll();

			// Should only see own trades
			expect(result.items).toHaveLength(1);
			expect(result.items[0]?.userId).toBe(ctx.user.id);
		});

		it("should filter by status", async () => {
			const ctx = await createTestContext();
			const account = await createTestAccount(ctx.user.id);

			// Create open and closed trades
			await createTestTrade(ctx.user.id, account.id, { status: "open" });
			await createClosedTestTrade(ctx.user.id, account.id);

			const caller = tradesRouter.createCaller(ctx);

			const openResult = await caller.getAll({ status: "open" });
			expect(openResult.items).toHaveLength(1);
			expect(openResult.items[0]?.status).toBe("open");

			const closedResult = await caller.getAll({ status: "closed" });
			expect(closedResult.items).toHaveLength(1);
			expect(closedResult.items[0]?.status).toBe("closed");
		});

		it("should filter by account", async () => {
			const ctx = await createTestContext();
			const account1 = await createTestAccount(ctx.user.id, {
				name: "Account 1",
			});
			const account2 = await createTestAccount(ctx.user.id, {
				name: "Account 2",
			});

			await createTestTrade(ctx.user.id, account1.id);
			await createTestTrade(ctx.user.id, account2.id);
			await createTestTrade(ctx.user.id, account2.id);

			const caller = tradesRouter.createCaller(ctx);

			const result = await caller.getAll({ accountId: account2.id });
			expect(result.items).toHaveLength(2);
			expect(result.items.every((t) => t.accountId === account2.id)).toBe(true);
		});

		it("should not return soft-deleted trades by default", async () => {
			const ctx = await createTestContext();
			const account = await createTestAccount(ctx.user.id);
			const trade = await createTestTrade(ctx.user.id, account.id);

			const caller = tradesRouter.createCaller(ctx);

			// Delete the trade
			await caller.delete({ id: trade.id });

			// Should not appear in getAll
			const result = await caller.getAll();
			expect(result.items).toHaveLength(0);
		});

		it("should paginate results with cursor", async () => {
			const ctx = await createTestContext();
			const account = await createTestAccount(ctx.user.id);

			// Create 5 trades
			for (let i = 0; i < 5; i++) {
				await createTestTrade(ctx.user.id, account.id);
			}

			const caller = tradesRouter.createCaller(ctx);

			// Get first page
			const page1 = await caller.getAll({ limit: 2 });
			expect(page1.items).toHaveLength(2);
			expect(page1.nextCursor).toBeDefined();

			// Get second page
			const page2 = await caller.getAll({ limit: 2, cursor: page1.nextCursor });
			expect(page2.items).toHaveLength(2);
			expect(page2.nextCursor).toBeDefined();

			// Get last page
			const page3 = await caller.getAll({ limit: 2, cursor: page2.nextCursor });
			expect(page3.items).toHaveLength(1);
			expect(page3.nextCursor).toBeUndefined();
		});
	});

	describe("getById", () => {
		it("should return a trade by ID", async () => {
			const ctx = await createTestContext();
			const account = await createTestAccount(ctx.user.id);
			const trade = await createTestTrade(ctx.user.id, account.id, {
				symbol: "NQ",
			});

			const caller = tradesRouter.createCaller(ctx);
			const result = await caller.getById({ id: trade.id });

			expect(result.id).toBe(trade.id);
			expect(result.symbol).toBe("NQ");
		});

		it("should throw error for non-existent trade", async () => {
			const ctx = await createTestContext();
			const caller = tradesRouter.createCaller(ctx);

			await expect(caller.getById({ id: 99999 })).rejects.toThrow(
				"Trade not found",
			);
		});

		it("should not return trades belonging to other users", async () => {
			// Create trade for another user
			const otherUser = await createTestUser();
			const otherAccount = await createTestAccount(otherUser.id);
			const otherTrade = await createTestTrade(otherUser.id, otherAccount.id);

			// Try to access from different user
			const ctx = await createTestContext();
			const caller = tradesRouter.createCaller(ctx);

			await expect(caller.getById({ id: otherTrade.id })).rejects.toThrow(
				"Trade not found",
			);
		});
	});

	describe("create", () => {
		it("should create a new open trade", async () => {
			const ctx = await createTestContext();
			const account = await createTestAccount(ctx.user.id);

			const caller = tradesRouter.createCaller(ctx);
			const result = await caller.create({
				symbol: "ES",
				instrumentType: "futures",
				direction: "long",
				entryPrice: "5000.00",
				entryTime: new Date().toISOString(),
				quantity: "2",
				accountId: account.id,
			});

			expect(result).toBeDefined();
			expect(result?.symbol).toBe("ES");
			expect(result?.direction).toBe("long");
			expect(result?.status).toBe("open");
			expect(result?.quantity).toBe("2");
		});

		it("should create a closed trade with calculated P&L", async () => {
			const ctx = await createTestContext();
			const account = await createTestAccount(ctx.user.id);

			const entryTime = new Date(Date.now() - 3600000);
			const exitTime = new Date();

			const caller = tradesRouter.createCaller(ctx);
			const result = await caller.create({
				symbol: "ES",
				instrumentType: "futures",
				direction: "long",
				entryPrice: "5000.00",
				exitPrice: "5010.00", // 10 points profit
				entryTime: entryTime.toISOString(),
				exitTime: exitTime.toISOString(),
				quantity: "1",
				fees: "4.50",
				accountId: account.id,
			});

			expect(result?.status).toBe("closed");
			expect(result?.realizedPnl).toBe("500.00"); // ES is $50/point
			expect(result?.netPnl).toBe("495.50"); // 500 - 4.50 fees
		});

		it("should detect stop loss hit on closed trade", async () => {
			const ctx = await createTestContext();
			const account = await createTestAccount(ctx.user.id);

			const caller = tradesRouter.createCaller(ctx);
			const result = await caller.create({
				symbol: "ES",
				instrumentType: "futures",
				direction: "long",
				entryPrice: "5000.00",
				exitPrice: "4990.00", // Below stop loss
				stopLoss: "4995.00",
				entryTime: new Date(Date.now() - 3600000).toISOString(),
				exitTime: new Date().toISOString(),
				quantity: "1",
				accountId: account.id,
			});

			expect(result?.stopLossHit).toBe(true);
			expect(result?.takeProfitHit).toBe(false);
		});
	});

	describe("update", () => {
		it("should update trade fields", async () => {
			const ctx = await createTestContext();
			const account = await createTestAccount(ctx.user.id);
			const trade = await createTestTrade(ctx.user.id, account.id);

			const caller = tradesRouter.createCaller(ctx);
			const result = await caller.update({
				id: trade.id,
				notes: "Updated notes",
				setupType: "breakout",
			});

			expect(result?.notes).toBe("Updated notes");
			expect(result?.setupType).toBe("breakout");
		});

		it("should recalculate P&L when price fields change", async () => {
			const ctx = await createTestContext();
			const account = await createTestAccount(ctx.user.id);
			const trade = await createClosedTestTrade(ctx.user.id, account.id, {
				entryPrice: "5000.00",
				exitPrice: "5010.00",
				realizedPnl: "500.00",
			});

			const caller = tradesRouter.createCaller(ctx);
			const result = await caller.update({
				id: trade.id,
				exitPrice: "5020.00", // Now 20 points profit
			});

			expect(result?.realizedPnl).toBe("1000"); // ES $50/point * 20 points
		});
	});

	describe("delete", () => {
		it("should soft delete a trade", async () => {
			const ctx = await createTestContext();
			const account = await createTestAccount(ctx.user.id);
			const trade = await createTestTrade(ctx.user.id, account.id);

			const caller = tradesRouter.createCaller(ctx);
			const result = await caller.delete({ id: trade.id });

			expect(result.success).toBe(true);

			// Trade should not appear in getAll
			const trades = await caller.getAll();
			expect(trades.items).toHaveLength(0);

			// But should appear in getDeleted
			const deleted = await caller.getDeleted();
			expect(deleted).toHaveLength(1);
			expect(deleted[0]?.id).toBe(trade.id);
		});
	});

	describe("restore", () => {
		it("should restore a soft-deleted trade", async () => {
			const ctx = await createTestContext();
			const account = await createTestAccount(ctx.user.id);
			const trade = await createTestTrade(ctx.user.id, account.id);

			const caller = tradesRouter.createCaller(ctx);

			// Delete then restore
			await caller.delete({ id: trade.id });
			await caller.restore({ id: trade.id });

			// Should appear in getAll again
			const trades = await caller.getAll();
			expect(trades.items).toHaveLength(1);

			// Should not appear in getDeleted
			const deleted = await caller.getDeleted();
			expect(deleted).toHaveLength(0);
		});
	});

	describe("getStats", () => {
		it("should calculate correct statistics", async () => {
			const { user, account } = await createCompleteTestSetup(0);

			// Use the existing user's context
			const caller = tradesRouter.createCaller(
				createTestContextWithUser(user) as Parameters<
					typeof tradesRouter.createCaller
				>[0],
			);

			// Create winning trades
			await createClosedTestTrade(user.id, account.id, {
				realizedPnl: "500.00",
				netPnl: "495.50",
			});
			await createClosedTestTrade(user.id, account.id, {
				realizedPnl: "300.00",
				netPnl: "295.50",
			});

			// Create losing trade
			await createClosedTestTrade(user.id, account.id, {
				realizedPnl: "-200.00",
				netPnl: "-204.50",
			});

			const stats = await caller.getStats();

			expect(stats.totalTrades).toBe(3);
			expect(stats.wins).toBe(2);
			expect(stats.losses).toBe(1);
			expect(stats.winRate).toBeCloseTo(66.67, 1);
			expect(stats.totalPnl).toBeCloseTo(586.5, 1); // 495.5 + 295.5 - 204.5
		});

		it("should filter stats by account", async () => {
			const user = await createTestUser();
			const account1 = await createTestAccount(user.id, { name: "Account 1" });
			const account2 = await createTestAccount(user.id, { name: "Account 2" });

			// Trades on account1
			await createClosedTestTrade(user.id, account1.id, { netPnl: "100.00" });
			await createClosedTestTrade(user.id, account1.id, { netPnl: "100.00" });

			// Trades on account2
			await createClosedTestTrade(user.id, account2.id, { netPnl: "-50.00" });

			const caller = tradesRouter.createCaller(
				createTestContextWithUser(user) as Parameters<
					typeof tradesRouter.createCaller
				>[0],
			);

			const stats1 = await caller.getStats({ accountId: account1.id });
			expect(stats1.totalTrades).toBe(2);
			expect(stats1.totalPnl).toBe(200);

			const stats2 = await caller.getStats({ accountId: account2.id });
			expect(stats2.totalTrades).toBe(1);
			expect(stats2.totalPnl).toBe(-50);
		});
	});

	describe("batchImport", () => {
		it("should import multiple trades at once", async () => {
			const ctx = await createTestContext();
			const account = await createTestAccount(ctx.user.id);

			const caller = tradesRouter.createCaller(ctx);

			const result = await caller.batchImport({
				accountId: account.id,
				trades: [
					{
						symbol: "ES",
						instrumentType: "futures",
						direction: "long",
						entryPrice: "5000.00",
						entryTime: new Date().toISOString(),
						quantity: "1",
					},
					{
						symbol: "NQ",
						instrumentType: "futures",
						direction: "short",
						entryPrice: "18000.00",
						exitPrice: "17990.00",
						entryTime: new Date(Date.now() - 3600000).toISOString(),
						exitTime: new Date().toISOString(),
						quantity: "1",
					},
				],
			});

			expect(result.imported).toBe(2);
			expect(result.total).toBe(2);

			// Verify trades exist
			const trades = await caller.getAll();
			expect(trades.items).toHaveLength(2);
		});
	});
});
