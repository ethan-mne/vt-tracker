// App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// 1. Import de Stripe Elements
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import AppLayout from "./components/layout/AppLayout";
import AuthLayout from "./components/layout/AuthLayout";

import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ContactsListPage from "./pages/ContactsListPage";
import NewContactPage from "./pages/NewContactPage";
import EditContactPage from "./pages/EditContactPage";

// Liste des librairies Google Maps à charger
const GOOGLE_LIBS: ("drawing" | "geometry" | "places" | "visualization")[] = [
  "places",
];

// 2. Initialisation de Stripe.js avec ta clé publique
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* 3. Wrappez vos routes d’achat de crédits (ou tout le Routes) dans Elements */}
        <Elements stripe={stripePromise}>
          <Routes>
            {/* Protected routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<ContactsListPage />} />
              <Route path="/contacts/new" element={<NewContactPage />} />
              <Route path="/contacts/edit/:id" element={<EditContactPage />} />
            </Route>

            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Elements>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
