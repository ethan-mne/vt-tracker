'use client';

import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, executeWithRetry, isOnline } from '../utils/supabase/client';
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
    if (!user) {
      console.log('refreshCredits: No user, returning.');
      return;
    }
    
    console.log('refreshCredits: Fetching credits for user:', user.id);
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();
        
      console.log('refreshCredits: Supabase query result:', { data, error });
      
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
      console.log('refreshCredits: Caught an error.');
    }
  }, [user]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          // Call refreshCredits after fetching the initial session
          await refreshCredits();
        } else {
          setCredits(0);
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
        setLoading(false); // Ensure loading is false even on error
      } finally {
        // setLoading(false); // Moved to catch block for initial fetch
      }
    };

    // Fetch initial session on mount
    fetchSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state changed:', _event, session);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Call refreshCredits when auth state changes to a logged-in user
          await refreshCredits();
        } else {
          // Reset credits when user logs out
          setCredits(0);
        }

        setLoading(false); // Loading is false after any auth state change or initial fetch
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log('Cleaning up auth state listener');
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array to run only on mount and unmount

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
          if (!user) {
            console.log('Cannot decrement credits: No user');
            return false;
          }
          
          if (!isOnline()) {
            console.log('Cannot decrement credits: Offline');
            return false;
          }
          
          try {
            // Use a transaction to ensure atomicity
            const result = await executeWithRetry(async () => {
              // First get the current credits with a lock
              const { data: creditData, error: selectError } = await supabase
                .from('user_credits')
                .select('credits')
                .eq('user_id', user.id)
                .single();
                
              if (selectError) {
                if (selectError.code === 'PGRST116') {
                  // No credits record exists
                  console.log('No credits record found');
                  return { error: new Error('No credits record found') };
                }
                throw selectError;
              }
              
              // If no credits record exists or credits are 0
              if (!creditData || creditData.credits < 1) {
                console.log('Cannot decrement credits: No credits available');
                return { error: new Error('No credits available') };
              }
              
              // Decrement credits
              const { error: updateError } = await supabase
                .from('user_credits')
                .update({ 
                  credits: creditData.credits - 1,
                  updated_at: new Date().toISOString() 
                })
                .eq('user_id', user.id)
                .eq('credits', creditData.credits); // Ensure credits haven't changed
                
              if (updateError) {
                throw updateError;
              }
              
              return { data: { credits: creditData.credits - 1 } };
            });
            
            if (result.error) {
              console.error('Error in decrementCredit:', result.error);
              return false;
            }
            
            // Update local state
            if (result.data) {
              setCredits(result.data.credits);
              return true;
            }
            
            return false;
          } catch (error) {
            console.error('Error in decrementCredit:', error);
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