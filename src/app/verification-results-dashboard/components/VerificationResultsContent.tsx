'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ShieldCheck, ShieldAlert, User, Hash, Calendar, Building2, CheckCircle2, XCircle, AlertTriangle, Download, Eye, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Clock, FileText, Copy, ExternalLink, Activity, AlertCircle, CheckCheck, Fingerprint, GitCompare, MoreHorizontal, Printer, Share2,  } from 'lucide-react';
import { toast } from 'sonner';
import { RiskBadge, StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';

const TrustScoreGauge = dynamic(() => import('./TrustScoreGauge'), { ssr: false });

interface DisplayResult {
  id: string;
  documentName: string;
  documentType: string;
  submittedAt: string;
  processedAt: string;
  processingTime: string;
  submittedBy: string;
  trustScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'pending' | 'processing' | 'complete' | 'failed' | 'flagged';
  extractedData: {
    fullName: string;
    idNumber: string;
    dateOfBirth: string;
    gender: string;
    citizenship: string;
    issueDate: string;
    smartCardNumber: string;
    ocrConfidence: number;
  };
  ruleChecks: RuleCheck[];
  aiExplanation: {
    summary: string;
    indicators: { id: string; type: 'positive' | 'negative' | 'warning'; text: string }[];
    recommendation: string;
    modelUsed: string;
    analysisTime: string;
  };
  auditTrail: { id: string; event: string; actor: string; time: string; detail: string }[];
}

type TabType = 'overview' | 'extracted' | 'ai-analysis' | 'audit';

interface RuleCheck {
  id: string;
  rule: string;
  status: 'pass' | 'fail' | 'warning';
  detail: string;
}

export default function VerificationResultsContent() {
  const [results, setResults] = useState<DisplayResult[]>([]);
  const [selectedResultId, setSelectedResultId] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const params = new URLSearchParams(window.location.search);
        const singleId = params.get('id');

        if (singleId) {
          const res = await fetch(`/api/verifications/${singleId}`);
          if (res.ok) {
            const { verification } = await res.json();
            const mapped = mapVerification(verification);
            setResults([mapped]);
            setSelectedResultId(mapped.id);
          }
        } else {
          const res = await fetch('/api/verifications?limit=20');
          if (res.ok) {
            const { verifications } = await res.json();
            if (verifications?.length > 0) {
              const mapped = verifications.map(mapVerification);
              setResults(mapped);
              setSelectedResultId(mapped[0].id);
            }
          }
        }
      } catch {
        // empty state
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, []);

  function mapVerification(v: Record<string, unknown>): DisplayResult {
    const ai = (v.ai_findings ?? {}) as Record<string, unknown>;
    const audit = (v.audit_trail ?? []) as { id: string; timestamp: string; action: string; actor: string; detail: string }[];
    const extracted = (v.extracted_data ?? {}) as Record<string, string | number>;
    const creator = v.creator as { full_name?: string; email?: string } | undefined;

    return {
      id: v.id as string,
      documentName: v.document_name as string,
      documentType: v.document_type as string,
      submittedAt: new Date(v.created_at as string).toLocaleString('en-ZA'),
      processedAt: new Date(v.updated_at as string).toLocaleString('en-ZA'),
      processingTime: (ai.analysisTime as string) ?? `${((v.analysis_time_ms as number) ?? 0) / 1000}s`,
      submittedBy: creator?.full_name ?? creator?.email ?? 'Unknown',
      trustScore: (v.trust_score as number) ?? 0,
      riskLevel: (v.risk_level as 'LOW' | 'MEDIUM' | 'HIGH') ?? 'LOW',
      status: v.status as DisplayResult['status'],
      extractedData: {
        fullName: String(extracted.fullName ?? 'N/A'),
        idNumber: String(extracted.idNumber ?? 'N/A'),
        dateOfBirth: String(extracted.dateOfBirth ?? 'N/A'),
        gender: String(extracted.gender ?? 'N/A'),
        citizenship: String(extracted.citizenship ?? 'N/A'),
        issueDate: String(extracted.issueDate ?? 'N/A'),
        smartCardNumber: 'N/A',
        ocrConfidence: Number(extracted.ocrConfidence ?? v.ocr_confidence ?? 0),
      },
      ruleChecks: (v.rule_checks ?? []) as RuleCheck[],
      aiExplanation: {
        summary: (ai.summary as string) ?? '',
        indicators: (ai.indicators ?? []) as DisplayResult['aiExplanation']['indicators'],
        recommendation: (v.recommendation as string) ?? (ai.recommendation as string) ?? '',
        modelUsed: (v.model_used as string) ?? (ai.modelUsed as string) ?? 'GPT-4o',
        analysisTime: (ai.analysisTime as string) ?? '—',
      },
      auditTrail: audit.map((a) => ({
        id: a.id,
        event: a.action,
        actor: a.actor,
        time: new Date(a.timestamp).toLocaleTimeString('en-ZA'),
        detail: a.detail,
      })),
    };
  }

  const result = results.find((r) => r.id === selectedResultId) ?? results[0];
  const currentIndex = results.findIndex((r) => r.id === selectedResultId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading verification results...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <ShieldCheck size={48} className="text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">No verifications yet</h2>
        <p className="text-muted-foreground">Upload and verify documents to see results here.</p>
        <Link href="/dashboard" className="btn-primary">Upload Documents</Link>
      </div>
    );
  }

  const navigate = (dir: 'prev' | 'next') => {
    const newIndex = dir === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < results.length) {
      setSelectedResultId(results[newIndex].id);
      setActiveTab('overview');
    }
  };

  const copyId = () => {
    if (result.extractedData.idNumber && result.extractedData.idNumber !== '—') {
      navigator.clipboard.writeText(result.extractedData.idNumber).catch(() => {});
    }
    toast.success('ID number copied to clipboard');
  };

  const downloadReport = async () => {
    try {
      toast.info('Generating PDF report…');
      const res = await fetch(`/api/verifications/${result.id}/report`);
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verifysa-report-${result.id.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      toast.error('Failed to generate report');
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity size={14} /> },
    { id: 'extracted', label: 'Extracted Data', icon: <Fingerprint size={14} /> },
    { id: 'ai-analysis', label: 'AI Analysis', icon: <ShieldCheck size={14} /> },
    { id: 'audit', label: 'Audit Trail', icon: <Clock size={14} /> },
  ];

  const ruleStatusIcon = (status: RuleCheck['status']) => {
    if (status === 'pass') return <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />;
    if (status === 'fail') return <XCircle size={15} className="text-red-400 flex-shrink-0" />;
    return <AlertTriangle size={15} className="text-amber-400 flex-shrink-0" />;
  };

  const isDemo = result.id.startsWith('ver-demo-');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="btn-ghost text-sm">
                <ChevronLeft size={15} />
                Queue
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Verification Results</h1>
                <p className="text-sm text-muted-foreground">{result.documentName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => navigate('prev')}
                className="btn-ghost text-sm disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>
              <span className="text-xs text-muted-foreground px-2">
                {currentIndex + 1} / {results.length}
              </span>
              <button
                disabled={currentIndex === results.length - 1}
                onClick={() => navigate('next')}
                className="btn-ghost text-sm disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
              <div className="w-px h-5 bg-border mx-1" />
              <button
                onClick={() => setComparisonMode(!comparisonMode)}
                className={`btn-ghost text-sm ${comparisonMode ? 'text-primary bg-cyan-950/30' : ''}`}
              >
                <GitCompare size={15} />
                Compare
              </button>
              <button onClick={downloadReport} className="btn-primary text-sm" disabled={isDemo}>
                <Download size={15} />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-6">
        {/* Demo notice */}
        {isDemo && (
          <div className="mb-5 p-4 bg-cyan-950/20 border border-cyan-800/30 rounded-xl flex items-start gap-3">
            <ShieldCheck size={18} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary">No AI results yet</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Go to <Link href="/dashboard" className="text-primary underline underline-offset-2">Document Upload</Link>, select a document and click the <strong className="text-foreground">▶ Play</strong> button to run real GPT-4o powered fraud detection. Results will appear here automatically.
              </p>
            </div>
          </div>
        )}

        {/* Result selector row */}
        <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-thin pb-1">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => { setSelectedResultId(r.id); setActiveTab('overview'); }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                r.id === selectedResultId
                  ? 'border-primary/50 bg-cyan-950/30 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80'
              }`}
            >
              {r.status === 'complete' ? (
                <CheckCircle2 size={14} className="text-emerald-400" />
              ) : r.status === 'flagged' ? (
                <AlertCircle size={14} className="text-amber-400" />
              ) : (
                <Clock size={14} className="text-muted-foreground" />
              )}
              <span className="truncate max-w-[160px]">{r.documentName}</span>
              {r.trustScore > 0 && (
                <span
                  className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded ${
                    r.trustScore >= 75
                      ? 'text-emerald-400 bg-emerald-950/60'
                      : r.trustScore >= 50
                      ? 'text-amber-400 bg-amber-950/60' :'text-red-400 bg-red-950/60'
                  }`}
                >
                  {r.trustScore}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Document Preview */}
          <div className="xl:col-span-1 space-y-4">
            {/* Document Preview */}
            <div className="card-elevated overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Document Preview</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                    <RotateCw size={13} />
                  </button>
                </div>
              </div>
              <div className="relative bg-muted/30 aspect-[3/4] flex items-center justify-center overflow-hidden">
                <div
                  className="transition-transform duration-200"
                  style={{ transform: `scale(${zoom / 100})` }}
                >
                  <div className="w-48 h-64 bg-gradient-to-br from-secondary to-muted rounded-lg border border-border flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                    <FileText size={32} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground text-center px-4">{result.documentName}</p>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="h-1 bg-muted rounded" />
                      <div className="h-1 bg-muted rounded mt-1 w-3/4" />
                      <div className="h-1 bg-muted rounded mt-1 w-1/2" />
                    </div>
                  </div>
                </div>
                {result.riskLevel === 'HIGH' && (
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] font-bold px-2 py-1 rounded risk-badge-high flex items-center gap-1">
                      <AlertTriangle size={10} />
                      FLAGGED
                    </span>
                  </div>
                )}
              </div>
              <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">{result.documentType}</p>
                  <p className="text-[11px] text-muted-foreground">{result.submittedAt}</p>
                </div>
                <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                  <Eye size={14} />
                </button>
              </div>
            </div>

            {/* Trust Score Gauge */}
            <div className="card-elevated p-5 flex flex-col items-center">
              <p className="text-sm font-semibold text-foreground mb-4 self-start">Trust Score</p>
              <TrustScoreGauge score={result.trustScore} />
              <div className="w-full mt-4 space-y-2">
                {[
                  { label: 'OCR Confidence', value: result.extractedData.ocrConfidence, color: 'bg-primary' },
                  { label: 'Rule Engine', value: result.ruleChecks.length > 0 ? result.ruleChecks.filter((r) => r.status === 'pass').length / result.ruleChecks.length * 100 : 0, color: 'bg-accent' },
                  { label: 'AI Analysis', value: result.trustScore, color: result.trustScore >= 75 ? 'bg-emerald-500' : result.trustScore >= 50 ? 'bg-amber-500' : 'bg-red-500' },
                ].map((bar) => (
                  <div key={`bar-${bar.label}`}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-muted-foreground">{bar.label}</span>
                      <span className="text-[11px] font-medium text-foreground font-mono-data">{bar.value.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${bar.color}`}
                        style={{ width: `${bar.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Badge */}
            <div
              className={`card-elevated p-4 ${
                result.riskLevel === 'HIGH' ?'border-red-800/50 bg-red-950/10'
                  : result.riskLevel === 'MEDIUM' ?'border-amber-800/50 bg-amber-950/10' :'border-emerald-800/50 bg-emerald-950/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground">Risk Assessment</p>
                <RiskBadge level={result.riskLevel} size="md" />
              </div>
              <p
                className={`text-sm font-semibold ${
                  result.riskLevel === 'HIGH' ?'text-red-300'
                    : result.riskLevel === 'MEDIUM' ?'text-amber-300' :'text-emerald-300'
                }`}
              >
                {result.aiExplanation.recommendation}
              </p>
              <p className="text-[11px] text-muted-foreground mt-2">
                Processed by {result.aiExplanation.modelUsed} in {result.aiExplanation.analysisTime}
              </p>
            </div>
          </div>

          {/* Right: Tabs */}
          <div className="xl:col-span-2 space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-muted/40 rounded-xl p-1 border border-border">
              {tabs.map((tab) => (
                <button
                  key={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    activeTab === tab.id
                      ? 'bg-card text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-fade-in">
                {/* Meta info */}
                <div className="card-elevated p-4">
                  <p className="text-sm font-semibold text-foreground mb-3">Verification Summary</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Document Type', value: result.documentType, icon: <FileText size={13} /> },
                      { label: 'Submitted By', value: result.submittedBy, icon: <User size={13} /> },
                      { label: 'Submitted At', value: result.submittedAt, icon: <Clock size={13} /> },
                      { label: 'Processing Time', value: result.processingTime, icon: <Activity size={13} /> },
                      { label: 'Status', value: <StatusBadge status={result.status} size="sm" />, icon: <CheckCheck size={13} /> },
                      { label: 'Verification ID', value: result.id, icon: <Hash size={13} /> },
                    ].map((item, idx) => (
                      <div key={`meta-${idx}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-muted-foreground">{item.icon}</span>
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                        </div>
                        <p className="text-sm font-medium text-foreground font-mono-data">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rule Checks */}
                <div className="card-elevated p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-foreground">Rule Engine Results</p>
                    <span className="text-xs text-muted-foreground">
                      {result.ruleChecks.length > 0
                        ? `${result.ruleChecks.filter((r) => r.status === 'pass').length}/${result.ruleChecks.length} passed`
                        : 'No rules run yet'}
                    </span>
                  </div>
                  {result.ruleChecks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Run AI verification to see rule engine results
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {result.ruleChecks.map((check) => (
                        <div
                          key={check.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            check.status === 'pass' ?'bg-emerald-950/20 border-emerald-900/40'
                              : check.status === 'fail' ?'bg-red-950/20 border-red-900/40' :'bg-amber-950/20 border-amber-900/40'
                          }`}
                        >
                          {ruleStatusIcon(check.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{check.rule}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{check.detail}</p>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex-shrink-0 ${
                              check.status === 'pass' ?'text-emerald-400 bg-emerald-950/60'
                                : check.status === 'fail' ?'text-red-400 bg-red-950/60' :'text-amber-400 bg-amber-950/60'
                            }`}
                          >
                            {check.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Extracted Data */}
            {activeTab === 'extracted' && (
              <div className="space-y-4 animate-fade-in">
                <div className="card-elevated p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-foreground">OCR Extracted Fields</p>
                    <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${
                      result.extractedData.ocrConfidence >= 80
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                        : result.extractedData.ocrConfidence >= 60
                        ? 'bg-amber-950/60 text-amber-400 border-amber-800/40' :'bg-muted text-muted-foreground border-border'
                    }`}>
                      {result.extractedData.ocrConfidence > 0 ? `${result.extractedData.ocrConfidence}% confidence` : 'No OCR data'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', value: result.extractedData.fullName, icon: <User size={14} />, mono: false },
                      { label: 'ID Number', value: result.extractedData.idNumber, icon: <Hash size={14} />, mono: true, copyable: true },
                      { label: 'Date of Birth', value: result.extractedData.dateOfBirth, icon: <Calendar size={14} />, mono: true },
                      { label: 'Gender', value: result.extractedData.gender, icon: <User size={14} />, mono: false },
                      { label: 'Citizenship', value: result.extractedData.citizenship, icon: <Building2 size={14} />, mono: false },
                      { label: 'Issue Date', value: result.extractedData.issueDate, icon: <Calendar size={14} />, mono: true },
                      { label: 'Smart Card No.', value: result.extractedData.smartCardNumber, icon: <Fingerprint size={14} />, mono: true },
                    ].map((field, idx) => (
                      <div key={`field-${idx}`} className="bg-muted/30 rounded-lg p-3 border border-border">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-muted-foreground">{field.icon}</span>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{field.label}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-semibold text-foreground ${field.mono ? 'font-mono-data' : ''}`}>
                            {field.value || '—'}
                          </p>
                          {field.copyable && result.extractedData.idNumber !== '—' && (
                            <button
                              onClick={copyId}
                              className="p-1 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                            >
                              <Copy size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {result.extractedData.idNumber && result.extractedData.idNumber !== '—' && (
                    <div className="mt-4 p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-lg">
                      <p className="text-xs font-semibold text-primary mb-1">Raw JSON Output (GPT-4o Extracted)</p>
                      <pre className="text-[11px] text-muted-foreground font-mono-data overflow-x-auto scrollbar-thin">
{`{
  "fullName": "${result.extractedData.fullName}",
  "idNumber": "${result.extractedData.idNumber}",
  "dateOfBirth": "${result.extractedData.dateOfBirth}",
  "gender": "${result.extractedData.gender}",
  "citizenship": "${result.extractedData.citizenship}",
  "ocrConfidence": ${result.extractedData.ocrConfidence}
}`}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: AI Analysis */}
            {activeTab === 'ai-analysis' && (
              <div className="space-y-4 animate-fade-in">
                <div
                  className={`card-elevated p-4 ${
                    result.riskLevel === 'HIGH' ?'border-red-800/50'
                      : result.riskLevel === 'MEDIUM' ?'border-amber-800/50' :'border-emerald-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    {result.riskLevel === 'HIGH' ? (
                      <ShieldAlert size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">AI Analysis Summary</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{result.aiExplanation.summary}</p>
                    </div>
                  </div>

                  {result.aiExplanation.indicators.length > 0 && (
                    <div className="space-y-2">
                      {result.aiExplanation.indicators.map((ind) => (
                        <div
                          key={ind.id}
                          className={`flex items-start gap-2.5 p-3 rounded-lg ${
                            ind.type === 'positive' ?'bg-emerald-950/20 border border-emerald-900/30'
                              : ind.type === 'negative' ?'bg-red-950/20 border border-red-900/30' :'bg-amber-950/20 border border-amber-900/30'
                          }`}
                        >
                          {ind.type === 'positive' ? (
                            <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                          ) : ind.type === 'negative' ? (
                            <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                          )}
                          <p className="text-sm text-foreground leading-relaxed">{ind.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Model</p>
                        <p className="text-xs font-medium text-foreground font-mono-data">{result.aiExplanation.modelUsed}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Analysis Time</p>
                        <p className="text-xs font-medium text-foreground font-mono-data">{result.aiExplanation.analysisTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn-ghost text-xs">
                        <Share2 size={13} />
                        Share
                      </button>
                      <button onClick={downloadReport} className="btn-primary text-xs" disabled={isDemo}>
                        <Printer size={13} />
                        Print Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Audit Trail */}
            {activeTab === 'audit' && (
              <div className="space-y-4 animate-fade-in">
                <div className="card-elevated p-4">
                  <p className="text-sm font-semibold text-foreground mb-4">Verification Audit Trail</p>
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                    <div className="space-y-4">
                      {result.auditTrail.map((event, idx) => (
                        <div key={event.id} className="flex gap-4 relative">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                              idx === result.auditTrail.length - 1
                                ? 'bg-emerald-950/60 border-2 border-emerald-500' :'bg-muted border-2 border-border'
                            }`}
                          >
                            {idx === result.auditTrail.length - 1 ? (
                              <CheckCircle2 size={16} className="text-emerald-400" />
                            ) : (
                              <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 bg-muted/30 rounded-lg p-3 border border-border">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-foreground">{event.event}</p>
                              <span className="text-[11px] text-muted-foreground font-mono-data flex-shrink-0">{event.time}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{event.detail}</p>
                            <p className="text-[11px] text-primary mt-1">Actor: {event.actor}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="card-elevated p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <StatusBadge status={result.status} />
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{result.processingTime} processing time</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost text-sm">
                  <ExternalLink size={14} />
                  Share
                </button>
                <button className="btn-secondary text-sm">
                  <MoreHorizontal size={14} />
                  More Actions
                </button>
                <button onClick={downloadReport} className="btn-primary text-sm" disabled={isDemo}>
                  <Download size={14} />
                  Download PDF Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}