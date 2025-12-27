import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
	playbookRules,
	playbooks,
	tradeRuleChecks,
	trades,
	userSettings,
} from "@/server/db/schema";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

const riskParametersSchema = z.object({
	positionSizing: z
		.object({
			method: z.enum(["fixed", "risk_percent", "kelly"]),
			fixedSize: z.number().optional(),
			riskPercent: z.number().optional(),
			kellyFraction: z.number().optional(),
		})
		.optional(),
	maxRiskPerTrade: z
		.object({
			type: z.enum(["dollars", "percent"]),
			value: z.number(),
		})
		.optional(),
	dailyLossLimit: z
		.object({
			type: z.enum(["dollars", "percent"]),
			value: z.number(),
		})
		.optional(),
	maxConcurrentPositions: z.number().optional(),
	minRRRatio: z.number().optional(),
	targetRMultiples: z.array(z.number()).optional(),
});

const scalingRulesSchema = z.object({
	scaleIn: z
		.array(
			z.object({
				trigger: z.string(),
				sizePercent: z.number(),
			}),
		)
		.optional(),
	scaleOut: z
		.array(
			z.object({
				trigger: z.string(),
				sizePercent: z.number(),
			}),
		)
		.optional(),
});

const trailingRulesSchema = z.object({
	moveToBreakeven: z
		.object({
			triggerR: z.number(),
			offsetTicks: z.number().optional(),
		})
		.optional(),
	trailStops: z
		.array(
			z.object({
				triggerR: z.number(),
				method: z.enum(["fixed_ticks", "atr_multiple", "swing_low"]),
				value: z.number(),
			}),
		)
		.optional(),
});

const playbookRuleSchema = z.object({
	id: z.number().optional(), // Optional for new rules
	text: z.string().min(1),
	category: z.enum(["entry", "exit", "risk", "management"]),
	order: z.number(),
});

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const createPlaybookSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().optional(),
	color: z.string().optional(),
	entryCriteria: z.string().optional(),
	exitRules: z.string().optional(),
	riskParameters: riskParametersSchema.optional(),
	scalingRules: scalingRulesSchema.optional(),
	trailingRules: trailingRulesSchema.optional(),
	isActive: z.boolean().optional(),
	rules: z.array(playbookRuleSchema).optional(),
});

const updatePlaybookSchema = z.object({
	id: z.number(),
	name: z.string().min(1).max(100).optional(),
	description: z.string().nullish(),
	color: z.string().optional(),
	entryCriteria: z.string().nullish(),
	exitRules: z.string().nullish(),
	riskParameters: riskParametersSchema.nullish(),
	scalingRules: scalingRulesSchema.nullish(),
	trailingRules: trailingRulesSchema.nullish(),
	isActive: z.boolean().optional(),
	rules: z.array(playbookRuleSchema).optional(),
});

// =============================================================================
// ROUTER
// =============================================================================

