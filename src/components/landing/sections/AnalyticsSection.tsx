'use client';

import { motion } from 'framer-motion';
import { BarChart2, ShieldCheck, ShieldAlert, TrendingUp } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import AnimatedCounter from '../shared/AnimatedCounter';
import RevealOnScroll from '../shared/RevealOnScroll';

const metrics = [
  { icon: <BarChart2 size={20} />, label: 'Documents Verified', value: 2400000, suffix: '+', display: '2.4M+', color: 'text-primary', accent: 'from-primary/20 to-cyan-500/10' },
  { icon: <ShieldCheck size={20} />, label: 'Average Trust Score', value: 87.3, suffix: '', display: '87.3', decimals: 1, color: 'text-emerald-400', accent: 'from-emerald-500/20 to-emerald-600/10' },
  { icon: <ShieldAlert size={20} />, label: 'Fraud Attempts Prevented', value: 48000, suffix: '+', display: '48K+', color: 'text-red-400', accent: 'from-red-500/20 to-red-600/10' },
  { icon: <TrendingUp size={20} />, label: 'Verification Success Rate', value: 94.2, suffix: '%', display: '94.2%', decimals: 1, color: 'text-accent', accent: 'from-accent/20 to-violet-600/10' },
];

export default function AnalyticsSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Analytics & Insights"
          title="Data-Driven Verification Intelligence"
          description="Real-time analytics across your organization. Track verification volume, fraud patterns, and team performance."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {metrics.map((m, i) => (
            <RevealOnScroll key={m.label} delay={i * 0.1}>
              <motion.div
                className={`glass-panel rounded-2xl p-6 bg-gradient-to-br ${m.accent} border border-border/50`}
                whileHover={{ y: -4 }}
              >
                <div className={`w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center ${m.color} mb-4`}>
                  {m.icon}
                </div>
                <p className={`text-3xl lg:text-4xl font-bold font-mono-data ${m.color}`}>
                  {m.decimals !== undefined ? (
                    <AnimatedCounter value={m.value} suffix={m.suffix} decimals={m.decimals} />
                  ) : m.value >= 1000000 ? (
                    <AnimatedCounter value={2.4} suffix="M+" decimals={1} />
                  ) : m.value >= 1000 ? (
                    <AnimatedCounter value={48} suffix="K+" decimals={0} />
                  ) : (
                    <AnimatedCounter value={m.value} suffix={m.suffix} />
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-2">{m.label}</p>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>

        {/* Mini chart visualization */}
        <RevealOnScroll>
          <div className="glass-panel-strong rounded-2xl p-6 lg:p-8 glow-cyan">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-semibold text-foreground">Verification Volume — Last 30 Days</p>
                <p className="text-xs text-muted-foreground">Across all organizations on VerifySA</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <TrendingUp size={12} /> +18% vs previous period
              </span>
            </div>
            <div className="flex items-end gap-1.5 h-40">
              {[24, 31, 19, 42, 38, 51, 29, 47, 56, 44, 63, 37, 71, 58, 49, 34, 52, 61, 45, 68, 55, 72, 48, 63, 57, 74, 66, 58, 71, 64].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/60 to-primary/20 min-w-[3px]"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(h / 74) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.02 }}
                />
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
