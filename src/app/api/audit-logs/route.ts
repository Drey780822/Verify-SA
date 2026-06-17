import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/session';
import { hasPermission } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireSession();
    if (!hasPermission(ctx.role, 'audit:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const action = searchParams.get('action');

    const supabase = await createClient();

    let query = supabase
      .from('audit_logs')
      .select('*, profile:profiles(id, full_name, email)')
      .eq('organization_id', ctx.organization.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (action) query = query.eq('action', action);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ auditLogs: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}
