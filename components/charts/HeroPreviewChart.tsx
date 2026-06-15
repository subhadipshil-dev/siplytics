'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface HeroPreviewChartProps {
  data: { name: string; Invested: number; Wealth: number }[];
  fmt: (v: number) => string;
}

export default function HeroPreviewChart({ data, fmt }: HeroPreviewChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="heroLandingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--primary-custom)" stopOpacity={0.28} />
            <stop offset="95%" stopColor="var(--primary-custom)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={9} tickLine={false} axisLine={false}
          tickFormatter={(v) => v >= 1e7 ? `${(v/1e7).toFixed(0)}Cr` : v >= 1e5 ? `${(v/1e5).toFixed(0)}L` : `${v/1000}K`}
        />
        <Tooltip
          contentStyle={{ background: 'var(--background-secondary)', borderColor: 'var(--card-border)', borderRadius: 10, fontSize: 12, fontFamily: 'Space Grotesk', color: 'var(--foreground)' }}
          formatter={(v: any) => [fmt(v), '']}
          cursor={{ stroke: 'var(--primary-custom)', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Area type="monotone" dataKey="Wealth" stroke="var(--primary-custom)" strokeWidth={2} fillOpacity={1} fill="url(#heroLandingGrad)" isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
