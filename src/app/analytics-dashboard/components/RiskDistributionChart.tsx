'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface RiskChartProps {
  data: { name: string; value: number; color: string }[];
}

const CustomTooltip = ({ active, payload, total }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[]; total: number }) => {
  if (!active || !payload || !payload[0]) return null;
  const pct = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : '0';
  return (
    <div className="tooltip-dark">
      <p className="text-xs font-semibold" style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
      <p className="text-sm font-bold text-foreground tabular-nums">{payload[0].value} documents</p>
      <p className="text-xs text-muted-foreground">{pct}% of total</p>
    </div>
  );
};

export default function RiskDistributionChart({ data }: RiskChartProps) {
  const total = data.reduce((a, b) => a + b.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
        No risk data available
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="50%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip total={total} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2 flex-1">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tabular-nums" style={{ color: entry.color }}>{entry.value}</span>
              <span className="text-[10px] text-muted-foreground">({((entry.value / total) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
