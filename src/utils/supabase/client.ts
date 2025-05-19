import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

export const createClientSideClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// For singleton pattern (client-side only)
export const supabase = createClientSideClient(); 