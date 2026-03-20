import { NextResponse } from 'next/server';

export async function POST() {
  const cookie = `presentation_token=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  const res = NextResponse.json({ success: true });
  res.headers.set('Set-Cookie', cookie);
  return res;
}
