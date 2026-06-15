'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GoalChartProps {
  data: { name: string; Target: number; Savings: number }[];
  fmt: (v: number) => string;
  tooltipStyle: React.CSSProperties;
}

export default function GoalChart({ data, fmt, tooltipStyle }: GoalChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false}
          tickFormatter={(v) => v >= 1e7 ? `${(v / 1e7).toFixed(0)}Cr` : v >= 1e5 ? `${(v / 1e5).toFixed(0)}L` : `${v / 1000}K`}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [fmt(v), '']} cursor={{ stroke: 'var(--primary-custom)', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
        <Bar dataKey="Savings" name="Current Fund"  fill="var(--secondary-custom)" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
        <Bar dataKey="Target"  name="Target Amount" fill="var(--primary-custom)"   radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
      </BarChart>
    </ResponsiveContainer>
  );
}
