// frontend/src/store/authStore.js
// Global state using Zustand (or simple Context)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // ===== LOGIN =====
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authAPI.login(email, password);
          localStorage.setItem('autoflow_token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          return data;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      // ===== REGISTER =====
      register: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authAPI.register(formData);
          localStorage.setItem('autoflow_token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          return data;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      // ===== LOGOUT =====
      logout: async () => {
        try { await authAPI.logout(); } catch {}
        localStorage.removeItem('autoflow_token');
        set({ user: null, token: null });
        window.location.href = '/login';
      },

      // ===== REFRESH USER =====
      refreshUser: async () => {
        try {
          const data = await authAPI.me();
          set({ user: data.user });
        } catch {}
      },

      // ===== HELPERS =====
      isAuthenticated: () => !!get().token,
      hasRole: (...roles) => roles.includes(get().user?.role),
      isPro: () => ['pro', 'enterprise'].includes(get().user?.plan),
    }),
    { name: 'autoflow_auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);

export default useAuthStore;
