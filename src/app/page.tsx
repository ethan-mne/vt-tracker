'use client';

import AppLayout from '../components/layout/AppLayout';
import ContactsListPage from '../pages/ContactsListPage';

export default function Home() {
  return (
    <AppLayout>
      <ContactsListPage />
    </AppLayout>
  );
} 