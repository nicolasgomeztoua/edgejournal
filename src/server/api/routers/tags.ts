import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { tags, tradeTags } from "@/server/db/schema";

export const tagsRouter = createTRPCRouter({
	// Get all tags for the user
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const userTags = await ctx.db.query.tags.findMany({
			where: eq(tags.userId, ctx.user.id),
			orderBy: (tags, { asc }) => [asc(tags.name)],
		});

		return userTags;
	}),

	// Create a new tag
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(50),
				color: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if tag with same name already exists
			const existing = await ctx.db.query.tags.findFirst({
				where: and(
					eq(tags.userId, ctx.user.id),
					eq(tags.name, input.name.toLowerCase()),
				),
			});

			if (existing) {
				throw new Error("A tag with this name already exists");
			}

			const [created] = await ctx.db
				.insert(tags)
				.values({
					userId: ctx.user.id,
					name: input.name.toLowerCase(),
					color: input.color ?? "#6366f1",
				})
				.returning();

			return created;
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
			// Verify ownership
			const tag = await ctx.db.query.tags.findFirst({
				where: and(eq(tags.id, input.id), eq(tags.userId, ctx.user.id)),
			});

			if (!tag) {
				throw new Error("Tag not found");
			}

			// Check for name conflict if changing name
			if (input.name && input.name.toLowerCase() !== tag.name) {
				const existing = await ctx.db.query.tags.findFirst({
					where: and(
						eq(tags.userId, ctx.user.id),
						eq(tags.name, input.name.toLowerCase()),
					),
				});

				if (existing) {
					throw new Error("A tag with this name already exists");
				}
			}

			const [updated] = await ctx.db
				.update(tags)
				.set({
					name: input.name ? input.name.toLowerCase() : tag.name,
					color: input.color ?? tag.color,
				})
				.where(eq(tags.id, input.id))
				.returning();

			return updated;
		}),

	// Delete a tag
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			// Verify ownership
			const tag = await ctx.db.query.tags.findFirst({
				where: and(eq(tags.id, input.id), eq(tags.userId, ctx.user.id)),
			});

			if (!tag) {
				throw new Error("Tag not found");
			}

			// Delete tag (cascade will remove trade associations)
			await ctx.db.delete(tags).where(eq(tags.id, input.id));

			return { success: true };
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
			// Verify tag ownership
			const tag = await ctx.db.query.tags.findFirst({
				where: and(eq(tags.id, input.tagId), eq(tags.userId, ctx.user.id)),
			});

			if (!tag) {
				throw new Error("Tag not found");
			}

			// Check if already tagged
			const existing = await ctx.db.query.tradeTags.findFirst({
				where: and(
					eq(tradeTags.tradeId, input.tradeId),
					eq(tradeTags.tagId, input.tagId),
				),
			});

			if (existing) {
				return { success: true, alreadyExists: true };
			}

			await ctx.db.insert(tradeTags).values({
				tradeId: input.tradeId,
				tagId: input.tagId,
			});

			return { success: true, alreadyExists: false };
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

	// Get tags for a specific trade
	getForTrade: protectedProcedure
		.input(z.object({ tradeId: z.number() }))
		.query(async ({ ctx, input }) => {
			const tradeTagsList = await ctx.db.query.tradeTags.findMany({
				where: eq(tradeTags.tradeId, input.tradeId),
				with: {
					tag: true,
				},
			});

			return tradeTagsList.map((tt) => tt.tag);
		}),
});
