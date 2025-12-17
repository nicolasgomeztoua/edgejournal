import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { dailyJournalEntries, playbookStrategies } from "@/server/db/schema";

export const journalRouter = createTRPCRouter({
	// ============================================================================
	// DAILY JOURNAL ENTRIES
	// ============================================================================

	// Get journal entry for a specific date
	getByDate: protectedProcedure
		.input(z.object({ date: z.string() }))
		.query(async ({ ctx, input }) => {
			const startOfDay = new Date(input.date);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(input.date);
			endOfDay.setHours(23, 59, 59, 999);

			const entry = await ctx.db.query.dailyJournalEntries.findFirst({
				where: and(
					eq(dailyJournalEntries.userId, ctx.user.id),
					gte(dailyJournalEntries.date, startOfDay),
					lte(dailyJournalEntries.date, endOfDay),
				),
			});

			return entry;
		}),

	// Get all journal entries (with pagination)
	getAll: protectedProcedure
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).default(30),
					offset: z.number().min(0).default(0),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const entries = await ctx.db.query.dailyJournalEntries.findMany({
				where: eq(dailyJournalEntries.userId, ctx.user.id),
				orderBy: (entries, { desc }) => [desc(entries.date)],
				limit: input?.limit ?? 30,
				offset: input?.offset ?? 0,
			});

			return entries;
		}),

	// Create or update a journal entry for a date
	upsert: protectedProcedure
		.input(
			z.object({
				date: z.string(),
				preMarketNotes: z.string().optional(),
				postMarketNotes: z.string().optional(),
				lessonsLearned: z.string().optional(),
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
				rating: z.number().min(1).max(5).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const startOfDay = new Date(input.date);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(input.date);
			endOfDay.setHours(23, 59, 59, 999);

			// Check if entry exists for this date
			const existing = await ctx.db.query.dailyJournalEntries.findFirst({
				where: and(
					eq(dailyJournalEntries.userId, ctx.user.id),
					gte(dailyJournalEntries.date, startOfDay),
					lte(dailyJournalEntries.date, endOfDay),
				),
			});

			if (existing) {
				// Update
				const [updated] = await ctx.db
					.update(dailyJournalEntries)
					.set({
						preMarketNotes: input.preMarketNotes,
						postMarketNotes: input.postMarketNotes,
						lessonsLearned: input.lessonsLearned,
						emotionalState: input.emotionalState,
						rating: input.rating,
					})
					.where(eq(dailyJournalEntries.id, existing.id))
					.returning();

				return updated;
			}

			// Create
			const dateToUse = new Date(input.date);
			dateToUse.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

			const [created] = await ctx.db
				.insert(dailyJournalEntries)
				.values({
					userId: ctx.user.id,
					date: dateToUse,
					preMarketNotes: input.preMarketNotes,
					postMarketNotes: input.postMarketNotes,
					lessonsLearned: input.lessonsLearned,
					emotionalState: input.emotionalState,
					rating: input.rating,
				})
				.returning();

			return created;
		}),

	// ============================================================================
	// PLAYBOOK STRATEGIES
	// ============================================================================

	// Get all strategies
	getStrategies: protectedProcedure.query(async ({ ctx }) => {
		const strategies = await ctx.db.query.playbookStrategies.findMany({
			where: eq(playbookStrategies.userId, ctx.user.id),
			orderBy: (strategies, { asc }) => [asc(strategies.name)],
		});

		return strategies;
	}),

	// Get a single strategy
	getStrategy: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const strategy = await ctx.db.query.playbookStrategies.findFirst({
				where: and(
					eq(playbookStrategies.id, input.id),
					eq(playbookStrategies.userId, ctx.user.id),
				),
			});

			return strategy;
		}),

	// Create a strategy
	createStrategy: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
				description: z.string().optional(),
				rules: z.string().optional(),
				riskManagement: z.string().optional(),
				bestConditions: z.string().optional(),
				worstConditions: z.string().optional(),
				examples: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [strategy] = await ctx.db
				.insert(playbookStrategies)
				.values({
					userId: ctx.user.id,
					...input,
				})
				.returning();

			return strategy;
		}),

	// Update a strategy
	updateStrategy: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1).max(100).optional(),
				description: z.string().optional(),
				rules: z.string().optional(),
				riskManagement: z.string().optional(),
				bestConditions: z.string().optional(),
				worstConditions: z.string().optional(),
				examples: z.string().optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			const [updated] = await ctx.db
				.update(playbookStrategies)
				.set(updateData)
				.where(
					and(
						eq(playbookStrategies.id, id),
						eq(playbookStrategies.userId, ctx.user.id),
					),
				)
				.returning();

			return updated;
		}),

	// Delete a strategy
	deleteStrategy: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(playbookStrategies)
				.where(
					and(
						eq(playbookStrategies.id, input.id),
						eq(playbookStrategies.userId, ctx.user.id),
					),
				);

			return { success: true };
		}),
});
