import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';

interface AuthState {
  user: User | null;
  session: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: boolean) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: false,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: false });
  },
}));
