import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireSession();
    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: membership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', ctx.user.id)
      .single();

    if (!membership && !ctx.profile.is_super_admin) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
    }

    await supabase
      .from('profiles')
      .update({ active_organization_id: organizationId })
      .eq('id', ctx.user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}
