/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  determineDiagramType,
  generateDiagramWithAI,
} from "@/lib/ai-utils";

export const aiRouter = createTRPCRouter({
  generateDiagram: publicProcedure
    .input(
      z.object({
        text: z.string().min(1, "Please provide text to generate a diagram"),
        isComplex: z.boolean().optional().default(false),
        previousError: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        let attempts = 0;
        const maxAttempts = 5;
        let validDiagram = "";
        let error: Error | null = null;

        // Use AI to determine the most suitable diagram type
        const suggestedType = await determineDiagramType(input.text);
        
        if (!suggestedType) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to determine diagram type",
          });
        }

        while (attempts < maxAttempts) {
          try {
            const mermaidCode = await generateDiagramWithAI(
              input.text,
              suggestedType,
              attempts,
              input.isComplex,
              input.previousError,
            );

            // Ensure we have a string response
            if (typeof mermaidCode !== "string") {
              throw new Error("Invalid response format from AI");
            }

            validDiagram = mermaidCode;
            break;
          } catch (err) {
            error = err instanceof Error ? err : new Error("Unknown error occurred");
            console.error("Error generating diagram:", error);
          }

          attempts++;
        }

        if (!validDiagram) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to generate a valid diagram after ${maxAttempts} attempts. ${error?.message ?? ""}`,
          });
        }

        // Return only serializable data
        return {
          diagram: validDiagram,
          type: suggestedType,
          message: `Generated a ${suggestedType} diagram based on your input.`,
        };
      } catch (error) {
        // Properly handle and transform any errors
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "An unknown error occurred",
        });
      }
    }),
});
