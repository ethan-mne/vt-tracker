// src/components/CreditPurchaseModal.tsx
"use client";

import React, { useState, useCallback } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { useAuth } from "../context/AuthContext";
import { CreditCard, Euro } from "lucide-react";
import { formatPrice } from "../lib/utils";
import toast from "react-hot-toast";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "../lib/payment-intent";
interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Constants
const CREDIT_PRICE = 2; // €2 per credit
const CREDIT_PACKAGES = [1, 5, 10, 20];

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
        <span className="text-gray-600 text-sm">credits</span>
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
      <span className="text-gray-700">Price per credit:</span>
      <span className="font-medium">{formatPrice(CREDIT_PRICE)}</span>
    </div>
    <div className="flex justify-between items-center mt-2 text-lg font-medium">
      <span>Total:</span>
      <span className="text-blue-700">
        {formatPrice(selectedAmount * CREDIT_PRICE)}
      </span>
    </div>
  </div>
);

const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements || !user) {
        setErrorMessage("Payment system not ready or user not logged in");
        return;
      }

      if (selectedAmount <= 0) {
        setErrorMessage("Please select a valid amount of credits");
        return;
      }

      setIsProcessing(true);
      setErrorMessage(null);

      try {
        // Create payment intent on the server
        const { clientSecret } = await createPaymentIntent(
          user.id,
          selectedAmount
        );

        if (!clientSecret) {
          throw new Error("Failed to create payment intent");
        }

        // Confirm the payment with Stripe.js
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error("Card element not found");
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                email: user.email,
              },
            },
          }
        );

        if (error) {
          throw new Error(error.message || "Payment failed");
        } else if (paymentIntent.status === "succeeded") {
          toast.success(`Successfully purchased ${selectedAmount} credits!`);
          onClose();
          // The webhook will add credits to the user account
        } else {
          throw new Error(`Payment returned status: ${paymentIntent.status}`);
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
        toast.error("Payment failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    },
    [stripe, elements, user, selectedAmount, onClose]
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Purchase Credits">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
            <CreditCard className="w-12 h-12 text-blue-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Credits for Contact Creation
              </h3>
              <p className="text-gray-600">
                Each credit costs {formatPrice(CREDIT_PRICE)} and allows you to
                create one contact.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">
              Choose number of credits:
            </h4>
            <CreditPackages
              packages={CREDIT_PACKAGES}
              selected={selectedAmount}
              onSelect={setSelectedAmount}
            />
          </div>

          <PaymentSummary selectedAmount={selectedAmount} />

          {errorMessage && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

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
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isProcessing}
              disabled={!stripe || isProcessing}
              className="gap-2"
            >
              <Euro className="w-4 h-4" />
              {isProcessing ? "Processing..." : "Pay"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreditPurchaseModal;
