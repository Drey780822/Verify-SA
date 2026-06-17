import { NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/auth/session';

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: ctx.user,
    profile: ctx.profile,
    organization: ctx.organization,
    role: ctx.role,
  });
}
