import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  determineDiagramType,
  generateDiagramWithAI,
  generateDiagramTitle,
} from "@/lib/ai-utils";
import { db } from "@/server/db";
import { validateMermaidDiagram as validateMermaid } from "@/server/services/mermaid-validation.service";
import { validateAndUpdateUserCredits } from "@/server/services/credits.service";

// Input schemas
const generateDiagramSchema = z.object({
  text: z.string().min(1, "Please provide text to generate a diagram"),
  isComplex: z.boolean().optional().default(false),
  previousError: z.string().optional(),
  name: z.string().optional(),
  anonymousId: z.string().optional(),
});

const deleteDiagramSchema = z.object({
  diagramId: z.string().min(1, "Diagram ID is required"),
});

export const aiRouter = createTRPCRouter({
  generateDiagram: publicProcedure
    .input(generateDiagramSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate and update credits
        await validateAndUpdateUserCredits(
          ctx.session?.user?.id,
          input.anonymousId,
          input.isComplex ?? false,
        );

        let attempts = 0;
        const maxAttempts = 5;
        let validDiagram = "";
        let lastError: Error | null = null;

        // Use AI to determine the most suitable diagram type and validate input
        const diagramTypeResult = await determineDiagramType(input.text);

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
              enhancedText ?? input.text, // Use enhanced text if available
              suggestedType,
              attempts,
              input.isComplex,
              lastError?.message ?? input.previousError,
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
            lastError =
              err instanceof Error ? err : new Error("Unknown error occurred");
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
          input.text,
          suggestedType,
        );

        // Store the diagram
        const diagram = await db.diagram.create({
          data: {
            content: validDiagram,
            type: suggestedType,
            name: generatedTitle,
            isComplex: input.isComplex ?? false,
            userId: ctx.session?.user?.id,
            anonymousId: !ctx.session?.user ? input.anonymousId : undefined,
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
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    }),

  getUserCredits: protectedProcedure.query(async ({ ctx }) => {
    const userCredits = await ctx.db.userCredits.findUnique({
      where: { userId: ctx.session.user.id },
    });
    return userCredits;
  }),

  getUserSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await ctx.db.subscription.findUnique({
      where: { userId: ctx.session.user.id },
    });
    return subscription;
  }),

  getUserDiagrams: protectedProcedure.query(async ({ ctx }) => {
    const diagrams = await ctx.db.diagram.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return diagrams;
  }),

  deleteDiagram: protectedProcedure
    .input(deleteDiagramSchema)
    .mutation(async ({ ctx, input }) => {
      // First check if the diagram exists and belongs to the user
      const diagram = await db.diagram.findFirst({
        where: {
          id: input.diagramId,
          userId: ctx.session.user.id,
        },
      });

      if (!diagram) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Diagram not found or you don't have permission to delete it",
        });
      }

      // Delete the diagram
      await db.diagram.delete({
        where: {
          id: input.diagramId,
        },
      });

      return {
        message: "Diagram deleted successfully",
      };
    }),
});
