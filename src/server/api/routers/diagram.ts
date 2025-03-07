import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const diagramRouter = createTRPCRouter({
  getUserDiagrams: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.diagram.findMany({
      where: {
        userId: ctx.session.user.id,
        previousDiagramId: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  getUserDiagramsWithFollowUps: protectedProcedure.input(z.object({
    diagramId: z.string(),
  })).query(async ({ ctx, input }) => {
    // Helper function to recursively get all diagrams in the chain
    async function getAllDiagramsInChain(diagramId: string, seenIds = new Set<string>()): Promise<string[]> {
      if (seenIds.has(diagramId)) return []; // Prevent infinite loops
      seenIds.add(diagramId);
      
      const nextDiagram = await ctx.db.diagram.findFirst({
        where: { previousDiagramId: diagramId },
        select: { id: true },
      });

      if (!nextDiagram) return [diagramId];

      const chainIds = await getAllDiagramsInChain(nextDiagram.id, seenIds);
      return [diagramId, ...chainIds];
    }

    // First get the initial diagram
    const initialDiagram = await ctx.db.diagram.findUnique({
      where: {
        id: input.diagramId,
      },
    });

    if (!initialDiagram) {
      throw new Error("Diagram not found");
    }

    // Get all diagram IDs in the chain
    const diagramIds = await getAllDiagramsInChain(input.diagramId);

    // Fetch all diagrams in the chain with a single query
    const diagrams = await ctx.db.diagram.findMany({
      where: {
        id: {
          in: diagramIds,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Return diagrams in the correct chain order
    return diagrams.sort((a, b) => 
      diagramIds.indexOf(a.id) - diagramIds.indexOf(b.id)
    );
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