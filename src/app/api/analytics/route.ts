import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/session';
import { hasPermission } from '@/types/database';
import type { AnalyticsData, RiskLevel } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireSession();
    if (!hasPermission(ctx.role, 'analytics:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const periodDays = parseInt(searchParams.get('period')?.replace('d', '') ?? '30');
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

    const supabase = await createClient();
    const orgId = ctx.organization.id;

    const { data: verifications } = await supabase
      .from('verifications')
      .select('*')
      .eq('organization_id', orgId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    const allVerifications = verifications ?? [];
    const total = allVerifications.length;
    const completed = allVerifications.filter((v) => v.status === 'complete');
    const flagged = allVerifications.filter((v) => v.status === 'flagged' || v.risk_level === 'HIGH');
    const passRate = total > 0 ? (completed.length / total) * 100 : 0;
    const avgTime =
      allVerifications.filter((v) => v.analysis_time_ms).length > 0
        ? allVerifications.reduce((sum, v) => sum + (v.analysis_time_ms ?? 0), 0) /
          allVerifications.filter((v) => v.analysis_time_ms).length
        : 0;

    const volumeMap = new Map<string, number>();
    allVerifications.forEach((v) => {
      const date = new Date(v.created_at).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
      volumeMap.set(date, (volumeMap.get(date) ?? 0) + 1);
    });

    const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    allVerifications.forEach((v) => {
      if (v.risk_level) riskCounts[v.risk_level as keyof typeof riskCounts]++;
    });

    const docTypeMap = new Map<string, number>();
    allVerifications.forEach((v) => {
      docTypeMap.set(v.document_type, (docTypeMap.get(v.document_type) ?? 0) + 1);
    });

    const { data: recentActivity } = await supabase
      .from('audit_logs')
      .select('*, profile:profiles(id, full_name, email)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10);

    const fraudPatternMap = new Map<string, { count: number; severity: RiskLevel; lastSeen: string }>();
    allVerifications.forEach((v) => {
      const checks = (v.rule_checks as { rule: string; status: string }[]) ?? [];
      checks
        .filter((c) => c.status === 'fail' || c.status === 'warning')
        .forEach((c) => {
          const existing = fraudPatternMap.get(c.rule);
          const severity: RiskLevel = c.status === 'fail' ? 'HIGH' : 'MEDIUM';
          if (existing) {
            existing.count++;
            if (new Date(v.created_at) > new Date(existing.lastSeen)) {
              existing.lastSeen = v.created_at;
            }
          } else {
            fraudPatternMap.set(c.rule, { count: 1, severity, lastSeen: v.created_at });
          }
        });
    });

    const analytics: AnalyticsData = {
      kpis: [
        {
          label: 'Total Verifications',
          value: total.toLocaleString(),
          subValue: `Last ${periodDays} days`,
          trend: 0,
          trendLabel: 'vs previous period',
        },
        {
          label: 'Pass Rate',
          value: `${passRate.toFixed(1)}%`,
          subValue: `${completed.length} of ${total} verified`,
          trend: 0,
          trendLabel: 'vs previous period',
        },
        {
          label: 'Fraud Detections',
          value: flagged.length.toString(),
          subValue: total > 0 ? `${((flagged.length / total) * 100).toFixed(1)}% of total` : '0% of total',
          trend: 0,
          trendLabel: 'flagged documents',
        },
        {
          label: 'Avg. Processing Time',
          value: `${(avgTime / 1000).toFixed(1)}s`,
          subValue: 'Per document',
          trend: 0,
          trendLabel: 'processing speed',
        },
        {
          label: 'Usage',
          value: `${ctx.organization.verifications_used}/${ctx.organization.verification_limit}`,
          subValue: 'Verifications used',
          trend: 0,
          trendLabel: 'plan limit',
        },
      ],
      volumeData: Array.from(volumeMap.entries()).map(([date, count]) => ({ date, count })),
      riskDistribution: [
        { name: 'Low Risk', value: riskCounts.LOW, color: '#10b981' },
        { name: 'Medium Risk', value: riskCounts.MEDIUM, color: '#f59e0b' },
        { name: 'High Risk', value: riskCounts.HIGH, color: '#ef4444' },
      ],
      documentTypes: Array.from(docTypeMap.entries()).map(([type, count]) => ({ type, count })),
      recentActivity: recentActivity ?? [],
      fraudPatterns: Array.from(fraudPatternMap.entries())
        .map(([pattern, data]) => ({
          pattern,
          count: data.count,
          severity: data.severity,
          lastSeen: new Date(data.lastSeen).toLocaleDateString('en-ZA'),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
    };

    return NextResponse.json(analytics);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}
