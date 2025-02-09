export interface AnonymousUserState {
  id: string;
  credits: number;
  lastReset: string;
}

let cachedAnonymousUser: AnonymousUserState | null = null;

export async function getAnonymousUser(): Promise<AnonymousUserState> {
  if (typeof window === 'undefined') {
    return {
      id: '',
      credits: 0,
      lastReset: new Date().toISOString(),
    };
  }

  // Return cached user if available
  if (cachedAnonymousUser) {
    return cachedAnonymousUser;
  }

  try {
    const response = await fetch('/api/anonymous');
    if (!response.ok) {
      throw new Error('Failed to fetch anonymous user');
    }
    
    const data = (await response.json()) as AnonymousUserState;
    
    // Validate the response shape
    if (!data.id || typeof data.credits !== 'number' || !data.lastReset) {
      throw new Error('Invalid response format');
    }
    
    cachedAnonymousUser = data;
    return data;
  } catch (error) {
    console.error('Error fetching anonymous user:', error);
    return {
      id: '',
      credits: 0,
      lastReset: new Date().toISOString(),
    };
  }
}

export async function updateAnonymousCredits(newCredits: number): Promise<void> {
  if (typeof window === 'undefined') return;
  if (cachedAnonymousUser) {
    cachedAnonymousUser.credits = newCredits;
  }
}

export function clearAnonymousUser(): void {
  cachedAnonymousUser = null;
} 