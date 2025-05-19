"use client";

import { AuthProvider } from "../context/AuthContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>{children}</Elements>
    </AuthProvider>
  );
}
