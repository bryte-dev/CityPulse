import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  try {
    const authHeader = request.headers.get('authorization') || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!idToken) return NextResponse.json({ error: 'Missing id token' }, { status: 401 });

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
    if (!decoded?.uid) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const uid = decoded.uid;
    const db = admin.firestore();
    await db.doc(`users/${uid}`).set({ subscriptionStatus: 'pro', stripeCustomerId: 'simulated' }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Simulate subscribe error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
