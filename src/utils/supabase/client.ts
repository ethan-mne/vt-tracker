import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log environment variables (without exposing the full key)
console.log('Supabase configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Helper function to safely access localStorage
const getLocalStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
};

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'vt-tracker-auth',
    storage: {
      getItem: (key) => {
        try {
          const storage = getLocalStorage();
          if (!storage) return Promise.resolve(null);
          
          const value = storage.getItem(key);
          return Promise.resolve(value);
        } catch (error) {
          console.warn('Error reading from localStorage:', error);
          return Promise.resolve(null);
        }
      },
      setItem: (key, value) => {
        try {
          const storage = getLocalStorage();
          if (!storage) return Promise.resolve();
          
          storage.setItem(key, value);
          return Promise.resolve();
        } catch (error) {
          console.warn('Error writing to localStorage:', error);
          return Promise.resolve();
        }
      },
      removeItem: (key) => {
        try {
          const storage = getLocalStorage();
          if (!storage) return Promise.resolve();
          
          storage.removeItem(key);
          return Promise.resolve();
        } catch (error) {
          console.warn('Error removing from localStorage:', error);
          return Promise.resolve();
        }
      }
    }
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'vt-tracker'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Initialize auth state
const initializeAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Initial auth state:', { hasSession: !!session, error });
    
    if (error) {
      console.error('Error getting initial session:', error);
      return;
    }

    if (session) {
      console.log('Session restored:', {
        user: session.user?.email,
        expiresAt: session.expires_at
      });
    }
  } catch (err) {
    console.error('Error initializing auth:', err);
  }
};

// Add a connection test function with retry logic
export const testConnection = async (retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { error } = await supabase
        .from('contacts')
        .select('count')
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.error(`Connection test attempt ${i + 1} failed:`, error);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.log('Connection test successful');
      return true;
    } catch (error) {
      console.error(`Connection test attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
};

// Initialize auth and test connection
const initialize = async () => {
  try {
    await initializeAuth();
    await testConnection();
  } catch (err) {
    console.error('Initialization failed:', err);
  }
};

// Run initialization
initialize().catch(err => {
  console.error('Initialization error:', err);
});

// Helper function to check if we're online
export const isOnline = () => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// Helper function to execute a Supabase query with retry logic and timeout
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
  timeout = 30000 // Increased timeout to 30 seconds
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check connection first
      const { connected, error: connectionError } = await waitForConnection(10000);
      if (!connected) {
        throw new Error(connectionError || 'Connection failed');
      }

      // Create a timeout promise with AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        // Execute the operation with the abort signal
        const result = await operation();
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Operation timed out after ${timeout}ms`);
        }
        throw error;
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after all retries');
};

// Helper function to wait for connection with timeout and diagnostics
export const waitForConnection = async (timeout = 30000): Promise<{ connected: boolean; error?: string }> => {
  const startTime = Date.now();
  let lastError: string | undefined;
  
  while (Date.now() - startTime < timeout) {
    // First check if we're online
    if (!isOnline()) {
      lastError = 'No internet connection';
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue;
    }

    // Then check Supabase connection with a shorter timeout
    const { connected, error } = await checkSupabaseConnection(5000);
    if (connected) {
      return { connected: true };
    }
    
    lastError = error;
    console.log(`Connection attempt failed: ${error}. Retrying...`);
    
    // Wait before next attempt with exponential backoff
    const elapsed = Date.now() - startTime;
    const remaining = timeout - elapsed;
    const delay = Math.min(1000 * Math.pow(2, Math.floor(elapsed / 5000)), remaining);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  return { 
    connected: false, 
    error: lastError || 'Connection timeout'
  };
};

// Helper function to check Supabase connection
export const checkSupabaseConnection = async (timeout = 5000): Promise<{ connected: boolean; error?: string }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const { error } = await supabase
        .from('contacts')
        .select('count')
        .limit(1)
        .maybeSingle();

      clearTimeout(timeoutId);

      if (error) {
        console.error('Supabase connection check failed:', error);
        return { 
          connected: false, 
          error: error.message || 'Database connection failed'
        };
      }

      return { connected: true };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return { 
          connected: false, 
          error: 'Connection check timed out'
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Supabase connection check error:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Connection check failed'
    };
  }
};

export { supabase }; 