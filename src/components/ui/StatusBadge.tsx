import React from 'react';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type VerificationStatus = 'processing' | 'complete' | 'failed' | 'pending' | 'flagged';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md';
}

const riskConfig: Record<RiskLevel, { label: string; className: string }> = {
  LOW: { label: 'Low Risk', className: 'risk-badge-low' },
  MEDIUM: { label: 'Medium Risk', className: 'risk-badge-medium' },
  HIGH: { label: 'High Risk', className: 'risk-badge-high' },
  CRITICAL: { label: 'Critical Risk', className: 'risk-badge-high' },
};

const statusConfig: Record<VerificationStatus, { label: string; dotClass: string; textColor: string }> = {
  processing: { label: 'Processing', dotClass: 'status-dot-processing', textColor: 'text-primary' },
  complete: { label: 'Verified', dotClass: 'status-dot-complete', textColor: 'text-emerald-400' },
  failed: { label: 'Failed', dotClass: 'status-dot-failed', textColor: 'text-red-400' },
  pending: { label: 'Pending', dotClass: 'status-dot-pending', textColor: 'text-muted-foreground' },
  flagged: { label: 'Flagged', dotClass: 'status-dot-flagged', textColor: 'text-amber-400' },
};

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const config = riskConfig[level];
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${config.className} ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 flex-shrink-0" />
      {config.label}
    </span>
  );
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${config.textColor} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dotClass}`} />
      {config.label}
    </span>
  );
}