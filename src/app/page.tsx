'use client';

import AppLayout from '../components/layout/AppLayout';
import dynamic from 'next/dynamic';

// Dynamically import ContactsListPage with SSR disabled to avoid Stripe Elements issues during prerendering
const ContactsListPage = dynamic(
  () => import('../pages/ContactsListPage'),
  { ssr: false }
);

export default function Home() {
  return (
    <AppLayout>
      <ContactsListPage />
    </AppLayout>
  );
} 