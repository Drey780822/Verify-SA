import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/session';
import { hasPermission } from '@/types/database';
import { analyzeDocumentForFraud } from '@/lib/ai/fraudDetection';
import { logAuditEvent } from '@/lib/audit/logger';

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireSession();
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const status = searchParams.get('status');

    let query = supabase
      .from('verifications')
      .select('*, creator:profiles!verifications_created_by_fkey(id, full_name, email)')
      .eq('organization_id', ctx.organization.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ verifications: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireSession();
    if (!hasPermission(ctx.role, 'verifications:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { documentName, documentType } = body;

    if (!documentName || !documentType) {
      return NextResponse.json({ error: 'documentName and documentType are required' }, { status: 400 });
    }

    if (ctx.organization.verifications_used >= ctx.organization.verification_limit) {
      return NextResponse.json({ error: 'Verification limit reached' }, { status: 429 });
    }

    const supabase = await createClient();
    const strictness = ctx.organization.verification_strictness;

    const { data: verification, error: insertError } = await supabase
      .from('verifications')
      .insert({
        organization_id: ctx.organization.id,
        created_by: ctx.user.id,
        document_name: documentName,
        document_type: documentType,
        status: 'processing',
        audit_trail: [
          {
            id: 'audit-1',
            timestamp: new Date().toISOString(),
            action: 'Verification initiated',
            actor: ctx.profile.full_name ?? ctx.user.email,
            detail: `Document "${documentName}" queued for analysis`,
          },
        ],
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await logAuditEvent({
      organizationId: ctx.organization.id,
      userId: ctx.user.id,
      action: 'verification_created',
      entityType: 'verification',
      entityId: verification.id,
      metadata: { documentName, documentType },
    });

    const startTime = Date.now();
    const analysis = await analyzeDocumentForFraud(documentName, documentType, strictness);
    const analysisTimeMs = Date.now() - startTime;

    const status =
      analysis.riskLevel === 'HIGH' && ctx.organization.approval_workflow !== 'auto_approve'
        ? 'flagged'
        : 'complete';

    const auditTrail = [
      ...(verification.audit_trail as object[]),
      {
        id: 'audit-2',
        timestamp: new Date().toISOString(),
        action: 'AI analysis completed',
        actor: 'VerifySA AI Engine',
        detail: `Trust score: ${analysis.trustScore}/100 — ${analysis.riskLevel} risk`,
      },
      {
        id: 'audit-3',
        timestamp: new Date().toISOString(),
        action: 'Rule validation completed',
        actor: 'Rule Engine',
        detail: `${analysis.ruleChecks.filter((r) => r.status === 'pass').length}/${analysis.ruleChecks.length} rules passed`,
      },
    ];

    const { data: updated, error: updateError } = await supabase
      .from('verifications')
      .update({
        status,
        trust_score: analysis.trustScore,
        risk_level: analysis.riskLevel,
        extracted_data: analysis.extractedData,
        rule_checks: analysis.ruleChecks,
        ai_findings: {
          summary: analysis.summary,
          indicators: analysis.indicators,
          recommendation: analysis.recommendation,
          modelUsed: analysis.modelUsed,
          analysisTime: analysis.analysisTime,
        },
        audit_trail: auditTrail,
        recommendation: analysis.recommendation,
        model_used: analysis.modelUsed,
        analysis_time_ms: analysisTimeMs,
        ocr_confidence: analysis.ocrConfidence,
      })
      .eq('id', verification.id)
      .select()
      .single();

    if (updateError) throw updateError;

    await supabase
      .from('organizations')
      .update({ verifications_used: ctx.organization.verifications_used + 1 })
      .eq('id', ctx.organization.id);

    await logAuditEvent({
      organizationId: ctx.organization.id,
      userId: ctx.user.id,
      action: status === 'flagged' ? 'verification_flagged' : 'verification_completed',
      entityType: 'verification',
      entityId: verification.id,
      metadata: { trustScore: analysis.trustScore, riskLevel: analysis.riskLevel },
    });

    return NextResponse.json({ verification: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
