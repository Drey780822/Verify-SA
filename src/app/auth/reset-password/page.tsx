'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
    toast.success('Password reset email sent!');
  };

  return (
    <div>
      <div className="lg:hidden flex items-center gap-3 mb-8">
        <AppLogo size={32} />
        <span className="text-xl font-bold">VerifySA</span>
      </div>

      <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={14} />
        Back to sign in
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-2">Reset your password</h2>
      <p className="text-muted-foreground mb-8">
        {sent
          ? 'Check your email for a password reset link.'
          : "Enter your email and we'll send you a reset link."}
      </p>

      {!sent && (
        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="you@company.co.za"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send reset link'}
          </button>
        </form>
      )}
    </div>
  );
}
