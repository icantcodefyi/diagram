import { z } from "zod";
export interface DiagramTypeResponse {
  type: string;
  reasoning: string;
}

// Rate limiting configuration
export const RATE_LIMIT = {
  minDelay: 1000,      // 1 second minimum between requests
  maxDelay: 120000,    // 120 seconds maximum backoff
  initialDelay: 5000,  // 5 seconds initial delay
  tokensPerMinute: 10000,  // Token limit per minute
  requestsPerMinute: 60     // Request limit per minute
}; 

export const validationResponseSchema = z.object({
  isValid: z.boolean(),
  understanding: z.string().nullable(),
  error: z.string().nullable(),
});

export const typeDeterminationResponseSchema = z.object({
  type: z.string(),
  reasoning: z.string(),
  enhancedText: z.string(),
});

export interface AIRequestConfig {
  maxTokens: number;  // Maximum tokens for the response
  totalTokens: number;  // Estimated total tokens (prompt + response)
}

// Define token limits for different request types
export const TOKEN_LIMITS = {
  validation: {
    maxTokens: 200,
    totalTokens: 800
  },
  typeDetermination: {
    maxTokens: 300,
    totalTokens: 1200
  },
  diagramGeneration: {
    maxTokens: 2000,
    totalTokens: 4000
  },
  titleGeneration: {
    maxTokens: 100,
    totalTokens: 400
  }
} as const;
