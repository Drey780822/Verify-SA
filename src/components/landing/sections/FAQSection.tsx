'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import RevealOnScroll from '../shared/RevealOnScroll';

const faqs = [
  { q: 'What documents can VerifySA verify?', a: 'VerifySA supports SA Identity Documents, passports, driver\'s licences, proof of residence, matric certificates, degree qualifications, and professional certifications. Our AI engine is specialized for South African document formats.' },
  { q: 'How accurate is the AI verification?', a: 'Our GPT-4o forensic engine achieves 99.7% detection accuracy when combined with our rule-based validation engine. The system uses configurable strictness levels to balance false positives and false negatives for your use case.' },
  { q: 'Is VerifySA POPIA compliant?', a: 'Yes. VerifySA is designed with POPIA compliance in mind. All data is encrypted at rest and in transit, stored in secure PostgreSQL with Row-Level Security, and audit trails are maintained for every verification action.' },
  { q: 'How does multi-tenant organization access work?', a: 'Each organization has isolated data through Supabase Row-Level Security. Users can belong to multiple organizations with different roles. Organization admins manage team members, verification rules, and approval workflows independently.' },
  { q: 'Can I integrate VerifySA with my existing HR system?', a: 'Professional and Enterprise plans include API access and webhook notifications. You can trigger verifications programmatically and receive real-time results via webhooks for seamless integration with your ATS or HRIS.' },
  { q: 'What happens when a document is flagged?', a: 'Flagged documents trigger your configured approval workflow — auto-approve, manual review, or dual approval. HR managers receive notifications and can review AI findings, extracted data, and rule validation results before making a decision.' },
  { q: 'How quickly are documents processed?', a: 'Average processing time is 1.8 seconds per document. Batch processing is supported for high-volume scenarios like university admissions or large recruitment drives.' },
  { q: 'What pricing plan is right for my team?', a: 'Starter is ideal for SMEs verifying up to 500 documents monthly. Professional suits recruitment agencies and mid-size HR teams. Enterprise is for large organizations needing unlimited volume, SSO, and dedicated support.' },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="FAQ"
          title="Frequently Asked Questions"
          description="Everything you need to know about VerifySA's verification platform."
        />

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <RevealOnScroll key={faq.q} delay={i * 0.05}>
              <div className="glass-panel rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  aria-expanded={openIndex === i}
                >
                  <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                  <span className="text-primary flex-shrink-0">
                    {openIndex === i ? <Minus size={18} /> : <Plus size={18} />}
                  </span>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
