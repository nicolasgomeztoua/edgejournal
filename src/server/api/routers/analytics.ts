import { and, eq, gte, isNotNull, isNull, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { calculateAggregateStats, parsePnl } from "@/lib/stats-calculations";
import {
	getDateStringInTimezone,
	getDayOfWeekInTimezone,
	getHourInTimezone,
	getMonthStringInTimezone,
} from "@/lib/timezone";
import {
	getActiveAccountsSubquery,
	getUserBreakevenThreshold,
	getUserTimezone,
} from "@/server/api/helpers";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { trades, userSettings } from "@/server/db/schema";

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
				conditions.push(gte(trades.exitTime, new Date(input.startDate)));
			}
			if (input?.endDate) {
				conditions.push(lte(trades.exitTime, new Date(input.endDate)));
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

	// =========================================================================
	// TIME-BASED ANALYSIS PROCEDURES
	// =========================================================================

	/**
	 * Get daily P&L data for calendar heatmap
	 * Returns last 365 days of daily aggregated P&L
	 * Groups by date in user's timezone
	 */
	getCalendarData: protectedProcedure
		.input(
			z
				.object({
					accountId: z.number().nullish(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			// Get trades from last 365 days
			const oneYearAgo = new Date();
			oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

			const conditions = [
				eq(trades.userId, ctx.user.id),
				eq(trades.status, "closed"),
				isNull(trades.deletedAt),
				isNotNull(trades.netPnl),
				gte(trades.exitTime, oneYearAgo),
			];

			if (input?.accountId) {
				conditions.push(eq(trades.accountId, input.accountId));
			} else {
				const activeAccountIds = getActiveAccountsSubquery(ctx.db, ctx.user.id);
				conditions.push(sql`${trades.accountId} IN (${activeAccountIds})`);
			}

			const closedTrades = await ctx.db
				.select({
					netPnl: trades.netPnl,
					exitTime: trades.exitTime,
				})
				.from(trades)
				.where(and(...conditions))
				.orderBy(trades.exitTime);

			// Get user settings
			const [beThreshold, userTimezone] = await Promise.all([
				getUserBreakevenThreshold(ctx.db, ctx.user.id),
				getUserTimezone(ctx.db, ctx.user.id),
			]);

			// Aggregate by date in user's timezone
			const dailyData = new Map<
				string,
				{ pnl: number; trades: number; wins: number; losses: number }
			>();

			for (const trade of closedTrades) {
				if (!trade.exitTime) continue;
				// Use timezone-aware date grouping
				const dateKey = getDateStringInTimezone(trade.exitTime, userTimezone);

				const existing = dailyData.get(dateKey) || {
					pnl: 0,
					trades: 0,
					wins: 0,
					losses: 0,
				};
				const pnl = parsePnl(trade.netPnl);
				existing.pnl += pnl;
				existing.trades += 1;
				if (pnl > beThreshold) existing.wins += 1;
				else if (pnl < -beThreshold) existing.losses += 1;

				dailyData.set(dateKey, existing);
			}

			return Array.from(dailyData.entries()).map(([date, data]) => ({
				date,
				pnl: data.pnl,
				trades: data.trades,
				wins: data.wins,
				losses: data.losses,
			}));
		}),

	/**
	 * Get performance breakdown by day of week
	 * Uses user's timezone for day calculation
	 */
	getPerformanceByDayOfWeek: protectedProcedure
		.input(
			z
				.object({
					accountId: z.number().nullish(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [
				eq(trades.userId, ctx.user.id),
				eq(trades.status, "closed"),
				isNull(trades.deletedAt),
				isNotNull(trades.netPnl),
			];

			if (input?.accountId) {
				conditions.push(eq(trades.accountId, input.accountId));
			} else {
				const activeAccountIds = getActiveAccountsSubquery(ctx.db, ctx.user.id);
				conditions.push(sql`${trades.accountId} IN (${activeAccountIds})`);
			}

			const closedTrades = await ctx.db
				.select({
					netPnl: trades.netPnl,
					exitTime: trades.exitTime,
				})
				.from(trades)
				.where(and(...conditions));

			// Get user settings
			const [beThreshold, userTimezone] = await Promise.all([
				getUserBreakevenThreshold(ctx.db, ctx.user.id),
				getUserTimezone(ctx.db, ctx.user.id),
			]);

			// Initialize days (0 = Sunday, 6 = Saturday)
			const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
			const dayData = dayNames.map((name) => ({
				day: name,
				pnl: 0,
				trades: 0,
				wins: 0,
				losses: 0,
			}));

			for (const trade of closedTrades) {
				if (!trade.exitTime) continue;
				// Use timezone-aware day calculation
				const dayIndex = getDayOfWeekInTimezone(trade.exitTime, userTimezone);
				const pnl = parsePnl(trade.netPnl);
				const dayEntry = dayData[dayIndex];
				if (!dayEntry) continue;

				dayEntry.pnl += pnl;
				dayEntry.trades += 1;
				if (pnl > beThreshold) dayEntry.wins += 1;
				else if (pnl < -beThreshold) dayEntry.losses += 1;
			}

			return dayData.map((d) => ({
				...d,
				winRate:
					d.wins + d.losses > 0 ? (d.wins / (d.wins + d.losses)) * 100 : 0,
				avgPnl: d.trades > 0 ? d.pnl / d.trades : 0,
			}));
		}),

	/**
	 * Get performance breakdown by hour of day
	 * Uses user's timezone for hour calculation
	 */
	getPerformanceByHour: protectedProcedure
		.input(
			z
				.object({
					accountId: z.number().nullish(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [
				eq(trades.userId, ctx.user.id),
				eq(trades.status, "closed"),
				isNull(trades.deletedAt),
				isNotNull(trades.netPnl),
			];

			if (input?.accountId) {
				conditions.push(eq(trades.accountId, input.accountId));
			} else {
				const activeAccountIds = getActiveAccountsSubquery(ctx.db, ctx.user.id);
				conditions.push(sql`${trades.accountId} IN (${activeAccountIds})`);
			}

			const closedTrades = await ctx.db
				.select({
					netPnl: trades.netPnl,
					entryTime: trades.entryTime,
				})
				.from(trades)
				.where(and(...conditions));

			// Get user settings
			const [beThreshold, userTimezone] = await Promise.all([
				getUserBreakevenThreshold(ctx.db, ctx.user.id),
				getUserTimezone(ctx.db, ctx.user.id),
			]);

			// Initialize 24 hours
			const hourData = Array.from({ length: 24 }, (_, i) => ({
				hour: i,
				pnl: 0,
				trades: 0,
				wins: 0,
				losses: 0,
			}));

			for (const trade of closedTrades) {
				// Use timezone-aware hour calculation
				const hourIndex = getHourInTimezone(trade.entryTime, userTimezone);
				const pnl = parsePnl(trade.netPnl);
				const hourEntry = hourData[hourIndex];
				if (!hourEntry) continue;

				hourEntry.pnl += pnl;
				hourEntry.trades += 1;
				if (pnl > beThreshold) hourEntry.wins += 1;
				else if (pnl < -beThreshold) hourEntry.losses += 1;
			}

			return hourData.map((h) => ({
				...h,
				winRate:
					h.wins + h.losses > 0 ? (h.wins / (h.wins + h.losses)) * 100 : 0,
				avgPnl: h.trades > 0 ? h.pnl / h.trades : 0,
			}));
		}),

	/**
	 * Get performance breakdown by trading session
	 * Uses user-configured sessions from settings (defaults to Asia/London/New York if not configured)
	 * All times are in UTC
	 */
	getPerformanceBySession: protectedProcedure
		.input(
			z
				.object({
					accountId: z.number().nullish(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [
				eq(trades.userId, ctx.user.id),
				eq(trades.status, "closed"),
				isNull(trades.deletedAt),
				isNotNull(trades.netPnl),
			];

			if (input?.accountId) {
				conditions.push(eq(trades.accountId, input.accountId));
			} else {
				const activeAccountIds = getActiveAccountsSubquery(ctx.db, ctx.user.id);
				conditions.push(sql`${trades.accountId} IN (${activeAccountIds})`);
			}

			const closedTrades = await ctx.db
				.select({
					netPnl: trades.netPnl,
					entryTime: trades.entryTime,
				})
				.from(trades)
				.where(and(...conditions));

			const beThreshold = await getUserBreakevenThreshold(ctx.db, ctx.user.id);

			// Get user's custom sessions from settings
			const userSettingsRow = await ctx.db.query.userSettings.findFirst({
				where: eq(userSettings.userId, ctx.user.id),
				columns: { tradingSessions: true },
			});

			// Default sessions if user hasn't configured any
			const defaultSessions = [
				{ name: "Asia", startHour: 0, endHour: 8, color: "#00d4ff" },
				{ name: "London", startHour: 8, endHour: 16, color: "#d4ff00" },
				{ name: "New York", startHour: 13, endHour: 21, color: "#00ff88" },
			];

			let sessionConfigs = defaultSessions;
			if (userSettingsRow?.tradingSessions) {
				try {
					const parsed = JSON.parse(userSettingsRow.tradingSessions);
					if (Array.isArray(parsed) && parsed.length > 0) {
						sessionConfigs = parsed;
					}
				} catch {
					// Keep defaults on parse error
				}
			}

			// Build sessions data structure
			const sessions: Record<
				string,
				{
					name: string;
					start: number;
					end: number;
					color: string;
					pnl: number;
					trades: number;
					wins: number;
					losses: number;
				}
			> = {};

			for (const config of sessionConfigs) {
				const key = config.name.toLowerCase().replace(/\s+/g, "_");
				sessions[key] = {
					name: config.name,
					start: config.startHour,
					end: config.endHour,
					color: config.color || "#6366f1",
					pnl: 0,
					trades: 0,
					wins: 0,
					losses: 0,
				};
			}

			// Helper to determine which sessions an hour belongs to (based on UTC hours)
			const getSessionsForHour = (hour: number): string[] => {
				const result: string[] = [];
				for (const [key, session] of Object.entries(sessions)) {
					// Handle sessions that wrap around midnight
					if (session.start <= session.end) {
						// Normal session (e.g., 8-16)
						if (hour >= session.start && hour < session.end) {
							result.push(key);
						}
					} else {
						// Wrapping session (e.g., 22-6)
						if (hour >= session.start || hour < session.end) {
							result.push(key);
						}
					}
				}
				return result;
			};

			for (const trade of closedTrades) {
				// Sessions use UTC hours
				const hour = trade.entryTime.getUTCHours();
				const pnl = parsePnl(trade.netPnl);
				const tradesSessions = getSessionsForHour(hour);

				// Attribute trade to all applicable sessions (handles overlap)
				for (const sessionKey of tradesSessions) {
					const session = sessions[sessionKey];
					if (session) {
						session.pnl += pnl;
						session.trades += 1;
						if (pnl > beThreshold) session.wins += 1;
						else if (pnl < -beThreshold) session.losses += 1;
					}
				}
			}

			return Object.values(sessions).map((s) => ({
				session: s.name,
				pnl: s.pnl,
				trades: s.trades,
				wins: s.wins,
				losses: s.losses,
				color: s.color,
				winRate:
					s.wins + s.losses > 0 ? (s.wins / (s.wins + s.losses)) * 100 : 0,
				avgPnl: s.trades > 0 ? s.pnl / s.trades : 0,
			}));
		}),

	/**
	 * Get performance breakdown by month
	 * Uses user's timezone for month grouping
	 */
	getPerformanceByMonth: protectedProcedure
		.input(
			z
				.object({
					accountId: z.number().nullish(),
					months: z.number().min(1).max(24).default(12),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const monthsBack = input?.months ?? 12;
			const startDate = new Date();
			startDate.setMonth(startDate.getMonth() - monthsBack);
			startDate.setDate(1);
			startDate.setHours(0, 0, 0, 0);

			const conditions = [
				eq(trades.userId, ctx.user.id),
				eq(trades.status, "closed"),
				isNull(trades.deletedAt),
				isNotNull(trades.netPnl),
				gte(trades.exitTime, startDate),
			];

			if (input?.accountId) {
				conditions.push(eq(trades.accountId, input.accountId));
			} else {
				const activeAccountIds = getActiveAccountsSubquery(ctx.db, ctx.user.id);
				conditions.push(sql`${trades.accountId} IN (${activeAccountIds})`);
			}

			const closedTrades = await ctx.db
				.select({
					netPnl: trades.netPnl,
					exitTime: trades.exitTime,
				})
				.from(trades)
				.where(and(...conditions))
				.orderBy(trades.exitTime);

			// Get user settings
			const [beThreshold, userTimezone] = await Promise.all([
				getUserBreakevenThreshold(ctx.db, ctx.user.id),
				getUserTimezone(ctx.db, ctx.user.id),
			]);

			// Aggregate by month in user's timezone
			const monthData = new Map<
				string,
				{ pnl: number; trades: number; wins: number; losses: number }
			>();

			for (const trade of closedTrades) {
				if (!trade.exitTime) continue;
				// Use timezone-aware month extraction
				const monthKey = getMonthStringInTimezone(trade.exitTime, userTimezone);

				const existing = monthData.get(monthKey) || {
					pnl: 0,
					trades: 0,
					wins: 0,
					losses: 0,
				};
				const pnl = parsePnl(trade.netPnl);
				existing.pnl += pnl;
				existing.trades += 1;
				if (pnl > beThreshold) existing.wins += 1;
				else if (pnl < -beThreshold) existing.losses += 1;

				monthData.set(monthKey, existing);
			}

			// Convert to array and sort by date
			return Array.from(monthData.entries())
				.map(([month, data]) => ({
					month,
					pnl: data.pnl,
					trades: data.trades,
					wins: data.wins,
					losses: data.losses,
					winRate:
						data.wins + data.losses > 0
							? (data.wins / (data.wins + data.losses)) * 100
							: 0,
					avgPnl: data.trades > 0 ? data.pnl / data.trades : 0,
				}))
				.sort((a, b) => a.month.localeCompare(b.month));
		}),
});
