'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/useAuth';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import the modal with SSR disabled to avoid Stripe Elements issues during prerendering
const CreditPurchaseModal = dynamic(
  () => import('../CreditPurchaseModal'),
  { ssr: false }
);

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  // React Router-specific code is removed since we use Next.js router now
  React.useEffect(() => {
    if (!user && !loading) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && !loading) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar onOpenCreditModal={() => setIsCreditModalOpen(true)} />
      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Phœnix - Visite technique. All rights reserved.
          </p>
        </div>
      </footer>
      <Toaster position="top-right" />
      <CreditPurchaseModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
      />
    </div>
  );
};

export default AppLayout;