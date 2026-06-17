'use client';

import { motion } from 'framer-motion';
import {
  Lock, Shield, Database, Users, FileCheck, CheckCircle2,
  Server, KeyRound, Eye,
} from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import GlassCard from '../shared/GlassCard';
import { StaggerContainer } from '../shared/RevealOnScroll';

const securityFeatures = [
  { icon: <Users size={20} />, title: 'Role-Based Access Control', desc: 'Five-tier RBAC with granular permissions per organization.' },
  { icon: <FileCheck size={20} />, title: 'Audit Logging', desc: 'Immutable audit trails for every action, exportable for compliance.' },
  { icon: <Lock size={20} />, title: 'Encrypted Storage', desc: 'AES-256 encryption at rest and TLS 1.3 in transit.' },
  { icon: <Database size={20} />, title: 'Supabase Security', desc: 'Row-Level Security isolates tenant data at the database level.' },
  { icon: <Server size={20} />, title: 'Multi-Tenant Architecture', desc: 'Complete data isolation between organizations with shared infrastructure.' },
  { icon: <Shield size={20} />, title: 'Compliance Ready', desc: 'POPIA, GDPR-aligned data handling with data residency options.' },
];

export default function SecuritySection() {
  return (
    <section id="security" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-950/5 to-background pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Enterprise Security"
          title="Security Architecture You Can Trust"
          description="Built on Supabase with Row-Level Security, end-to-end encryption, and enterprise-grade access controls."
        />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <StaggerContainer className="grid sm:grid-cols-2 gap-4" stagger={0.08}>
            {securityFeatures.map((f) => (
              <GlassCard key={f.title} glow="none" className="p-5">
                <div className="w-9 h-9 rounded-lg bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400 mb-3">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </GlassCard>
            ))}
          </StaggerContainer>

          {/* Architecture diagram */}
          <motion.div
            className="glass-panel-strong rounded-2xl p-8 glow-cyan"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-6 text-center">Security Architecture</p>

            <div className="space-y-4">
              {/* Layer 1 */}
              <div className="flex items-center justify-center">
                <div className="glass-panel rounded-xl px-6 py-3 border border-primary/30 text-center">
                  <Eye size={16} className="text-primary mx-auto mb-1" />
                  <p className="text-xs font-semibold text-foreground">Application Layer</p>
                  <p className="text-[10px] text-muted-foreground">Next.js + RBAC Middleware</p>
                </div>
              </div>

              <div className="flex justify-center"><div className="w-px h-6 bg-primary/30" /></div>

              {/* Layer 2 */}
              <div className="flex items-center justify-center gap-4">
                <div className="glass-panel rounded-xl px-4 py-3 border border-accent/30 text-center flex-1">
                  <KeyRound size={16} className="text-accent mx-auto mb-1" />
                  <p className="text-xs font-semibold text-foreground">Auth Layer</p>
                  <p className="text-[10px] text-muted-foreground">Supabase Auth + JWT</p>
                </div>
                <div className="glass-panel rounded-xl px-4 py-3 border border-emerald-800/30 text-center flex-1">
                  <Shield size={16} className="text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-foreground">API Gateway</p>
                  <p className="text-[10px] text-muted-foreground">Rate Limiting + Validation</p>
                </div>
              </div>

              <div className="flex justify-center"><div className="w-px h-6 bg-primary/30" /></div>

              {/* Layer 3 */}
              <div className="flex items-center justify-center">
                <div className="glass-panel rounded-xl px-6 py-3 border border-emerald-800/30 text-center w-full max-w-sm">
                  <Database size={16} className="text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-foreground">PostgreSQL + Row-Level Security</p>
                  <p className="text-[10px] text-muted-foreground">Tenant-isolated data · AES-256 encrypted</p>
                </div>
              </div>

              <div className="flex justify-center gap-8 pt-2">
                {['Org A', 'Org B', 'Org C'].map((org) => (
                  <div key={org} className="flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-emerald-400" />
                    <span className="text-[10px] text-muted-foreground">{org} isolated</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
