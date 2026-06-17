import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/session';
import { canManageOrg } from '@/types/database';
import { logAuditEvent } from '@/lib/audit/logger';

export async function GET() {
  try {
    const ctx = await requireSession();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('verification_rules')
      .select('*')
      .eq('organization_id', ctx.organization.id)
      .order('rule_name');

    if (error) throw error;
    return NextResponse.json({ rules: data ?? [] });
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

    const { rules } = await request.json();
    if (!Array.isArray(rules)) {
      return NextResponse.json({ error: 'rules array is required' }, { status: 400 });
    }

    const supabase = await createClient();

    for (const rule of rules) {
      await supabase
        .from('verification_rules')
        .update({
          enabled: rule.enabled,
          strictness_weight: rule.strictness_weight,
          config: rule.config,
        })
        .eq('id', rule.id)
        .eq('organization_id', ctx.organization.id);
    }

    await logAuditEvent({
      organizationId: ctx.organization.id,
      userId: ctx.user.id,
      action: 'rules_updated',
      entityType: 'verification_rules',
      metadata: { updatedCount: rules.length },
    });

    const { data } = await supabase
      .from('verification_rules')
      .select('*')
      .eq('organization_id', ctx.organization.id);

    return NextResponse.json({ rules: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}
