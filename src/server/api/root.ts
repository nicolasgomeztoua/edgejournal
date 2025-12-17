import { accountsRouter } from "@/server/api/routers/accounts";
import { journalRouter } from "@/server/api/routers/journal";
import { marketDataRouter } from "@/server/api/routers/marketData";
import { settingsRouter } from "@/server/api/routers/settings";
import { tagsRouter } from "@/server/api/routers/tags";
import { tradesRouter } from "@/server/api/routers/trades";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	trades: tradesRouter,
	marketData: marketDataRouter,
	accounts: accountsRouter,
	settings: settingsRouter,
	tags: tagsRouter,
	journal: journalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.trades.getAll();
 *       ^? Trade[]
 */
export const createCaller = createCallerFactory(appRouter);
