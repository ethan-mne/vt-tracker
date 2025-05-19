// src/components/CreditPurchaseModal.tsx
import React, { useState, useCallback } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { useAuth } from "../context/AuthContext";
import { CreditCard, Euro } from "lucide-react";
import { formatPrice } from "../lib/utils";
import toast from "react-hot-toast";
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";

import { loadStripe } from "@stripe/stripe-js";

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Constants
const CREDIT_PRICE = 50;
const CREDIT_PACKAGES = [1, 5, 10, 20];
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242";

// Stripe configuration
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": { color: "#aab7c4" },
    },
    invalid: { color: "#9e2146" },
  },
  hidePostalCode: true,
};

const CreditPackages: React.FC<{
  packages: number[];
  selected: number;
  onSelect: (amount: number) => void;
}> = ({ packages, selected, onSelect }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {packages.map((amount) => (
      <button
        key={amount}
        type="button"
        onClick={() => onSelect(amount)}
        className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${
          selected === amount
            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
        }`}
      >
        <span className="text-2xl font-bold">{amount}</span>
        <span className="text-gray-600 text-sm">crédits</span>
        <span className="mt-1 text-blue-700 font-medium">
          {formatPrice(amount * CREDIT_PRICE)}
        </span>
      </button>
    ))}
  </div>
);

const PaymentSummary: React.FC<{ selectedAmount: number }> = ({
  selectedAmount,
}) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex justify-between items-center">
      <span className="text-gray-700">Prix unitaire :</span>
      <span className="font-medium">{formatPrice(CREDIT_PRICE)}</span>
    </div>
    <div className="flex justify-between items-center mt-2 text-lg font-medium">
      <span>Total :</span>
      <span className="text-blue-700">
        {formatPrice(selectedAmount * CREDIT_PRICE)}
      </span>
    </div>
  </div>
);

const InnerModal: React.FC<CreditPurchaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addCredits } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSuccess = useCallback(async () => {
    const success = await addCredits(selectedAmount);
    if (success) {
      toast.success(`Achat de ${selectedAmount} crédits réussi !`);
      onClose();
    } else {
      toast.error("Échec de l'ajout des crédits en base");
    }
  }, [addCredits, selectedAmount, onClose]);

  const processPayment = useCallback(
    async (clientSecret: string) => {
      if (!stripe || !elements) return;

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );

      if (error) {
        throw new Error(error.message || "Erreur lors du paiement");
      }

      if (paymentIntent?.status === "succeeded") {
        await handlePaymentSuccess();
      }
    },
    [stripe, elements, handlePaymentSuccess]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements || selectedAmount <= 0) return;

      setIsProcessing(true);

      try {
        const response = await fetch(`${API_URL}/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: selectedAmount * CREDIT_PRICE * 100,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création du paiement");
        }

        const { clientSecret } = await response.json();
        await processPayment(clientSecret);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        toast.error(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [stripe, elements, selectedAmount, processPayment]
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Acheter des crédits">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
            <CreditCard className="w-12 h-12 text-blue-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Crédits pour création de contact
              </h3>
              <p className="text-gray-600">
                Chaque crédit coûte {formatPrice(CREDIT_PRICE)} et permet de
                créer un contact.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">
              Choisissez le nombre de crédits :
            </h4>
            <CreditPackages
              packages={CREDIT_PACKAGES}
              selected={selectedAmount}
              onSelect={setSelectedAmount}
            />
          </div>

          <PaymentSummary selectedAmount={selectedAmount} />

          <div className="p-4 bg-white rounded-lg border">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              type="button"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={isProcessing}
              disabled={!stripe || isProcessing}
              className="gap-2"
            >
              <Euro className="w-4 h-4" />
              {isProcessing ? "Traitement..." : "Payer"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = (props) => (
  <Elements stripe={stripePromise}>
    <InnerModal {...props} />
  </Elements>
);

export default CreditPurchaseModal;
