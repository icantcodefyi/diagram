export interface DiagramTypeResponse {
  type: string;
  reasoning: string;
}

// Rate limiting configuration
export const RATE_LIMIT = {
  minDelay: 1000, // Minimum delay between requests in ms
  maxDelay: 30000, // Maximum delay for exponential backoff
  initialDelay: 2000, // Initial delay for rate limiting
}; 


export interface ValidationResponse {
  isValid: boolean;
  understanding: string | null;
  error: string | null;
}

export interface TypeDeterminationResponse {
  type: string;
  reasoning: string;
  enhancedText: string;
}
