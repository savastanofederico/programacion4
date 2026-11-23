import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMeApi, loginApi, logoutApi } from '../features/auth/api/auth';
import type { UserPublic } from '../features/auth/types/auth';
import { registerUnauthorizedHandler } from '../shared/api/axiosInstance';

interface AuthState {
  usuario: UserPublic | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<UserPublic>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username: string, password: string) => {
        await loginApi(username, password);
        const me = await getMeApi();
        set({ usuario: me, cargando: false });
        return me;
      },

      logout: async () => {
        try {
          await logoutApi();
        } finally {
          set({ usuario: null, cargando: false });
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const me = await getMeApi();
          set({ usuario: me, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      limpiarSesion: () => {
        set({ usuario: null, cargando: false });
      },
    }),
    {
      name: 'foodstore-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);

registerUnauthorizedHandler(() => {
  useAuthStore.getState().limpiarSesion();
});
