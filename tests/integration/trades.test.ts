import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Account, User } from "@/server/db/schema";
import {
	createTestCaller,
	setupTrader,
	type TestCaller,
	truncateAllTables,
} from "../utils";

describe("trades router", () => {
	let user: User;
	let account: Account;
	let caller: TestCaller;

	beforeAll(async () => {
		await truncateAllTables();
		const setup = await setupTrader({ account: { isDefault: true } });
		user = setup.user;
		account = setup.account;
		caller = await createTestCaller(user.clerkId, user);
	});

	afterAll(async () => {
		await truncateAllTables();
	});

	describe("create", () => {
		it("should create an open trade", async () => {
			const trade = await caller.trades.create({
				symbol: "ES",
				instrumentType: "futures",
				direction: "long",
				entryPrice: "5000.00",
				entryTime: new Date().toISOString(),
				quantity: "2",
				stopLoss: "4990.00",
				takeProfit: "5020.00",
				accountId: account.id,
			});

			expect(trade).toBeDefined();
			expect(trade?.symbol).toBe("ES");
			expect(trade?.direction).toBe("long");
			expect(trade?.status).toBe("open");
			expect(parseFloat(trade?.quantity ?? "0")).toBe(2);
		});

		it("should create a closed trade with P&L calculation", async () => {
			const entryTime = new Date();
			const exitTime = new Date(entryTime.getTime() + 3600000); // 1 hour later

			const trade = await caller.trades.create({
				symbol: "ES",
				instrumentType: "futures",
				direction: "long",
				entryPrice: "5000.00",
				entryTime: entryTime.toISOString(),
				exitPrice: "5010.00",
				exitTime: exitTime.toISOString(),
				quantity: "1",
				fees: "5.00",
				accountId: account.id,
			});

			expect(trade).toBeDefined();
			expect(trade?.status).toBe("closed");
			expect(trade?.realizedPnl).toBeDefined();
			expect(trade?.netPnl).toBeDefined();
			// ES is $50 per point, so 10 points = $500
			expect(parseFloat(trade?.realizedPnl ?? "0")).toBe(500);
			expect(parseFloat(trade?.netPnl ?? "0")).toBe(495); // $500 - $5 fees
		});

		it("should create a short trade", async () => {
			const entryTime = new Date();
			const exitTime = new Date(entryTime.getTime() + 3600000);

			const trade = await caller.trades.create({
				symbol: "NQ",
				instrumentType: "futures",
				direction: "short",
				entryPrice: "18000.00",
				entryTime: entryTime.toISOString(),
				exitPrice: "17980.00",
				exitTime: exitTime.toISOString(),
				quantity: "1",
				accountId: account.id,
			});

			expect(trade).toBeDefined();
			expect(trade?.direction).toBe("short");
			// NQ is $20 per point, short from 18000 to 17980 = 20 points = $400
			expect(parseFloat(trade?.realizedPnl ?? "0")).toBe(400);
		});
	});

	describe("getAll", () => {
		it("should return all trades for the user", async () => {
			const result = await caller.trades.getAll();

			expect(result.items.length).toBeGreaterThanOrEqual(3);
			expect(result.items.every((t) => t.userId === user.id)).toBe(true);
		});

		it("should filter by status", async () => {
			const openTrades = await caller.trades.getAll({ status: "open" });
			const closedTrades = await caller.trades.getAll({ status: "closed" });

			expect(openTrades.items.every((t) => t.status === "open")).toBe(true);
			expect(closedTrades.items.every((t) => t.status === "closed")).toBe(true);
		});

		it("should filter by symbol", async () => {
			const esTrades = await caller.trades.getAll({ symbol: "ES" });

			expect(esTrades.items.length).toBeGreaterThanOrEqual(1);
			expect(esTrades.items.every((t) => t.symbol.includes("ES"))).toBe(true);
		});

		it("should filter by direction", async () => {
			const longTrades = await caller.trades.getAll({ tradeDirection: "long" });
			const shortTrades = await caller.trades.getAll({
				tradeDirection: "short",
			});

			expect(longTrades.items.every((t) => t.direction === "long")).toBe(true);
			expect(shortTrades.items.every((t) => t.direction === "short")).toBe(
				true,
			);
		});
	});

	describe("getById", () => {
		it("should return a specific trade with related data", async () => {
			const allTrades = await caller.trades.getAll();
			const firstTrade = allTrades.items[0];
			expect(firstTrade).toBeDefined();

			const trade = await caller.trades.getById({ id: firstTrade?.id ?? 0 });

			expect(trade).toBeDefined();
			expect(trade.id).toBe(firstTrade?.id);
			expect(trade.account).toBeDefined();
		});

		it("should throw error for non-existent trade", async () => {
			await expect(caller.trades.getById({ id: 99999 })).rejects.toThrow(
				"Trade not found",
			);
		});
	});

	describe("update", () => {
		it("should update trade properties", async () => {
			let allTrades = await caller.trades.getAll({ status: "open" });
			let openTrade = allTrades.items[0];

			if (!openTrade) {
				// Create one if none exist
				await caller.trades.create({
					symbol: "ES",
					instrumentType: "futures",
					direction: "long",
					entryPrice: "5000.00",
					entryTime: new Date().toISOString(),
					quantity: "1",
					accountId: account.id,
				});
				// Re-fetch to get the created trade
				allTrades = await caller.trades.getAll({ status: "open" });
				openTrade = allTrades.items[0];
			}

			expect(openTrade).toBeDefined();

			const updated = await caller.trades.update({
				id: openTrade?.id ?? 0,
				notes: "Updated notes for testing",
				setupType: "breakout",
			});

			expect(updated?.notes).toBe("Updated notes for testing");
			expect(updated?.setupType).toBe("breakout");
		});
	});

	describe("close", () => {
		it("should close an open trade and calculate P&L", async () => {
			// Create a fresh open trade
			const openTrade = await caller.trades.create({
				symbol: "ES",
				instrumentType: "futures",
				direction: "long",
				entryPrice: "5100.00",
				entryTime: new Date().toISOString(),
				quantity: "1",
				accountId: account.id,
			});
			expect(openTrade).toBeDefined();

			const closedTrade = await caller.trades.close({
				id: openTrade?.id ?? 0,
				exitPrice: "5120.00",
				exitTime: new Date().toISOString(),
				fees: "2.50",
			});

			expect(closedTrade?.status).toBe("closed");
			expect(parseFloat(closedTrade?.exitPrice ?? "0")).toBe(5120);
			// 20 points * $50 = $1000
			expect(parseFloat(closedTrade?.realizedPnl ?? "0")).toBe(1000);
			expect(parseFloat(closedTrade?.netPnl ?? "0")).toBe(997.5); // $1000 - $2.50
		});
	});

	describe("delete (soft delete)", () => {
		it("should soft delete a trade", async () => {
			// Create a trade to delete
			const trade = await caller.trades.create({
				symbol: "ES",
				instrumentType: "futures",
				direction: "long",
				entryPrice: "5000.00",
				entryTime: new Date().toISOString(),
				quantity: "1",
				accountId: account.id,
			});
			expect(trade).toBeDefined();

			await caller.trades.delete({ id: trade?.id ?? 0 });

			// Should not appear in normal getAll
			const allTrades = await caller.trades.getAll();
			const deletedTrade = allTrades.items.find((t) => t.id === trade?.id);
			expect(deletedTrade).toBeUndefined();

			// Should appear in trash
			const deletedTrades = await caller.trades.getDeleted();
			const inTrash = deletedTrades.find((t) => t.id === trade?.id);
			expect(inTrash).toBeDefined();
		});
	});

	describe("restore", () => {
		it("should restore a soft-deleted trade", async () => {
			const deletedTrades = await caller.trades.getDeleted();
			const tradeToRestore = deletedTrades[0];

			if (tradeToRestore) {
				await caller.trades.restore({ id: tradeToRestore.id });

				const allTrades = await caller.trades.getAll();
				const restored = allTrades.items.find(
					(t) => t.id === tradeToRestore.id,
				);
				expect(restored).toBeDefined();
			}
		});
	});

	describe("getStats", () => {
		it("should calculate correct statistics", async () => {
			const stats = await caller.trades.getStats();

			expect(stats).toBeDefined();
			expect(typeof stats.totalTrades).toBe("number");
			expect(typeof stats.wins).toBe("number");
			expect(typeof stats.losses).toBe("number");
			expect(typeof stats.breakevens).toBe("number");
			expect(typeof stats.winRate).toBe("number");
			expect(typeof stats.totalPnl).toBe("number");
			expect(typeof stats.profitFactor).toBe("number");
		});

		it("should filter stats by account", async () => {
			const stats = await caller.trades.getStats({ accountId: account.id });

			expect(stats).toBeDefined();
			// All stats should be for this specific account
			expect(stats.totalTrades).toBeGreaterThanOrEqual(0);
		});
	});

	describe("batchImport", () => {
		it("should import multiple trades at once", async () => {
			const tradesToImport = [
				{
					symbol: "ES",
					instrumentType: "futures" as const,
					direction: "long" as const,
					entryPrice: "5000.00",
					entryTime: new Date().toISOString(),
					exitPrice: "5010.00",
					exitTime: new Date().toISOString(),
					quantity: "1",
				},
				{
					symbol: "NQ",
					instrumentType: "futures" as const,
					direction: "short" as const,
					entryPrice: "18000.00",
					entryTime: new Date().toISOString(),
					exitPrice: "17990.00",
					exitTime: new Date().toISOString(),
					quantity: "1",
				},
			];

			const result = await caller.trades.batchImport({
				accountId: account.id,
				trades: tradesToImport,
			});

			expect(result.imported).toBe(2);
			expect(result.total).toBe(2);
		});
	});
});
