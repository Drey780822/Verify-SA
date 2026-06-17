'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface LandingButtonProps {
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  external?: boolean;
}

export default function LandingButton({
  href,
  variant = 'primary',
  children,
  icon,
  className = '',
  external,
}: LandingButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200';

  const variants = {
    primary:
      'bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]',
    secondary:
      'glass-panel text-foreground border border-border hover:border-primary/40 hover:bg-muted/50',
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
  };

  const content = (
    <motion.span
      className={`${base} ${variants[variant]} ${className}`}
      whileHover={{ y: variant === 'primary' ? -1 : 0 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
      {icon ?? (variant === 'primary' ? <ArrowRight size={16} /> : null)}
    </motion.span>
  );

  if (external || href.startsWith('mailto:') || href.startsWith('http')) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
        {content}
      </a>
    );
  }

  return <Link href={href}>{content}</Link>;
}
