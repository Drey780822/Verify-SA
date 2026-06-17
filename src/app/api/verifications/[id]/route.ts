import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireSession();
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('verifications')
      .select('*, creator:profiles!verifications_created_by_fkey(id, full_name, email)')
      .eq('id', id)
      .eq('organization_id', ctx.organization.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    return NextResponse.json({ verification: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}
