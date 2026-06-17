'use client';

import { motion } from 'framer-motion';

export default function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] blob-cyan opacity-60" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] blob-violet opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full landing-grid-bg opacity-40" />
      <motion.div
        className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-primary/5 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-40 left-[5%] w-96 h-96 rounded-full bg-accent/5 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
