'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SimulationPathChartProps {
  data: any[];
  runs: any[];
  colors: string[];
  formatCurrency: (val: number) => string;
}

export default function SimulationPathChart({ data, runs, colors, formatCurrency }: SimulationPathChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
        <YAxis
          stroke="var(--text-muted)"
          fontSize={10}
          tickLine={false}
          tickFormatter={(v) => {
            if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
            if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
            return `₹${v / 1000}K`;
          }}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--background-secondary)',
            borderColor: 'var(--card-border)',
            borderRadius: '8px',
            fontSize: '11px',
            color: 'var(--foreground)'
          }}
          formatter={(value: any) => [formatCurrency(value), '']}
          cursor={{ stroke: 'var(--primary-custom)', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        {runs.map((_, idx) => (
          <Line
            key={idx}
            type="monotone"
            name={`Path ${idx + 1}`}
            dataKey={`Path ${idx + 1}`}
            stroke={colors[idx % colors.length]}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
