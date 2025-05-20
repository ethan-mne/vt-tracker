'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { Contact } from '../types/supabase';
import { useAuth } from '../context/useAuth';
import ContactCard from '../components/ContactCard';
import { Plus, User } from 'lucide-react';
import Button from '../components/ui/Button';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

// Dynamically import the modal with SSR disabled to avoid Stripe Elements issues during prerendering
const CreditPurchaseModal = dynamic(
  () => import('../components/CreditPurchaseModal'),
  { ssr: false }
);

const ContactsListPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  useEffect(() => {
    console.log('Auth state:', { user, authLoading }); // Debug log

    const fetchContacts = async () => {
      if (!user) {
        console.log('No user, skipping fetch'); // Debug log
        setLoading(false);
        return;
      }
      
      console.log('Fetching contacts for user:', user.id); // Debug log
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Supabase error:', error); // Debug log
          throw error;
        }
        
        console.log('Fetched contacts:', data); // Debug log
        setContacts(data || []);
      } catch (err) {
        console.error('Error fetching contacts:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, [user, authLoading]);

  const refreshContacts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setContacts(data || []);
    } catch (err) {
      console.error('Error refreshing contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  console.log('Render state:', { loading, authLoading, user, contacts }); // Debug log

  // Show loading state while auth is loading or contacts are loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">{t('common.loading', { defaultValue: 'Loading authentication...' })}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">{t('common.loading', { defaultValue: 'Loading contacts...' })}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('common.appName', { defaultValue: 'My Contacts' })}</h1>
        <Link href="/contacts/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            {t('common.newContact')}
          </Button>
        </Link>
      </div>
      
      {contacts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} onDelete={refreshContacts} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('contact.noContacts')}</h3>
          <p className="text-gray-500 mb-6">{t('contact.search', { defaultValue: 'Get started by creating your first contact.' })}</p>
          <Link href="/contacts/new">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              {t('contact.create', { defaultValue: 'Add a Contact' })}
            </Button>
          </Link>
        </div>
      )}
      
      <CreditPurchaseModal 
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
      />
    </div>
  );
};

export default ContactsListPage;