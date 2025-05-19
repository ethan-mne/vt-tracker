"use server";
import Stripe from "stripe";
import { createServerSideClient } from "../utils/supabase/server";

export async function createPaymentIntent(userId: string, amount: number) {
  const stripe_key = process.env.STRIPE_SECRET_KEY;
  if (!stripe_key) {
    throw new Error("Missing Stripe secret key");
  }
  const stripe = new Stripe(stripe_key);
  const supabase = await createServerSideClient();
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    throw new Error("User not found");
  }

  // Calculate price (credits × 2 euro each)
  const pricePerCredit = 200; // in cents (2 EUR)
  const totalAmount = amount * pricePerCredit;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: "eur",
    metadata: {
      userId,
      credits: amount.toString(),
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    amount: totalAmount,
    credits: amount,
  };
}
