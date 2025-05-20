import React from 'react';
import ContactForm from '../components/ContactForm';
import { useTranslation } from 'react-i18next';

const NewContactPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('common.createNewContact')}</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ContactForm />
      </div>
    </div>
  );
};

export default NewContactPage;