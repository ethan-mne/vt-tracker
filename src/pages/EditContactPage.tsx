import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContactForm from '../components/ContactForm';
import { Contact } from '../types/supabase';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const EditContactPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContact = async () => {
      if (!id || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', id)
          .eq('created_by', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          navigate('/');
          return;
        }
        
        setContact(data);
      } catch (err) {
        console.error('Error fetching contact:', err);
        setError('Failed to load contact information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContact();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading contact...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!contact) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Contact</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ContactForm contact={contact} isEditing />
      </div>
    </div>
  );
};

export default EditContactPage;