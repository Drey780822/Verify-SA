'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VolumeChartProps {
  data: { date: string; count: number }[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="tooltip-dark min-w-[140px]">
      <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={`tooltip-entry-${i}`} className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.name}</span>
          </span>
          <span className="font-bold tabular-nums" style={{ color: entry.color }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function VerificationVolumeChart({ data }: VolumeChartProps) {
  const chartData = data.map((d) => ({ date: d.date, verified: d.count }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
        No verification data for this period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="verifiedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="verified" stroke="var(--primary)" fill="url(#verifiedGrad)" strokeWidth={2} name="verified" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
