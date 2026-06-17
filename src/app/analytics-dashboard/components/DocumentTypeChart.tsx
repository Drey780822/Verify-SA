'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['var(--primary)', 'var(--accent)', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

interface DocTypeChartProps {
  data: { type: string; count: number }[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: { color: string } }[]; label?: string }) => {
  if (!active || !payload || !payload[0]) return null;
  return (
    <div className="tooltip-dark">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      <p className="text-xs text-muted-foreground">
        Documents: <span className="font-bold text-foreground tabular-nums">{payload[0].value}</span>
      </p>
    </div>
  );
};

export default function DocumentTypeChart({ data }: DocTypeChartProps) {
  const chartData = data.map((d, i) => ({
    type: d.type.replace(/_/g, ' '),
    count: d.count,
    color: COLORS[i % COLORS.length],
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
        No document type data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="type" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.type} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
