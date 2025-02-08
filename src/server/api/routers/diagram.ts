import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

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

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First verify the user owns this diagram
      const diagram = await ctx.db.diagram.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!diagram) {
        throw new Error("Diagram not found or unauthorized");
      }

      // Update the diagram
      return ctx.db.diagram.update({
        where: {
          id: input.id,
        },
        data: {
          content: input.content,
        },
      });
    }),
});