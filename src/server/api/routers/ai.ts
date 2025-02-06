/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  determineDiagramType,
  generateDiagramWithAI,
  isValidMermaidDiagram,
} from "@/lib/ai-utils";

export const aiRouter = createTRPCRouter({
  generateDiagram: publicProcedure
    .input(
      z.object({
        text: z.string().min(1, "Please provide text to generate a diagram"),
      }),
    )
    .mutation(async ({ input }) => {
      let attempts = 0
      const maxAttempts = 5;
      let validDiagram = "";
      let error: Error | null = null;

      // Use AI to determine the most suitable diagram type
      const suggestedType = await determineDiagramType(input.text);

      while (attempts < maxAttempts) {
        try {
          const mermaidCode = await generateDiagramWithAI(
            input.text,
            suggestedType,
            attempts,
          );

          if (isValidMermaidDiagram(mermaidCode)) {
            validDiagram = mermaidCode;
            break;
          }
        } catch (err) {
          error = err as Error;
          console.error("Error generating diagram:", err);
        }

        attempts++;
      }

      if (!validDiagram) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate a valid diagram after ${maxAttempts} attempts. ${error?.message ?? ""}`,
        });
      }

      return {
        diagram: validDiagram,
        type: suggestedType,
        message: `Generated a ${suggestedType} based on your input.`,
      };
    }),
});
