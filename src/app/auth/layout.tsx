import React from 'react';
import AppLogo from '@/components/ui/AppLogo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-950 via-background to-violet-950/30 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>
        <div className="relative flex items-center gap-3">
          <AppLogo size={40} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">VerifySA</h1>
            <p className="text-sm text-muted-foreground">AI Document Verification Platform</p>
          </div>
        </div>
        <div className="relative space-y-6">
          <h2 className="text-3xl font-bold text-foreground leading-tight">
            Verify South African documents with AI-powered fraud detection
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Trusted by HR teams and recruitment agencies. Multi-tenant, role-based access,
            and enterprise-grade audit trails.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              SOC 2 Ready
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              POPIA Compliant
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              99.9% Uptime
            </div>
          </div>
        </div>
        <p className="relative text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} VerifySA. All rights reserved.
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
