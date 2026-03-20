import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body?.password || '';
    const expected = process.env.PRESENTATION_PASSWORD || '';
    if (!expected) return NextResponse.json({ error: 'Presentation mode not configured' }, { status: 400 });
    if (password !== expected) return NextResponse.json({ error: 'Invalid password' }, { status: 401 });

    // Set a simple flag cookie (not cryptographically signed) used only for demo access control.
    const cookie = `presentation_token=presentation_ok; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24}`;
    const res = NextResponse.json({ success: true });
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch (e) {
    console.error('Presentation auth error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
