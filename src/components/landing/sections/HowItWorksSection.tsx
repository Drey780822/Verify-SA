'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  UploadCloud, ScanText, Brain, ShieldAlert, Gauge, FileCheck2,
} from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';

const steps = [
  { icon: <UploadCloud size={24} />, title: 'Upload Document', desc: 'Drag and drop SA IDs, certificates, passports, or proof of residence.', color: 'from-cyan-500 to-cyan-600' },
  { icon: <ScanText size={24} />, title: 'OCR Extraction', desc: 'AI extracts names, ID numbers, dates, and institution details with high confidence.', color: 'from-blue-500 to-blue-600' },
  { icon: <Brain size={24} />, title: 'AI Analysis', desc: 'GPT-4o forensic engine detects forgery patterns, inconsistencies, and anomalies.', color: 'from-violet-500 to-violet-600' },
  { icon: <ShieldAlert size={24} />, title: 'Risk Assessment', desc: 'Rule engine validates SA ID checksums, DOB patterns, and document integrity.', color: 'from-amber-500 to-amber-600' },
  { icon: <Gauge size={24} />, title: 'Trust Score', desc: 'Composite 0–100 score combining AI findings and rule validation results.', color: 'from-emerald-500 to-emerald-600' },
  { icon: <FileCheck2 size={24} />, title: 'Verification Report', desc: 'PDF report with audit trail, findings, and compliance-ready documentation.', color: 'from-primary to-accent' },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ['0%', '100%']);

  return (
    <section id="how-it-works" ref={ref} className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="How It Works"
          title="Six Steps to Verified Trust"
          description="From document upload to compliance-ready report in under 2 seconds. Fully automated, fully auditable."
        />

        <div className="relative max-w-3xl mx-auto">
          {/* Progress line */}
          <div className="absolute left-6 lg:left-8 top-0 bottom-0 w-px bg-border">
            <motion.div className="w-full bg-gradient-to-b from-primary to-accent origin-top" style={{ height: lineHeight }} />
          </div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="relative flex gap-6 lg:gap-8 group"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className={`relative z-10 w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>
                <motion.div
                  className="glass-panel rounded-2xl p-6 flex-1 group-hover:border-primary/30 transition-colors duration-300"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Step {i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