export const playbooksRouter = createTRPCRouter({
	// Get all playbooks for current user
	getAll: protectedProcedure
		.input(
			z
				.object({
					includeInactive: z.boolean().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [eq(playbooks.userId, ctx.user.id)];

			if (!input?.includeInactive) {
				conditions.push(eq(playbooks.isActive, true));
			}

			const results = await ctx.db.query.playbooks.findMany({
				where: and(...conditions),
				orderBy: [desc(playbooks.createdAt)],
				with: {
					rules: {
						orderBy: [playbookRules.order],
					},
				},
			});

			// Get trade counts and stats for each playbook
			const playbooksWithStats = await Promise.all(
				results.map(async (playbook) => {
					// Get trade count for this playbook
					const tradeCountResult = await ctx.db
						.select({ count: sql<number>`count(*)` })
						.from(trades)
						.where(
							and(
								eq(trades.playbookId, playbook.id),
								eq(trades.userId, ctx.user.id),
								isNull(trades.deletedAt),
							),
						);

					const tradeCount = tradeCountResult[0]?.count ?? 0;

					return {
						...playbook,
						riskParameters: playbook.riskParameters
							? JSON.parse(playbook.riskParameters)
							: null,
						scalingRules: playbook.scalingRules
							? JSON.parse(playbook.scalingRules)
							: null,
						trailingRules: playbook.trailingRules
							? JSON.parse(playbook.trailingRules)
							: null,
						_count: {
							rules: playbook.rules.length,
							trades: tradeCount,
						},
					};
				}),
			);

			return playbooksWithStats;
		}),

	// Get a single playbook by ID
	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const playbook = await ctx.db.query.playbooks.findFirst({
				where: and(
					eq(playbooks.id, input.id),
					eq(playbooks.userId, ctx.user.id),
				),
				with: {
					rules: {
						orderBy: [playbookRules.order],
					},
				},
			});

			if (!playbook) {
				throw new Error("Playbook not found");
			}

			return {
				...playbook,
				riskParameters: playbook.riskParameters
					? JSON.parse(playbook.riskParameters)
					: null,
				scalingRules: playbook.scalingRules
					? JSON.parse(playbook.scalingRules)
					: null,
				trailingRules: playbook.trailingRules
					? JSON.parse(playbook.trailingRules)
					: null,
			};
		}),

	// Create a new playbook
	create: protectedProcedure
		.input(createPlaybookSchema)
		.mutation(async ({ ctx, input }) => {
			const { rules, riskParameters, scalingRules, trailingRules, ...data } =
				input;

			const [newPlaybook] = await ctx.db
				.insert(playbooks)
				.values({
					...data,
					userId: ctx.user.id,
					riskParameters: riskParameters
						? JSON.stringify(riskParameters)
						: null,
					scalingRules: scalingRules ? JSON.stringify(scalingRules) : null,
					trailingRules: trailingRules ? JSON.stringify(trailingRules) : null,
				})
				.returning();

			if (!newPlaybook) {
				throw new Error("Failed to create playbook");
			}

			// Create rules if provided
			if (rules && rules.length > 0) {
				await ctx.db.insert(playbookRules).values(
					rules.map((rule) => ({
						playbookId: newPlaybook.id,
						text: rule.text,
						category: rule.category,
						order: rule.order,
					})),
				);
			}

			return newPlaybook;
		}),

	// Update a playbook
	update: protectedProcedure
		.input(updatePlaybookSchema)
		.mutation(async ({ ctx, input }) => {
			const {
				id,
				rules,
				riskParameters,
				scalingRules,
				trailingRules,
				...data
			} = input;

			// Verify ownership
			const existingPlaybook = await ctx.db.query.playbooks.findFirst({
				where: and(eq(playbooks.id, id), eq(playbooks.userId, ctx.user.id)),
			});

			if (!existingPlaybook) {
				throw new Error("Playbook not found");
			}

			// Prepare update data
			const updateData: Record<string, unknown> = { ...data };

			if (riskParameters !== undefined) {
				updateData.riskParameters = riskParameters
					? JSON.stringify(riskParameters)
					: null;
			}
			if (scalingRules !== undefined) {
				updateData.scalingRules = scalingRules
					? JSON.stringify(scalingRules)
					: null;
			}
			if (trailingRules !== undefined) {
				updateData.trailingRules = trailingRules
					? JSON.stringify(trailingRules)
					: null;
			}

			const [updated] = await ctx.db
				.update(playbooks)
				.set(updateData)
				.where(eq(playbooks.id, id))
				.returning();

			// Update rules if provided
			if (rules !== undefined) {
				// Delete existing rules
				await ctx.db
					.delete(playbookRules)
					.where(eq(playbookRules.playbookId, id));

				// Insert new rules
				if (rules.length > 0) {
					await ctx.db.insert(playbookRules).values(
						rules.map((rule) => ({
							playbookId: id,
							text: rule.text,
							category: rule.category,
							order: rule.order,
						})),
					);
				}
			}

			return updated;
		}),

	// Delete a playbook (soft delete by setting inactive)
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const existingPlaybook = await ctx.db.query.playbooks.findFirst({
				where: and(
					eq(playbooks.id, input.id),
					eq(playbooks.userId, ctx.user.id),
				),
			});

			if (!existingPlaybook) {
				throw new Error("Playbook not found");
			}

			// Hard delete the playbook and cascade to rules
			await ctx.db.delete(playbooks).where(eq(playbooks.id, input.id));

			// Also remove playbook association from trades
			await ctx.db
				.update(trades)
				.set({ playbookId: null })
				.where(
					and(eq(trades.playbookId, input.id), eq(trades.userId, ctx.user.id)),
				);

			return { success: true };
		}),

	// Duplicate a playbook
	duplicate: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const original = await ctx.db.query.playbooks.findFirst({
				where: and(
					eq(playbooks.id, input.id),
					eq(playbooks.userId, ctx.user.id),
				),
				with: {
					rules: true,
				},
			});

			if (!original) {
				throw new Error("Playbook not found");
			}

			// Create new playbook
			const [newPlaybook] = await ctx.db
				.insert(playbooks)
				.values({
					userId: ctx.user.id,
					name: `${original.name} (Copy)`,
					description: original.description,
					color: original.color,
					entryCriteria: original.entryCriteria,
					exitRules: original.exitRules,
					riskParameters: original.riskParameters,
					scalingRules: original.scalingRules,
					trailingRules: original.trailingRules,
					isActive: true,
				})
				.returning();

			if (!newPlaybook) {
				throw new Error("Failed to duplicate playbook");
			}

			// Duplicate rules
			if (original.rules.length > 0) {
				await ctx.db.insert(playbookRules).values(
					original.rules.map((rule) => ({
						playbookId: newPlaybook.id,
						text: rule.text,
						category: rule.category,
						order: rule.order,
					})),
				);
			}

			return newPlaybook;
		}),

	// Get playbook statistics
	getStats: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			// Verify ownership
			const playbook = await ctx.db.query.playbooks.findFirst({
				where: and(
					eq(playbooks.id, input.id),
					eq(playbooks.userId, ctx.user.id),
				),
			});

			if (!playbook) {
				throw new Error("Playbook not found");
			}

			// Get user's breakeven threshold
			const userSettingsResult = await ctx.db.query.userSettings.findFirst({
				where: eq(userSettings.userId, ctx.user.id),
				columns: { breakevenThreshold: true },
			});
			const beThreshold = parseFloat(
				userSettingsResult?.breakevenThreshold ?? "3.00",
			);

			// Get all closed trades for this playbook
			const playbookTrades = await ctx.db.query.trades.findMany({
				where: and(
					eq(trades.playbookId, input.id),
					eq(trades.userId, ctx.user.id),
					eq(trades.status, "closed"),
					isNull(trades.deletedAt),
				),
			});

			const totalTrades = playbookTrades.length;

			if (totalTrades === 0) {
				return {
					totalTrades: 0,
					wins: 0,
					losses: 0,
					breakevens: 0,
					winRate: 0,
					totalPnl: 0,
					avgPnl: 0,
					profitFactor: 0,
					avgWin: 0,
					avgLoss: 0,
				};
			}

			// Calculate stats
			const wins = playbookTrades.filter((t) => {
				const pnl = t.netPnl ? parseFloat(t.netPnl) : 0;
				return pnl > beThreshold;
			}).length;

			const losses = playbookTrades.filter((t) => {
				const pnl = t.netPnl ? parseFloat(t.netPnl) : 0;
				return pnl < -beThreshold;
			}).length;

			const breakevens = totalTrades - wins - losses;

			const totalPnl = playbookTrades.reduce(
				(sum, t) => sum + (t.netPnl ? parseFloat(t.netPnl) : 0),
				0,
			);

			const grossProfit = playbookTrades.reduce((sum, t) => {
				const pnl = t.netPnl ? parseFloat(t.netPnl) : 0;
				return pnl > beThreshold ? sum + pnl : sum;
			}, 0);

			const grossLoss = playbookTrades.reduce((sum, t) => {
				const pnl = t.netPnl ? parseFloat(t.netPnl) : 0;
				return pnl < -beThreshold ? sum + Math.abs(pnl) : sum;
			}, 0);

			const decisiveTrades = wins + losses;
			const winRate = decisiveTrades > 0 ? (wins / decisiveTrades) * 100 : 0;
			const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
			const avgWin = wins > 0 ? grossProfit / wins : 0;
			const avgLoss = losses > 0 ? grossLoss / losses : 0;
			const avgPnl = totalPnl / totalTrades;

			return {
				totalTrades,
				wins,
				losses,
				breakevens,
				winRate,
				totalPnl,
				avgPnl,
				profitFactor,
				avgWin,
				avgLoss,
			};
		}),

	// Get rule compliance for a playbook
	getRuleCompliance: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			// Verify ownership
			const playbook = await ctx.db.query.playbooks.findFirst({
				where: and(
					eq(playbooks.id, input.id),
					eq(playbooks.userId, ctx.user.id),
				),
				with: {
					rules: true,
				},
			});

			if (!playbook) {
				throw new Error("Playbook not found");
			}

			// Get all trades with this playbook
			const playbookTrades = await ctx.db.query.trades.findMany({
				where: and(
					eq(trades.playbookId, input.id),
					eq(trades.userId, ctx.user.id),
					isNull(trades.deletedAt),
				),
				with: {
					ruleChecks: true,
				},
			});

			// Calculate compliance per trade
			const tradeCompliance = playbookTrades.map((trade) => {
				const totalRules = playbook.rules.length;
				if (totalRules === 0) {
					return { tradeId: trade.id, compliance: 100 };
				}

				const checkedRules = trade.ruleChecks.filter((rc) => rc.checked).length;
				const compliance = (checkedRules / totalRules) * 100;

				return { tradeId: trade.id, compliance };
			});

			// Calculate average compliance
			const avgCompliance =
				tradeCompliance.length > 0
					? tradeCompliance.reduce((sum, tc) => sum + tc.compliance, 0) /
						tradeCompliance.length
					: 0;

			// Calculate compliance per rule
			const ruleCompliance = playbook.rules.map((rule) => {
				const checkedCount = playbookTrades.reduce((count, trade) => {
					const check = trade.ruleChecks.find((rc) => rc.ruleId === rule.id);
					return check?.checked ? count + 1 : count;
				}, 0);

				const compliance =
					playbookTrades.length > 0
						? (checkedCount / playbookTrades.length) * 100
						: 0;

				return {
					ruleId: rule.id,
					ruleText: rule.text,
					category: rule.category,
					checkedCount,
					totalTrades: playbookTrades.length,
					compliance,
				};
			});

			return {
				totalTrades: playbookTrades.length,
				avgCompliance,
				tradeCompliance,
				ruleCompliance,
			};
		}),

	// Check/uncheck a rule for a trade
	checkRule: protectedProcedure
		.input(
			z.object({
				tradeId: z.number(),
				ruleId: z.number(),
				checked: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Verify trade ownership
			const trade = await ctx.db.query.trades.findFirst({
				where: and(
					eq(trades.id, input.tradeId),
					eq(trades.userId, ctx.user.id),
				),
			});

			if (!trade) {
				throw new Error("Trade not found");
			}

			// Upsert the rule check
			await ctx.db
				.insert(tradeRuleChecks)
				.values({
					tradeId: input.tradeId,
					ruleId: input.ruleId,
					checked: input.checked,
					checkedAt: input.checked ? new Date() : null,
				})
				.onConflictDoUpdate({
					target: [tradeRuleChecks.tradeId, tradeRuleChecks.ruleId],
					set: {
						checked: input.checked,
						checkedAt: input.checked ? new Date() : null,
					},
				});

			return { success: true };
		}),

	// Bulk check rules for a trade
	bulkCheckRules: protectedProcedure
		.input(
			z.object({
				tradeId: z.number(),
				ruleChecks: z.array(
					z.object({
						ruleId: z.number(),
						checked: z.boolean(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Verify trade ownership
			const trade = await ctx.db.query.trades.findFirst({
				where: and(
					eq(trades.id, input.tradeId),
					eq(trades.userId, ctx.user.id),
				),
			});

			if (!trade) {
				throw new Error("Trade not found");
			}

			// Delete existing checks for this trade
			await ctx.db
				.delete(tradeRuleChecks)
				.where(eq(tradeRuleChecks.tradeId, input.tradeId));

			// Insert new checks
			if (input.ruleChecks.length > 0) {
				await ctx.db.insert(tradeRuleChecks).values(
					input.ruleChecks.map((rc) => ({
						tradeId: input.tradeId,
						ruleId: rc.ruleId,
						checked: rc.checked,
						checkedAt: rc.checked ? new Date() : null,
					})),
				);
			}

			return { success: true };
		}),

	// Get rule checks for a trade
	getTradeRuleChecks: protectedProcedure
		.input(z.object({ tradeId: z.number() }))
		.query(async ({ ctx, input }) => {
			// Verify trade ownership
			const trade = await ctx.db.query.trades.findFirst({
				where: and(
					eq(trades.id, input.tradeId),
					eq(trades.userId, ctx.user.id),
				),
				with: {
					playbook: {
						with: {
							rules: {
								orderBy: [playbookRules.order],
							},
						},
					},
					ruleChecks: true,
				},
			});

			if (!trade) {
				throw new Error("Trade not found");
			}

			if (!trade.playbook) {
				return { playbook: null, rules: [], checks: [], compliance: 0 };
			}

			const rules = trade.playbook.rules;
			const checks = trade.ruleChecks;

			// Calculate compliance
			const totalRules = rules.length;
			const checkedRules = checks.filter((c) => c.checked).length;
			const compliance = totalRules > 0 ? (checkedRules / totalRules) * 100 : 0;

			return {
				playbook: {
					id: trade.playbook.id,
					name: trade.playbook.name,
					color: trade.playbook.color,
				},
				rules,
				checks,
				compliance,
			};
		}),
});
