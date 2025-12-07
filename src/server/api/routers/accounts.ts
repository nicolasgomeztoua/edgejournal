import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { accounts, trades } from "@/server/db/schema";

// Platform enum values (must match schema)
const platformEnum = z.enum(["mt4", "mt5", "projectx", "ninjatrader", "other"]);

// Input schemas
const createAccountSchema = z.object({
	name: z.string().min(1).max(100),
	broker: z.string().optional(),
	platform: platformEnum.default("other"),
	accountType: z.enum(["live", "demo", "paper"]).default("live"),
	initialBalance: z.string().optional(),
	currency: z.string().default("USD"),
	accountNumber: z.string().optional(),
	notes: z.string().optional(),
	color: z.string().optional(),
	isDefault: z.boolean().optional(),
});

const updateAccountSchema = z.object({
	id: z.number(),
	name: z.string().min(1).max(100).optional(),
	broker: z.string().optional(),
	platform: platformEnum.optional(),
	accountType: z.enum(["live", "demo", "paper"]).optional(),
	initialBalance: z.string().optional(),
	currency: z.string().optional(),
	accountNumber: z.string().optional(),
	notes: z.string().optional(),
	color: z.string().optional(),
	isActive: z.boolean().optional(),
	isDefault: z.boolean().optional(),
});

export const accountsRouter = createTRPCRouter({
	// Get all accounts for current user
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const userAccounts = await ctx.db.query.accounts.findMany({
			where: eq(accounts.userId, ctx.user.id),
			orderBy: [desc(accounts.isDefault), desc(accounts.createdAt)],
		});

		return userAccounts;
	}),

	// Get active accounts only
	getActive: protectedProcedure.query(async ({ ctx }) => {
		const userAccounts = await ctx.db.query.accounts.findMany({
			where: and(eq(accounts.userId, ctx.user.id), eq(accounts.isActive, true)),
			orderBy: [desc(accounts.isDefault), desc(accounts.createdAt)],
		});

		return userAccounts;
	}),

	// Get default account
	getDefault: protectedProcedure.query(async ({ ctx }) => {
		const defaultAccount = await ctx.db.query.accounts.findFirst({
			where: and(
				eq(accounts.userId, ctx.user.id),
				eq(accounts.isDefault, true),
			),
		});

		// If no default, return first active account
		if (!defaultAccount) {
			return ctx.db.query.accounts.findFirst({
				where: and(
					eq(accounts.userId, ctx.user.id),
					eq(accounts.isActive, true),
				),
				orderBy: [desc(accounts.createdAt)],
			});
		}

		return defaultAccount;
	}),

	// Get account by ID
	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const account = await ctx.db.query.accounts.findFirst({
				where: and(eq(accounts.id, input.id), eq(accounts.userId, ctx.user.id)),
			});

			if (!account) {
				throw new Error("Account not found");
			}

			return account;
		}),

	// Create a new account
	create: protectedProcedure
		.input(createAccountSchema)
		.mutation(async ({ ctx, input }) => {
			// If this is set as default, unset other defaults first
			if (input.isDefault) {
				await ctx.db
					.update(accounts)
					.set({ isDefault: false })
					.where(eq(accounts.userId, ctx.user.id));
			}

			// Check if this is the user's first account - make it default
			const existingAccounts = await ctx.db.query.accounts.findMany({
				where: eq(accounts.userId, ctx.user.id),
			});

			const isFirstAccount = existingAccounts.length === 0;

			const [newAccount] = await ctx.db
				.insert(accounts)
				.values({
					...input,
					userId: ctx.user.id,
					isDefault: input.isDefault ?? isFirstAccount,
				})
				.returning();

			return newAccount;
		}),

	// Update an account
	update: protectedProcedure
		.input(updateAccountSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			// Verify ownership
			const existingAccount = await ctx.db.query.accounts.findFirst({
				where: and(eq(accounts.id, id), eq(accounts.userId, ctx.user.id)),
			});

			if (!existingAccount) {
				throw new Error("Account not found");
			}

			// If setting as default, unset other defaults first
			if (updateData.isDefault) {
				await ctx.db
					.update(accounts)
					.set({ isDefault: false })
					.where(eq(accounts.userId, ctx.user.id));
			}

			const [updated] = await ctx.db
				.update(accounts)
				.set(updateData)
				.where(eq(accounts.id, id))
				.returning();

			return updated;
		}),

	// Set account as default
	setDefault: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			// Verify ownership
			const existingAccount = await ctx.db.query.accounts.findFirst({
				where: and(eq(accounts.id, input.id), eq(accounts.userId, ctx.user.id)),
			});

			if (!existingAccount) {
				throw new Error("Account not found");
			}

			// Unset all defaults for this user
			await ctx.db
				.update(accounts)
				.set({ isDefault: false })
				.where(eq(accounts.userId, ctx.user.id));

			// Set the new default
			const [updated] = await ctx.db
				.update(accounts)
				.set({ isDefault: true })
				.where(eq(accounts.id, input.id))
				.returning();

			return updated;
		}),

	// Delete an account
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const existingAccount = await ctx.db.query.accounts.findFirst({
				where: and(eq(accounts.id, input.id), eq(accounts.userId, ctx.user.id)),
			});

			if (!existingAccount) {
				throw new Error("Account not found");
			}

			// Check if there are trades associated with this account
			const associatedTrades = await ctx.db.query.trades.findFirst({
				where: eq(trades.accountId, input.id),
			});

			if (associatedTrades) {
				// Option 1: Prevent deletion
				// throw new Error("Cannot delete account with associated trades");

				// Option 2: Unassign trades from this account (set accountId to null)
				await ctx.db
					.update(trades)
					.set({ accountId: null })
					.where(eq(trades.accountId, input.id));
			}

			await ctx.db.delete(accounts).where(eq(accounts.id, input.id));

			// If this was the default account, set another one as default
			if (existingAccount.isDefault) {
				const anotherAccount = await ctx.db.query.accounts.findFirst({
					where: and(
						eq(accounts.userId, ctx.user.id),
						eq(accounts.isActive, true),
					),
				});

				if (anotherAccount) {
					await ctx.db
						.update(accounts)
						.set({ isDefault: true })
						.where(eq(accounts.id, anotherAccount.id));
				}
			}

			return { success: true };
		}),

	// Get account stats
	getStats: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			// Verify ownership
			const account = await ctx.db.query.accounts.findFirst({
				where: and(eq(accounts.id, input.id), eq(accounts.userId, ctx.user.id)),
			});

			if (!account) {
				throw new Error("Account not found");
			}

			// Get all closed trades for this account
			const accountTrades = await ctx.db.query.trades.findMany({
				where: and(eq(trades.accountId, input.id), eq(trades.status, "closed")),
			});

			const totalTrades = accountTrades.length;
			const wins = accountTrades.filter(
				(t) => t.netPnl && parseFloat(t.netPnl) > 0,
			).length;
			const losses = accountTrades.filter(
				(t) => t.netPnl && parseFloat(t.netPnl) < 0,
			).length;

			const totalPnl = accountTrades.reduce(
				(sum, t) => sum + (t.netPnl ? parseFloat(t.netPnl) : 0),
				0,
			);

			const currentBalance =
				parseFloat(account.initialBalance ?? "0") + totalPnl;

			return {
				totalTrades,
				wins,
				losses,
				winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
				totalPnl,
				initialBalance: parseFloat(account.initialBalance ?? "0"),
				currentBalance,
			};
		}),
});
