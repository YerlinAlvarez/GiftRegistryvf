import { create } from 'zustand';
import { User } from '../../domain/entities/User';
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl';
import { FirebaseAuthDataSource } from '../../data/datasources/FirebaseAuthDataSource';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  unsubscribeAuth: (() => void) | null;

  init: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const repository = new AuthRepositoryImpl();
  const dataSource = new FirebaseAuthDataSource();

  return {
    user: null,
    isLoading: false,
    error: null,
    unsubscribeAuth: null,

    init: () => {
      const { unsubscribeAuth } = get();
      if (unsubscribeAuth) return;
      const unsubscribe = repository.subscribeToAuthState((user) => {
        set({ user });
      });
      set({ user: repository.getCurrentUser(), unsubscribeAuth: unsubscribe });
    },

    loginWithEmail: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const user = await repository.loginUser(email.trim(), password);
        set({ user, isLoading: false });
      } catch (e: any) {
        set({ error: e.message ?? 'Error al iniciar sesion', isLoading: false });
      }
    },

    loginWithGoogle: async () => {
      set({ isLoading: true, error: null });
      try {
        const user = await dataSource.loginWithGoogle();
        set({ user, isLoading: false });
      } catch (e: any) {
        set({ error: e.message ?? 'Error al iniciar sesion con Google', isLoading: false });
      }
    },

    loginWithGitHub: async () => {
      set({ isLoading: true, error: null });
      try {
        const user = await dataSource.loginWithGitHub();
        set({ user, isLoading: false });
      } catch (e: any) {
        set({ error: e.message ?? 'Error al iniciar sesion con GitHub', isLoading: false });
      }
    },

    registerWithEmail: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const user = await repository.registerUser(email.trim(), password);
        set({ user, isLoading: false });
      } catch (e: any) {
        set({ error: e.message ?? 'Error al registrarse', isLoading: false });
      }
    },

    logout: async () => {
      set({ isLoading: true, error: null });
      try {
        await repository.logoutUser();
        set({ user: null, isLoading: false });
      } catch (e: any) {
        set({ error: e.message ?? 'Error al cerrar sesion', isLoading: false });
      }
    },

    clearError: () => set({ error: null }),
  };
});
