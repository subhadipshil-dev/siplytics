'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PortfolioChartProps {
  data: { name: string; value: number }[];
  colors: string[];
}

export default function PortfolioChart({ data, colors }: PortfolioChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
          contentStyle={{
            background: 'var(--background-secondary)',
            borderColor: 'var(--card-border)',
            borderRadius: '8px',
            fontSize: '11px',
            color: 'var(--foreground)'
          }}
          formatter={(v) => `${v}%`}
        />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={65}
          paddingAngle={3}
          dataKey="value"
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
