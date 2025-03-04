import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { determineDiagramType, generateDiagramWithAI, generateDiagramTitle } from "@/lib/ai-utils";
import { validateMermaidDiagram as validateMermaid } from "@/server/services/mermaid-validation.service";
import { validateAndUpdateUserCredits } from "@/server/services/credits.service";
import { createThreadWithPrompt } from "@/server/services/thread.service";

export const threadRouter = createTRPCRouter({
  // Get all threads for the current user
  getUserThreads: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.diagramThread.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        rootDiagram: true,
        diagrams: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }),

  // Get a single thread with all its diagrams
  getThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      const thread = await ctx.db.diagramThread.findFirst({
        where: {
          id: input.threadId,
          userId: ctx.session.user.id,
        },
        include: {
          rootDiagram: true,
          diagrams: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!thread) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Thread not found or unauthorized",
        });
      }

      return thread;
    }),

  // Create a new thread with a prompt
  createThreadWithPrompt: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1, "Please provide text to generate a diagram"),
        isComplex: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return createThreadWithPrompt(ctx.session.user.id, input.prompt, input.isComplex ?? false);
    }),

  // Create a new thread (simplified version for manual thread creation)
  createThread: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        rootDiagramId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If rootDiagramId is provided, verify it belongs to the user
      if (input.rootDiagramId) {
        const diagram = await ctx.db.diagram.findFirst({
          where: {
            id: input.rootDiagramId,
            userId: ctx.session.user.id,
          },
        });

        if (!diagram) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Root diagram not found or unauthorized",
          });
        }
      }

      return ctx.db.diagramThread.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
          rootDiagramId: input.rootDiagramId,
        },
        include: {
          rootDiagram: true,
        },
      });
    }),

  // Update a thread
  updateThread: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        name: z.string().optional(),
        rootDiagramId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { threadId, ...updateData } = input;

      // Verify thread ownership
      const thread = await ctx.db.diagramThread.findFirst({
        where: {
          id: threadId,
          userId: ctx.session.user.id,
        },
      });

      if (!thread) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Thread not found or unauthorized",
        });
      }

      // If updating rootDiagramId, verify the new diagram belongs to the user
      if (updateData.rootDiagramId) {
        const diagram = await ctx.db.diagram.findFirst({
          where: {
            id: updateData.rootDiagramId,
            userId: ctx.session.user.id,
          },
        });

        if (!diagram) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Root diagram not found or unauthorized",
          });
        }
      }

      return ctx.db.diagramThread.update({
        where: { id: threadId },
        data: updateData,
        include: {
          rootDiagram: true,
        },
      });
    }),

  // Delete a thread and all its diagrams
  deleteThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify thread ownership
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

      // Delete the thread (this will cascade delete all diagrams in the thread)
      await ctx.db.diagramThread.delete({
        where: { id: input.threadId },
      });

      return { message: "Thread deleted successfully" };
    }),

  // Add a diagram to a thread
  addDiagramToThread: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        diagramId: z.string(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify thread ownership
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

      // Verify diagram ownership
      const diagram = await ctx.db.diagram.findFirst({
        where: {
          id: input.diagramId,
          userId: ctx.session.user.id,
        },
      });

      if (!diagram) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Diagram not found or unauthorized",
        });
      }

      // If parentId is provided, verify it belongs to the same thread
      if (input.parentId) {
        const parentDiagram = await ctx.db.diagram.findFirst({
          where: {
            id: input.parentId,
            threadId: input.threadId,
          },
        });

        if (!parentDiagram) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent diagram not found in thread",
          });
        }
      }

      return ctx.db.diagram.update({
        where: { id: input.diagramId },
        data: {
          threadId: input.threadId,
          parentId: input.parentId,
        },
      });
    }),

  // Remove a diagram from a thread
  removeDiagramFromThread: protectedProcedure
    .input(z.object({ diagramId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify diagram ownership
      const diagram = await ctx.db.diagram.findFirst({
        where: {
          id: input.diagramId,
          userId: ctx.session.user.id,
        },
      });

      if (!diagram) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Diagram not found or unauthorized",
        });
      }

      return ctx.db.diagram.update({
        where: { id: input.diagramId },
        data: {
          threadId: null,
          parentId: null,
        },
      });
    }),
}); 