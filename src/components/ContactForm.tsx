'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "../utils/supabase/client";
import { useAuth } from "../context/useAuth";
import { Contact } from "../types/supabase";
import Button from "./ui/Button";
import { Save, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ContactFormProps {
  contact?: Contact;
  isEditing?: boolean;
}

interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  note: string;
}

const initialFormValues: FormValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  note: "",
};

const ContactForm: React.FC<ContactFormProps> = ({ contact, isEditing = false }) => {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<FormValues>(
    contact
      ? {
          first_name: contact.first_name || "",
          last_name: contact.last_name || "",
          email: contact.email || "",
          phone: contact.phone || "",
          address: contact.address || "",
          note: contact.note || "",
        }
      : initialFormValues
  );
  const [submitting, setSubmitting] = useState(false);
  const { user, decrementCredit } = useAuth();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t('contact.mustBeLoggedIn'));
      return;
    }
    
    // Validate required fields
    if (!formValues.first_name || !formValues.last_name) {
      toast.error(t('contact.firstLastNameRequired'));
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isEditing && contact) {
        // Update existing contact
        const { error } = await supabase
          .from("contacts")
          .update({
            ...formValues,
            updated_at: new Date().toISOString(),
          })
          .eq("id", contact.id);
          
        if (error) throw error;
        
        toast.success(t('contact.updated'));
        // Use replace instead of push for mobile
        router.replace("/");
      } else {
        // Create new contact
        // First check if user has credits
        const hasCredit = await decrementCredit();
        
        if (!hasCredit) {
          toast.error(t('contact.noCredits'));
          setSubmitting(false);
          return;
        }
        
        const { error } = await supabase.from("contacts").insert({
          ...formValues,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        if (error) throw error;
        
        toast.success(t('contact.created'));
        // Use replace instead of push for mobile
        router.replace("/");
      }
    } catch (error) {
      console.error("Error saving contact:", error);
      toast.error(t('contact.failedSave'));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('contact.firstName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formValues.first_name}
            onChange={handleChange}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          />
        </div>
        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('contact.lastName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formValues.last_name}
            onChange={handleChange}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t('contact.email')}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formValues.email}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t('contact.phone')}
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formValues.phone}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t('contact.address')}
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formValues.address}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t('contact.notes')}
        </label>
        <textarea
          id="notes"
          name="note"
          rows={3}
          value={formValues.note}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/")}
          disabled={submitting}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('contact.saving')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? t('contact.update') : t('contact.save')}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;
