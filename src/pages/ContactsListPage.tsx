'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase, executeWithRetry, waitForConnection } from '../utils/supabase/client';
import { Contact } from '../types/supabase';
import { useAuth } from '../context/useAuth';
import ContactCard from '../components/ContactCard';
import { Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('ContactsListPage useEffect triggered', { user, authLoading });
    const fetchContacts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Wait for connection with timeout
        const { connected, error: connectionError } = await waitForConnection();
        if (!connected) {
          throw new Error(connectionError || 'Unable to connect to the database. Please check your internet connection and try again.');
        }

        const result = await executeWithRetry(async () => {
          const response = await supabase
            .from("contacts")
            .select("*")
            .eq("created_by", user.id)
            .order("created_at", { ascending: false });
          return response;
        });

        if (result.error) {
          const errorDetails = {
            message: result.error.message || 'Unknown error occurred',
            code: result.error.code || 'No code available',
            details: result.error.details || 'No details available'
          };
          console.error('Supabase error details:', errorDetails);
          throw new Error(`Failed to fetch contacts: ${errorDetails.message}`);
        }

        setContacts(result.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch contacts');
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading) {
      fetchContacts();
    }
  }, [user?.id, authLoading]);

  const refreshContacts = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Wait for connection with timeout
      const { connected, error: connectionError } = await waitForConnection();
      if (!connected) {
        throw new Error(connectionError || 'Unable to connect to the database. Please check your internet connection and try again.');
      }

      const result = await executeWithRetry(async () => {
        const response = await supabase
          .from('contacts')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });
        return response;
      });
        
      if (result.error) {
        throw result.error;
      }
      
      setContacts(result.data || []);
      setError(null);
    } catch (err) {
      console.error('Error refreshing contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh contacts');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('contacts.title')}</h1>
        <Button onClick={() => router.push("/contacts/new")}>
          {t('contacts.addNew')}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={refreshContacts}
          >
            {t('common.retry')}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{t('contacts.noContacts')}</p>
          <Button onClick={() => router.push("/contacts/new")}>
            {t('contacts.createFirst')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={() => router.push(`/contacts/edit/${contact.id}`)}
              onDelete={refreshContacts}
            />
          ))}
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