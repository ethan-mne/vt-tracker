import { NextRequest, NextResponse } from 'next/server';
import Stripe from "stripe";
import { createServerSideClient } from "../../../utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { userId, amount } = await request.json();
    
    const stripe_key = process.env.STRIPE_SECRET_KEY;
    if (!stripe_key) {
      return NextResponse.json({ error: "Missing Stripe secret key" }, { status: 500 });
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
        return NextResponse.json({ error: "Failed to initialize user credits" }, { status: 500 });
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

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
      credits: amount,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('paymentIntentId');
    
    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing payment intent ID" }, { status: 400 });
    }

    const stripe_key = process.env.STRIPE_SECRET_KEY;
    if (!stripe_key) {
      return NextResponse.json({ error: "Missing Stripe secret key" }, { status: 500 });
    }
    
    const stripe = new Stripe(stripe_key);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Extract metadata
      const userId = paymentIntent.metadata.userId;
      const credits = parseInt(paymentIntent.metadata.credits, 10);

      if (!userId || isNaN(credits)) {
        return NextResponse.json({ error: "Invalid payment metadata" }, { status: 400 });
      }

      // Add credits to user
      await addCreditsToUser(userId, credits);
      
      return NextResponse.json({
        status: 'succeeded',
        message: 'Payment successful and credits added'
      });
    }
    
    return NextResponse.json({
      status: paymentIntent.status,
      message: getStatusMessage(paymentIntent.status)
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 });
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'requires_payment_method':
      return 'Payment requires a payment method';
    case 'requires_confirmation':
      return 'Payment requires confirmation';
    case 'requires_action':
      return 'Payment requires additional action';
    case 'processing':
      return 'Payment is processing';
    case 'canceled':
      return 'Payment was canceled';
    default:
      return 'Payment status unknown';
  }
}

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