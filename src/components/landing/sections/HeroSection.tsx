'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  ShieldCheck, Play, CheckCircle2, AlertTriangle, Sparkles,
} from 'lucide-react';
import GradientBackground from '../shared/GradientBackground';
import LandingButton from '../shared/LandingButton';
import AnimatedCounter from '../shared/AnimatedCounter';
import RevealOnScroll from '../shared/RevealOnScroll';

const stats = [
  { value: 2.4, suffix: 'M+', label: 'Documents Verified', decimals: 1 },
  { value: 99.7, suffix: '%', label: 'Detection Accuracy', decimals: 1 },
  { value: 847, suffix: '', label: 'Enterprise Clients', decimals: 0 },
  { value: 1.8, suffix: 's', label: 'Avg. Processing Time', decimals: 1 },
];

const trustLogos = ['Discovery', 'Sanlam', 'Standard Bank', 'Vodacom', 'MTN', 'Old Mutual'];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });
  const parallaxX = useTransform(springX, [-0.5, 0.5], [-20, 20]);
  const parallaxY = useTransform(springY, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
    >
      <GradientBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <RevealOnScroll delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-primary/20 text-xs font-medium text-primary mb-6">
                <Sparkles size={14} />
                AI-Powered Identity Verification for South Africa
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
                <span className="text-gradient-hero">Trust Every Identity.</span>
                <br />
                <span className="text-foreground">Verify Every Document.</span>
              </h1>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                AI-powered identity and document verification designed for modern recruitment teams, SMEs, universities, and enterprises.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
                <LandingButton href="/auth/signup" variant="primary">
                  Start Verifying
                </LandingButton>
                <LandingButton href="#dashboard-preview" variant="secondary" icon={<Play size={16} />}>
                  Watch Demo
                </LandingButton>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.4}>
              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> POPIA Compliant</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-primary" /> SOC 2 Ready</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-accent" /> 256-bit Encryption</span>
              </div>
            </RevealOnScroll>
          </div>

          {/* Floating dashboard preview */}
          <RevealOnScroll delay={0.2} direction="left" className="relative hidden lg:block">
            <motion.div style={{ x: parallaxX, y: parallaxY }} className="relative">
              {/* Main card */}
              <motion.div
                className="glass-panel-strong rounded-2xl p-6 glow-cyan animate-float"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Live Verification</p>
                    <p className="text-sm font-semibold text-foreground">Sipho Ndlovu — SA ID</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-400">Verified</span>
                  </div>
                </div>

                {/* Trust score ring */}
                <div className="flex items-center gap-6">
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="8" />
                      <motion.circle
                        cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${94 * 2.64} ${100 * 2.64}`}
                        initial={{ strokeDasharray: '0 264' }}
                        animate={{ strokeDasharray: `${94 * 2.64} ${100 * 2.64}` }}
                        transition={{ duration: 2, delay: 0.8, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        className="text-2xl font-bold font-mono-data text-emerald-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        94
                      </motion.span>
                      <span className="text-[9px] text-muted-foreground">Trust Score</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5">
                    {[
                      { label: 'ID Format', status: 'pass' },
                      { label: 'Luhn Checksum', status: 'pass' },
                      { label: 'OCR Confidence', status: 'pass' },
                      { label: 'AI Fraud Scan', status: 'pass' },
                    ].map((check) => (
                      <div key={check.label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{check.label}</span>
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating stat card */}
              <motion.div
                className="absolute -top-6 -right-6 glass-panel rounded-xl px-4 py-3 glow-violet animate-float-delayed"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
              >
                <p className="text-[10px] text-muted-foreground">Fraud Blocked Today</p>
                <p className="text-xl font-bold font-mono-data text-red-400">127</p>
              </motion.div>

              {/* Floating alert card */}
              <motion.div
                className="absolute -bottom-4 -left-8 glass-panel rounded-xl px-4 py-3 border border-amber-800/30 max-w-[200px]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-amber-400">Flagged Document</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Fake certificate detected — Trust Score 38</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </RevealOnScroll>
        </div>

        {/* Stats row */}
        <RevealOnScroll delay={0.5} className="mt-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-panel rounded-xl p-5 text-center lg:text-left">
                <p className="text-2xl lg:text-3xl font-bold font-mono-data text-gradient-cyan">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>

        {/* Logo strip */}
        <RevealOnScroll delay={0.6} className="mt-16">
          <p className="text-center text-xs text-muted-foreground mb-6 uppercase tracking-widest">Trusted by leading South African organizations</p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12 opacity-50">
            {trustLogos.map((logo) => (
              <span key={logo} className="text-sm font-semibold text-muted-foreground tracking-wide">{logo}</span>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
