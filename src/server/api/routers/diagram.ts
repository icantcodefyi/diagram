import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { validateAndUpdateUserCredits } from "@/server/services/credits.service";
import { generateDiagramWithAI, determineDiagramType } from "@/lib/ai/diagram-generator";
import type { DiagramType } from "@/types/diagram";
import type { DiagramTypeResponse } from "@/lib/ai/types";

// Input schemas
const generateNewDiagramSchema = z.object({
  prompt: z.string().min(1, "Please provide text to generate a diagram"),
  isComplex: z.boolean().optional().default(false),
});

const generateFollowUpSchema = z.object({
  parentDiagramId: z.string(),
  prompt: z.string().min(1, "Please provide text to generate a diagram"),
  isComplex: z.boolean().optional().default(false),
  changeDescription: z.string(),
});

const updateDiagramSchema = z.object({
  diagramId: z.string(),
  prompt: z.string().optional(),
  code: z.string().optional(),
  parentDiagramId: z.string().optional(),
});

export const diagramRouter = createTRPCRouter({
  // Get all root diagrams (no parent version) for the user
  getUserDiagrams: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.diagram.findMany({
      where: {
        userId: ctx.session.user.id,
        parentDiagramId: null, // Only get root diagrams
      },
      include: {
        childDiagrams: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  // Get a specific diagram with its child diagrams
  getDiagram: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const diagram = await ctx.db.diagram.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          childDiagrams: {
            orderBy: {
              createdAt: 'asc',
            },
          },
          parentDiagram: true,
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

  // Get child diagrams for a specific diagram
  getChildDiagrams: protectedProcedure
    .input(z.object({ diagramId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.diagram.findMany({
        where: {
          parentDiagramId: input.diagramId,
          userId: ctx.session.user.id,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    }),

  // Generate a new root diagram with AI
  generateNew: protectedProcedure
    .input(generateNewDiagramSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate and update credits
        await validateAndUpdateUserCredits(
          ctx.session.user.id,
          undefined,
          input.isComplex ?? false,
        );

        // Generate diagram using AI
        const result = await generateDiagramWithAI(
          input.prompt,
          "flowchart",
          0,
          input.isComplex
        );

        const diagramData = typeof result === 'string'
          ? { code: result, type: "flowchart" }
          : { code: (result as { code: string; type: string }).code, type: (result as { code: string; type: string }).type };

        // Create a new root diagram
        const diagram = await ctx.db.diagram.create({
          data: {
            prompt: input.prompt,
            code: diagramData.code,
            type: diagramData.type,
            isComplex: input.isComplex ?? false,
            userId: ctx.session.user.id,
            isSaved: true,
          },
        });

        return diagram;
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

  // Generate a follow-up diagram
  generateFollowUp: protectedProcedure
    .input(generateFollowUpSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        type DiagramWithParent = {
          prompt: string;
          code: string;
          type: string;
          parentDiagram: DiagramWithParent | null;
          [key: string]: any;
        };

        // Get parent diagram with full version history chain
        const parentDiagram = await ctx.db.diagram.findFirst({
          where: {
            id: input.parentDiagramId,
            userId: ctx.session.user.id,
          },
          include: {
            parentDiagram: true
          }
        }) as DiagramWithParent;

        if (!parentDiagram) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent diagram not found or unauthorized",
          });
        }

        // Validate and update credits
        await validateAndUpdateUserCredits(
          ctx.session.user.id,
          undefined,
          input.isComplex ?? false,
        );

        // Build version history for context
        const versionHistory = [];
        let currentVersion: DiagramWithParent | null = parentDiagram;
        while (currentVersion) {
          versionHistory.unshift({
            prompt: currentVersion.prompt,
            code: currentVersion.code,
          });
          currentVersion = currentVersion.parentDiagram;
        }

        // Construct enhanced context from version history
        const contextPrompt = `
This is a follow-up to an existing diagram with the following version history:
${versionHistory.map((version, index) => `
Version ${index + 1}:
- Prompt: ${version.prompt}
- Previous diagram code: ${version.code}
`).join('\n')}

Latest diagram code for reference:
${parentDiagram.code}

Requested changes: ${input.prompt}
Change context: ${input.changeDescription}

Please generate a new version of the diagram that:
1. Incorporates the requested changes
2. Maintains consistency with the existing diagram structure
3. Preserves the core elements from the previous version
4. Adapts the layout to accommodate the new changes`;

        // Generate new diagram using AI with enhanced context
        const result = await generateDiagramWithAI(
          contextPrompt,
          parentDiagram.type as DiagramType,
          versionHistory.length, // Pass version depth for context
          input.isComplex,
          parentDiagram.code // Pass immediate parent's code
        );

        const diagramData = typeof result === 'string'
          ? { code: result, type: parentDiagram.type }
          : { code: (result as { code: string; type: string }).code, type: (result as { code: string; type: string }).type };

        // Create new diagram as a child of the parent
        const newDiagram = await ctx.db.diagram.create({
          data: {
            prompt: input.prompt,
            code: diagramData.code,
            type: diagramData.type,
            isComplex: input.isComplex ?? false,
            userId: ctx.session.user.id,
            parentDiagramId: parentDiagram.id,
            isSaved: true,
          },
        });

        return newDiagram;
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

  // Delete a diagram and all its children
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the diagram and its children
      const diagram = await ctx.db.diagram.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          childDiagrams: true,
        },
      });

      if (!diagram) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Diagram not found or unauthorized",
        });
      }

      // Delete everything in a transaction
      return ctx.db.$transaction(async (tx) => {
        // First delete all child diagrams
        await tx.diagram.deleteMany({
          where: {
            parentDiagramId: input.id,
            userId: ctx.session.user.id,
          },
        });

        // Then delete the parent diagram
        await tx.diagram.delete({
          where: {
            id: input.id,
          },
        });

        return { message: "Diagram and all its children deleted successfully" };
      });
    }),

  // Update a diagram
  update: protectedProcedure
    .input(updateDiagramSchema)
    .mutation(async ({ ctx, input }) => {
      const diagram = await ctx.db.diagram.update({
        where: {
          id: input.diagramId,
          userId: ctx.session.user.id,
        },
        data: {
          code: input.code,
          prompt: input.prompt,
        },
      });
      return diagram;
    }),
});