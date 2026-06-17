import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/session';
import { hasPermission } from '@/types/database';
import { generateVerificationReport } from '@/lib/reports/pdfGenerator';
import { logAuditEvent } from '@/lib/audit/logger';
import type { Verification } from '@/types/database';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireSession();
    if (!hasPermission(ctx.role, 'reports:generate')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .eq('id', id)
      .eq('organization_id', ctx.organization.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    const pdfBuffer = generateVerificationReport(data as Verification, ctx.organization.name);

    await logAuditEvent({
      organizationId: ctx.organization.id,
      userId: ctx.user.id,
      action: 'report_generated',
      entityType: 'verification',
      entityId: id,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="verifysa-report-${id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}
