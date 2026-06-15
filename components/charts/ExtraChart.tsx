'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExtraChartProps {
  data: { year: number; assets: number; liabilities: number; netWorth: number }[];
  formatCurrency: (v: number) => string;
}

export default function ExtraChart({ data, formatCurrency }: ExtraChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" vertical={false} />
        <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={10} tickLine={false} tickFormatter={(v) => `Yr ${v}`} />
        <YAxis
          stroke="var(--text-muted)"
          fontSize={10}
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
            fontSize: '11px',
            color: 'var(--foreground)'
          }}
          formatter={(v: any) => formatCurrency(v)}
          cursor={{ stroke: 'var(--primary-custom)', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Legend wrapperStyle={{ fontSize: '10px' }} />
        <Bar dataKey="assets" name="Total Assets" fill="var(--primary-custom)" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
        <Bar dataKey="liabilities" name="Liabilities" fill="var(--danger-custom)" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
        <Bar dataKey="netWorth" name="Net Worth" fill="var(--secondary-custom)" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
      </BarChart>
    </ResponsiveContainer>
  );
}
