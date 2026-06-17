'use client';

import React, { useEffect, useState } from 'react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from 'recharts';

interface TrustScoreGaugeProps {
  score: number;
  animated?: boolean;
}

export default function TrustScoreGauge({ score, animated = true }: TrustScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);

  useEffect(() => {
    if (!animated) return;
    let current = 0;
    const step = score / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [score, animated]);

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const scoreColor = getScoreColor(displayScore);

  const data = [
    { name: 'score', value: displayScore, fill: scoreColor },
  ];

  return (
    <div className="relative flex flex-col items-center">
      <div className="w-52 h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="90%"
            barSize={14}
            data={data}
            startAngle={225}
            endAngle={-45}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: 'var(--muted)' }}
              dataKey="value"
              cornerRadius={8}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold tabular-nums font-mono-data transition-all duration-75"
            style={{ color: scoreColor }}
          >
            {displayScore}
          </span>
          <span className="text-xs text-muted-foreground font-medium mt-0.5">Trust Score</span>
          <span
            className="text-xs font-semibold mt-1 px-2 py-0.5 rounded-full"
            style={{
              color: scoreColor,
              background: `${scoreColor}18`,
              border: `1px solid ${scoreColor}40`,
            }}
          >
            {displayScore >= 80 ? 'Low Risk' : displayScore >= 60 ? 'Medium Risk' : 'High Risk'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2">
        {[
          { label: 'High Risk', range: '0–59', color: '#ef4444' },
          { label: 'Medium', range: '60–79', color: '#f59e0b' },
          { label: 'Low Risk', range: '80–100', color: '#10b981' },
        ].map((tier) => (
          <div key={`tier-${tier.label}`} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: tier.color }} />
            <span className="text-[10px] text-muted-foreground">{tier.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}