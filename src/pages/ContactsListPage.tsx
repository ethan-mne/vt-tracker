'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { Contact } from '../types/supabase';
import { useAuth } from '../context/useAuth';
import ContactCard from '../components/ContactCard';
import { Plus, User, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// Dynamically import the modal with SSR disabled to avoid Stripe Elements issues during prerendering
const CreditPurchaseModal = dynamic(
  () => import('../components/CreditPurchaseModal'),
  { ssr: false }
);

const ContactsListPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchContacts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setError(null);
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (mounted) {
          setContacts(data || []);
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
        if (mounted) {
          setError('Failed to load contacts. Please try again.');
          toast.error('Failed to load contacts');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchContacts();
    
    return () => {
      mounted = false;
    };
  }, [user]);

  const refreshContacts = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
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
      setError('Failed to refresh contacts. Please try again.');
      toast.error('Failed to refresh contacts');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
        <Button 
          onClick={refreshContacts}
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
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