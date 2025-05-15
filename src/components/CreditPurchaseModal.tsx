import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Euro } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import toast from 'react-hot-toast';

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CREDIT_PRICE = 50;
const CREDIT_PACKAGES = [1, 5, 10, 20];

const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addCredits } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (selectedAmount <= 0) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = await addCredits(selectedAmount);
    
    if (success) {
      toast.success(`Successfully purchased ${selectedAmount} credits!`);
      onClose();
    } else {
      toast.error('Failed to purchase credits. Please try again.');
    }
    
    setIsProcessing(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Purchase Credits">
      <div className="space-y-6">
        <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
          <CreditCard className="w-12 h-12 text-blue-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Credits for Contact Creation
            </h3>
            <p className="text-gray-600">
              Each credit costs {formatPrice(CREDIT_PRICE)} and allows you to create one new contact.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Select amount to purchase:</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CREDIT_PACKAGES.map(amount => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${
                  selectedAmount === amount
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl font-bold">{amount}</span>
                <span className="text-gray-600 text-sm">credits</span>
                <span className="mt-1 text-blue-700 font-medium">
                  {formatPrice(amount * CREDIT_PRICE)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Cost per credit:</span>
            <span className="font-medium">{formatPrice(CREDIT_PRICE)}</span>
          </div>
          <div className="flex justify-between items-center mt-2 text-lg font-medium">
            <span>Total:</span>
            <span className="text-blue-700">{formatPrice(selectedAmount * CREDIT_PRICE)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handlePurchase} 
            loading={isProcessing}
            className="gap-2"
          >
            <Euro className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 'Complete Purchase'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreditPurchaseModal;