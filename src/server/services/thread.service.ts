import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { determineDiagramType, generateDiagramWithAI, generateDiagramTitle } from "@/lib/ai-utils";
//import { validateMermaidDiagram as validateMermaid } from "@/server/services/mermaid-validation.service";
import { validateAndUpdateUserCredits } from "@/server/services/credits.service";

export async function createThreadWithPrompt(userId: string, prompt: string, isComplex: boolean = false) {
  try {
    // Validate and update credits
    await validateAndUpdateUserCredits(userId, undefined, isComplex);

    let attempts = 0;
    const maxAttempts = 5;
    let validDiagram = "";
    let lastError: Error | null = null;

    // Use AI to determine the most suitable diagram type and validate input
    const diagramTypeResult = await determineDiagramType(prompt);

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
          enhancedText ?? prompt,
          suggestedType,
          attempts,
          isComplex,
          lastError?.message,
        );

        if (typeof mermaidCode !== "string") {
          lastError = new Error("Invalid response format from AI");
          attempts++;
          continue;
        }

        // Validate the Mermaid diagram
        //const isValid = await validateMermaid(mermaidCode);
        //if (!isValid) {
        //  lastError = new Error("Generated diagram failed validation");
        //  attempts++;
        //  continue;
        //}

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

    // Generate a title for the thread
    const generatedTitle = await generateDiagramTitle(prompt, suggestedType);

    // Create the thread with the generated diagram
    const thread = await db.diagramThread.create({
      data: {
        name: generatedTitle,
        userId: userId,
      },
      include: {
        rootDiagram: true,
      },
    });

    // Create the root diagram
    const diagram = await db.diagram.create({
      data: {
        prompt: prompt,
        code: validDiagram,
        type: suggestedType,
        isComplex: isComplex,
        userId: userId,
        threadId: thread.id,
      },
    });

    // Update the thread with the root diagram
    await db.diagramThread.update({
      where: { id: thread.id },
      data: { rootDiagramId: diagram.id },
    });

    return {
      thread,
      diagram,
      message: `Successfully created thread with ${suggestedType} diagram.`,
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
} 