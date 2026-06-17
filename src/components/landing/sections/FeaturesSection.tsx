'use client';

import { motion } from 'framer-motion';
import {
  Fingerprint, FileSearch, ShieldAlert, Gauge, ScrollText,
  ScanText, Brain, Users, FileDown,
} from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import { StaggerContainer } from '../shared/RevealOnScroll';

const features = [
  { icon: <Fingerprint size={22} />, title: 'Identity Verification', desc: 'Validate SA ID numbers with Luhn checksum, DOB patterns, and gender digit consistency.', glow: 'cyan' as const },
  { icon: <FileSearch size={22} />, title: 'Document Verification', desc: 'Verify certificates, passports, proof of residence, and driver licences.', glow: 'violet' as const },
  { icon: <ShieldAlert size={22} />, title: 'Fraud Detection', desc: 'AI-powered forensic analysis detects forgery, manipulation, and synthetic documents.', glow: 'cyan' as const },
  { icon: <Gauge size={22} />, title: 'Trust Scoring', desc: 'Composite 0–100 trust score with configurable strictness levels per organization.', glow: 'violet' as const },
  { icon: <ScrollText size={22} />, title: 'Audit Trails', desc: 'Immutable audit logs for every verification action, exportable for compliance.', glow: 'cyan' as const },
  { icon: <ScanText size={22} />, title: 'OCR Extraction', desc: 'High-confidence field extraction from scanned documents and photographs.', glow: 'violet' as const },
  { icon: <Brain size={22} />, title: 'AI Analysis', desc: 'GPT-4o forensic engine with South African document specialization.', glow: 'cyan' as const },
  { icon: <Users size={22} />, title: 'Role-Based Access', desc: 'Five-tier RBAC from Super Admin to Viewer with granular permissions.', glow: 'violet' as const },
  { icon: <FileDown size={22} />, title: 'PDF Reporting', desc: 'Generate compliance-ready PDF reports with findings, scores, and audit trails.', glow: 'cyan' as const },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="AI Verification Engine"
          title="Enterprise-Grade Verification Infrastructure"
          description="Every feature built for security, compliance, and scale. Powered by AI, backed by audit trails."
        />

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.08}>
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className={`glass-panel rounded-2xl p-6 cursor-default group hover:${feature.glow === 'cyan' ? 'glow-cyan' : 'glow-violet'} transition-all duration-300 hover:border-primary/20`}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
