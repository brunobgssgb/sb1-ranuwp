import Cookies from 'js-cookie';
import { User } from '../types';

const SESSION_KEY = 'auth_session';
const SESSION_EXPIRY_DAYS = 7;

export function saveSession(user: User): void {
  try {
    Cookies.set(SESSION_KEY, JSON.stringify(user), { 
      expires: SESSION_EXPIRY_DAYS,
      secure: true,
      sameSite: 'strict'
    });
  } catch (error) {
    console.error('Failed to save session:', error);
    throw new Error('Falha ao salvar sessão');
  }
}

export function getSession(): User | null {
  try {
    const session = Cookies.get(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

export function clearSession(): void {
  try {
    Cookies.remove(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
    throw new Error('Falha ao limpar sessão');
  }
}