import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/session';
import { canManageTeam, type UserRole } from '@/types/database';
import { logAuditEvent } from '@/lib/audit/logger';

export async function GET() {
  try {
    const ctx = await requireSession();
    const supabase = await createClient();

    const { data: members, error } = await supabase
      .from('organization_members')
      .select('*, profile:profiles(id, email, full_name, avatar_url)')
      .eq('organization_id', ctx.organization.id)
      .order('joined_at', { ascending: true });

    if (error) throw error;

    const { data: invitations } = await supabase
      .from('invitations')
      .select('*')
      .eq('organization_id', ctx.organization.id)
      .eq('status', 'pending');

    return NextResponse.json({ members: members ?? [], invitations: invitations ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireSession();
    if (!canManageTeam(ctx.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, role } = await request.json();
    if (!email || !role) {
      return NextResponse.json({ error: 'email and role are required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert({
        organization_id: ctx.organization.id,
        email: email.toLowerCase(),
        role: role as UserRole,
        invited_by: ctx.user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Invitation already pending for this email' }, { status: 409 });
      }
      throw error;
    }

    await logAuditEvent({
      organizationId: ctx.organization.id,
      userId: ctx.user.id,
      action: 'member_invited',
      entityType: 'invitation',
      entityId: invitation.id,
      metadata: { email, role },
    });

    return NextResponse.json({ invitation });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ctx = await requireSession();
    if (!canManageTeam(ctx.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { memberId, role } = await request.json();
    if (!memberId || !role) {
      return NextResponse.json({ error: 'memberId and role are required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('organization_members')
      .update({ role: role as UserRole })
      .eq('id', memberId)
      .eq('organization_id', ctx.organization.id)
      .select('*, profile:profiles(id, email, full_name)')
      .single();

    if (error) throw error;

    await logAuditEvent({
      organizationId: ctx.organization.id,
      userId: ctx.user.id,
      action: 'member_role_changed',
      entityType: 'organization_member',
      entityId: memberId,
      metadata: { newRole: role },
    });

    return NextResponse.json({ member: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ctx = await requireSession();
    if (!canManageTeam(ctx.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const invitationId = searchParams.get('invitationId');

    const supabase = await createClient();

    if (memberId) {
      if (memberId === ctx.membership.id) {
        return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
      }

      await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)
        .eq('organization_id', ctx.organization.id);

      await logAuditEvent({
        organizationId: ctx.organization.id,
        userId: ctx.user.id,
        action: 'member_removed',
        entityType: 'organization_member',
        entityId: memberId,
      });
    }

    if (invitationId) {
      await supabase
        .from('invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId)
        .eq('organization_id', ctx.organization.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}
