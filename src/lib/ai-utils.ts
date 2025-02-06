import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";
import { type DiagramType, DIAGRAM_TYPES } from "@/types/diagram";
import fs from 'fs/promises';
import path from 'path';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

interface DiagramTypeResponse {
  type: string;
  reasoning: string;
}

// Function to validate if the string is a valid Mermaid diagram
export const isValidMermaidDiagram = (diagram: string): boolean => {
  const diagramParts = diagram.trim().split(/\s+/);
  if (diagramParts.length < 2) return false;
  
  const diagramType = diagramParts[0]?.toLowerCase() ?? "";
  return Object.keys(DIAGRAM_TYPES).some(type => 
    diagramType.includes(type.toLowerCase())
  );
};

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

// Function to determine the best diagram type using AI
export const determineDiagramType = async (text: string): Promise<DiagramType> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-001" });
  
  const prompt = `Analyze this text and determine the most suitable Mermaid diagram type for visualizing it. Consider the context, relationships, and visualization needs.

Available diagram types and their use cases:
${Object.entries(DIAGRAM_TYPES)
  .map(([type, desc]) => `- ${type}: ${desc}`)
  .join('\n')}

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

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    if (typeof text !== "string") {
      throw new Error("Invalid response from AI model");
    }

    try {
      const parsed = JSON.parse(text) as DiagramTypeResponse;
      if (
        parsed.type && 
        typeof parsed.type === "string" && 
        Object.prototype.hasOwnProperty.call(DIAGRAM_TYPES, parsed.type)
      ) {
        return parsed.type as DiagramType;
      }
    } catch (e) {
      console.error("Failed to parse diagram type response:", e);
    }
  } catch (error) {
    console.error("Error determining diagram type:", error);
  }

  // Default to flowchart if AI suggestion fails
  return "flowchart";
};

// Function to get syntax documentation for a diagram type
const getSyntaxDocumentation = async (diagramType: DiagramType): Promise<string> => {
  try {
    const docPath = path.join(process.cwd(), 'src', 'syntax', `${diagramType}.md`);
    const doc = await fs.readFile(docPath, 'utf8');
    return doc;
  } catch (error) {
    console.warn(`Could not load syntax documentation for ${diagramType}:`, error);
    return '';
  }
};

// Function to generate diagram using AI
export const generateDiagramWithAI = async (text: string, suggestedType: DiagramType, attempt = 0): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
  
  // Get the syntax documentation for the suggested diagram type
  const syntaxDoc = await getSyntaxDocumentation(suggestedType);
  
  const prompt = attempt === 0
    ? `Generate a clear and concise ${suggestedType} using Mermaid.js syntax for the following text. Focus on essential relationships and keep the diagram simple and readable. Only return the Mermaid diagram code, no explanations or additional text.

Here is the official Mermaid.js syntax documentation for ${suggestedType}:

${syntaxDoc}

Text to visualize:
${text}

Important guidelines:
- Start with "${suggestedType}"
- Use clear and concise node labels
- Follow the syntax documentation provided above
- Focus on key relationships
- Avoid complex styling
- Ensure proper syntax
- Keep it minimal but informative`
    : `Previous attempt to create a Mermaid diagram was invalid. Please generate a valid ${suggestedType} for this text. Focus on basic syntax and avoid styling.

Here is the official Mermaid.js syntax documentation for ${suggestedType}:

${syntaxDoc}

Text to visualize:
${text}

Requirements:
- Must start with "${suggestedType}"
- Use simple syntax following the documentation above
- Focus on core relationships
- No styling or decorations`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const responseText = response.text();
  
  if (typeof responseText !== "string") {
    throw new Error("Invalid response from AI model");
  }

  let mermaidCode = formatDiagramCode(responseText);
  mermaidCode = removeStyles(mermaidCode);

  return mermaidCode;
}; 