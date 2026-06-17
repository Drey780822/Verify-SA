import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/session';
import { logAuditEvent } from '@/lib/audit/logger';

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireSession();
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (invError || !invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    if (invitation.email.toLowerCase() !== ctx.user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Invitation email does not match your account' }, { status: 403 });
    }

    if (new Date(invitation.expires_at) < new Date()) {
      await supabase.from('invitations').update({ status: 'expired' }).eq('id', invitation.id);
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    const { error: memberError } = await supabase.from('organization_members').insert({
      organization_id: invitation.organization_id,
      user_id: ctx.user.id,
      role: invitation.role,
      invited_by: invitation.invited_by,
    });

    if (memberError) throw memberError;

    await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invitation.id);

    await supabase
      .from('profiles')
      .update({ active_organization_id: invitation.organization_id })
      .eq('id', ctx.user.id);

    await logAuditEvent({
      organizationId: invitation.organization_id,
      userId: ctx.user.id,
      action: 'member_joined',
      entityType: 'organization_member',
      metadata: { role: invitation.role },
    });

    return NextResponse.json({ success: true, organizationId: invitation.organization_id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}
