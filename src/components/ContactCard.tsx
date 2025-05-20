'use client';

import { Contact } from '../types/supabase';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../utils/supabase/client';
import { toast } from 'react-hot-toast';
import { Phone, Mail, MapPin, FileText, Trash2, Edit, UserX } from 'lucide-react';
import Button from './ui/Button';
import { useTranslation } from 'react-i18next';

interface ContactCardProps {
  contact: Contact;
  onDelete: (id: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onDelete }) => {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(t('contact.deleteConfirm'))) {
      return;
    }
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contact.id);
        
      if (error) throw error;
      
      toast.success(t('contact.deleted'));
      onDelete(contact.id);
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error(t('contact.failedDelete'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {contact.first_name} {contact.last_name}
            </h3>
            {contact.created_at && (
              <p className="text-xs text-gray-500 mt-1">
                {t('contact.addedOn')} {new Date(contact.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Link href={`/contacts/edit/${contact.id}`}>
              <Button variant="ghost" size="sm" className="text-blue-600">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              onClick={handleDelete}
              variant="ghost"
              size="sm"
              className="text-red-600"
              disabled={deleting}
            >
              {deleting ? <UserX className="h-4 w-4 animate-pulse" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {contact.phone && (
            <div className="flex items-center text-sm text-gray-700">
              <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
              <span>{contact.phone}</span>
            </div>
          )}
          
          {contact.email && (
            <div className="flex items-center text-sm text-gray-700">
              <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
              <span>{contact.email}</span>
            </div>
          )}
          
          {contact.address && (
            <div className="flex items-start text-sm text-gray-700">
              <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>{contact.address}</span>
            </div>
          )}
          
          {contact.note && (
            <div className="flex items-start text-sm text-gray-700 pt-1">
              <FileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{contact.note}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactCard;