import { and, desc, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { dailyNotes } from "@/server/db/schema";

export const dailyNotesRouter = createTRPCRouter({
	// Get note for a specific date
	getByDate: protectedProcedure
		.input(
			z.object({
				date: z.string(), // ISO date string (YYYY-MM-DD)
				accountId: z.number().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const dateStart = new Date(input.date);
			dateStart.setHours(0, 0, 0, 0);
			const dateEnd = new Date(input.date);
			dateEnd.setHours(23, 59, 59, 999);

			const conditions = [
				eq(dailyNotes.userId, ctx.user.id),
				gte(dailyNotes.date, dateStart),
				lte(dailyNotes.date, dateEnd),
			];

			if (input.accountId) {
				conditions.push(eq(dailyNotes.accountId, input.accountId));
			}

			const note = await ctx.db.query.dailyNotes.findFirst({
				where: and(...conditions),
			});

			return note ?? null;
		}),

	// Get all notes in a date range
	getAll: protectedProcedure
		.input(
			z.object({
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				accountId: z.number().optional(),
				limit: z.number().min(1).max(100).default(50),
			}),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [eq(dailyNotes.userId, ctx.user.id)];

			if (input.startDate) {
				conditions.push(gte(dailyNotes.date, new Date(input.startDate)));
			}
			if (input.endDate) {
				conditions.push(lte(dailyNotes.date, new Date(input.endDate)));
			}
			if (input.accountId) {
				conditions.push(eq(dailyNotes.accountId, input.accountId));
			}

			const notes = await ctx.db.query.dailyNotes.findMany({
				where: and(...conditions),
				orderBy: [desc(dailyNotes.date)],
				limit: input.limit,
			});

			return notes;
		}),

	// Create or update a daily note
	upsert: protectedProcedure
		.input(
			z.object({
				date: z.string(),
				accountId: z.number().optional(),
				preMarketNotes: z.string().optional(),
				marketOutlook: z.string().optional(),
				plannedSetups: z.string().optional(),
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
				dayRating: z.number().min(1).max(5).optional(),
				dailyGoal: z.string().optional(),
				goalMet: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const dateStart = new Date(input.date);
			dateStart.setHours(0, 0, 0, 0);
			const dateEnd = new Date(input.date);
			dateEnd.setHours(23, 59, 59, 999);

			// Check if note exists for this date
			const conditions = [
				eq(dailyNotes.userId, ctx.user.id),
				gte(dailyNotes.date, dateStart),
				lte(dailyNotes.date, dateEnd),
			];

			if (input.accountId) {
				conditions.push(eq(dailyNotes.accountId, input.accountId));
			}

			const existingNote = await ctx.db.query.dailyNotes.findFirst({
				where: and(...conditions),
			});

			if (existingNote) {
				// Update existing note
				const [updated] = await ctx.db
					.update(dailyNotes)
					.set({
						preMarketNotes: input.preMarketNotes,
						marketOutlook: input.marketOutlook,
						plannedSetups: input.plannedSetups,
						postMarketNotes: input.postMarketNotes,
						lessonsLearned: input.lessonsLearned,
						emotionalState: input.emotionalState,
						dayRating: input.dayRating,
						dailyGoal: input.dailyGoal,
						goalMet: input.goalMet,
					})
					.where(eq(dailyNotes.id, existingNote.id))
					.returning();

				return updated;
			}

			// Create new note
			const noteDate = new Date(input.date);
			noteDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

			const [created] = await ctx.db
				.insert(dailyNotes)
				.values({
					userId: ctx.user.id,
					accountId: input.accountId ?? null,
					date: noteDate,
					preMarketNotes: input.preMarketNotes,
					marketOutlook: input.marketOutlook,
					plannedSetups: input.plannedSetups,
					postMarketNotes: input.postMarketNotes,
					lessonsLearned: input.lessonsLearned,
					emotionalState: input.emotionalState,
					dayRating: input.dayRating,
					dailyGoal: input.dailyGoal,
					goalMet: input.goalMet,
				})
				.returning();

			return created;
		}),

	// Delete a daily note
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			// Verify ownership
			const note = await ctx.db.query.dailyNotes.findFirst({
				where: and(
					eq(dailyNotes.id, input.id),
					eq(dailyNotes.userId, ctx.user.id),
				),
			});

			if (!note) {
				throw new Error("Note not found");
			}

			await ctx.db.delete(dailyNotes).where(eq(dailyNotes.id, input.id));

			return { success: true };
		}),

	// Get notes calendar data (for heatmap display)
	getCalendarData: protectedProcedure
		.input(
			z.object({
				startDate: z.string(),
				endDate: z.string(),
				accountId: z.number().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [
				eq(dailyNotes.userId, ctx.user.id),
				gte(dailyNotes.date, new Date(input.startDate)),
				lte(dailyNotes.date, new Date(input.endDate)),
			];

			if (input.accountId) {
				conditions.push(eq(dailyNotes.accountId, input.accountId));
			}

			const notes = await ctx.db.query.dailyNotes.findMany({
				where: and(...conditions),
				columns: {
					id: true,
					date: true,
					dayRating: true,
					emotionalState: true,
				},
			});

			return notes.map((n) => ({
				date: n.date.toISOString().split("T")[0],
				hasNote: true,
				rating: n.dayRating,
				emotionalState: n.emotionalState,
			}));
		}),
});
