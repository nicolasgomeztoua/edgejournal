import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { calculateAggregateStats, parsePnl } from "@/lib/stats-calculations";
import {
	getActiveAccountsSubquery,
	getUserBreakevenThreshold,
} from "@/server/api/helpers";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { trades } from "@/server/db/schema";

// =============================================================================
// ANALYTICS ROUTER
// Provides advanced analytics and performance metrics
// =============================================================================

export const analyticsRouter = createTRPCRouter({
	/**
	 * Get overview metrics for the analytics dashboard
	 * Returns all core metrics in a single call for efficiency
	 */
	getOverview: protectedProcedure
		.input(
			z
				.object({
					accountId: z.number().nullish(),
					startDate: z.string().datetime().nullish(),
					endDate: z.string().datetime().nullish(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			// Build conditions for the query
			const conditions = [
				eq(trades.userId, ctx.user.id),
				eq(trades.status, "closed"),
				isNull(trades.deletedAt),
				isNotNull(trades.netPnl),
			];

			// Filter by account if specified, otherwise use active accounts
			if (input?.accountId) {
				conditions.push(eq(trades.accountId, input.accountId));
			} else {
				const activeAccountIds = getActiveAccountsSubquery(ctx.db, ctx.user.id);
				conditions.push(sql`${trades.accountId} IN (${activeAccountIds})`);
			}

			// Date range filters
			if (input?.startDate) {
				conditions.push(
					sql`${trades.exitTime} >= ${new Date(input.startDate)}`,
				);
			}
			if (input?.endDate) {
				conditions.push(sql`${trades.exitTime} <= ${new Date(input.endDate)}`);
			}

			// Fetch all closed trades with P&L
			const closedTrades = await ctx.db
				.select({
					id: trades.id,
					netPnl: trades.netPnl,
					entryPrice: trades.entryPrice,
					stopLoss: trades.stopLoss,
					quantity: trades.quantity,
					exitTime: trades.exitTime,
				})
				.from(trades)
				.where(and(...conditions))
				.orderBy(trades.exitTime);

			// Get user's breakeven threshold
			const beThreshold = await getUserBreakevenThreshold(ctx.db, ctx.user.id);

			// Calculate aggregate stats using existing function
			const stats = calculateAggregateStats(closedTrades, beThreshold);

			// Calculate additional advanced metrics
			const pnls = closedTrades.map((t) => parsePnl(t.netPnl));

			// Expectancy: (winRate/100 * avgWin) - (lossRate/100 * avgLoss)
			const winRate = stats.winRate / 100;
			const lossRate = 1 - winRate;
			const expectancy =
				stats.totalTrades > 0
					? winRate * stats.avgWin - lossRate * stats.avgLoss
					: 0;

			// Payoff Ratio: avgWin / avgLoss
			const payoffRatio = stats.avgLoss > 0 ? stats.avgWin / stats.avgLoss : 0;

			// Sharpe Ratio: (mean return - risk free rate) / std dev
			// Using 0 as risk-free rate for simplicity (common in trading)
			let sharpeRatio = 0;
			if (pnls.length > 1) {
				const mean = stats.avgPnl;
				const variance =
					pnls.reduce((sum, pnl) => sum + (pnl - mean) ** 2, 0) /
					(pnls.length - 1);
				const stdDev = Math.sqrt(variance);
				sharpeRatio = stdDev > 0 ? mean / stdDev : 0;
			}

			// Largest win and loss
			const largestWin = pnls.length > 0 ? Math.max(...pnls) : 0;
			const largestLoss = pnls.length > 0 ? Math.min(...pnls) : 0;

			// Consecutive wins/losses (current streak)
			let currentStreak = 0;
			let currentStreakType: "win" | "loss" | "none" = "none";
			for (let i = pnls.length - 1; i >= 0; i--) {
				const pnl = pnls[i];
				if (pnl === undefined) continue;

				if (pnl > beThreshold) {
					if (currentStreakType === "none" || currentStreakType === "win") {
						currentStreakType = "win";
						currentStreak++;
					} else {
						break;
					}
				} else if (pnl < -beThreshold) {
					if (currentStreakType === "none" || currentStreakType === "loss") {
						currentStreakType = "loss";
						currentStreak++;
					} else {
						break;
					}
				} else {
					// Breakeven breaks the streak
					break;
				}
			}

			return {
				// Basic stats
				totalTrades: stats.totalTrades,
				wins: stats.wins,
				losses: stats.losses,
				breakevens: stats.breakevens,
				winRate: stats.winRate,
				totalPnl: stats.totalPnl,
				avgPnl: stats.avgPnl,
				grossProfit: stats.grossProfit,
				grossLoss: stats.grossLoss,
				profitFactor: stats.profitFactor,
				avgWin: stats.avgWin,
				avgLoss: stats.avgLoss,
				avgRMultiple: stats.avgRMultiple,

				// Advanced metrics
				expectancy,
				payoffRatio,
				sharpeRatio,
				largestWin,
				largestLoss,

				// Streak info
				currentStreak,
				currentStreakType,
			};
		}),
});
