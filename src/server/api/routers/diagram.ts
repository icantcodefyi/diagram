import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const diagramRouter = createTRPCRouter({
  getUserDiagrams: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.diagram.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
}); 