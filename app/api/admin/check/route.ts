import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!idToken) return NextResponse.json({ admin: false }, { status: 401 });

    // Use firebase-admin to verify token and compare to ADMIN_UIDS
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
    const uid = decoded?.uid;
    if (!uid) return NextResponse.json({ admin: false }, { status: 401 });

    // Option 1: check ADMIN_UIDS env (comma separated)
    const envAdmins = (process.env.ADMIN_UIDS || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (envAdmins.includes(uid)) return NextResponse.json({ admin: true });

    // Option 2: check config/admins document in Firestore
    try {
      const db = admin.firestore();
      const doc = await db.doc('config/admins').get();
      const data = doc.exists ? doc.data() : null;
      const uids: string[] = (data?.uids) || [];
      if (uids.includes(uid)) return NextResponse.json({ admin: true });
    } catch (e) {
      console.error('Error checking admin config doc', e);
    }

    return NextResponse.json({ admin: false });
  } catch (e) {
    console.error('Admin check error', e);
    return NextResponse.json({ admin: false }, { status: 500 });
  }
}
