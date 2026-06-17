import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/session';
import { canManageOrg } from '@/types/database';
import { logAuditEvent } from '@/lib/audit/logger';

export async function GET() {
  try {
    const ctx = await requireSession();
    const supabase = await createClient();

    const { data: memberships } = await supabase
      .from('organization_members')
      .select('*, organization:organizations(*)')
      .eq('user_id', ctx.user.id);

    const organizations = memberships?.map((m) => ({
      ...m.organization,
      role: m.role,
    })) ?? [];

    return NextResponse.json({
      activeOrganization: ctx.organization,
      organizations,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ctx = await requireSession();
    if (!canManageOrg(ctx.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const supabase = await createClient();

    const allowedFields = [
      'name',
      'verification_strictness',
      'approval_workflow',
      'settings',
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', ctx.organization.id)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      organizationId: ctx.organization.id,
      userId: ctx.user.id,
      action: 'settings_updated',
      entityType: 'organization',
      entityId: ctx.organization.id,
      metadata: updates,
    });

    return NextResponse.json({ organization: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}
