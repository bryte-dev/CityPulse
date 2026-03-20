import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  try {
    const authHeader = request.headers.get('authorization') || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!idToken) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    // Initialize Firebase Admin and verify token
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
    if (!decoded?.uid) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const uid = decoded.uid;
    const db = admin.firestore();
    const userDoc = await db.doc(`users/${uid}`).get();
    if (!userDoc.exists) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    const userData = userDoc.data() as any;
    const customerId = userData?.stripeCustomerId;
    if (!customerId) return NextResponse.json({ error: 'Aucun abonnement trouvé' }, { status: 400 });

    const stripe = new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' });

    // List active subscriptions for the customer and cancel them
    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 100 });
    for (const s of subs.data) {
      try {
        await stripe.subscriptions.del(s.id);
      } catch (e) {
        console.error('Error cancelling subscription', s.id, e);
      }
    }

    // Update Firestore user record
    await db.doc(`users/${uid}`).update({ subscriptionStatus: 'free', stripeCustomerId: admin.firestore.FieldValue.delete() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: 'Impossible d\'annuler l\'abonnement' }, { status: 500 });
  }
}
