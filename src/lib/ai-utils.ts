import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";
import { type DiagramType, DIAGRAM_TYPES } from "@/types/diagram";
import fs from "fs/promises";
import path from "path";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

interface DiagramTypeResponse {
  type: string;
  reasoning: string;
}

// Function to remove style definitions from Mermaid diagram
export const removeStyles = (diagram: string): string => {
  return diagram
    .replace(/style\s+[^\n]+/g, "")
    .replace(/class\s+[^\n]+/g, "")
    .replace(/classDef\s+[^\n]+/g, "")
    .replace(/linkStyle\s+[^\n]+/g, "")
    .replace(/\n\s*\n/g, "\n")
    .trim();
};

// Function to sanitize and format the diagram code
export const formatDiagramCode = (code: string): string => {
  return code
    .replace(/```mermaid\n?|\n?```/g, "")
    .replace(/^\s*[\r\n]/gm, "")
    .trim();
};

// Rate limiting configuration
const RATE_LIMIT = {
  minDelay: 1000, // Minimum delay between requests in ms
  maxDelay: 30000, // Maximum delay for exponential backoff
  initialDelay: 2000, // Initial delay for rate limiting
};

// Queue for managing API requests
const requestQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;

// Sleep utility function
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Process the request queue
async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      await request();
      await sleep(RATE_LIMIT.minDelay); // Ensure minimum delay between requests
    }
  }
  isProcessingQueue = false;
}

// Wrapper for API calls with exponential backoff
async function makeAPIRequestWithRetry<T>(
  apiCall: () => Promise<T>,
  attempt = 0,
  maxAttempts = 5
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("429") &&
      attempt < maxAttempts
    ) {
      const delay = Math.min(
        RATE_LIMIT.maxDelay,
        RATE_LIMIT.initialDelay * Math.pow(2, attempt)
      );
      console.log(`Rate limited. Retrying in ${delay}ms...`);
      await sleep(delay);
      return makeAPIRequestWithRetry(apiCall, attempt + 1, maxAttempts);
    }
    throw error;
  }
}

// Function to determine the best diagram type using AI
export const determineDiagramType = async (
  text: string,
): Promise<DiagramType> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

  const prompt = `Analyze this text and determine the most suitable Mermaid diagram type for visualizing it. Consider the context, relationships, and visualization needs.

Available diagram types and their use cases:
${Object.entries(DIAGRAM_TYPES)
  .map(([type, desc]) => `- ${type}: ${desc}`)
  .join("\n")}

Text to analyze: "${text}"

Consider:
1. The type of information being represented
2. The relationships between elements
3. The temporal or structural nature of the data
4. The visualization goals
5. The complexity of the information

Respond in this exact JSON format:
{
  "type": "selected_diagram_type",
  "reasoning": "brief explanation why this type is best suited for this visualization"
}`;

  return new Promise((resolve, reject) => {
    const request = async () => {
      try {
        const result = await makeAPIRequestWithRetry(async () => {
          const response = await model.generateContent(prompt);
          return response;
        });
        
        const response = result.response;
        const responseText = response.text();

        if (typeof responseText !== "string") {
          throw new Error("Invalid response from AI model");
        }

        try {
          const cleanText = responseText.replace(/^```json\n|\n```$/g, '').trim();
          const parsed = JSON.parse(cleanText) as DiagramTypeResponse;
          if (
            parsed.type &&
            typeof parsed.type === "string" &&
            Object.prototype.hasOwnProperty.call(DIAGRAM_TYPES, parsed.type)
          ) {
            resolve(parsed.type as DiagramType);
            return;
          }
        } catch (e) {
          console.error("Failed to parse diagram type response:", e);
        }
        resolve("flowchart"); // Default fallback
      } catch (error) {
        console.error("Error determining diagram type:", error);
        resolve("flowchart"); // Default fallback on error
      }
    };

    requestQueue.push(request);
    void processQueue();
  });
};

// Function to get syntax documentation for a diagram type
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

// Function to generate diagram using AI
export const generateDiagramWithAI = async (
  text: string,
  suggestedType: DiagramType,
  attempt = 0,
  isComplex = false,
): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

  // Get the syntax documentation for the suggested diagram type
  const syntaxDoc = await getSyntaxDocumentation(suggestedType);

  const prompt =
    attempt === 0
      ? `Generate a ${isComplex ? "detailed and sophisticated" : "clear and concise"} ${suggestedType} using Mermaid.js syntax for the following text. ${
          isComplex
            ? "Include comprehensive relationships, styling, and advanced features to create a rich visualization."
            : "Focus on essential relationships and keep the diagram simple and readable."
        } Only return the Mermaid diagram code, no explanations or additional text.

Here is the official Mermaid.js syntax documentation for ${suggestedType}:

${syntaxDoc}

Text to visualize:
${text}

Important guidelines:
- Start with "${suggestedType}"
- Use ${isComplex ? "descriptive and detailed" : "clear and concise"} node labels
- Follow the syntax documentation provided above
${
  isComplex
    ? `- Utilize advanced features and styling
- Add comprehensive relationships
- Include detailed subgraphs where appropriate
- Use colors and formatting for better visualization`
    : `- Focus on key relationships
- Avoid complex styling
- Ensure proper syntax
- Keep it minimal but informative`
}`
      : `Previous attempt to create a Mermaid diagram was invalid. Please generate a valid ${suggestedType} for this text. ${
          isComplex
            ? "While maintaining complexity, ensure the syntax is correct."
            : "Focus on basic syntax and avoid styling."
        }

Here is the official Mermaid.js syntax documentation for ${suggestedType}:

${syntaxDoc}

Text to visualize:
${text}

Requirements:
- Must start with "${suggestedType}"
- Use ${isComplex ? "advanced" : "simple"} syntax following the documentation above
${
  isComplex
    ? `- Include detailed relationships and styling
- Utilize advanced features where appropriate
- Maintain proper syntax while being comprehensive`
    : `- Focus on core relationships
- No styling or decorations`
}`;

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

    requestQueue.push(request);
    void processQueue();
  });
};
