'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, Share2, Code2, Mail, ArrowRight } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

const footerLinks = {
  Company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Security', href: '#security' },
    { label: 'Integrations', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Status', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'POPIA Compliance', href: '#' },
    { label: 'Contact', href: 'mailto:hello@verifysa.co.za' },
  ],
};

export default function FooterSection() {
  return (
    <footer id="contact" className="relative border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <AppLogo size={28} />
              <span className="text-lg font-bold text-foreground">VerifySA</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              AI-powered identity and document verification for South African enterprises. Trust every identity. Verify every document.
            </p>

            {/* Newsletter */}
            <div className="glass-panel rounded-xl p-4">
              <p className="text-xs font-semibold text-foreground mb-2">Stay updated</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@company.co.za"
                  className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <motion.button
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Subscribe"
                >
                  <ArrowRight size={14} />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} VerifySA (Pty) Ltd. All rights reserved. Made in South Africa.
          </p>
          <div className="flex items-center gap-4">
            {[
              { icon: <Globe size={16} />, href: '#', label: 'Website' },
              { icon: <Share2 size={16} />, href: '#', label: 'LinkedIn' },
              { icon: <Code2 size={16} />, href: '#', label: 'GitHub' },
              { icon: <Mail size={16} />, href: 'mailto:hello@verifysa.co.za', label: 'Email' },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
