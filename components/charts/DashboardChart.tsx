'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardChartProps {
  data: { name: string; value: number; color: string }[];
  fmt: (v: number) => string;
}

export default function DashboardChart({ data, fmt }: DashboardChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
          contentStyle={{ background: 'var(--background-secondary)', borderColor: 'var(--card-border)', borderRadius: 8, fontSize: 11, color: 'var(--foreground)' }}
          formatter={(v: any) => [fmt(v), '']}
        />
        <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={4} dataKey="value" isAnimationActive={true} animationDuration={800} animationEasing="ease-out">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
