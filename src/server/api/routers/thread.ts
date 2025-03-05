import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { createThreadWithPrompt } from "@/server/services/thread.service";
import { determineDiagramType, generateDiagramWithAI, generateDiagramTitle } from "@/lib/ai-utils";
import { validateMermaidDiagram as validateMermaid } from "@/server/services/mermaid-validation.service";
import { validateAndUpdateUserCredits } from "@/server/services/credits.service";
import { generateDiagramWithAI as generateDiagramWithAI_lib } from "@/lib/ai/diagram-generator";
import type { DiagramResponse } from "@/lib/ai/types";

interface DiagramAIResponse {
  diagram: string;
  type: string;
  message?: string;
}

// Input schemas
const createThreadSchema = z.object({
  prompt: z.string().min(1, "Please provide text to generate a diagram"),
  isComplex: z.boolean().optional().default(false),
});

const getThreadSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
});

const generateDiagramSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
  prompt: z.string().min(1, "Please provide text to generate a diagram"),
  isComplex: z.boolean().optional().default(false),
});

const deleteThreadSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
});

export const threadRouter = createTRPCRouter({
  createThread: protectedProcedure
    .input(createThreadSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate and update credits
        await validateAndUpdateUserCredits(
          ctx.session.user.id,
          undefined,
          input.isComplex ?? false,
        );

        // Create thread with initial diagram
        const threadResult = await createThreadWithPrompt(
          ctx.session.user.id,
          input.prompt,
          input.isComplex ?? false
        );

        return {
          thread: threadResult.thread,
          diagram: threadResult.diagram,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "An unknown error occurred",
        });
      }
    }),

  getThreads: protectedProcedure.query(async ({ ctx }) => {
    const threads = await db.diagramThread.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        diagrams: {
          orderBy: { createdAt: "desc" },
          take: 1, // Get only the latest diagram
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return threads;
  }),

  getThread: protectedProcedure
    .input(getThreadSchema)
    .query(async ({ input, ctx }) => {
      const thread = await db.diagramThread.findFirst({
        where: {
          id: input.threadId,
          userId: ctx.session.user.id,
        },
        include: {
          diagrams: {
            orderBy: { createdAt: "desc" },
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

  createDiagramInThread: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        prompt: z.string(),
        isComplex: z.boolean().optional(),
        code: z.string().optional(),
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

      let diagramCode: string;
      let diagramType: string;

      if (input.code) {
        // If code is provided, use it directly
        diagramCode = input.code;
        diagramType = "flowchart"; // Default type
      } else {
        // Generate new diagram using AI
        try {
          const result = await generateDiagramWithAI_lib(input.prompt, "flowchart", 0, input.isComplex);
          if (typeof result === 'string') {
            diagramCode = result;
            diagramType = "flowchart";
          } else {
            diagramCode = result.diagram;
            diagramType = result.type;
          }
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to generate diagram",
          });
        }
      }

      // Create the new diagram
      const storedDiagram = await ctx.db.diagram.create({
        data: {
          prompt: input.prompt,
          code: diagramCode,
          type: diagramType,
          isComplex: input.isComplex ?? false,
          userId: ctx.session.user.id,
          threadId: input.threadId,
        },
      });

      return {
        diagram: diagramCode,
        type: diagramType,
        storedDiagram,
      };
    }),

  deleteThread: protectedProcedure
    .input(deleteThreadSchema)
    .mutation(async ({ input, ctx }) => {
      // First check if the thread exists and belongs to the user
      const thread = await db.diagramThread.findFirst({
        where: {
          id: input.threadId,
          userId: ctx.session.user.id,
        },
      });

      if (!thread) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Thread not found or you don't have permission to delete it",
        });
      }

      // Delete all diagrams in the thread first
      await db.diagram.deleteMany({
        where: {
          threadId: input.threadId,
        },
      });

      // Then delete the thread
      await db.diagramThread.delete({
        where: {
          id: input.threadId,
        },
      });

      return {
        message: "Thread and all associated diagrams deleted successfully",
      };
    }),
}); 