'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import LandingButton from '../shared/LandingButton';
import RevealOnScroll from '../shared/RevealOnScroll';

export default function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-background pointer-events-none" />
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(6,182,212,0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(139,92,246,0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(6,182,212,0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <RevealOnScroll>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight mb-6">
            Build Trust Into Every{' '}
            <span className="text-gradient-cyan">Hiring Decision</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Join hundreds of South African organizations using VerifySA to eliminate fraud, accelerate hiring, and maintain compliance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <LandingButton href="/auth/signup" variant="primary" icon={<ArrowRight size={16} />}>
              Start Free Trial
            </LandingButton>
            <LandingButton href="mailto:demo@verifysa.co.za" variant="secondary" icon={<Calendar size={16} />}>
              Book Demo
            </LandingButton>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
