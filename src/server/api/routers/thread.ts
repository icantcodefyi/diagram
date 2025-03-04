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

  generateDiagram: protectedProcedure
    .input(generateDiagramSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate and update credits
        await validateAndUpdateUserCredits(
          ctx.session.user.id,
          undefined,
          input.isComplex ?? false,
        );

        // Verify thread ownership
        const thread = await db.diagramThread.findFirst({
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

        let attempts = 0;
        const maxAttempts = 5;
        let validDiagram = "";
        let lastError: Error | null = null;

        // Use AI to determine the most suitable diagram type and validate input
        const diagramTypeResult = await determineDiagramType(input.prompt);

        if (!diagramTypeResult.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: diagramTypeResult.error ?? "Invalid input for diagram generation",
          });
        }

        const suggestedType = diagramTypeResult.type;
        const enhancedText = diagramTypeResult.enhancedText;

        while (attempts < maxAttempts) {
          try {
            const mermaidCode = await generateDiagramWithAI(
              enhancedText ?? input.prompt,
              suggestedType,
              attempts,
              input.isComplex,
              lastError?.message,
            );

            if (typeof mermaidCode !== "string") {
              lastError = new Error("Invalid response format from AI");
              attempts++;
              continue;
            }

            // Validate the Mermaid diagram
            const isValid = await validateMermaid(mermaidCode);
            if (!isValid) {
              lastError = new Error("Generated diagram failed validation");
              attempts++;
              continue;
            }

            validDiagram = mermaidCode;
            break;
          } catch (err) {
            lastError = err instanceof Error ? err : new Error("Unknown error occurred");
            console.error(`Attempt ${attempts + 1} failed:`, lastError);
            attempts++;
          }
        }

        if (!validDiagram) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to generate a valid diagram after ${maxAttempts} attempts. Last error: ${lastError?.message ?? "Unknown error"}`,
          });
        }

        // Generate a title for the diagram
        const generatedTitle = await generateDiagramTitle(
          input.prompt,
          suggestedType,
        );

        // Store the diagram
        const diagram = await db.diagram.create({
          data: {
            prompt: input.prompt,
            code: validDiagram,
            type: suggestedType,
            isComplex: input.isComplex ?? false,
            userId: ctx.session.user.id,
            threadId: input.threadId,
          },
        });

        return {
          diagram: validDiagram,
          type: suggestedType,
          message: `Successfully generated a ${suggestedType} diagram.`,
          storedDiagram: diagram,
          enhancedText: enhancedText,
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