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
  previousError?: string,
): Promise<string> => {
  const model = getFlashModel();
  const syntaxDoc = await getSyntaxDocumentation(suggestedType);

  const complexityGuidelines = isComplex
    ? [
        "1. Structure:",
        "   - Use clear hierarchical organization",
        "   - Group related elements using subgraphs",
        "   - Maintain consistent direction (TB/LR/etc.)",
        "2. Relationships:",
        "   - Use precise arrow types for relationships",
        "   - Include relationship labels where meaningful",
        "   - Ensure proper connection syntax",
        "3. Styling:",
        "   - Apply consistent node shapes",
        "   - Use color schemes meaningfully",
        "   - Add tooltips for complex nodes",
        "4. Advanced Features:",
        "   - Implement click events if relevant",
        "   - Use appropriate line styles",
        "   - Add descriptive titles/labels",
      ]
    : [
        "1. Structure:",
        "   - Keep layout simple and linear",
        "   - Minimize crossing lines",
        "   - Use basic top-to-bottom flow",
        "2. Relationships:",
        "   - Use basic arrows (-->)",
        "   - Keep labels short and clear",
        "   - Direct connections only",
        "3. Styling:",
        "   - Minimal use of shapes",
        "   - Limited color palette",
        "   - Focus on readability",
      ];

  const syntaxValidationSteps = [
    "1. Verify diagram type declaration is correct",
    "2. Check all node declarations follow documentation",
    "3. Validate relationship syntax",
    "4. Confirm subgraph syntax if used",
    "5. Verify style declarations",
    "6. Check for proper line endings",
    "7. Validate direction statements",
    "8. Ensure proper nesting of elements",
  ];

  const diagramPrompt = DIAGRAM_PROMPTS[suggestedType].split('\n').map(line => `   ${line}`).join('\n');

  let prompt: string;

  if (attempt === 0) {
    prompt = `As an expert in Mermaid.js diagram generation, create a ${isComplex ? "comprehensive" : "simple"} ${suggestedType} diagram following these specialized requirements exactly.

Input Text to Visualize:
${text}

Specialized Requirements for ${suggestedType}:
${diagramPrompt}

Follow these exact steps:

1. First, analyze the requirements from the specialized prompt above
2. Then, implement the diagram following this structure:
${diagramPrompt}

3. Apply these complexity guidelines:
${complexityGuidelines.join('\n')}

4. Validate against official syntax:
${syntaxDoc}

5. Perform final validation:
${syntaxValidationSteps.join('\n')}

Critical Requirements:
1. Start with "${suggestedType}" declaration
2. Follow exact Mermaid.js syntax
3. Ensure all nodes are declared before use
4. Use proper arrow syntax
5. Maintain consistent indentation
6. No markdown or extra text

Return only the Mermaid diagram code, no explanations.`;
  } else {
    const errorAnalysis = previousError
      ? `Previous Error Analysis:
1. Error: ${previousError}
2. Common causes:
   - Incorrect syntax in node declarations
   - Invalid relationship definitions
   - Improper subgraph structure
   - Malformed style declarations
3. Focus areas for correction:
   - Syntax validation
   - Proper closing of blocks
   - Valid relationship types
   - Correct style formats`
      : "";

    prompt = `As an expert Mermaid.js developer, fix the invalid diagram while following these specialized requirements exactly.

${errorAnalysis}

Input Text to Visualize:
${text}

Specialized Requirements for ${suggestedType}:
${diagramPrompt}

Follow these exact steps:

1. First, analyze the requirements from the specialized prompt above
2. Then, implement the diagram following this structure:
${diagramPrompt}

3. Apply these complexity guidelines:
${complexityGuidelines.join('\n')}

4. Validate against official syntax:
${syntaxDoc}

5. Perform final validation:
${syntaxValidationSteps.join('\n')}

Critical Requirements:
1. Start with "${suggestedType}" declaration
2. Follow exact Mermaid.js syntax
3. Ensure all nodes are declared before use
4. Use proper arrow syntax
5. Maintain consistent indentation
6. No markdown or extra text

Return only the Mermaid diagram code, no explanations.`;
  }

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
