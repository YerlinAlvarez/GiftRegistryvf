import { create } from 'zustand';
import { User } from '../../domain/entities/User';
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  unsubscribeAuth: (() => void) | null;

  init: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const repository = new AuthRepositoryImpl();

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

      set({
        user: repository.getCurrentUser(),
        unsubscribeAuth: unsubscribe,
      });
    },

    loginWithEmail: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const user = await repository.loginUser(email.trim(), password);
        set({ user, isLoading: false });
      } catch (e: any) {
        set({ error: e.message ?? 'Error al iniciar sesión', isLoading: false });
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
        set({ error: e.message ?? 'Error al cerrar sesión', isLoading: false });
      }
    },

    clearError: () => set({ error: null }),
  };
});

