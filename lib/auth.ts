export interface Session {
  user_uid: string;
  telephone: string;
  nom_commerce: string;
  account_status: 'essai' | 'actif' | 'suspendu';
  trial_remaining_days: number;
}

const SESSION_KEY = 'assa_session';

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  return getSession() !== null;
}
