'use client';

import { motion } from 'framer-motion';
import {
  Users, Building2, GraduationCap, Shield, Landmark, Banknote,
} from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import { StaggerContainer } from '../shared/RevealOnScroll';

const industries = [
  { icon: <Users size={24} />, title: 'Recruitment Agencies', desc: 'Verify candidate identities and credentials before placement. Reduce hiring fraud by 94%.', stat: '2,400+ agencies' },
  { icon: <Building2 size={24} />, title: 'SMEs', desc: 'Affordable verification for growing businesses. Protect your team without enterprise overhead.', stat: '12,000+ SMEs' },
  { icon: <GraduationCap size={24} />, title: 'Universities', desc: 'Authenticate student qualifications, transcripts, and identity documents at scale.', stat: '85+ institutions' },
  { icon: <Shield size={24} />, title: 'Insurance Providers', desc: 'Validate policyholder identity and supporting documents during onboarding and claims.', stat: '340+ providers' },
  { icon: <Landmark size={24} />, title: 'Government', desc: 'Secure citizen identity verification for public services and compliance programs.', stat: '28 departments' },
  { icon: <Banknote size={24} />, title: 'Financial Services', desc: 'KYC-ready document verification for banks, fintechs, and micro-lenders.', stat: '190+ firms' },
];

export default function IndustriesSection() {
  return (
    <section id="industries" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Industries"
          title="Built for Every Sector That Needs Trust"
          description="From recruitment to financial services, VerifySA adapts to your industry's verification requirements."
        />

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.1}>
          {industries.map((ind) => (
            <motion.div
              key={ind.title}
              className="glass-panel rounded-2xl p-6 group hover:border-primary/30 transition-all duration-300"
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                {ind.icon}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{ind.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{ind.desc}</p>
              <span className="text-xs font-semibold text-primary">{ind.stat}</span>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
