'use client';

import AppLayout from '../components/layout/AppLayout';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import ContactsListPage with SSR disabled to avoid Stripe Elements issues during prerendering
const ContactsListPage = dynamic(
  () => import('../pages/ContactsListPage'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading contacts...</p>
          </div>
        </div>
      }>
        <ContactsListPage />
      </Suspense>
    </AppLayout>
  );
} 