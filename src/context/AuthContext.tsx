import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { UserCredits } from '../types/supabase';

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      if (data.session?.user) {
        await refreshCredits();
      }
      
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await refreshCredits();
        } else {
          setCredits(0);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshCredits = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();
      
    if (!error && data) {
      setCredits(data.credits);
    } else if (error && error.code === 'PGRST116') {
      // Create credit record if it doesn't exist
      const { data: newData } = await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          credits: 0
        })
        .select()
        .single();
        
      if (newData) {
        setCredits(newData.credits);
      }
    }
  };

  const decrementCredit = async (): Promise<boolean> => {
    if (!user || credits < 1) return false;
    
    const { error } = await supabase
      .from('user_credits')
      .update({ credits: credits - 1, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
      
    if (!error) {
      setCredits(prev => prev - 1);
      return true;
    }
    return false;
  };

  const addCredits = async (amount: number): Promise<boolean> => {
    if (!user || amount <= 0) return false;
    
    const { error } = await supabase
      .from('user_credits')
      .update({ 
        credits: credits + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
      
    if (!error) {
      setCredits(prev => prev + amount);
      return true;
    }
    return false;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        signIn,
        signUp,
        signOut,
        loading,
        credits,
        refreshCredits,
        decrementCredit,
        addCredits
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};