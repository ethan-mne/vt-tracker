'use client';

import { Contact } from '../types/supabase';
import { useState } from 'react';
import { Phone, MapPin, Trash2, Loader2 } from 'lucide-react';
import Button from './ui/Button';
import { useTranslation } from 'react-i18next';

interface ContactCardProps {
  contact: Contact;
  onDelete: () => void;
  onEdit: () => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onDelete, onEdit }) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(t('contact.confirmDelete'))) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {contact.first_name} {contact.last_name}
          </h3>
          {contact.email && (
            <p className="text-gray-600 text-sm">{contact.email}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={isDeleting}
          >
            {t('common.edit')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {contact.phone && (
        <p className="text-gray-600 text-sm mb-2">
          <Phone className="h-4 w-4 inline mr-1" />
          {contact.phone}
        </p>
      )}
      
      {contact.address && (
        <p className="text-gray-600 text-sm mb-2">
          <MapPin className="h-4 w-4 inline mr-1" />
          {contact.address}
        </p>
      )}
      
      {contact.note && (
        <p className="text-gray-600 text-sm mt-2">
          {contact.note}
        </p>
      )}
    </div>
  );
};

export default ContactCard;