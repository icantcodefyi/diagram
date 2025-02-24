import { RATE_LIMIT } from "./types";

interface RateLimitState {
  tokenCount: number;
  requestCount: number;
  lastResetTime: number;
  tokenResetTime: number | null;  // Track when token limit will reset
  globalPause: boolean;  // Add this field
}

interface QueueRequest {
  request: () => Promise<void>;
  estimatedTokens: number;
}

// Queue for managing API requests
const requestQueue: QueueRequest[] = [];
let isProcessingQueue = false;

// Rate limit state
const rateLimitState: RateLimitState = {
  tokenCount: 0,
  requestCount: 0,
  lastResetTime: Date.now(),
  tokenResetTime: null,
  globalPause: false
};

// Sleep utility function
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Reset rate limit counters if minute has passed
function checkAndResetLimits() {
  const now = Date.now();
  if (now - rateLimitState.lastResetTime >= 60000) { // 1 minute
    console.log('Resetting rate limits:', {
      previousTokens: rateLimitState.tokenCount,
      previousRequests: rateLimitState.requestCount
    });
    rateLimitState.tokenCount = 0;
    rateLimitState.requestCount = 0;
    rateLimitState.lastResetTime = now;
  }
}

// Calculate wait time based on rate limits with better token management
function calculateWaitTime(estimatedTokens: number): number {
  const now = Date.now();
  
  // If we're in global pause, return time until reset
  if (rateLimitState.globalPause && rateLimitState.tokenResetTime) {
    return rateLimitState.tokenResetTime - now + 1000;
  }
  
  checkAndResetLimits();
  
  const timeUntilReset = 60000 - (now - rateLimitState.lastResetTime);
  
  // If we're token limited, use the token reset time
  if (rateLimitState.tokenResetTime && now < rateLimitState.tokenResetTime) {
    return rateLimitState.tokenResetTime - now + 1000; // Add 1s buffer
  }

  // Check if adding these tokens would exceed the limit
  if (rateLimitState.tokenCount + estimatedTokens > RATE_LIMIT.tokensPerMinute) {
    // Calculate minimum wait time needed for tokens
    const requiredWaitTime = timeUntilReset + 1000;
    return requiredWaitTime;
  }

  // Check request rate limit
  if (rateLimitState.requestCount >= RATE_LIMIT.requestsPerMinute) {
    return timeUntilReset + 1000;
  }
  
  return RATE_LIMIT.minDelay;
}

// Process the request queue
async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;

  console.log('Starting queue processing:', {
    queueLength: requestQueue.length
  });
  
  isProcessingQueue = true;
  while (requestQueue.length > 0) {
    const queueItem = requestQueue[0]!;
    const waitTime = calculateWaitTime(queueItem.estimatedTokens);
    
    console.log('Processing queue item:', {
      waitTime,
      queueLength: requestQueue.length
    });
    
    if (waitTime > RATE_LIMIT.minDelay) {
      console.log(`Waiting ${waitTime}ms before next request due to rate limits`);
      await sleep(waitTime);
      continue;
    }

    // Remove and execute request
    const { request, estimatedTokens } = requestQueue.shift()!;
    
    try {
      await request();
      rateLimitState.tokenCount += estimatedTokens;
      rateLimitState.requestCount++;
      console.log('Request completed successfully:', {
        newTokenCount: rateLimitState.tokenCount,
        newRequestCount: rateLimitState.requestCount
      });
      
      // Add minimum delay between requests
      await sleep(RATE_LIMIT.minDelay);
    } catch (error: any) {
      console.error("Error processing queue request:", error);
      
      if (error?.lastError?.responseHeaders) {
        const headers = error.lastError.responseHeaders;
        
        if (headers['x-ratelimit-reset-tokens']) {
          const resetTime = parseInt(headers['x-ratelimit-reset-tokens']) * 1000;
          rateLimitState.tokenResetTime = Date.now() + resetTime;
          rateLimitState.globalPause = true;
          
          console.log(`Token limit exceeded. Queue paused until ${new Date(rateLimitState.tokenResetTime).toISOString()}`);
          await sleep(Math.min(resetTime, RATE_LIMIT.maxDelay));
          
          // Reset state after pause
          rateLimitState.globalPause = false;
          rateLimitState.tokenCount = 0;
          continue;
        }
      }
      
      // For non-rate-limit errors, add delay and potentially retry
      await sleep(RATE_LIMIT.minDelay);
    }
  }
  
  console.log('Queue processing completed');
  isProcessingQueue = false;
}

// Wrapper for API calls with exponential backoff
export async function makeAPIRequestWithRetry<T>(
  apiCall: () => Promise<T>,
  estimatedTokens: number = 1000, // Default token estimate
  attempt = 0,
  maxAttempts = 5,
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("429") &&
      attempt < maxAttempts
    ) {
      let retryAfter = RATE_LIMIT.initialDelay;
      
      // Extract retry information from Azure headers
      if (error instanceof Error && 'lastError' in error) {
        const lastError = error.lastError as any;
        if (lastError?.responseHeaders) {
          if (lastError.responseHeaders['retry-after']) {
            retryAfter = parseInt(lastError.responseHeaders['retry-after']) * 1000;
          } else if (lastError.responseHeaders['x-ratelimit-reset-tokens']) {
            retryAfter = parseInt(lastError.responseHeaders['x-ratelimit-reset-tokens']) * 1000;
          }
        }
      }

      retryAfter = Math.min(Math.max(retryAfter, RATE_LIMIT.minDelay), RATE_LIMIT.maxDelay);
      const buffer = Math.random() * 1000;
      const delay = retryAfter + buffer;
      
      console.log(`Rate limited (attempt ${attempt + 1}/${maxAttempts}). Retrying in ${Math.ceil(delay/1000)} seconds...`);
      await sleep(delay);
      return makeAPIRequestWithRetry(apiCall, estimatedTokens, attempt + 1, maxAttempts);
    }
    throw error;
  }
}

// Smarter request batching
export function addToQueue(request: () => Promise<void>, estimatedTokens: number = 1000) {
  // Split large requests into smaller chunks if possible
  if (estimatedTokens > RATE_LIMIT.tokensPerMinute / 2) {
    console.log(`Large request (${estimatedTokens} tokens) detected. Adding with delay.`);
  }
  
  requestQueue.push({ request, estimatedTokens });
  void processQueue();
} 