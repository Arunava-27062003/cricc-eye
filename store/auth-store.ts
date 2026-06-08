import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { persistStorage } from '@/services/storage';
import type { AuthSession, AuthUser } from '@/types/auth';

interface AuthState {
  hydrated: boolean;
  token: string | null;
  user: AuthUser | null;
  setSession: (session: AuthSession) => void;
  updateUser: (user: AuthUser) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hydrated: false,
      token: null,
      user: null,
      setSession: (session) => set({ token: session.token, user: session.user }),
      updateUser: (user) => set({ user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => persistStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hydrated: true });
      },
    }
  )
);
