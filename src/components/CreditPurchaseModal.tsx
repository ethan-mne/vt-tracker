// src/components/CreditPurchaseModal.tsx
"use client";

import React, { useState, useCallback } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { useAuth } from "../context/useAuth";
import { CreditCard, Euro } from "lucide-react";
import { formatPrice } from "../lib/utils";
import toast from "react-hot-toast";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent, checkPaymentStatus } from "../lib/payment-intent";
import { useTranslation } from "react-i18next";

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Constants
const CREDIT_PRICE = 100; // €100 per credit
const CREDIT_PACKAGES = [5, 10, 15, 20];

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "14px",
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
  t: (key: string) => string;
}> = ({ packages, selected, onSelect, t }) => (
  <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
    {packages.map((amount) => (
      <button
        key={amount}
        type="button"
        onClick={() => onSelect(amount)}
        className={`flex flex-col items-center justify-center p-2 sm:p-4 border rounded-lg transition-all ${
          selected === amount
            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
        }`}
      >
        <span className="text-xl sm:text-2xl font-bold">{amount}</span>
        <span className="text-gray-600 text-xs sm:text-sm">{t("payment.credits")}</span>
        <span className="mt-1 text-blue-700 text-sm sm:text-base font-medium">
          {formatPrice(amount * CREDIT_PRICE)}
        </span>
      </button>
    ))}
  </div>
);

const PaymentSummary: React.FC<{ 
  selectedAmount: number;
  t: (key: string) => string;
}> = ({
  selectedAmount,
  t
}) => (
  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-700">{t("payment.pricePerCredit")}</span>
      <span className="font-medium">{formatPrice(CREDIT_PRICE)}</span>
    </div>
    <div className="flex justify-between items-center mt-2 text-base sm:text-lg font-medium">
      <span>{t("payment.total")}</span>
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
  const { t } = useTranslation();
  const { user, refreshCredits } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements || !user) {
        setErrorMessage(t("payment.systemNotReady"));
        return;
      }

      if (selectedAmount <= 0 || !Number.isInteger(selectedAmount)) {
        setErrorMessage(t("payment.invalidAmount"));
        return;
      }

      setIsProcessing(true);
      setErrorMessage(null);

      try {
        const { clientSecret, paymentIntentId } = await createPaymentIntent(
          user.id,
          selectedAmount
        );

        if (!clientSecret || !paymentIntentId) {
          throw new Error(t("payment.failedCreateIntent"));
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error(t("payment.cardElementNotFound"));
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: user.email,
            },
          },
        });

        if (error) {
          throw new Error(error.message || t("payment.failed"));
        }

        if (!paymentIntent) {
          throw new Error(t("payment.unknownError"));
        }

        const paymentStatus = await checkPaymentStatus(paymentIntentId);
        
        if (paymentStatus.status === 'succeeded') {
          toast.success(t("payment.success", { count: selectedAmount }));
          if (refreshCredits) {
            await refreshCredits();
          }
          onClose();
        } else {
          throw new Error(t("payment.statusError", { message: paymentStatus.message }));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t("payment.unknownError");
        setErrorMessage(errorMessage);
        toast.error(t("payment.failedTryAgain"));
      } finally {
        setIsProcessing(false);
      }
    },
    [stripe, elements, user, selectedAmount, onClose, refreshCredits, t]
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("payment.purchaseCredits")}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center p-4 sm:p-6 bg-blue-50 rounded-lg">
            <CreditCard className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 mr-3 sm:mr-4" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {t("payment.creditsForContact")}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                {t("payment.creditDescription", {
                  price: formatPrice(CREDIT_PRICE)
                })}
              </p>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">
              {t("payment.chooseCredits")}
            </h4>
            <CreditPackages
              packages={CREDIT_PACKAGES}
              selected={selectedAmount}
              onSelect={setSelectedAmount}
              t={t}
            />
          </div>

          <PaymentSummary selectedAmount={selectedAmount} t={t} />

          {errorMessage && (
            <div className="bg-red-50 text-red-700 p-2 sm:p-3 rounded-md text-xs sm:text-sm">
              {errorMessage}
            </div>
          )}

          <div className="p-3 sm:p-4 bg-white rounded-lg border">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              type="button"
              className="w-full sm:w-auto"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              loading={isProcessing}
              disabled={!stripe || isProcessing}
              className="w-full sm:w-auto gap-2"
            >
              <Euro className="w-4 h-4" />
              {isProcessing
                ? t("payment.processing")
                : t("payment.pay")}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreditPurchaseModal;
