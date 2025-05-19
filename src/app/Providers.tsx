'use client';

import { AuthProvider } from '../context/AuthContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

export function Providers({ children }: { children: React.ReactNode }) {
    const stripe_key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!stripe_key) {
        throw new Error("Missing Stripe publishable key");
    }
    const stripePromise = loadStripe(stripe_key);
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </AuthProvider>
  );
} 