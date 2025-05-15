import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Contact } from '../types/supabase';
import ContactCard from '../components/ContactCard';
import Button from '../components/ui/Button';
import { Plus, UserSearch, RefreshCw } from 'lucide-react';
import CreditPurchaseModal from '../components/CreditPurchaseModal';

const ContactsListPage: React.FC = () => {
  const { user, credits } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreditModal, setShowCreditModal] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('created_by', user!.id)
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setContacts(data || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          My Contacts
        </h1>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={fetchContacts}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          {credits > 0 ? (
            <Link to="/contacts/new">
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                New Contact
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={() => setShowCreditModal(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              New Contact
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchContacts}
            className="ml-4"
          >
            Try Again
          </Button>
        </div>
      )}

      {contacts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex justify-center">
            <UserSearch className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No contacts found
          </h3>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            {credits > 0
              ? "You don't have any contacts yet. Create your first contact with the button above."
              : "You don't have any contacts yet. Purchase credits to add your first contact."}
          </p>
          {credits === 0 && (
            <Button
              className="mt-4"
              onClick={() => setShowCreditModal(true)}
            >
              Purchase Credits
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onDelete={handleDeleteContact}
            />
          ))}
        </div>
      )}

      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
      />
    </div>
  );
};

export default ContactsListPage;