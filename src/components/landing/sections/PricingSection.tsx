'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import LandingButton from '../shared/LandingButton';
import RevealOnScroll from '../shared/RevealOnScroll';

const plans = [
  {
    name: 'Starter',
    description: 'For small teams getting started with verification.',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      '500 verifications/month',
      'Up to 3 team members',
      'Standard strictness level',
      'PDF report generation',
      'Email support',
      'Basic analytics',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    description: 'For growing teams that need advanced verification.',
    monthlyPrice: 149,
    yearlyPrice: 119,
    features: [
      '5,000 verifications/month',
      'Up to 15 team members',
      'All strictness levels',
      'Approval workflows',
      'Custom verification rules',
      'Advanced analytics',
      'Audit log export',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with custom requirements.',
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      'Unlimited verifications',
      'Unlimited team members',
      'Dual approval workflows',
      'Custom AI model tuning',
      'SSO / SAML integration',
      'Dedicated account manager',
      'SLA guarantee',
      'On-premise deployment option',
    ],
    cta: 'Book Demo',
    highlighted: false,
  },
];

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Pricing"
          title="Simple, Transparent Pricing"
          description="Start free, scale as you grow. No hidden fees, no per-document surprises."
        />

        {/* Toggle */}
        <RevealOnScroll className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm ${!yearly ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Monthly</span>
          <button
            onClick={() => setYearly(!yearly)}
            className="relative w-14 h-7 rounded-full bg-muted border border-border transition-colors"
            aria-label="Toggle yearly pricing"
          >
            <motion.div
              className="absolute top-0.5 w-6 h-6 rounded-full bg-primary"
              animate={{ left: yearly ? 'calc(100% - 26px)' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm ${yearly ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
            Yearly
            <span className="ml-1.5 text-xs font-semibold text-emerald-400">Save 20%</span>
          </span>
        </RevealOnScroll>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <RevealOnScroll key={plan.name} delay={i * 0.1}>
              <motion.div
                className={`relative rounded-2xl p-6 lg:p-8 h-full flex flex-col ${
                  plan.highlighted
                    ? 'glass-panel-strong glow-cyan border-2 border-primary/40 scale-[1.02]'
                    : 'glass-panel border border-border'
                }`}
                whileHover={{ y: -4 }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles size={10} /> Most Popular
                  </div>
                )}

                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <AnimatePresence mode="wait">
                    {plan.monthlyPrice !== null ? (
                      <motion.div
                        key={yearly ? 'yearly' : 'monthly'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-4xl font-bold font-mono-data text-foreground">
                          R{yearly ? plan.yearlyPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </motion.div>
                    ) : (
                      <span className="text-3xl font-bold text-foreground">Custom</span>
                    )}
                  </AnimatePresence>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <LandingButton
                  href={plan.name === 'Enterprise' ? '#contact' : '/auth/signup'}
                  variant={plan.highlighted ? 'primary' : 'secondary'}
                  className="w-full justify-center"
                >
                  {plan.cta}
                </LandingButton>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
