import { User } from "better-auth/types";
import { create } from "zustand";
import { authClient } from "@lib/api-client";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setSessionToken: (token: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  refreshSession: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  signOut: () => Promise<void>;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sessionToken: null,

  setUser: (user) => set({ user }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setSessionToken: (sessionToken) => set({ sessionToken }),
  setIsLoading: (isLoading) => set({ isLoading }),

  signOut: async () => {
    await authClient.signOut();
    set({
      isAuthenticated: false,
      user: null,
      sessionToken: null,
    });
  },

  refreshSession: async () => {
    const { data, error } = await authClient.getSession();
    if (data && !error) {
      set({
        isAuthenticated: true,
        sessionToken: data.session.token,
        user: data.user,
      });
    }
  },

  checkAuthStatus: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await authClient.getSession();

      if (data && !error) {
        set({
          isAuthenticated: true,
          user: data.user,
          sessionToken: data.session.token,
        });
      } else {
        set({
          isAuthenticated: false,
          user: null,
          sessionToken: null,
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      set({
        isAuthenticated: false,
        user: null,
        sessionToken: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
