'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck, Activity, AlertTriangle, CheckCircle2, Clock,
  BarChart2, FileText, TrendingUp,
} from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import RevealOnScroll from '../shared/RevealOnScroll';

const recentVerifications = [
  { name: 'Sipho Ndlovu', type: 'SA ID', score: 94, risk: 'LOW', status: 'complete', time: '2m ago' },
  { name: 'Amahle Dlamini', type: 'Degree', score: 41, risk: 'HIGH', status: 'flagged', time: '15m ago' },
  { name: 'Thabo Khumalo', type: 'SA ID', score: 88, risk: 'LOW', status: 'complete', time: '32m ago' },
  { name: 'Lerato Mokoena', type: 'Matric', score: 67, risk: 'MEDIUM', status: 'flagged', time: '1h ago' },
];

const activityFeed = [
  { action: 'Verification completed', detail: 'Trust Score 94 — Sipho Ndlovu SA ID', time: '2m ago', type: 'success' },
  { action: 'Document flagged', detail: 'Fake certificate detected — Amahle Dlamini', time: '15m ago', type: 'warning' },
  { action: 'Report generated', detail: 'PDF export for Thabo Khumalo verification', time: '34m ago', type: 'info' },
  { action: 'Team member invited', detail: 'Recruiter role assigned to new user', time: '2h ago', type: 'info' },
];

const aiFindings = [
  { type: 'positive', text: 'SA ID format matches 13-digit standard' },
  { type: 'positive', text: 'Luhn checksum validation passed' },
  { type: 'warning', text: 'OCR confidence at 87% — minor blur detected' },
  { type: 'negative', text: 'Institution seal misalignment on certificate' },
];

const riskColor = (risk: string) =>
  risk === 'LOW' ? 'text-emerald-400' : risk === 'MEDIUM' ? 'text-amber-400' : 'text-red-400';

export default function DashboardPreview() {
  return (
    <section id="dashboard-preview" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Platform Preview"
          title="See VerifySA in Action"
          description="A real-time verification command center. Not a mockup — this is the actual product interface."
        />

        <RevealOnScroll>
          <motion.div
            className="glass-panel-strong rounded-3xl overflow-hidden glow-cyan border border-primary/10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-amber-500/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-muted/50 text-[10px] text-muted-foreground font-mono">
                  app.verifysa.co.za/dashboard
                </div>
              </div>
            </div>

            <div className="p-4 lg:p-6 grid lg:grid-cols-12 gap-4 lg:gap-5">
              {/* Trust Score */}
              <div className="lg:col-span-3 glass-panel rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-primary" /> Trust Score
                </p>
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeDasharray="248 264" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold font-mono-data text-emerald-400">94</span>
                      <span className="text-[9px] text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                  <span className="mt-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">Low Risk</span>
                </div>
              </div>

              {/* Verification History */}
              <div className="lg:col-span-5 glass-panel rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                  <Clock size={12} /> Verification History
                </p>
                <div className="space-y-2">
                  {recentVerifications.map((v) => (
                    <div key={v.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <FileText size={14} className="text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{v.name}</p>
                          <p className="text-[10px] text-muted-foreground">{v.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-xs font-bold font-mono-data ${riskColor(v.risk)}`}>{v.score}</span>
                        {v.status === 'complete'
                          ? <CheckCircle2 size={14} className="text-emerald-400" />
                          : <AlertTriangle size={14} className="text-amber-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analytics mini */}
              <div className="lg:col-span-4 glass-panel rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                  <BarChart2 size={12} /> Organization Analytics
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Verified', value: '847', trend: '+18%', color: 'text-primary' },
                    { label: 'Pass Rate', value: '94.2%', trend: '+2.1%', color: 'text-emerald-400' },
                    { label: 'Flagged', value: '89', trend: '+31', color: 'text-amber-400' },
                    { label: 'Blocked', value: '127', trend: '+12', color: 'text-red-400' },
                  ].map((m) => (
                    <div key={m.label} className="bg-muted/30 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      <p className={`text-lg font-bold font-mono-data ${m.color}`}>{m.value}</p>
                      <p className="text-[9px] text-emerald-400 flex items-center gap-0.5"><TrendingUp size={8} />{m.trend}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Findings */}
              <div className="lg:col-span-4 glass-panel rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-accent" /> AI Findings
                </p>
                <div className="space-y-2">
                  {aiFindings.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      {f.type === 'positive' && <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />}
                      {f.type === 'warning' && <AlertTriangle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />}
                      {f.type === 'negative' && <AlertTriangle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />}
                      <span className="text-muted-foreground">{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="lg:col-span-4 glass-panel rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                  <Activity size={12} /> Recent Activity
                </p>
                <div className="space-y-3">
                  {activityFeed.map((a, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        a.type === 'success' ? 'bg-emerald-400' : a.type === 'warning' ? 'bg-amber-400' : 'bg-primary'
                      }`} />
                      <div>
                        <p className="text-xs font-medium text-foreground">{a.action}</p>
                        <p className="text-[10px] text-muted-foreground">{a.detail}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk indicators */}
              <div className="lg:col-span-4 glass-panel rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-4">Risk Distribution</p>
                <div className="space-y-3">
                  {[
                    { label: 'Low Risk', pct: 73, color: 'bg-emerald-500' },
                    { label: 'Medium Risk', pct: 18, color: 'bg-amber-500' },
                    { label: 'High Risk', pct: 9, color: 'bg-red-500' },
                  ].map((r) => (
                    <div key={r.label}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">{r.label}</span>
                        <span className="font-mono-data text-foreground">{r.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${r.color}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${r.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
