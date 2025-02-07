/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import {
  determineDiagramType,
  generateDiagramWithAI,
  generateDiagramTitle,
} from "@/lib/ai-utils";
import { db } from "@/server/db";
import puppeteer from "puppeteer";
import mermaid from "mermaid";

async function validateMermaidDiagram(code: string): Promise<boolean> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Inject Mermaid and validation logic
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"></script>
        </head>
        <body>
          <div id="container" class="mermaid">${code}</div>
        </body>
      </html>
    `);

    // Add the validation function directly to the page context
    await page.addScriptTag({
      content: `
        window.validateDiagram = async function(code) {
          try {
            await mermaid.initialize({
              startOnLoad: false,
              securityLevel: 'strict'
            });

            await mermaid.parse(code);
            const { svg } = await mermaid.render('validate-diagram', code);
            return { isValid: !!svg, error: null };
          } catch (error) {
            return { 
              isValid: false, 
              error: error.message || 'Unknown error during validation'
            };
          }
        }
      `
    });

    // Wait for Mermaid and validation function to be ready
    await page.waitForFunction(() => 
      typeof window.mermaid !== 'undefined' && 
      typeof window.validateDiagram === 'function'
    );

    // Execute validation with proper error handling
    const results = await page.evaluate(async (code) => {
      return await window.validateDiagram(code);
    }, code);

    await browser.close();

    if (!results.isValid) {
      console.error('Mermaid validation failed:', results.error);
    }

    return results.isValid;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

export const aiRouter = createTRPCRouter({
  generateDiagram: publicProcedure
    .input(
      z.object({
        text: z.string().min(1, "Please provide text to generate a diagram"),
        isComplex: z.boolean().optional().default(false),
        previousError: z.string().optional(),
        name: z.string().optional(),
        anonymousId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check anonymous user limits
        if (!ctx.session?.user) {
          if (!input.anonymousId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Anonymous ID is required for unauthenticated users",
            });
          }

          const anonymousCount = await db.diagram.count({
            where: {
              anonymousId: input.anonymousId,
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
          // Check user credits
          const userCredits = await db.userCredits.findUnique({
            where: { userId: ctx.session.user.id },
          });

          const requiredCredits = input.isComplex ? 2 : 1;

          if (!userCredits) {
            // Create initial credits if first time
            if (requiredCredits > 10) { // Initial credits are 10
              throw new TRPCError({
                code: "FORBIDDEN",
                message: "Insufficient credits",
              });
            }
          } else {
            // Check if credits need to be reset
            const lastReset = userCredits.lastCreditReset;
            const now = new Date();
            if (lastReset.getDate() !== now.getDate()) {
              if (requiredCredits > 10) { // Daily credits are 10
                throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Insufficient credits",
                });
              }
            } else {
              // Check if user has enough credits
              if (userCredits.credits < requiredCredits) {
                throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Insufficient credits",
                });
              }
            }
          }
        }

        let attempts = 0;
        const maxAttempts = 5;
        let validDiagram = "";
        let lastError: Error | null = null;

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
              lastError?.message ?? input.previousError,
            );
            console.log('Generated diagram code:', mermaidCode);
            if (typeof mermaidCode !== "string") {
              lastError = new Error("Invalid response format from AI");
              attempts++;
              continue;
            }

            // Validate the Mermaid diagram
            const isValid = await validateMermaidDiagram(mermaidCode);
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
        const generatedTitle = await generateDiagramTitle(input.text, suggestedType);

        // Only deduct credits and store diagram after successful generation
        if (ctx.session?.user) {
          const userCredits = await db.userCredits.findUnique({
            where: { userId: ctx.session.user.id },
          });

          const requiredCredits = input.isComplex ? 2 : 1;
          const now = new Date();

          if (!userCredits) {
            // Create initial credits if first time
            await db.userCredits.create({
              data: {
                userId: ctx.session.user.id,
                credits: 10 - requiredCredits,
                lastCreditReset: now,
              },
            });
          } else {
            // Check if credits need to be reset
            if (userCredits.lastCreditReset.getDate() !== now.getDate()) {
              await db.userCredits.update({
                where: { userId: ctx.session.user.id },
                data: {
                  credits: 10 - requiredCredits,
                  lastCreditReset: now,
                },
              });
            } else {
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

        // Store the diagram after successful generation and validation
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
          message: `Successfully generated a valid ${suggestedType} diagram.`,
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

  deleteDiagram: protectedProcedure
    .input(
      z.object({
        diagramId: z.string().min(1, "Diagram ID is required"),
      }),
    )
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
          message: "Diagram not found or you don't have permission to delete it",
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
