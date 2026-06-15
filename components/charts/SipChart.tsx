'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SipChartProps {
  data: { name: string; Invested: number; Returns: number; Corpus: number }[];
  fmt: (v: number) => string;
  yAxisFormatter: (v: number) => string;
  tooltipStyle: React.CSSProperties;
}

export default function SipChart({ data, fmt, yAxisFormatter, tooltipStyle }: SipChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--secondary-custom)" stopOpacity={0.22} />
            <stop offset="95%" stopColor="var(--secondary-custom)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gWlth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--primary-custom)" stopOpacity={0.28} />
            <stop offset="95%" stopColor="var(--primary-custom)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={yAxisFormatter} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [fmt(v), '']} cursor={{ stroke: 'var(--primary-custom)', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
        <Area type="monotone" name="Total Invested" dataKey="Invested" stroke="var(--secondary-custom)" strokeWidth={2} fillOpacity={1} fill="url(#gInv)" isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
        <Area type="monotone" name="Future Corpus"  dataKey="Corpus"   stroke="var(--primary-custom)"   strokeWidth={2} fillOpacity={1} fill="url(#gWlth)" isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
