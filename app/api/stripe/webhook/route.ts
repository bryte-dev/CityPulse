import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' });

  const body = await request.text();
  const sig = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret || '');
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalide' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        await updateDoc(doc(db, 'users', userId), {
          subscriptionStatus: 'pro',
          stripeCustomerId: session.customer,
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;
      console.log('Subscription cancelled for customer:', customerId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
