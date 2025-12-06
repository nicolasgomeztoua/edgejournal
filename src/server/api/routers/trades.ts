import { z } from "zod";
import { eq, desc, and, gte, lte, sql, isNull, isNotNull, ilike, or } from "drizzle-orm";

import {
	createTRPCRouter,
	protectedProcedure,
} from "@/server/api/trpc";
import { trades, tradeTags, userSettings } from "@/server/db/schema";
import { calculatePnL } from "@/lib/symbols";

// Input schemas
const createTradeSchema = z.object({
	symbol: z.string().min(1),
	instrumentType: z.enum(["futures", "forex"]),
	direction: z.enum(["long", "short"]),
	entryPrice: z.string(),
	entryTime: z.string().datetime(),
	quantity: z.string(),
	// Exit fields (for closed trades / imports)
	exitPrice: z.string().optional(),
	exitTime: z.string().datetime().optional(),
	// Risk management
	stopLoss: z.string().optional(),
	takeProfit: z.string().optional(),
	// Fees
	fees: z.string().optional(),
	// Metadata
	setupType: z.string().optional(),
	emotionalState: z
		.enum([
			"confident",
			"fearful",
			"greedy",
			"neutral",
			"frustrated",
			"excited",
			"anxious",
		])
		.optional(),
	notes: z.string().optional(),
	tagIds: z.array(z.number()).optional(),
	accountId: z.number(), // Required: Link to trading account
	externalId: z.string().optional(), // For tracking imported trades
});

const updateTradeSchema = z.object({
	id: z.number(),
	symbol: z.string().optional(),
	instrumentType: z.enum(["futures", "forex"]).optional(),
	direction: z.enum(["long", "short"]).optional(),
	entryPrice: z.string().optional(),
	exitPrice: z.string().optional(),
	exitTime: z.string().datetime().optional(),
	quantity: z.string().optional(),
	stopLoss: z.string().optional(),
	takeProfit: z.string().optional(),
	stopLossHit: z.boolean().optional(),
	takeProfitHit: z.boolean().optional(),
	realizedPnl: z.string().optional(),
	fees: z.string().optional(),
	netPnl: z.string().optional(),
	setupType: z.string().optional(),
	emotionalState: z
		.enum([
			"confident",
			"fearful",
			"greedy",
			"neutral",
			"frustrated",
			"excited",
			"anxious",
		])
		.optional(),
	notes: z.string().optional(),
	status: z.enum(["open", "closed"]).optional(),
});

// Batch import schema for CSV imports
const batchImportTradeSchema = z.object({
	symbol: z.string().min(1),
	instrumentType: z.enum(["futures", "forex"]),
	direction: z.enum(["long", "short"]),
	entryPrice: z.string(),
	entryTime: z.string(), // ISO string
	exitPrice: z.string().optional(),
	exitTime: z.string().optional(), // ISO string
	quantity: z.string(),
	stopLoss: z.string().optional(),
	takeProfit: z.string().optional(),
	stopLossHit: z.boolean().optional(), // Pre-determined from orders data
	takeProfitHit: z.boolean().optional(), // Pre-determined from orders data
	fees: z.string().optional(),
	notes: z.string().optional(),
	externalId: z.string().optional(),
});

const batchImportSchema = z.object({
	accountId: z.number(),
	trades: z.array(batchImportTradeSchema).min(1).max(1000), // Limit batch size
});

