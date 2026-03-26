// /app/api/auth/forget-password/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import admin from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const { email, redirectTo } = await req.json();

  try {
    // on passe l'instance admin.app() à getAuth
    const link = await getAuth(admin.app()).generatePasswordResetLink(email, { url: redirectTo });
    return NextResponse.json({ ok: true, link });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}