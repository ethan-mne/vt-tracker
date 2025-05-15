import React, { useState } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Contact } from '../types/supabase';
import CreditPurchaseModal from './CreditPurchaseModal';

interface ContactFormProps {
  contact?: Contact;
  isEditing?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  contact, 
  isEditing = false 
}) => {
  const [name, setName] = useState(contact?.name || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [errors, setErrors] = useState<{name?: string; phone?: string}>({});
  const [loading, setLoading] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  
  const { user, credits, decrementCredit } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: {name?: string; phone?: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // For new contacts, check if user has enough credits
    if (!isEditing && credits < 1) {
      setShowCreditModal(true);
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEditing) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update({ name, phone })
          .eq('id', contact!.id);
        
        if (error) throw error;
        
        toast.success('Contact updated successfully');
      } else {
        // Create new contact
        const { error } = await supabase
          .from('contacts')
          .insert({
            name,
            phone,
            created_by: user!.id
          });
        
        if (error) throw error;
        
        // Decrement credit after successful contact creation
        await decrementCredit();
        
        toast.success('Contact created successfully');
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error(isEditing ? 'Failed to update contact' : 'Failed to create contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {!isEditing && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-700">
                Creating a new contact will use 1 credit
              </p>
              <span className="font-medium text-blue-800">
                {credits} {credits === 1 ? 'credit' : 'credits'} remaining
              </span>
            </div>
          </div>
        )}
        
        <Input
          label="Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter contact name"
          error={errors.name}
          required
        />
        
        <Input
          label="Phone Number"
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
          error={errors.phone}
          required
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {isEditing ? 'Update Contact' : 'Create Contact'}
          </Button>
        </div>
      </form>
      
      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
      />
    </>
  );
};

export default ContactForm;