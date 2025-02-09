import { type DiagramType } from "@/types/diagram";
import { DIAGRAM_TYPES } from "@/types/diagram";
import { DIAGRAM_PROMPTS } from "@/types/diagram-prompts";
import fs from "fs/promises";
import path from "path";
import { formatDiagramCode, removeStyles } from "./diagram-utils";
import { addToQueue, makeAPIRequestWithRetry } from "./queue";
import { getFlashModel, getFlashLiteModel } from "./gemini-client";
import { type ValidationResponse, type TypeDeterminationResponse } from "./types";
import { cleanJsonResponse } from "./diagram-utils";

const getSyntaxDocumentation = async (
  diagramType: DiagramType,
): Promise<string> => {
  try {
    const docPath = path.join(
      process.cwd(),
      "src",
      "syntax",
      `${diagramType}.md`,
    );
    const doc = await fs.readFile(docPath, "utf8");
    return doc;
  } catch (error) {
    console.warn(
      `Could not load syntax documentation for ${diagramType}:`,
      error,
    );
    return "";
  }
};

// Function to determine the best diagram type using AI
export const determineDiagramType = async (
  text: string,
): Promise<{ type: DiagramType; isValid: boolean; enhancedText?: string; error?: string }> => {
  const model = getFlashLiteModel();

  const validationPrompt = `Analyze this text and determine if we can generate a diagram from it if not return null, anything insensible also return null.

Text to analyze: "${text}"

Return your response in this exact format (including the json code block):
\`\`\`json
{
  "isValid": boolean,
  "understanding": "detailed explanation of what you understand from the text, or null if invalid",
  "error": "explanation of why the text is insufficient (if invalid), or null if valid"
}
\`\`\``;

  try {
    const validationResult = await makeAPIRequestWithRetry(async () => {
      const response = await model.generateContent(validationPrompt);
      return response;
    });

    const validationText = validationResult.response.text();
    const cleanedValidationText = cleanJsonResponse(validationText);
    const validationJson = JSON.parse(cleanedValidationText) as ValidationResponse;

    if (!validationJson.isValid) {
      return {
        type: "flowchart", // default type
        isValid: false,
        error: validationJson.error ?? "The provided text doesn't contain enough information for a meaningful diagram"
      };
    }

    // If valid, proceed with diagram type determination
    const typePrompt = `Based on this understanding of the text, determine the most suitable Mermaid diagram type.

Text Understanding:
${validationJson.understanding}

Available diagram types and their use cases:
${Object.entries(DIAGRAM_TYPES)
  .map(([type, desc]) => `- ${type}: ${desc}`)
  .join("\n")}

Consider:
1. The type of information being represented
2. The relationships between elements
3. The temporal or structural nature of the data
4. The visualization goals
5. The complexity of the information

Return your response in this exact format (including the json code block):
\`\`\`json
{
  "type": "selected_diagram_type",
  "reasoning": "brief explanation why this type is best suited for this visualization",
  "enhancedText": "refined and structured version of the original text based on the understanding"
}
\`\`\``;

    const typeResult = await makeAPIRequestWithRetry(async () => {
      const response = await model.generateContent(typePrompt);
      return response;
    });

    const typeText = typeResult.response.text();
    const cleanedTypeText = cleanJsonResponse(typeText);
    const parsed = JSON.parse(cleanedTypeText) as TypeDeterminationResponse;

    if (
      parsed.type &&
      typeof parsed.type === "string" &&
      Object.prototype.hasOwnProperty.call(DIAGRAM_TYPES, parsed.type)
    ) {
      return {
        type: parsed.type as DiagramType,
        isValid: true,
        enhancedText: parsed.enhancedText
      };
    }

    return {
      type: "flowchart",
      isValid: true,
      enhancedText: validationJson.understanding ?? ""
    };
  } catch (error) {
    console.error("Error in diagram type determination:", error);
    return {
      type: "flowchart",
      isValid: false,
      error: "Failed to analyze the text. Please try providing more specific information."
    };
  }
};

