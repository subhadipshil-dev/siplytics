'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FireChartProps {
  data: { name: string; 'Invested Corpus': number; 'FIRE Target': number }[];
  formatCurrency: (v: number) => string;
}

export default function FireChart({ data, formatCurrency }: FireChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorInvestedCorpus" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary-custom)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--primary-custom)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorTargetCorpus" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--secondary-custom)" stopOpacity={0.15} />
            <stop offset="95%" stopColor="var(--secondary-custom)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis
          stroke="var(--text-muted)"
          fontSize={11}
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
            borderRadius: '12px',
            fontSize: '12px',
            fontFamily: 'Space Grotesk',
            color: 'var(--foreground)'
          }}
          formatter={(value: any) => [formatCurrency(value), '']}
          cursor={{ stroke: 'var(--primary-custom)', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        <Area
          type="monotone"
          name="Invested Corpus"
          dataKey="Invested Corpus"
          stroke="var(--primary-custom)"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#colorInvestedCorpus)"
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        />
        <Area
          type="monotone"
          name="FIRE Target (Inflating)"
          dataKey="FIRE Target"
          stroke="var(--secondary-custom)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fillOpacity={1}
          fill="url(#colorTargetCorpus)"
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
