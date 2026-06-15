'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportChartProps {
  data: { name: string; Corpus: number; Invested: number }[];
  formatCurrency: (v: number) => string;
}

export default function ReportChart({ data, formatCurrency }: ReportChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} tickLine={false} />
        <YAxis
          stroke="var(--text-muted)"
          fontSize={9}
          tickLine={false}
          tickFormatter={(v) => {
            if (v >= 10000000) return `₹${(v / 10000000).toFixed(0)}Cr`;
            if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
            return `₹${v / 1000}K`;
          }}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--background-secondary)',
            borderColor: 'var(--card-border)',
            borderRadius: '8px',
            fontSize: '10px',
            color: 'var(--foreground)'
          }}
          formatter={(v: any) => [formatCurrency(v), 'Corpus']}
          cursor={{ stroke: 'var(--primary-custom)', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Bar dataKey="Corpus" fill="var(--primary-custom)" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
      </BarChart>
    </ResponsiveContainer>
  );
}
