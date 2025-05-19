import React, { useState } from 'react';
import { Contact } from '../types/supabase';
import { formatPhone } from '../lib/utils';
import { Phone, User, Edit, Trash2 } from 'lucide-react';
import Button from './ui/Button';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface ContactCardProps {
  contact: Contact;
  onDelete: (id: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setIsDeleting(true);
      
      try {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .match({ id: contact.id });
          
        if (error) {
          throw error;
        }
        
        toast.success('Contact deleted successfully');
        onDelete(contact.id);
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast.error('Failed to delete contact');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/contacts/edit/${contact.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-700" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">{contact.first_name}</h3>
              <div className="flex items-center mt-1 text-gray-600">
                <Phone className="h-4 w-4 mr-1" />
                <span>{formatPhone(contact.phone)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleEdit}
              className="text-gray-600 hover:text-blue-600"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              loading={isDeleting}
              className="text-gray-600 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;