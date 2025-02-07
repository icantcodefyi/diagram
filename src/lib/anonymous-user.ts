import { v4 as uuidv4 } from 'uuid';

const ANONYMOUS_ID_KEY = 'anonymous_user_id';
const ANONYMOUS_CREDITS_KEY = 'anonymous_credits';
const ANONYMOUS_LAST_RESET_KEY = 'anonymous_last_reset';

export interface AnonymousUserState {
  id: string;
  credits: number;
  lastReset: string;
}

export function getAnonymousUser(): AnonymousUserState {
  if (typeof window === 'undefined') {
    return {
      id: '',
      credits: 0,
      lastReset: new Date().toISOString(),
    };
  }

  let id = localStorage.getItem(ANONYMOUS_ID_KEY);
  let credits = localStorage.getItem(ANONYMOUS_CREDITS_KEY);
  let lastReset = localStorage.getItem(ANONYMOUS_LAST_RESET_KEY);

  // If no anonymous ID exists, create one
  if (!id) {
    id = uuidv4();
    credits = '5'; // Initial credits for anonymous users
    lastReset = new Date().toISOString();
    
    localStorage.setItem(ANONYMOUS_ID_KEY, id);
    localStorage.setItem(ANONYMOUS_CREDITS_KEY, credits);
    localStorage.setItem(ANONYMOUS_LAST_RESET_KEY, lastReset);
  }

  // Check if credits need to be reset (daily)
  const lastResetDate = lastReset ? new Date(lastReset) : new Date(0);
  const now = new Date();
  if (lastResetDate.getDate() !== now.getDate()) {
    credits = '5'; // Reset to initial credits
    lastReset = now.toISOString();
    
    localStorage.setItem(ANONYMOUS_CREDITS_KEY, credits);
    localStorage.setItem(ANONYMOUS_LAST_RESET_KEY, lastReset);
  }

  return {
    id,
    credits: Number(credits),
    lastReset: lastReset ?? new Date().toISOString(),
  };
}

export function updateAnonymousCredits(newCredits: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ANONYMOUS_CREDITS_KEY, String(newCredits));
}

export function clearAnonymousUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ANONYMOUS_ID_KEY);
  localStorage.removeItem(ANONYMOUS_CREDITS_KEY);
  localStorage.removeItem(ANONYMOUS_LAST_RESET_KEY);
} 