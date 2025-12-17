import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { tags, tradeTags } from "@/server/db/schema";

export const tagsRouter = createTRPCRouter({
	// Get all tags for the current user
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const userTags = await ctx.db.query.tags.findMany({
			where: eq(tags.userId, ctx.user.id),
			orderBy: (tags, { asc }) => [asc(tags.name)],
		});

		// Get trade counts for each tag
		const tagsWithCounts = await Promise.all(
			userTags.map(async (tag) => {
				const tradeTagCount = await ctx.db
					.select()
					.from(tradeTags)
					.where(eq(tradeTags.tagId, tag.id));

				return {
					...tag,
					tradeCount: tradeTagCount.length,
				};
			}),
		);

		return tagsWithCounts;
	}),

	// Create a new tag
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(50),
				color: z.string().optional().default("#6366f1"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [newTag] = await ctx.db
				.insert(tags)
				.values({
					userId: ctx.user.id,
					name: input.name,
					color: input.color,
				})
				.returning();

			return newTag;
		}),

	// Update a tag
	update: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1).max(50).optional(),
				color: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			const [updatedTag] = await ctx.db
				.update(tags)
				.set(updateData)
				.where(and(eq(tags.id, id), eq(tags.userId, ctx.user.id)))
				.returning();

			return updatedTag;
		}),

	// Delete a tag
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(tags)
				.where(and(eq(tags.id, input.id), eq(tags.userId, ctx.user.id)));

			return { success: true };
		}),

	// Get tags for a specific trade
	getForTrade: protectedProcedure
		.input(z.object({ tradeId: z.number() }))
		.query(async ({ ctx, input }) => {
			const tradeTagsResult = await ctx.db.query.tradeTags.findMany({
				where: eq(tradeTags.tradeId, input.tradeId),
				with: {
					tag: true,
				},
			});

			return tradeTagsResult.map((tt) => tt.tag);
		}),

	// Add tag to trade
	addToTrade: protectedProcedure
		.input(
			z.object({
				tradeId: z.number(),
				tagId: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Verify tag belongs to user
			const tag = await ctx.db.query.tags.findFirst({
				where: and(eq(tags.id, input.tagId), eq(tags.userId, ctx.user.id)),
			});

			if (!tag) {
				throw new Error("Tag not found");
			}

			await ctx.db
				.insert(tradeTags)
				.values({
					tradeId: input.tradeId,
					tagId: input.tagId,
				})
				.onConflictDoNothing();

			return { success: true };
		}),

	// Remove tag from trade
	removeFromTrade: protectedProcedure
		.input(
			z.object({
				tradeId: z.number(),
				tagId: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(tradeTags)
				.where(
					and(
						eq(tradeTags.tradeId, input.tradeId),
						eq(tradeTags.tagId, input.tagId),
					),
				);

			return { success: true };
		}),

	// Set all tags for a trade (replace existing)
	setTradeTags: protectedProcedure
		.input(
			z.object({
				tradeId: z.number(),
				tagIds: z.array(z.number()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Remove all existing tags
			await ctx.db
				.delete(tradeTags)
				.where(eq(tradeTags.tradeId, input.tradeId));

			// Add new tags
			if (input.tagIds.length > 0) {
				await ctx.db.insert(tradeTags).values(
					input.tagIds.map((tagId) => ({
						tradeId: input.tradeId,
						tagId,
					})),
				);
			}

			return { success: true };
		}),
});
