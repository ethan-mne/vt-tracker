"use client";

import { AuthProvider } from "../context/AuthContext";
import dynamic from "next/dynamic";

// Dynamically import Stripe components to avoid SSR issues
const StripeElementsProvider = dynamic(
  () => import("../components/StripeElementsProvider"),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StripeElementsProvider>{children}</StripeElementsProvider>
    </AuthProvider>
  );
}
