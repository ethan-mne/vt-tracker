'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/useAuth';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

// Dynamically import the modal with SSR disabled to avoid Stripe Elements issues during prerendering
const CreditPurchaseModal = dynamic(
  () => import('../CreditPurchaseModal'),
  { ssr: false }
);

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const { t } = useTranslation();

  // React Router-specific code is removed since we use Next.js router now
  React.useEffect(() => {
    if (!user && !loading) {
      const currentPath = window.location.pathname;
      // Only redirect if we're not on an auth page
      if (currentPath !== '/sign-in' && currentPath !== '/sign-up') {
        router.replace('/sign-in');
      }
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
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          &copy; 2024 {t('common.appName')}. {t('common.allRightsReserved')}
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