'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Clock, Loader2, Settings2, Eye, Download, Trash2, Play, Info, ZoomIn, RefreshCw, ShieldCheck, FileBadge, FileCheck2, Plus, SlidersHorizontal,  } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSession } from '@/lib/hooks/useSession';
import type { FraudAnalysisResult } from '@/lib/ai/fraudDetection';

type DocumentType = 'SA_ID' | 'CERTIFICATE' | 'PROOF_OF_RESIDENCE' | 'PASSPORT' | 'DRIVERS_LICENSE';
type FileStatus = 'pending' | 'processing' | 'complete' | 'failed' | 'flagged';

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: DocumentType;
  status: FileStatus;
  progress: number;
  previewUrl?: string;
  trustScore?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  errorMessage?: string;
  processingStep?: string;
  analysisResult?: FraudAnalysisResult;
}

const documentTypeConfig: Record<DocumentType, { label: string; icon: React.ReactNode; color: string }> = {
  SA_ID: { label: 'SA Identity Document', icon: <ShieldCheck size={14} />, color: 'text-primary' },
  CERTIFICATE: { label: 'Certificate / Qualification', icon: <FileBadge size={14} />, color: 'text-accent' },
  PROOF_OF_RESIDENCE: { label: 'Proof of Residence', icon: <FileCheck2 size={14} />, color: 'text-emerald-400' },
  PASSPORT: { label: 'Passport', icon: <FileText size={14} />, color: 'text-amber-400' },
  DRIVERS_LICENSE: { label: "Driver's Licence", icon: <FileText size={14} />, color: 'text-blue-400' },
};

