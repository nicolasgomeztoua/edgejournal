import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { User } from "@/server/db/schema";
import {
	createTestCaller,
	createTestUser,
	type TestCaller,
	truncateAllTables,
} from "../utils";

describe("accounts router", () => {
	let user: User;
	let caller: TestCaller;

	beforeAll(async () => {
		await truncateAllTables();
		user = await createTestUser({ name: "Accounts Test User" });
		caller = await createTestCaller(user.clerkId, user);
	});

	afterAll(async () => {
		await truncateAllTables();
	});

	describe("create", () => {
		it("should create a new account", async () => {
			const account = await caller.accounts.create({
				name: "My Trading Account",
				platform: "mt4",
				accountType: "demo",
				initialBalance: "10000",
				currency: "USD",
			});

			expect(account).toBeDefined();
			expect(account?.name).toBe("My Trading Account");
			expect(account?.platform).toBe("mt4");
			expect(account?.accountType).toBe("demo");
			expect(parseFloat(account?.initialBalance ?? "0")).toBe(10000);
			expect(account?.currency).toBe("USD");
		});

		it("should set first account as default", async () => {
			// Get all accounts - the first one should be default
			const accounts = await caller.accounts.getAll();
			const firstAccount = accounts.find(
				(a) => a.name === "My Trading Account",
			);

			expect(firstAccount).toBeDefined();
			expect(firstAccount?.isDefault).toBe(true);
		});

		it("should create a prop challenge account with rules", async () => {
			const account = await caller.accounts.create({
				name: "FTMO Challenge",
				platform: "mt5",
				accountType: "prop_challenge",
				initialBalance: "100000",
				maxDrawdown: "6",
				profitTarget: "10",
				dailyLossLimit: "5",
			});

			expect(account).toBeDefined();
			expect(account?.accountType).toBe("prop_challenge");
			expect(parseFloat(account?.maxDrawdown ?? "0")).toBe(6);
			expect(parseFloat(account?.profitTarget ?? "0")).toBe(10);
			expect(parseFloat(account?.dailyLossLimit ?? "0")).toBe(5);
			expect(account?.challengeStatus).toBe("active");
		});
	});

	describe("getAll", () => {
		it("should return all user accounts", async () => {
			const accounts = await caller.accounts.getAll();

			expect(accounts.length).toBeGreaterThanOrEqual(2);
			expect(accounts.every((a) => a.userId === user.id)).toBe(true);
		});
	});

	describe("getById", () => {
		it("should return a specific account", async () => {
			const allAccounts = await caller.accounts.getAll();
			const firstAccount = allAccounts[0];
			expect(firstAccount).toBeDefined();

			const account = await caller.accounts.getById({
				id: firstAccount?.id ?? 0,
			});

			expect(account).toBeDefined();
			expect(account.id).toBe(firstAccount?.id);
		});

		it("should throw error for non-existent account", async () => {
			await expect(caller.accounts.getById({ id: 99999 })).rejects.toThrow(
				"Account not found",
			);
		});
	});

	describe("update", () => {
		it("should update account properties", async () => {
			const allAccounts = await caller.accounts.getAll();
			const account = allAccounts[0];
			expect(account).toBeDefined();

			const updated = await caller.accounts.update({
				id: account?.id ?? 0,
				name: "Updated Account Name",
				broker: "Interactive Brokers",
			});

			expect(updated?.name).toBe("Updated Account Name");
			expect(updated?.broker).toBe("Interactive Brokers");
		});
	});

	describe("setDefault", () => {
		it("should set an account as default and unset others", async () => {
			const accounts = await caller.accounts.getAll();
			let nonDefaultAccount = accounts.find((a) => !a.isDefault);

			if (!nonDefaultAccount) {
				// Create another account if all are default
				await caller.accounts.create({
					name: "Another Account",
					platform: "other",
					accountType: "live",
				});
				// Re-fetch to get the non-default account
				const refreshedAccounts = await caller.accounts.getAll();
				nonDefaultAccount = refreshedAccounts.find((a) => !a.isDefault);
			}

			expect(nonDefaultAccount).toBeDefined();
			const accountToSetDefault = nonDefaultAccount;

			await caller.accounts.setDefault({ id: accountToSetDefault?.id ?? 0 });

			const finalAccounts = await caller.accounts.getAll();
			const defaultAccounts = finalAccounts.filter((a) => a.isDefault);

			expect(defaultAccounts.length).toBe(1);
			expect(defaultAccounts[0]?.id).toBe(accountToSetDefault?.id);
		});
	});

	describe("getStats", () => {
		it("should return account statistics", async () => {
			const accounts = await caller.accounts.getAll();
			const account = accounts[0];
			expect(account).toBeDefined();

			const stats = await caller.accounts.getStats({ id: account?.id ?? 0 });

			expect(stats).toBeDefined();
			expect(typeof stats.totalTrades).toBe("number");
			expect(typeof stats.wins).toBe("number");
			expect(typeof stats.losses).toBe("number");
			expect(typeof stats.winRate).toBe("number");
			expect(typeof stats.totalPnl).toBe("number");
		});
	});

	describe("delete", () => {
		it("should delete an account", async () => {
			// Create an account specifically for deletion
			const accountToDelete = await caller.accounts.create({
				name: "Account To Delete",
				platform: "other",
				accountType: "demo",
			});
			expect(accountToDelete).toBeDefined();

			await caller.accounts.delete({ id: accountToDelete?.id ?? 0 });

			// Verify it's gone
			await expect(
				caller.accounts.getById({ id: accountToDelete?.id ?? 0 }),
			).rejects.toThrow("Account not found");
		});
	});

	describe("account groups", () => {
		it("should create a group", async () => {
			const group = await caller.accounts.createGroup({
				name: "Copy Trading Group",
				description: "Accounts for copy trading",
				color: "#00ff00",
			});

			expect(group).toBeDefined();
			expect(group?.name).toBe("Copy Trading Group");
		});

		it("should list all groups", async () => {
			const groups = await caller.accounts.getGroups();

			expect(groups.length).toBeGreaterThanOrEqual(1);
		});

		it("should delete a group", async () => {
			const group = await caller.accounts.createGroup({
				name: "Group To Delete",
			});
			expect(group).toBeDefined();

			await caller.accounts.deleteGroup({ id: group?.id ?? 0 });

			const groups = await caller.accounts.getGroups();
			const deletedGroup = groups.find((g) => g.id === group?.id);

			expect(deletedGroup).toBeUndefined();
		});
	});
});
