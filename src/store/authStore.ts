import { create } from 'zustand';
import { User } from '../types';
import * as authService from '../services/auth.service';
import * as session from '../lib/session';

interface AuthStore {
  currentUser: User | null;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  currentUser: null,
  isInitialized: false,

  initialize: async () => {
    try {
      const savedUser = session.getSession();
      if (savedUser) {
        set({ currentUser: savedUser });
      }
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
    } finally {
      set({ isInitialized: true });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const user = await authService.authenticateUser({ email, password });
      session.saveSession(user);
      set({ currentUser: user });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Falha na autenticação');
    }
  },

  logout: async () => {
    try {
      session.clearSession();
      set({ currentUser: null });
    } catch (error) {
      console.error('Logout failed:', error);
      throw new Error('Falha ao sair');
    }
  },

  updateProfile: async (data: Partial<User>) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const updatedUser = await authService.updateUserProfile(currentUser.id, data);
      session.saveSession(updatedUser);
      set({ currentUser: updatedUser });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Falha ao atualizar perfil');
    }
  },

  updatePassword: async (newPassword: string) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      await authService.updateUserPassword(currentUser.id, newPassword);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Falha ao atualizar senha');
    }
  }
}));