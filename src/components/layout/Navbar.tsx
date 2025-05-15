import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { LogOut, Menu, X, CreditCard, User, Plus } from 'lucide-react';
import CreditPurchaseModal from '../CreditPurchaseModal';

const Navbar: React.FC = () => {
  const { user, signOut, credits } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center text-blue-800 font-bold text-xl"
            >
              <User className="h-6 w-6 mr-2" />
              VT Tracker
            </Link>
          </div>

          {user ? (
            <>
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 font-normal"
                  onClick={() => setIsCreditModalOpen(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>{credits} Credits</span>
                </Button>

                <Link to="/contacts/new">
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    New Contact
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
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
              <Link to="/sign-in">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && user && (
        <div className="sm:hidden bg-white border-t border-gray-200 py-2 px-4 space-y-2">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium">Credits</span>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => {
                setIsCreditModalOpen(true);
                setIsMenuOpen(false);
              }}
            >
              <CreditCard className="h-4 w-4" />
              {credits}
            </Button>
          </div>
          
          <Link
            to="/contacts/new"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-3" />
              New Contact
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
              Sign Out
            </div>
          </button>
        </div>
      )}

      <CreditPurchaseModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar