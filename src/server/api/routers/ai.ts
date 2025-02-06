/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import {
  determineDiagramType,
  generateDiagramWithAI,
} from "@/lib/ai-utils";
import { db } from "@/server/db";

export const aiRouter = createTRPCRouter({
  generateDiagram: publicProcedure
    .input(
      z.object({
        text: z.string().min(1, "Please provide text to generate a diagram"),
        isComplex: z.boolean().optional().default(false),
        previousError: z.string().optional(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check anonymous user limits
        if (!ctx.session?.user) {
          const anonymousCount = await db.diagram.count({
            where: {
              userId: null,
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
              },
            },
          });

          if (anonymousCount >= 5) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Please login to generate more diagrams",
            });
          }
        } else {
          // Check and update user credits
          const userCredits = await db.userCredits.findUnique({
            where: { userId: ctx.session.user.id },
          });

          if (!userCredits) {
            // Create initial credits if first time
            await db.userCredits.create({
              data: {
                userId: ctx.session.user.id,
                credits: 9, // 10 - cost of current generation
              },
            });
          } else {
            // Check if credits need to be reset
            const lastReset = userCredits.lastCreditReset;
            const now = new Date();
            if (lastReset.getDate() !== now.getDate()) {
              await db.userCredits.update({
                where: { userId: ctx.session.user.id },
                data: {
                  credits: 9, // 10 - cost of current generation
                  lastCreditReset: now,
                },
              });
            } else {
              // Check if user has enough credits
              const requiredCredits = input.isComplex ? 2 : 1;
              if (userCredits.credits < requiredCredits) {
                throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Insufficient credits",
                });
              }

              // Deduct credits
              await db.userCredits.update({
                where: { userId: ctx.session.user.id },
                data: {
                  credits: userCredits.credits - requiredCredits,
                },
              });
            }
          }
        }

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

        // Store the diagram
        const diagram = await db.diagram.create({
          data: {
            content: validDiagram,
            type: suggestedType,
            name: input.name,
            isComplex: input.isComplex ?? false,
            userId: ctx.session?.user?.id,
          },
        });

        return {
          diagram: validDiagram,
          type: suggestedType,
          message: `Generated a ${suggestedType} diagram based on your input.`,
          storedDiagram: diagram,
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

  getUserDiagrams: protectedProcedure
    .query(async ({ ctx }) => {
      const diagrams = await db.diagram.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return diagrams;
    }),

  getUserCredits: protectedProcedure
    .query(async ({ ctx }) => {
      const credits = await db.userCredits.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
      });
      return credits;
    }),
});
