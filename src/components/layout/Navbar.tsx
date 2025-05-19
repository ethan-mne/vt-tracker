'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/useAuth';
import Button from '../ui/Button';
import { LogOut, Menu, X, CreditCard, User, Plus, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navbar: React.FC<{ onOpenCreditModal: () => void }> = ({ onOpenCreditModal }) => {
  const { user, signOut, credits, refreshCredits } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { i18n, t } = useTranslation();

  // Refresh credits when the component mounts and when the user changes
  useEffect(() => {
    if (user) {
      refreshCredits();
    }
  }, [user, refreshCredits]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center text-blue-800 font-bold text-xl"
            >
              <User className="h-6 w-6 mr-2" />
              {t('common.appName')}
            </Link>
          </div>

          {user ? (
            <>
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                <div className="relative">
                  <select
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">{t('common.english')}</option>
                    <option value="fr">{t('common.french')}</option>
                    <option value="es">{t('common.spanish')}</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <Globe className="h-4 w-4" />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 font-normal"
                  onClick={() => {
                    refreshCredits();
                    onOpenCreditModal();
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>{credits} {t('common.credits')}</span>
                </Button>

                <Link href="/contacts/new">
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    {t('common.newContact')}
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('common.signOut')}
                </Button>
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <button
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                >
                  {isMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={i18n.language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en">{t('common.english')}</option>
                  <option value="fr">{t('common.french')}</option>
                  <option value="es">{t('common.spanish')}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <Globe className="h-4 w-4" />
                </div>
              </div>
              <Link href="/sign-in">
                <Button variant="outline" size="sm">
                  {t('common.signIn')}
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">{t('common.signUp')}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && user && (
        <div className="sm:hidden bg-white border-t border-gray-200 py-2 px-4 space-y-2">
          <div className="py-2">
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">{t('common.english')}</option>
              <option value="fr">{t('common.french')}</option>
              <option value="es">{t('common.spanish')}</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium">{t('common.credits')}</span>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => {
                refreshCredits();
                onOpenCreditModal();
                setIsMenuOpen(false);
              }}
            >
              <CreditCard className="h-4 w-4" />
              {credits}
            </Button>
          </div>
          
          <Link
            href="/contacts/new"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-3" />
              {t('common.newContact')}
            </div>
          </Link>
          
          <button
            onClick={() => {
              handleSignOut();
              setIsMenuOpen(false);
            }}
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center">
              <LogOut className="h-4 w-4 mr-3" />
              {t('common.signOut')}
            </div>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;