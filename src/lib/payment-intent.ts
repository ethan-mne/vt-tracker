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
    .from("user_credits")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (userError || !userData) {
    // If user credit record doesn't exist, create one
    const { error: insertError } = await supabase
      .from("user_credits")
      .insert({
        user_id: userId,
        credits: 0
      });
      
    if (insertError) {
      console.error("Error creating user credits:", insertError);
      throw new Error("Failed to initialize user credits");
    }
  }

  // Calculate price (credits × 100 euro each)
  const pricePerCredit = 10000; // in cents (100 EUR)
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
    paymentIntentId: paymentIntent.id,
  };
}

export async function checkPaymentStatus(paymentIntentId: string) {
  const stripe_key = process.env.STRIPE_SECRET_KEY;
  if (!stripe_key) {
    throw new Error("Missing Stripe secret key");
  }
  const stripe = new Stripe(stripe_key);

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Extract metadata
      const userId = paymentIntent.metadata.userId;
      const credits = parseInt(paymentIntent.metadata.credits, 10);

      if (!userId || isNaN(credits)) {
        throw new Error("Invalid payment metadata");
      }

      // Add credits to user
      await addCreditsToUser(userId, credits);
      
      return {
        status: 'succeeded',
        message: 'Payment successful and credits added'
      };
    } else if (paymentIntent.status === 'requires_payment_method') {
      return {
        status: 'requires_payment_method',
        message: 'Payment requires a payment method'
      };
    } else if (paymentIntent.status === 'requires_confirmation') {
      return {
        status: 'requires_confirmation',
        message: 'Payment requires confirmation'
      };
    } else if (paymentIntent.status === 'requires_action') {
      return {
        status: 'requires_action',
        message: 'Payment requires additional action'
      };
    } else if (paymentIntent.status === 'processing') {
      return {
        status: 'processing',
        message: 'Payment is processing'
      };
    } else if (paymentIntent.status === 'canceled') {
      return {
        status: 'canceled',
        message: 'Payment was canceled'
      };
    } else {
      return {
        status: paymentIntent.status,
        message: 'Payment status unknown'
      };
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw new Error('Failed to check payment status');
  }
}

// Function to add credits to a user
async function addCreditsToUser(userId: string, creditsToAdd: number) {
  const supabase = await createServerSideClient();
  
  // Check if user has a credits record
  const { data: userData, error: selectError } = await supabase
    .from('user_credits')
    .select('credits')
    .eq('user_id', userId)
    .single();
  
  if (selectError && selectError.code !== 'PGRST116') {
    console.error('Error fetching user credits:', selectError);
    throw new Error('Failed to fetch user credits');
  }
  
  // If user has credits, update them; otherwise create a new record
  if (userData) {
    const newCredits = (userData.credits || 0) + creditsToAdd;
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ 
        credits: newCredits, 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Error updating user credits:', updateError);
      throw new Error('Failed to update user credits');
    }
  } else {
    // Create new credits record
    const { error: insertError } = await supabase
      .from('user_credits')
      .insert({ 
        user_id: userId, 
        credits: creditsToAdd,
        updated_at: new Date().toISOString() 
      });
    
    if (insertError) {
      console.error('Error creating user credits:', insertError);
      throw new Error('Failed to create user credits');
    }
  }
  
  // Create a payment record
  await supabase.from('payments').insert({
    user_id: userId,
    amount: creditsToAdd * 100, // €100 per credit
    credits: creditsToAdd,
    status: 'completed',
    created_at: new Date().toISOString()
  });
}
