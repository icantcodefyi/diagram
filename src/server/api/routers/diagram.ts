import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const diagramRouter = createTRPCRouter({
  getUserDiagrams: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.diagram.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        thread: true,
        parentDiagram: true,
        childDiagrams: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  getDiagram: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const diagram = await ctx.db.diagram.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          thread: true,
          parentDiagram: true,
          childDiagrams: true,
        },
      });

      if (!diagram) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Diagram not found or unauthorized",
        });
      }

      return diagram;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        prompt: z.string().optional(),
        code: z.string().optional(),
        type: z.string().optional(),
        isComplex: z.boolean().optional(),
        isSaved: z.boolean().optional(),
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Diagram not found or unauthorized",
        });
      }

      // Update the diagram
      return ctx.db.diagram.update({
        where: {
          id: input.id,
        },
        data: {
          prompt: input.prompt,
          code: input.code,
          type: input.type,
          isComplex: input.isComplex,
          isSaved: input.isSaved,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First verify the user owns this diagram
      const diagram = await ctx.db.diagram.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!diagram) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Diagram not found or unauthorized",
        });
      }

      // Delete the diagram
      await ctx.db.diagram.delete({
        where: {
          id: input.id,
        },
      });

      return { message: "Diagram deleted successfully" };
    }),

  // Get all child diagrams of a diagram
  getChildDiagrams: protectedProcedure
    .input(z.object({ parentId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First verify the user owns the parent diagram
      const parentDiagram = await ctx.db.diagram.findFirst({
        where: {
          id: input.parentId,
          userId: ctx.session.user.id,
        },
      });

      if (!parentDiagram) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Parent diagram not found or unauthorized",
        });
      }

      return ctx.db.diagram.findMany({
        where: {
          parentId: input.parentId,
        },
        include: {
          thread: true,
          parentDiagram: true,
          childDiagrams: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  // Get all diagrams in a thread
  getThreadDiagrams: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First verify the user owns the thread
      const thread = await ctx.db.diagramThread.findFirst({
        where: {
          id: input.threadId,
          userId: ctx.session.user.id,
        },
      });

      if (!thread) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Thread not found or unauthorized",
        });
      }

      return ctx.db.diagram.findMany({
        where: {
          threadId: input.threadId,
        },
        include: {
          thread: true,
          parentDiagram: true,
          childDiagrams: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
});