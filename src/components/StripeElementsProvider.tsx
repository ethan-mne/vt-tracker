"use client";

import React from "react";
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

interface StripeElementsProviderProps {
  children: React.ReactNode;
}

export default function StripeElementsProvider({ children }: StripeElementsProviderProps) {
  return stripePromise ? (
    <Elements stripe={stripePromise}>{children}</Elements>
  ) : (
    <div className="p-4 bg-red-100 text-red-700 rounded-md">
      Error: Stripe configuration is missing. Please check your environment variables.
      {children}
    </div>
  );
} 