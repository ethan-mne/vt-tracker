"use client";

import { AuthProvider } from "../context/AuthContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";

// Create a singleton instance of the Stripe promise to avoid recreating it on each render
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
let stripePromise: Promise<Stripe | null> | undefined;

if (stripeKey) {
  stripePromise = loadStripe(stripeKey);
} else {
  console.error("Stripe publishable key is missing");
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {stripePromise ? (
        <Elements stripe={stripePromise}>{children}</Elements>
      ) : (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          Error: Stripe configuration is missing. Please check your environment variables.
          {children}
        </div>
      )}
    </AuthProvider>
  );
}
