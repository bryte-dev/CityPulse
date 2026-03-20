import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  try {
    // Read ID token from Authorization header
    const authHeader = request.headers.get('authorization') || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!idToken) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    // Initialize Firebase Admin dynamically and verify token
    const admin = await import('firebase-admin');
    if (!admin.apps || admin.apps.length === 0) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        } as any),
      });
    }
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded || !decoded.uid) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const stripe = new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' });
    const { priceId } = await request.json();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/pricing?success=true`,
      cancel_url: `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      customer_email: decoded.email,
      metadata: { userId: decoded.uid },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 });
  }
}
