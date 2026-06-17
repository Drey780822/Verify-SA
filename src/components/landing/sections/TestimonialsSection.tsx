'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import { StaggerContainer } from '../shared/RevealOnScroll';

const testimonials = [
  {
    quote: 'VerifySA cut our candidate verification time from 3 days to under 2 seconds. We caught 14 fraudulent applications in the first month alone.',
    name: 'Nomvula Mahlangu',
    role: 'HR Director',
    company: 'TalentForce SA',
    initials: 'NM',
    gradient: 'from-primary to-accent',
  },
  {
    quote: 'As a recruitment agency handling 200+ placements monthly, VerifySA gives us the confidence to guarantee verified candidates to our clients.',
    name: 'Thandi Zulu',
    role: 'Senior Recruiter',
    company: 'ProTalent Recruitment',
    initials: 'TZ',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    quote: 'We replaced our manual document checks with VerifySA and reduced hiring fraud incidents by 89%. The audit trails are invaluable for compliance.',
    name: 'David van der Merwe',
    role: 'CEO',
    company: 'TechStaff Solutions',
    initials: 'DV',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    quote: 'Processing 15,000 student applications annually, VerifySA\'s batch verification and trust scoring transformed our admissions workflow.',
    name: 'Prof. Amahle Dlamini',
    role: 'Registrar',
    company: 'University of Johannesburg',
    initials: 'AD',
    gradient: 'from-violet-500 to-violet-600',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Testimonials"
          title="Trusted by Teams Across South Africa"
          description="See why HR leaders, recruiters, and enterprise teams choose VerifySA to protect their organizations."
        />

        <StaggerContainer className="grid sm:grid-cols-2 gap-6" stagger={0.12}>
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              className="glass-panel rounded-2xl p-6 lg:p-8 relative group hover:border-primary/20 transition-colors"
              whileHover={{ y: -4 }}
            >
              <Quote size={24} className="text-primary/30 mb-4" />
              <p className="text-sm text-foreground leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xs font-bold text-white">{t.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
