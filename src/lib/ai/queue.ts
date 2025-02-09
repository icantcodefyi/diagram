import { RATE_LIMIT } from "./types";

// Queue for managing API requests
const requestQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;

// Sleep utility function
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Process the request queue
export async function processQueue() {
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
export async function makeAPIRequestWithRetry<T>(
  apiCall: () => Promise<T>,
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
      const delay = Math.min(
        RATE_LIMIT.maxDelay,
        RATE_LIMIT.initialDelay * Math.pow(2, attempt),
      );
      console.log(`Rate limited. Retrying in ${delay}ms...`);
      await sleep(delay);
      return makeAPIRequestWithRetry(apiCall, attempt + 1, maxAttempts);
    }
    throw error;
  }
}

export function addToQueue(request: () => Promise<void>) {
  requestQueue.push(request);
  void processQueue();
} 