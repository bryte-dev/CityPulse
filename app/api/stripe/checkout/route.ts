import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  try {
    const { auth } = await import('@/lib/auth');
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' });
    const { priceId } = await request.json();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/pricing?success=true`,
      cancel_url: `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      customer_email: session.user.email,
      metadata: { userId: session.user.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 });
  }
}
