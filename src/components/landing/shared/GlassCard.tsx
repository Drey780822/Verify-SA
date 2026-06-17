'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'violet' | 'none';
  hover?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  glow = 'none',
  hover = true,
}: GlassCardProps) {
  const glowClass =
    glow === 'cyan' ? 'glow-cyan' : glow === 'violet' ? 'glow-violet' : '';

  return (
    <motion.div
      className={`glass-panel rounded-2xl p-6 ${glowClass} ${className}`}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
    >
      {children}
    </motion.div>
  );
}