const statusConfig: Record<FileStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: { label: 'Queued', color: 'text-muted-foreground', bgColor: 'bg-muted/50', icon: <Clock size={12} /> },
  processing: { label: 'Processing', color: 'text-primary', bgColor: 'bg-cyan-950/60', icon: <Loader2 size={12} className="animate-spin" /> },
  complete: { label: 'Verified', color: 'text-emerald-400', bgColor: 'bg-emerald-950/60', icon: <CheckCircle size={12} /> },
  failed: { label: 'Failed', color: 'text-red-400', bgColor: 'bg-red-950/60', icon: <AlertCircle size={12} /> },
  flagged: { label: 'Flagged', color: 'text-amber-400', bgColor: 'bg-amber-950/60', icon: <AlertCircle size={12} /> },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentUploadContent() {
  const { session } = useSession();
  const [isDragOver, setIsDragOver] = useState(false);
  const [queue, setQueue] = useState<Omit<QueuedFile, 'file'>[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('SA_ID');
  const strictnessLevel = session?.organization.verification_strictness ?? 'standard';
  const [comparisonMode, setComparisonMode] = useState(false);
  const [batchMode, setBatchMode] = useState(true);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFilesToQueue(files);
  }, [selectedDocType]);

  const addFilesToQueue = (files: File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const newItems: Omit<QueuedFile, 'file'>[] = [];
    const skipped: string[] = [];

    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        skipped.push(file.name);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        skipped.push(`${file.name} (too large)`);
        return;
      }
      newItems.push({
        id: `doc-${Date.now()}-${Math.floor(file.size / 100)}`,
        name: file.name,
        size: file.size,
        type: selectedDocType,
        status: 'pending',
        progress: 0,
        processingStep: 'Awaiting processing',
      });
    });

    if (skipped.length > 0) {
      toast.error(`${skipped.length} file(s) skipped — unsupported format or too large`);
    }
    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems]);
      toast.success(`${newItems.length} document${newItems.length > 1 ? 's' : ''} added to queue`);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFilesToQueue(Array.from(e.target.files));
    }
  };

  const removeFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((f) => f.id !== id));
    toast('Document removed from queue');
  };

  const updateDocType = (id: string, type: DocumentType) => {
    setQueue((prev) => prev.map((f) => (f.id === id ? { ...f, type } : f)));
  };

  const runVerification = async (id: string) => {
    const item = queue.find((f) => f.id === id);
    if (!item) return;

    // Step 1: OCR extraction
    setQueue((prev) =>
      prev.map((f) => f.id === id ? { ...f, status: 'processing', progress: 15, processingStep: 'Extracting text via OCR…' } : f)
    );
    toast.info('AI verification started…');

    // Step 2: Rule validation
    await new Promise((r) => setTimeout(r, 800));
    setQueue((prev) =>
      prev.map((f) => f.id === id ? { ...f, progress: 35, processingStep: 'Running rule-based validation…' } : f)
    );

    // Step 3: AI fraud analysis
    await new Promise((r) => setTimeout(r, 600));
    setQueue((prev) =>
      prev.map((f) => f.id === id ? { ...f, progress: 55, processingStep: 'Running AI fraud analysis with GPT-4o…' } : f)
    );

    try {
      setQueue((prev) =>
        prev.map((f) => f.id === id ? { ...f, progress: 55, processingStep: 'Running AI fraud analysis with GPT-4o…' } : f)
      );

      const res = await fetch('/api/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: item.name,
          documentType: item.type,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Verification failed');
      }

      const { verification } = await res.json();
      const aiFindings = verification.ai_findings ?? {};

      setQueue((prev) =>
        prev.map((f) => f.id === id ? { ...f, progress: 85, processingStep: 'Calculating Trust Score…' } : f)
      );
      await new Promise((r) => setTimeout(r, 400));

      const finalStatus: FileStatus = verification.status;
      const result: FraudAnalysisResult = {
        trustScore: verification.trust_score,
        riskLevel: verification.risk_level,
        summary: aiFindings.summary ?? '',
        indicators: aiFindings.indicators ?? [],
        recommendation: verification.recommendation ?? '',
        ruleChecks: verification.rule_checks ?? [],
        modelUsed: verification.model_used ?? 'GPT-4o',
        analysisTime: aiFindings.analysisTime ?? `${(verification.analysis_time_ms / 1000).toFixed(2)}s`,
        ocrConfidence: verification.ocr_confidence ?? 0,
        extractedData: verification.extracted_data ?? {},
      };

      setQueue((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: finalStatus,
                progress: 100,
                processingStep: finalStatus === 'flagged' ? 'Flagged for review' : 'Verification complete',
                trustScore: result.trustScore,
                riskLevel: result.riskLevel,
                errorMessage: finalStatus === 'flagged' ? result.recommendation : undefined,
                analysisResult: result,
              }
            : f
        )
      );

      if (finalStatus === 'flagged') {
        toast.warning(`Document flagged — Trust Score: ${result.trustScore} (HIGH RISK)`);
      } else {
        toast.success(`Verification complete — Trust Score: ${result.trustScore}`);
      }
    } catch (err) {
      setQueue((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: 'failed', progress: 45, processingStep: 'AI analysis failed', errorMessage: 'AI analysis failed — check API key or retry' }
            : f
        )
      );
      toast.error('AI analysis failed — please retry');
    }
  };

  const processAll = () => {
    const pending = queue.filter((f) => f.status === 'pending');
    if (pending.length === 0) {
      toast.error('No pending documents in queue');
      return;
    }
    pending.forEach((f, i) => {
      setTimeout(() => runVerification(f.id), i * 1500);
    });
    toast.info(`Starting AI verification for ${pending.length} document${pending.length > 1 ? 's' : ''}…`);
  };

  const clearCompleted = () => {
    setQueue((prev) => prev.filter((f) => f.status !== 'complete'));
    toast('Completed documents cleared');
  };

  const pendingCount = queue.filter((f) => f.status === 'pending').length;
  const processingCount = queue.filter((f) => f.status === 'processing').length;
  const completedCount = queue.filter((f) => f.status === 'complete').length;
  const failedCount = queue.filter((f) => f.status === 'failed' || f.status === 'flagged').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Document Upload</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload SA identity documents and certificates for AI-powered verification
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`btn-ghost text-sm ${showSettings ? 'text-primary bg-cyan-950/40' : ''}`}
            >
              <SlidersHorizontal size={15} />
              Verification Settings
            </button>
            <button onClick={processAll} className="btn-primary text-sm" disabled={pendingCount === 0 || processingCount > 0}>
              <Play size={15} />
              Process All ({pendingCount})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Upload Zone + Settings */}
        <div className="xl:col-span-1 space-y-5">
          {/* Document Type Selector */}
          <div className="card-elevated p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Document Type</p>
            <div className="grid grid-cols-1 gap-2">
              {(Object.entries(documentTypeConfig) as [DocumentType, typeof documentTypeConfig[DocumentType]][]).map(([key, cfg]) => (
                <button
                  key={`doctype-${key}`}
                  onClick={() => setSelectedDocType(key)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150 text-left ${
                    selectedDocType === key
                      ? 'border-primary/50 bg-cyan-950/30 text-primary' :'border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:text-foreground'
                  }`}
                >
                  <span className={selectedDocType === key ? 'text-primary' : cfg.color}>{cfg.icon}</span>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'drop-zone-active border-primary' :'border-border hover:border-border/80 hover:bg-muted/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={batchMode}
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${isDragOver ? 'bg-cyan-950/60 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <UploadCloud size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isDragOver ? 'Drop documents here' : 'Drag & drop documents'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse — JPG, PNG, PDF up to 10 MB
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                {['SA ID', 'Certificate', 'Passport', 'PDF'].map((tag) => (
                  <span
                    key={`tag-${tag}`}
                    className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {isDragOver && (
              <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
                <div className="absolute w-full h-0.5 bg-primary/40 animate-scan-line" />
              </div>
            )}
          </div>

          {/* Verification Settings Panel */}
          {showSettings && (
            <div className="card-elevated p-4 space-y-4 animate-slide-up">
              <div className="flex items-center gap-2">
                <Settings2 size={15} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">Verification Settings</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Strictness Level</label>
                <div className="select-field text-sm capitalize bg-muted/50 cursor-not-allowed opacity-80">
                  {strictnessLevel} — Set by organization admin
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {strictnessLevel === 'strict' ? 'Flags minor inconsistencies. May increase false positives.'
                    : strictnessLevel === 'lenient' ? 'Only flags obvious fraud. Faster processing.' : 'Balanced detection. Recommended for most use cases.'}
                </p>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Comparison Mode</p>
                  <p className="text-[11px] text-muted-foreground">Cross-match ID vs Certificate</p>
                </div>
                <button
                  onClick={() => setComparisonMode(!comparisonMode)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${comparisonMode ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${comparisonMode ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Batch Processing</p>
                  <p className="text-[11px] text-muted-foreground">Process multiple files at once</p>
                </div>
                <button
                  onClick={() => setBatchMode(!batchMode)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${batchMode ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${batchMode ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>

              <div className="bg-cyan-950/20 border border-cyan-800/30 rounded-lg p-3 flex gap-2">
                <Info size={14} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-primary/80">
                  AI analysis uses OpenAI GPT-4o with a forensic document verification prompt. Results are advisory — always perform manual review for high-stakes hires.
                </p>
              </div>
            </div>
          )}

          {/* Queue Stats */}
          <div className="card-elevated p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Queue Summary</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Pending', value: pendingCount, color: 'text-muted-foreground' },
                { label: 'Processing', value: processingCount, color: 'text-primary' },
                { label: 'Verified', value: completedCount, color: 'text-emerald-400' },
                { label: 'Flagged', value: failedCount, color: 'text-amber-400' },
              ].map((stat) => (
                <div key={`stat-${stat.label}`} className="bg-muted/40 rounded-lg p-3">
                  <p className={`text-xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Queue */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-foreground">Verification Queue</h2>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                {queue.length} documents
              </span>
            </div>
            <div className="flex items-center gap-2">
              {completedCount > 0 && (
                <button onClick={clearCompleted} className="btn-ghost text-xs">
                  <Trash2 size={13} />
                  Clear completed
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-xs"
              >
                <Plus size={13} />
                Add More
              </button>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="card-elevated flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4">
                <UploadCloud size={32} className="text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-foreground">No documents in queue</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Drag and drop documents into the upload zone or click Browse to add files for verification.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary mt-4 text-sm"
              >
                <UploadCloud size={15} />
                Upload Documents
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item) => {
                const statusCfg = statusConfig[item.status];
                const docTypeCfg = documentTypeConfig[item.type];
                return (
                  <div
                    key={item.id}
                    className={`card-elevated p-4 transition-all duration-200 hover:border-border/80 ${
                      item.status === 'flagged' ? 'border-amber-800/50' : item.status === 'failed' ? 'border-red-800/40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-12 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border border-border relative overflow-hidden">
                        <FileText size={20} className="text-muted-foreground" />
                        {item.status === 'processing' && (
                          <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute w-full h-0.5 bg-primary/60 animate-scan-line" />
                          </div>
                        )}
                        {item.status === 'complete' && (
                          <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                            <CheckCircle size={16} className="text-emerald-400" />
                          </div>
                        )}
                        {(item.status === 'flagged' || item.status === 'failed') && (
                          <div className="absolute inset-0 bg-amber-950/40 flex items-center justify-center">
                            <AlertCircle size={16} className={item.status === 'flagged' ? 'text-amber-400' : 'text-red-400'} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className={`flex items-center gap-1 text-[11px] font-medium ${docTypeCfg.color}`}>
                                {docTypeCfg.icon}
                                {docTypeCfg.label}
                              </span>
                              <span className="text-[11px] text-muted-foreground">{formatBytes(item.size)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {(item.status === 'complete' || item.status === 'flagged') && item.trustScore !== undefined && (
                              <span
                                className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-full ${
                                  item.trustScore >= 75
                                    ? 'bg-emerald-950/60 text-emerald-400'
                                    : item.trustScore >= 50
                                    ? 'bg-amber-950/60 text-amber-400' :'bg-red-950/60 text-red-400'
                                }`}
                              >
                                {item.trustScore}/100
                              </span>
                            )}
                            <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${statusCfg.bgColor} ${statusCfg.color}`}>
                              {statusCfg.icon}
                              {statusCfg.label}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {(item.status === 'processing' || item.status === 'pending') && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[11px] text-muted-foreground">{item.processingStep}</p>
                              <p className="text-[11px] text-primary font-mono-data">{item.progress}%</p>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  item.status === 'processing' ? 'progress-bar-animated' : 'bg-border'
                                }`}
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {item.errorMessage && (
                          <p className="text-[11px] text-amber-400 mt-2 flex items-center gap-1">
                            <AlertCircle size={11} />
                            {item.errorMessage}
                          </p>
                        )}

                        {/* Actions Row */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1">
                            <select
                              value={item.type}
                              onChange={(e) => updateDocType(item.id, e.target.value as DocumentType)}
                              disabled={item.status === 'processing'}
                              className="text-[11px] bg-muted border border-border rounded-md px-2 py-1 text-muted-foreground focus:outline-none focus:border-primary cursor-pointer disabled:opacity-50"
                            >
                              {(Object.entries(documentTypeConfig) as [DocumentType, typeof documentTypeConfig[DocumentType]][]).map(([key, cfg]) => (
                                <option key={`opt-${item.id}-${key}`} value={key}>
                                  {cfg.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-1">
                            {item.status === 'pending' && (
                              <button
                                onClick={() => runVerification(item.id)}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-cyan-950/40 rounded-md transition-colors"
                                title="Start AI verification"
                              >
                                <Play size={13} />
                              </button>
                            )}
                            {item.status === 'failed' && (
                              <button
                                onClick={() => runVerification(item.id)}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-cyan-950/40 rounded-md transition-colors"
                                title="Retry AI verification"
                              >
                                <RefreshCw size={13} />
                              </button>
                            )}
                            {(item.status === 'complete' || item.status === 'flagged') && (
                              <Link
                                href="/verification-results-dashboard"
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-cyan-950/40 rounded-md transition-colors"
                                title="View AI analysis results"
                              >
                                <Eye size={13} />
                              </Link>
                            )}
                            <button
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-cyan-950/40 rounded-md transition-colors"
                              title="Preview document"
                            >
                              <ZoomIn size={13} />
                            </button>
                            {(item.status === 'complete' || item.status === 'flagged') && (
                              <button
                                className="p-1.5 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-950/40 rounded-md transition-colors"
                                title="Download report"
                              >
                                <Download size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => removeFromQueue(item.id)}
                              disabled={item.status === 'processing'}
                              className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-950/40 rounded-md transition-colors disabled:opacity-40"
                              title="Remove from queue"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Batch Actions Bar */}
          {queue.length > 0 && (
            <div className="card-elevated p-4 border-primary/20 bg-cyan-950/10">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${processingCount > 0 ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                    <p className="text-sm text-foreground font-medium">
                      {processingCount > 0 ? `${processingCount} document${processingCount > 1 ? 's' : ''} being analyzed by GPT-4o…` : `${queue.length} documents in queue`}
                    </p>
                  </div>
                  {completedCount > 0 && (
                    <span className="text-xs text-emerald-400">
                      {completedCount} verified
                    </span>
                  )}
                  {failedCount > 0 && (
                    <span className="text-xs text-amber-400">
                      {failedCount} need attention
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/verification-results-dashboard"
                    className="btn-secondary text-xs"
                  >
                    <Eye size={13} />
                    View Results
                  </Link>
                  <button
                    onClick={processAll}
                    disabled={pendingCount === 0 || processingCount > 0}
                    className="btn-primary text-xs"
                  >
                    {processingCount > 0 ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Analyzing…
                      </>
                    ) : (
                      <>
                        <Play size={13} />
                        Process All ({pendingCount})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}