// Function to generate diagram using AI
export const generateDiagramWithAI = async (
  text: string,
  suggestedType: DiagramType,
  attempt = 0,
  isComplex = false,
): Promise<string> => {
  const model = getFlashModel();
  const syntaxDoc = await getSyntaxDocumentation(suggestedType);

  const diagramPrompt = DIAGRAM_PROMPTS[suggestedType].split('\n').map(line => `   ${line}`).join('\n');

  // Different prompt strategies based on attempt number
  const promptStrategies: (() => string)[] = [
    // First attempt - Standard approach with clear structure
    () => `As an expert in Mermaid.js diagram generation, create a ${isComplex ? "comprehensive" : "simple"} ${suggestedType} diagram.

Input Text to Visualize:
${text}

Specialized Requirements for ${suggestedType}:
${diagramPrompt}

Follow these guidelines:
1. Start with "${suggestedType}" declaration
2. Follow exact Mermaid.js syntax
3. Keep it ${isComplex ? "detailed" : "simple"} and clear
4. Focus on readability

Reference Syntax:
${syntaxDoc}

Return only the Mermaid diagram code, no explanations.`,

    // Second attempt - Focus on hierarchical breakdown
    () => `Create a ${suggestedType} diagram by breaking down the components hierarchically.

Content to Visualize:
${text}

Key Points:
1. Break down the main concepts first
2. Establish clear relationships
3. Use proper ${suggestedType} syntax
4. Keep the structure ${isComplex ? "comprehensive" : "minimal"}

Syntax Guidelines:
${syntaxDoc}

Return only valid Mermaid.js code.`,

    // Third attempt - Systematic approach
    () => `Generate a ${suggestedType} diagram using a systematic approach.

Text for Visualization:
${text}

Process:
1. Identify main elements
2. Define relationships
3. Organize layout
4. Apply ${isComplex ? "advanced" : "basic"} formatting

Technical Requirements:
1. Valid ${suggestedType} syntax
2. Clear node definitions
3. Proper connections
4. ${isComplex ? "Detailed" : "Simple"} structure

Return only the diagram code.`,

    // Fourth attempt - Alternative perspective
    () => `Design a ${suggestedType} diagram with a fresh perspective.

Source Text:
${text}

Focus Areas:
1. Essential components only
2. Clear flow and structure
3. ${isComplex ? "Rich" : "Basic"} relationships
4. Standard syntax

Syntax Reference:
${syntaxDoc}

Return only Mermaid.js compatible code.`
  ];

  // Get the appropriate prompt strategy based on attempt number (cycling through if we exceed the number of strategies)
  const strategyIndex = attempt % promptStrategies.length;
  const selectedStrategy = promptStrategies[strategyIndex];
  if (!selectedStrategy) {
    throw new Error('No valid prompt strategy found');
  }
  const prompt = selectedStrategy();

  return new Promise((resolve, reject) => {
    const request = async () => {
      try {
        const result = await makeAPIRequestWithRetry(async () => {
          const response = await model.generateContent(prompt);
          return response;
        });

        const response = result.response;

        if (!response?.text) {
          throw new Error("Invalid or empty response from AI model");
        }

        const responseText = response.text();
        if (typeof responseText !== "string") {
          throw new Error("Invalid response format from AI model");
        }

        let mermaidCode = formatDiagramCode(responseText);
        mermaidCode = removeStyles(mermaidCode);

        resolve(mermaidCode);
      } catch (error) {
        console.error("Error generating diagram:", error);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };

    addToQueue(request);
  });
};

// Function to generate a concise title for a diagram
export const generateDiagramTitle = async (
  text: string,
  diagramType: DiagramType,
): Promise<string> => {
  const model = getFlashLiteModel();

  const prompt = `Generate a short, concise, and descriptive title (maximum 50 characters) for a ${diagramType} diagram based on this text. The title should capture the main concept or purpose of the diagram.

Text to generate title for: "${text}"

Rules:
1. Maximum 50 characters
2. Be descriptive but concise
3. Focus on the main concept
4. No quotes or special characters
5. Return only the title, nothing else
`;

  return new Promise((resolve) => {
    const request = async () => {
      try {
        const result = await makeAPIRequestWithRetry(async () => {
          const response = await model.generateContent(prompt);
          return response;
        });

        const title = result.response.text().trim();
        // Ensure title is not too long and remove any quotes
        const cleanTitle = title.replace(/["']/g, "").slice(0, 50);
        resolve(cleanTitle || "Untitled Diagram");
      } catch (error) {
        console.error("Error generating diagram title:", error);
        resolve("Untitled Diagram");
      }
    };

    addToQueue(request);
  });
};
