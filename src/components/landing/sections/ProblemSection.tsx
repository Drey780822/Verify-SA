'use client';

import { motion } from 'framer-motion';
import {
  Bot, FileWarning, UserX, ScanFace, ArrowDown,
} from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import GlassCard from '../shared/GlassCard';
import { StaggerContainer } from '../shared/RevealOnScroll';
import AnimatedCounter from '../shared/AnimatedCounter';

const fraudStats = [
  { icon: <Bot size={22} />, value: 340, suffix: '%', label: 'Increase in AI-Generated Identity Fraud', color: 'text-red-400', bg: 'bg-red-950/40 border-red-900/50' },
  { icon: <FileWarning size={22} />, value: 68, suffix: '%', label: 'Of Fake Certificates Go Undetected', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-900/50' },
  { icon: <UserX size={22} />, value: 4.2, suffix: 'B', prefix: 'R', label: 'Lost to Hiring Fraud Annually (SA)', color: 'text-red-400', bg: 'bg-red-950/40 border-red-900/50', decimals: 1 },
  { icon: <ScanFace size={22} />, value: 89, suffix: '%', label: 'Deepfake Risk in Remote Hiring', color: 'text-accent', bg: 'bg-violet-950/40 border-violet-900/50' },
];

const timeline = [
  { step: '1', title: 'Fake Application Submitted', desc: 'Candidate submits AI-generated ID or forged certificate during hiring process.', time: 'Day 1' },
  { step: '2', title: 'Manual Review Misses It', desc: 'HR team performs visual check — sophisticated forgeries pass undetected.', time: 'Day 3' },
  { step: '3', title: 'Candidate Hired', desc: 'Unverified identity enters your organization with full system access.', time: 'Day 14' },
  { step: '4', title: 'Fraud Discovered', desc: 'Identity theft, credential fraud, or compliance breach surfaces months later.', time: 'Day 180+' },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-red-950/5 to-background pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="The Challenge"
          title="The Fraud Problem Is Growing Faster Than Ever"
          description="AI has democratized document forgery. Traditional verification methods can't keep pace with synthetic identities, deepfakes, and AI-generated credentials."
        />

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20" stagger={0.12}>
          {fraudStats.map((stat) => (
            <GlassCard key={stat.label} glow="none" className={`border ${stat.bg}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${stat.color} bg-current/10`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <p className={`text-3xl font-bold font-mono-data ${stat.color}`}>
                {stat.prefix && stat.prefix}
                <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
              </p>
              <p className="text-sm text-muted-foreground mt-2 leading-snug">{stat.label}</p>
            </GlassCard>
          ))}
        </StaggerContainer>

        {/* Timeline */}
        <div className="relative">
          <h3 className="text-xl font-semibold text-foreground text-center mb-12">How Fraud Infiltrates Your Organization</h3>
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent -translate-y-1/2" />

          <div className="grid lg:grid-cols-4 gap-6">
            {timeline.map((item, i) => (
              <motion.div
                key={item.step}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <GlassCard className="h-full border-red-900/20">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-red-950/60 border border-red-800/50 flex items-center justify-center text-xs font-bold text-red-400">
                      {item.step}
                    </span>
                    <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">{item.time}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </GlassCard>
                {i < timeline.length - 1 && (
                  <ArrowDown size={16} className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-red-500/40 z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
