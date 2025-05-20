import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSideClient } from '../../utils/supabase/server';
import { z } from 'zod';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Define schema for metadata validation
const PaymentMetadataSchema = z.object({
  userId: z.string().uuid({
    message: "A valid user ID is required"
  }),
  credits: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Credits must be a positive number"
    })
});

// Webhook endpoint for Stripe events
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret is not configured' },
        { status: 500 }
      );
    }

    // Construct the event from the raw body and signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle different event types
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Extract and validate metadata
      if (!paymentIntent.metadata) {
        console.error('Missing metadata in payment intent');
        return NextResponse.json({ received: true });
      }
      
      const metadataResult = PaymentMetadataSchema.safeParse(paymentIntent.metadata);
      
      if (!metadataResult.success) {
        console.error('Invalid metadata format:', metadataResult.error.format());
        return NextResponse.json({ received: true });
      }
      
      const { userId, credits } = metadataResult.data;
      
      // Add credits to the user
      await addCreditsToUser(userId, credits);
      
      // Log successful payment
      console.log(`Payment succeeded: Added ${credits} credits to user ${userId}`);
    }
    
    // Return a response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
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