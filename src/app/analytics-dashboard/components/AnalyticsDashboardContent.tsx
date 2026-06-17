'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  ShieldCheck, ShieldAlert, Zap, TrendingUp, TrendingDown,
  Download, RefreshCw, CheckCircle2, Activity, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import MetricCard from '@/components/ui/MetricCard';
import { RiskBadge } from '@/components/ui/StatusBadge';
import { useSession } from '@/lib/hooks/useSession';
import type { AnalyticsData, AuditLog } from '@/types/database';

const VerificationVolumeChart = dynamic(() => import('./VerificationVolumeChart'), { ssr: false });
const RiskDistributionChart = dynamic(() => import('./RiskDistributionChart'), { ssr: false });
const DocumentTypeChart = dynamic(() => import('./DocumentTypeChart'), { ssr: false });

type PeriodFilter = '7d' | '30d' | '90d';

const KPI_ACCENTS = ['cyan', 'emerald', 'red', 'violet', 'amber'] as const;
const KPI_ICONS = [
  <ShieldCheck size={16} key="shield" />,
  <CheckCircle2 size={16} key="check" />,
  <ShieldAlert size={16} key="alert" />,
  <Zap size={16} key="zap" />,
  <Activity size={16} key="activity" />,
];

function formatAuditAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AnalyticsDashboardContent() {
  const { session } = useSession();
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = () => {
    if (!analytics) return;
    const csv = [
      'Metric,Value',
      ...analytics.kpis.map((k) => `${k.label},${k.value}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verifysa-analytics-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics exported');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Verification intelligence · {session?.organization.name ?? 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-lg p-0.5 border border-border">
              {(['7d', '30d', '90d'] as PeriodFilter[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                    period === p
                      ? 'bg-card text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
                </button>
              ))}
            </div>
            <button onClick={fetchAnalytics} className="btn-ghost text-sm" disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={handleExport} className="btn-secondary text-sm" disabled={!analytics}>
              <Download size={14} />
              Export
            </button>
            <Link href="/dashboard" className="btn-primary text-sm">
              <ShieldCheck size={14} />
              New Verification
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : analytics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
              {analytics.kpis.map((kpi, i) => (
                <MetricCard
                  key={kpi.label}
                  label={kpi.label}
                  value={kpi.value}
                  subValue={kpi.subValue}
                  trend={kpi.trend !== 0 ? kpi.trend : undefined}
                  trendLabel={kpi.trendLabel}
                  icon={KPI_ICONS[i]}
                  accentColor={KPI_ACCENTS[i]}
                  alert={kpi.label === 'Fraud Detections' && parseInt(kpi.value) > 0}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-elevated p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Verification Volume</h3>
                <VerificationVolumeChart data={analytics.volumeData} />
              </div>
              <div className="card-elevated p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Risk Distribution</h3>
                <RiskDistributionChart data={analytics.riskDistribution} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-elevated p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Document Types</h3>
                <DocumentTypeChart data={analytics.documentTypes} />
              </div>

              <div className="card-elevated p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Activity size={16} />
                  Activity Feed
                </h3>
                <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin">
                  {analytics.recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                  ) : (
                    analytics.recentActivity.map((log: AuditLog) => (
                      <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{formatAuditAction(log.action)}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.profile?.full_name ?? 'System'} · {new Date(log.created_at).toLocaleString('en-ZA')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {analytics.fraudPatterns.length > 0 && (
              <div className="card-elevated overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Fraud Pattern Analysis</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Pattern</th>
                        <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Count</th>
                        <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Severity</th>
                        <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {analytics.fraudPatterns.map((fp) => (
                        <tr key={fp.pattern} className="hover:bg-muted/30">
                          <td className="px-6 py-3 text-sm text-foreground">{fp.pattern}</td>
                          <td className="px-6 py-3 text-sm font-mono-data text-foreground">{fp.count}</td>
                          <td className="px-6 py-3"><RiskBadge level={fp.severity} /></td>
                          <td className="px-6 py-3 text-xs text-muted-foreground">{fp.lastSeen}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card-elevated p-12 text-center">
            <ShieldCheck size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No analytics data yet</h3>
            <p className="text-muted-foreground">Start verifying documents to see analytics here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
