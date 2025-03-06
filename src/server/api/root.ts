import { postRouter } from "@/server/api/routers/post";
import { aiRouter } from "./routers/ai";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { diagramRouter } from "./routers/diagram";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  ai: aiRouter,
  diagram: diagramRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
