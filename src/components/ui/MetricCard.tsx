import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  accentColor?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  alert?: boolean;
}

const accentMap: Record<string, { bg: string; text: string; border: string }> = {
  cyan: { bg: 'bg-cyan-950/60', text: 'text-primary', border: 'border-cyan-800/50' },
  violet: { bg: 'bg-violet-950/60', text: 'text-accent', border: 'border-violet-800/50' },
  emerald: { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/50' },
  amber: { bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-800/50' },
  red: { bg: 'bg-red-950/60', text: 'text-red-400', border: 'border-red-800/50' },
};

export default function MetricCard({
  label,
  value,
  subValue,
  trend,
  trendLabel,
  icon,
  accentColor = 'cyan',
  size = 'md',
  alert = false,
}: MetricCardProps) {
  const accent = accentMap[accentColor];
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <div
      className={`card-elevated p-5 flex flex-col gap-3 transition-all duration-200 hover:border-border/80 ${
        alert ? 'border-amber-800/60 bg-amber-950/20' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="metric-label">{label}</p>
          {subValue && <p className="text-[11px] text-muted-foreground mt-0.5">{subValue}</p>}
        </div>
        {icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent.bg} ${accent.text} border ${accent.border}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className={`font-bold tabular-nums font-mono-data ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-2xl'} ${accent.text}`}>
          {value}
        </span>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${
              isPositive
                ? 'bg-emerald-950/60 text-emerald-400'
                : isNegative
                ? 'bg-red-950/60 text-red-400' :'bg-muted text-muted-foreground'
            }`}
          >
            {isPositive ? (
              <TrendingUp size={12} />
            ) : isNegative ? (
              <TrendingDown size={12} />
            ) : (
              <Minus size={12} />
            )}
            <span>
              {trend > 0 ? '+' : ''}
              {trend}%
            </span>
          </div>
        )}
      </div>
      {trendLabel && (
        <p className="text-[11px] text-muted-foreground">{trendLabel}</p>
      )}
    </div>
  );
}