export const tradesRouter = createTRPCRouter({
	// Get all trades for current user
	getAll: protectedProcedure
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).default(50),
					cursor: z.number().optional(),
					status: z.enum(["open", "closed"]).optional(),
					symbol: z.string().optional(),
					tradeDirection: z.enum(["long", "short"]).optional(),
					startDate: z.string().datetime().optional(),
					endDate: z.string().datetime().optional(),
					accountId: z.number().optional(),
					search: z.string().optional(), // Server-side search
					includeDeleted: z.boolean().optional(), // Include soft-deleted trades
				})
				.optional()
		)
		.query(async ({ ctx, input }) => {
			const limit = input?.limit ?? 50;

			const conditions = [eq(trades.userId, ctx.user.id)];

			// Exclude deleted trades by default
			if (!input?.includeDeleted) {
				conditions.push(isNull(trades.deletedAt));
			}

			// Filter by account if specified
			if (input?.accountId) {
				conditions.push(eq(trades.accountId, input.accountId));
			}
			if (input?.status) {
				conditions.push(eq(trades.status, input.status));
			}
			if (input?.symbol) {
				conditions.push(ilike(trades.symbol, `%${input.symbol}%`));
			}
			if (input?.tradeDirection) {
				conditions.push(eq(trades.direction, input.tradeDirection));
			}
			if (input?.startDate) {
				conditions.push(gte(trades.entryTime, new Date(input.startDate)));
			}
			if (input?.endDate) {
				conditions.push(lte(trades.entryTime, new Date(input.endDate)));
			}
			// Server-side search: symbol, setupType, or notes
			if (input?.search) {
				const searchTerm = `%${input.search}%`;
				conditions.push(
					or(
						ilike(trades.symbol, searchTerm),
						ilike(trades.setupType, searchTerm),
						ilike(trades.notes, searchTerm)
					)!
				);
			}
			if (input?.cursor) {
				conditions.push(lte(trades.id, input.cursor));
			}

			const items = await ctx.db.query.trades.findMany({
				where: and(...conditions),
				orderBy: [desc(trades.entryTime)],
				limit: limit + 1,
				with: {
					tradeTags: {
						with: {
							tag: true,
						},
					},
					account: true,
				},
			});

			let nextCursor: number | undefined;
			if (items.length > limit) {
				const nextItem = items.pop();
				nextCursor = nextItem?.id;
			}

			return {
				items,
				nextCursor,
			};
		}),

	// Get a single trade by ID
	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const trade = await ctx.db.query.trades.findFirst({
				where: and(eq(trades.id, input.id), eq(trades.userId, ctx.user.id)),
				with: {
					executions: true,
					tradeTags: {
						with: {
							tag: true,
						},
					},
					screenshots: true,
					account: true, // Include account info
				},
			});

			if (!trade) {
				throw new Error("Trade not found");
			}

			return trade;
		}),

	// Create a new trade
	create: protectedProcedure
		.input(createTradeSchema)
		.mutation(async ({ ctx, input }) => {
			const { tagIds, externalId, ...tradeData } = input;

			// Determine if trade is closed (has exit price)
			const isClosed = !!input.exitPrice && !!input.exitTime;
			
			// Calculate P&L if trade is closed
			let realizedPnl: string | undefined;
			let netPnl: string | undefined;
			let stopLossHit = false;
			let takeProfitHit = false;

			if (isClosed && input.exitPrice) {
				const pnl = calculatePnL(
					input.symbol,
					input.instrumentType,
					parseFloat(input.entryPrice),
					parseFloat(input.exitPrice),
					parseFloat(input.quantity),
					input.direction
				);
				realizedPnl = pnl.toFixed(2);
				
				const fees = parseFloat(input.fees || "0");
				netPnl = (pnl - fees).toFixed(2);

				// Check if SL/TP was hit
				if (input.stopLoss) {
					const sl = parseFloat(input.stopLoss);
					const exit = parseFloat(input.exitPrice);
					if (input.direction === "long") {
						stopLossHit = exit <= sl;
					} else {
						stopLossHit = exit >= sl;
					}
				}
				if (input.takeProfit) {
					const tp = parseFloat(input.takeProfit);
					const exit = parseFloat(input.exitPrice);
					if (input.direction === "long") {
						takeProfitHit = exit >= tp;
					} else {
						takeProfitHit = exit <= tp;
					}
				}
			}

			const [newTrade] = await ctx.db
				.insert(trades)
				.values({
					...tradeData,
					userId: ctx.user.id,
					entryTime: new Date(input.entryTime),
					exitTime: input.exitTime ? new Date(input.exitTime) : null,
					status: isClosed ? "closed" : "open",
					importSource: externalId ? "csv" : "manual",
					externalId: externalId || null,
					realizedPnl,
					netPnl,
					stopLossHit,
					takeProfitHit,
				})
				.returning();

			// Add tags if provided
			if (tagIds && tagIds.length > 0 && newTrade) {
				await ctx.db.insert(tradeTags).values(
					tagIds.map((tagId) => ({
						tradeId: newTrade.id,
						tagId,
					}))
				);
			}

			return newTrade;
		}),

	// Batch import trades (much faster for CSV imports)
	batchImport: protectedProcedure
		.input(batchImportSchema)
		.mutation(async ({ ctx, input }) => {
			const { accountId, trades: tradesToImport } = input;

			// Prepare all trade records with P&L calculations
			const tradeRecords = tradesToImport.map((trade) => {
				const isClosed = !!trade.exitPrice && !!trade.exitTime;
				
				let realizedPnl: string | undefined;
				let netPnl: string | undefined;
				
				// Use provided SL/TP hit values if available (from Orders CSV), otherwise calculate
				let stopLossHit = trade.stopLossHit ?? false;
				let takeProfitHit = trade.takeProfitHit ?? false;

				if (isClosed && trade.exitPrice) {
					const pnl = calculatePnL(
						trade.symbol,
						trade.instrumentType,
						parseFloat(trade.entryPrice),
						parseFloat(trade.exitPrice),
						parseFloat(trade.quantity),
						trade.direction
					);
					realizedPnl = pnl.toFixed(2);
					
					const fees = parseFloat(trade.fees || "0");
					netPnl = (pnl - fees).toFixed(2);

					// Only calculate SL/TP hit if not already provided
					if (trade.stopLossHit === undefined && trade.stopLoss) {
						const sl = parseFloat(trade.stopLoss);
						const exit = parseFloat(trade.exitPrice);
						if (trade.direction === "long") {
							stopLossHit = exit <= sl;
						} else {
							stopLossHit = exit >= sl;
						}
					}
					if (trade.takeProfitHit === undefined && trade.takeProfit) {
						const tp = parseFloat(trade.takeProfit);
						const exit = parseFloat(trade.exitPrice);
						if (trade.direction === "long") {
							takeProfitHit = exit >= tp;
						} else {
							takeProfitHit = exit <= tp;
						}
					}
				}

				return {
					userId: ctx.user.id,
					accountId,
					symbol: trade.symbol,
					instrumentType: trade.instrumentType,
					direction: trade.direction,
					entryPrice: trade.entryPrice,
					entryTime: new Date(trade.entryTime),
					exitPrice: trade.exitPrice || null,
					exitTime: trade.exitTime ? new Date(trade.exitTime) : null,
					quantity: trade.quantity,
					stopLoss: trade.stopLoss || null,
					takeProfit: trade.takeProfit || null,
					fees: trade.fees || null,
					notes: trade.notes || null,
					externalId: trade.externalId || null,
					status: isClosed ? "closed" as const : "open" as const,
					importSource: "csv" as const,
					realizedPnl,
					netPnl,
					stopLossHit,
					takeProfitHit,
				};
			});

			// Insert all trades in a single batch
			const insertedTrades = await ctx.db
				.insert(trades)
				.values(tradeRecords)
				.returning({ id: trades.id });

			return {
				imported: insertedTrades.length,
				total: tradesToImport.length,
			};
		}),

	// Update a trade
	update: protectedProcedure
		.input(updateTradeSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			// Verify ownership
			const existingTrade = await ctx.db.query.trades.findFirst({
				where: and(eq(trades.id, id), eq(trades.userId, ctx.user.id)),
			});

			if (!existingTrade) {
				throw new Error("Trade not found");
			}

			// Determine final values (use input if provided, otherwise use existing)
			const finalDirection = updateData.direction ?? existingTrade.direction;
			const finalEntryPrice = updateData.entryPrice ?? existingTrade.entryPrice;
			const finalQuantity = updateData.quantity ?? existingTrade.quantity;
			const finalExitPrice = updateData.exitPrice ?? existingTrade.exitPrice;
			const finalFees = updateData.fees ?? existingTrade.fees;
			const finalStopLoss = updateData.stopLoss ?? existingTrade.stopLoss;
			const finalTakeProfit = updateData.takeProfit ?? existingTrade.takeProfit;

			// Recalculate P&L if trade is closed and has exit price
			let recalculatedPnl: {
				realizedPnl?: string;
				netPnl?: string;
				stopLossHit?: boolean;
				takeProfitHit?: boolean;
			} = {};

			// Get symbol and instrument type (use updated values if provided)
			const finalSymbol = updateData.symbol ?? existingTrade.symbol;
			const finalInstrumentType = updateData.instrumentType ?? existingTrade.instrumentType;

			if (existingTrade.status === "closed" && finalExitPrice) {
				const entryPrice = parseFloat(finalEntryPrice);
				const exitPrice = parseFloat(finalExitPrice);
				const quantity = parseFloat(finalQuantity);
				const fees = parseFloat(finalFees ?? "0");

				// Use proper contract/lot size calculation
				const realizedPnl = calculatePnL(
					finalSymbol,
					finalInstrumentType,
					entryPrice,
					exitPrice,
					quantity,
					finalDirection
				);

				const netPnl = realizedPnl - fees;

				// Check if SL/TP was hit
				const stopLossHit =
					finalStopLoss &&
					((finalDirection === "long" && exitPrice <= parseFloat(finalStopLoss)) ||
						(finalDirection === "short" && exitPrice >= parseFloat(finalStopLoss)));

				const takeProfitHit =
					finalTakeProfit &&
					((finalDirection === "long" && exitPrice >= parseFloat(finalTakeProfit)) ||
						(finalDirection === "short" && exitPrice <= parseFloat(finalTakeProfit)));

				recalculatedPnl = {
					realizedPnl: realizedPnl.toString(),
					netPnl: netPnl.toString(),
					stopLossHit: Boolean(stopLossHit),
					takeProfitHit: Boolean(takeProfitHit),
				};
			}

			const [updated] = await ctx.db
				.update(trades)
				.set({
					...updateData,
					...recalculatedPnl,
					exitTime: updateData.exitTime
						? new Date(updateData.exitTime)
						: undefined,
				})
				.where(eq(trades.id, id))
				.returning();

			return updated;
		}),

	// Close a trade
	close: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				exitPrice: z.string(),
				exitTime: z.string().datetime(),
				fees: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const existingTrade = await ctx.db.query.trades.findFirst({
				where: and(eq(trades.id, input.id), eq(trades.userId, ctx.user.id)),
			});

			if (!existingTrade) {
				throw new Error("Trade not found");
			}

			// Calculate P&L with proper contract/lot sizing
			const entryPrice = parseFloat(existingTrade.entryPrice);
			const exitPrice = parseFloat(input.exitPrice);
			const quantity = parseFloat(existingTrade.quantity);
			const fees = parseFloat(input.fees ?? "0");

			const realizedPnl = calculatePnL(
				existingTrade.symbol,
				existingTrade.instrumentType,
				entryPrice,
				exitPrice,
				quantity,
				existingTrade.direction
			);

			const netPnl = realizedPnl - fees;

			// Check if SL/TP was hit
			const stopLossHit =
				existingTrade.stopLoss &&
				((existingTrade.direction === "long" &&
					exitPrice <= parseFloat(existingTrade.stopLoss)) ||
					(existingTrade.direction === "short" &&
						exitPrice >= parseFloat(existingTrade.stopLoss)));

			const takeProfitHit =
				existingTrade.takeProfit &&
				((existingTrade.direction === "long" &&
					exitPrice >= parseFloat(existingTrade.takeProfit)) ||
					(existingTrade.direction === "short" &&
						exitPrice <= parseFloat(existingTrade.takeProfit)));

			const [updated] = await ctx.db
				.update(trades)
				.set({
					exitPrice: input.exitPrice,
					exitTime: new Date(input.exitTime),
					status: "closed",
					realizedPnl: realizedPnl.toString(),
					fees: fees.toString(),
					netPnl: netPnl.toString(),
				stopLossHit: Boolean(stopLossHit),
				takeProfitHit: Boolean(takeProfitHit),
				})
				.where(eq(trades.id, input.id))
				.returning();

			return updated;
		}),

	// Soft delete a trade
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const existingTrade = await ctx.db.query.trades.findFirst({
				where: and(eq(trades.id, input.id), eq(trades.userId, ctx.user.id)),
			});

			if (!existingTrade) {
				throw new Error("Trade not found");
			}

			// Soft delete by setting deletedAt timestamp
			await ctx.db
				.update(trades)
				.set({ deletedAt: new Date() })
				.where(eq(trades.id, input.id));
			
			return { success: true };
		}),

	// Bulk soft delete trades
	deleteMany: protectedProcedure
		.input(z.object({ ids: z.array(z.number()).min(1).max(100) }))
		.mutation(async ({ ctx, input }) => {
			// Verify all trades belong to user before deleting
			const existingTrades = await ctx.db.query.trades.findMany({
				where: and(
					eq(trades.userId, ctx.user.id),
					sql`${trades.id} IN (${sql.join(input.ids.map(id => sql`${id}`), sql`, `)})`
				),
			});

			if (existingTrades.length !== input.ids.length) {
				throw new Error("Some trades not found or don't belong to you");
			}

			// Soft delete all
			await ctx.db
				.update(trades)
				.set({ deletedAt: new Date() })
				.where(
					and(
						eq(trades.userId, ctx.user.id),
						sql`${trades.id} IN (${sql.join(input.ids.map(id => sql`${id}`), sql`, `)})`
					)
				);
			
			return { success: true, deleted: input.ids.length };
		}),

	// Restore a soft-deleted trade
	restore: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const existingTrade = await ctx.db.query.trades.findFirst({
				where: and(
					eq(trades.id, input.id),
					eq(trades.userId, ctx.user.id),
					isNotNull(trades.deletedAt)
				),
			});

			if (!existingTrade) {
				throw new Error("Deleted trade not found");
			}

			await ctx.db
				.update(trades)
				.set({ deletedAt: null })
				.where(eq(trades.id, input.id));
			
			return { success: true };
		}),

	// Permanently delete a trade (hard delete)
	permanentDelete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const existingTrade = await ctx.db.query.trades.findFirst({
				where: and(eq(trades.id, input.id), eq(trades.userId, ctx.user.id)),
			});

			if (!existingTrade) {
				throw new Error("Trade not found");
			}

			await ctx.db.delete(trades).where(eq(trades.id, input.id));
			return { success: true };
		}),

	// Get deleted trades (trash)
	getDeleted: protectedProcedure
		.input(
			z.object({
				accountId: z.number().optional(),
				limit: z.number().min(1).max(100).default(50),
			}).optional()
		)
		.query(async ({ ctx, input }) => {
			const conditions = [
				eq(trades.userId, ctx.user.id),
				isNotNull(trades.deletedAt),
			];

			if (input?.accountId) {
				conditions.push(eq(trades.accountId, input.accountId));
			}

			const items = await ctx.db.query.trades.findMany({
				where: and(...conditions),
				orderBy: [desc(trades.deletedAt)],
				limit: input?.limit ?? 50,
				with: {
					account: true,
				},
			});

			return items;
		}),

	// Get trade statistics
	getStats: protectedProcedure
		.input(
			z
				.object({
					startDate: z.string().datetime().optional(),
					endDate: z.string().datetime().optional(),
					accountId: z.number().optional(), // Filter by account
				})
				.optional()
		)
		.query(async ({ ctx, input }) => {
			// Get user's breakeven threshold setting
			const userSettingsResult = await ctx.db.query.userSettings.findFirst({
				where: eq(userSettings.userId, ctx.user.id),
				columns: {
					breakevenThreshold: true,
				},
			});
			const beThreshold = parseFloat(userSettingsResult?.breakevenThreshold ?? "3.00");

			const conditions = [
				eq(trades.userId, ctx.user.id),
				eq(trades.status, "closed"),
				isNull(trades.deletedAt), // Exclude deleted trades from stats
			];

			// Filter by account if specified
			if (input?.accountId) {
				conditions.push(eq(trades.accountId, input.accountId));
			}
			if (input?.startDate) {
				conditions.push(gte(trades.entryTime, new Date(input.startDate)));
			}
			if (input?.endDate) {
				conditions.push(lte(trades.entryTime, new Date(input.endDate)));
			}

			const closedTrades = await ctx.db.query.trades.findMany({
				where: and(...conditions),
			});

			const totalTrades = closedTrades.length;
			
			// Classify trades using breakeven threshold
			// Win: P&L > threshold, Loss: P&L < -threshold, Breakeven: within ±threshold
			const wins = closedTrades.filter((t) => {
				const pnl = t.netPnl ? parseFloat(t.netPnl) : 0;
				return pnl > beThreshold;
			}).length;
			
			const losses = closedTrades.filter((t) => {
				const pnl = t.netPnl ? parseFloat(t.netPnl) : 0;
				return pnl < -beThreshold;
			}).length;
			
			const breakevens = totalTrades - wins - losses;

			const totalPnl = closedTrades.reduce(
				(sum, t) => sum + (t.netPnl ? parseFloat(t.netPnl) : 0),
				0
			);
			
			// For profit factor, use threshold-adjusted wins/losses
			const grossProfit = closedTrades.reduce((sum, t) => {
				const pnl = t.netPnl ? parseFloat(t.netPnl) : 0;
				return pnl > beThreshold ? sum + pnl : sum;
			}, 0);
			const grossLoss = closedTrades.reduce((sum, t) => {
				const pnl = t.netPnl ? parseFloat(t.netPnl) : 0;
				return pnl < -beThreshold ? sum + Math.abs(pnl) : sum;
			}, 0);

			// Win rate excludes breakevens - only wins vs losses
			const decisiveTrades = wins + losses;
			const winRate = decisiveTrades > 0 ? (wins / decisiveTrades) * 100 : 0;
			const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
			const avgWin = wins > 0 ? grossProfit / wins : 0;
			const avgLoss = losses > 0 ? grossLoss / losses : 0;

			return {
				totalTrades,
				wins,
				losses,
				breakevens,
				winRate,
				totalPnl,
				grossProfit,
				grossLoss,
				profitFactor,
				avgWin,
				avgLoss,
				breakevenThreshold: beThreshold,
			};
		}),
});

