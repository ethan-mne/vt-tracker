'use client';

import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase/client';
import { AuthContextType, defaultContext } from './authTypes';

export const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  const refreshCredits = useCallback(async () => {
    if (!user) return;
    
    try {
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
    } catch (error) {
      console.error('Error refreshing credits:', error);
    }
  }, [user]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          await refreshCredits();
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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
  }, [refreshCredits]);

  // Debug log for state changes
  useEffect(() => {
    console.log('AuthProvider: State updated:', { user, loading, session });
  }, [user, loading, session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        signIn: async (email: string, password: string) => {
          try {
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            return { error };
          } catch (error) {
            console.error('Error signing in:', error);
            return { error: error as Error };
          }
        },
        signUp: async (email: string, password: string) => {
          try {
            const { error } = await supabase.auth.signUp({
              email,
              password,
            });
            return { error };
          } catch (error) {
            console.error('Error signing up:', error);
            return { error: error as Error };
          }
        },
        signOut: async () => {
          try {
            await supabase.auth.signOut();
          } catch (error) {
            console.error('Error signing out:', error);
          }
        },
        loading,
        credits,
        refreshCredits,
        decrementCredit: async (): Promise<boolean> => {
          if (!user || credits < 1) {
            console.log('Cannot decrement credits:', { user: !!user, credits });
            return false;
          }
          
          console.log('Attempting to decrement credits. Current credits:', credits);
          try {
            const { error } = await supabase
              .from('user_credits')
              .update({ credits: credits - 1, updated_at: new Date().toISOString() })
              .eq('user_id', user.id);
              
            if (!error) {
              console.log('Successfully decremented credits');
              setCredits(prev => prev - 1);
              return true;
            }
            console.error('Error from Supabase when decrementing credits:', error);
            return false;
          } catch (error) {
            console.error('Error decrementing credit:', error);
            return false;
          }
        },
        addCredits: async (amount: number): Promise<boolean> => {
          if (!user || amount <= 0) return false;
          
          try {
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
          } catch (error) {
            console.error('Error adding credits:', error);
            return false;
          }
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};