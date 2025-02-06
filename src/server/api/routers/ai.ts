/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Function to validate if the string is a valid Mermaid diagram
const isValidMermaidDiagram = (diagram: string): boolean => {
  // Basic validation - check if it starts with a valid Mermaid diagram type
  const validStartPatterns = [
    'graph',
    'flowchart',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'erDiagram',
    'gantt',
    'pie',
    'mindmap'
  ];
  
  const diagramParts = diagram.trim().split(' ');
  if (diagramParts.length === 0) return false;
  
  const diagramStart = diagramParts[0] ?? '';
  return validStartPatterns.some(pattern => diagramStart.includes(pattern));
};

// Function to remove style definitions from Mermaid diagram
const removeStyles = (diagram: string): string => {
  return diagram
    .replace(/style\s+[^\n]+/g, '')  // Remove style definitions
    .replace(/class\s+[^\n]+/g, '')  // Remove class assignments
    .replace(/classDef\s+[^\n]+/g, '') // Remove class definitions
    .replace(/\n\s*\n/g, '\n')       // Remove empty lines
    .trim();
};

export const aiRouter = createTRPCRouter({
  generateDiagram: publicProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input }) => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

      let attempts = 0;
      const maxAttempts = 3;
      let validDiagram = '';

      while (attempts < maxAttempts) {
        let prompt = '';
        
        if (attempts === 0) {
          prompt = `Generate a simple and clear Mermaid diagram for the following text. Only return the Mermaid diagram code without any styles, nothing else. The diagram should be minimal and focus on core relationships: ${input.text}`;
        } else {
          prompt = `The previous attempt to create a Mermaid diagram was invalid. Please generate a valid Mermaid diagram for this text. Focus on basic syntax and avoid any styling. Here's the text: ${input.text}\n\nEnsure you start with one of these: graph, flowchart, sequenceDiagram, classDiagram, stateDiagram, erDiagram, gantt, pie, or mindmap.`;
        }

        try {
          const result = await model.generateContent(prompt);
          const response = result.response;
          const text = response.text();
          
          if (typeof text !== 'string') {
            attempts++;
            continue;
          }

          let mermaidCode = text.replace(/```mermaid\n?|\n?```/g, '').trim();
          
          // Remove any style-related content
          mermaidCode = removeStyles(mermaidCode);

          if (isValidMermaidDiagram(mermaidCode)) {
            validDiagram = mermaidCode;
            break;
          }
        } catch (error) {
          console.error('Error generating diagram:', error);
        }

        attempts++;
      }

      if (!validDiagram) {
        throw new Error("Failed to generate a valid Mermaid diagram after multiple attempts");
      }

      return {
        diagram: validDiagram,
      };
    }),
}); 