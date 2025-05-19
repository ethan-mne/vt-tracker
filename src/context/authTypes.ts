import type { Session, User } from '@supabase/supabase-js';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
  loading: boolean;
  credits: number;
  refreshCredits: () => Promise<void>;
  decrementCredit: () => Promise<boolean>;
  addCredits: (amount: number) => Promise<boolean>;
}

export const defaultContext: AuthContextType = {
  session: null,
  user: null,
  signIn: async () => ({ error: new Error('Not implemented') }),
  signUp: async () => ({ error: new Error('Not implemented') }),
  signOut: async () => {},
  loading: true,
  credits: 0,
  refreshCredits: async () => {},
  decrementCredit: async () => false,
  addCredits: async () => false,
}; 