'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  History, Search, Filter, Download, Eye, Loader2,
  ShieldCheck, ShieldAlert, Clock,
} from 'lucide-react';
import { RiskBadge, StatusBadge } from '@/components/ui/StatusBadge';
import type { Verification } from '@/types/database';
import { toast } from 'sonner';

export default function VerificationHistoryContent() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      try {
        const params = new URLSearchParams({ limit: '100' });
        if (statusFilter) params.set('status', statusFilter);
        const res = await fetch(`/api/verifications?${params}`);
        if (res.ok) {
          const data = await res.json();
          setVerifications(data.verifications ?? []);
        }
      } catch {
        toast.error('Failed to load verification history');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [statusFilter]);

  const filtered = verifications.filter((v) =>
    v.document_name.toLowerCase().includes(search.toLowerCase()) ||
    v.document_type.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadReport = async (id: string) => {
    try {
      const res = await fetch(`/api/verifications/${id}/report`);
      if (!res.ok) throw new Error('Failed to generate report');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verifysa-report-${id.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      toast.error('Failed to download report');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <History size={24} />
            Verification History
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete audit trail of all document verifications
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by document name or type..."
            className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-muted border border-border rounded-lg pl-10 pr-8 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Statuses</option>
            <option value="complete">Complete</option>
            <option value="flagged">Flagged</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <ShieldCheck size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No verifications yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload and verify documents to see them here.
          </p>
          <Link href="/dashboard" className="btn-primary inline-flex">
            Upload Documents
          </Link>
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trust Score</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{v.document_name}</p>
                      <p className="text-xs text-muted-foreground">{v.creator?.full_name ?? 'Unknown'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{v.document_type}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono-data text-sm font-semibold text-foreground">
                        {v.trust_score ?? '—'}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {v.risk_level ? <RiskBadge level={v.risk_level} /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(v.created_at).toLocaleDateString('en-ZA', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/verification-results-dashboard?id=${v.id}`}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="View details"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => handleDownloadReport(v.id)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Download PDF report"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
