import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '../utils/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  loading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  loginWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  loginWithGoogle: () => Promise<{ error: string | null }>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
  upgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const supabase = createClient();

  const setGuestCookie = (val: boolean) => {
    if (typeof window !== 'undefined') {
      if (val) {
        document.cookie = 'siplytics-guest-mode=true; path=/; max-age=31536000; SameSite=Lax';
        localStorage.setItem('siplytics-guest-session', 'true');
      } else {
        document.cookie = 'siplytics-guest-mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        localStorage.removeItem('siplytics-guest-session');
      }
    }
  };

  return {
    user: null,
    session: null,
    isGuest: false,
    loading: true,
    error: null,
    upgradeModalOpen: false,

    clearError: () => set({ error: null }),
    setUpgradeModalOpen: (open) => set({ upgradeModalOpen: open }),

    initialize: async () => {
      set({ loading: true });
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const guestSession = typeof window !== 'undefined' && localStorage.getItem('siplytics-guest-session') === 'true';

        if (session) {
          set({
            session,
            user: session.user,
            isGuest: false,
            loading: false,
          });
        } else {
          set({
            session: null,
            user: null,
            isGuest: guestSession,
            loading: false,
          });
        }
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    },

    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setGuestCookie(false); // Clear guest cookie upon user login
        set({
          session: data.session,
          user: data.user,
          isGuest: false,
          loading: false,
        });
        return { error: null };
      } catch (err: any) {
        set({ error: err.message, loading: false });
        return { error: err.message };
      }
    },

    signup: async (email, password, fullName) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          },
        });

        if (error) throw error;

        // If email verification is enabled, user might not have a session immediately
        if (data.session) {
          setGuestCookie(false);
          set({
            session: data.session,
            user: data.user,
            isGuest: false,
          });
        }
        set({ loading: false });
        return { error: null };
      } catch (err: any) {
        set({ error: err.message, loading: false });
        return { error: err.message };
      }
    },

    loginWithMagicLink: async (email) => {
      set({ loading: true, error: null });
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          },
        });

        if (error) throw error;

        set({ loading: false });
        return { error: null };
      } catch (err: any) {
        set({ error: err.message, loading: false });
        return { error: err.message };
      }
    },

    loginWithGoogle: async () => {
      set({ loading: true, error: null });
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          },
        });

        if (error) throw error;

        return { error: null };
      } catch (err: any) {
        set({ error: err.message, loading: false });
        return { error: err.message };
      }
    },

    continueAsGuest: () => {
      setGuestCookie(true);
      set({
        user: null,
        session: null,
        isGuest: true,
        loading: false,
        error: null,
      });
    },

    logout: async () => {
      set({ loading: true });
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out failed:', err);
      } finally {
        setGuestCookie(false);
        set({
          user: null,
          session: null,
          isGuest: false,
          loading: false,
          error: null,
        });
      }
    },
  };
});
