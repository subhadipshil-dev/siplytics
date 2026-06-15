'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SimulationDistChartProps {
  data: { bin: string; count: number }[];
}

export default function SimulationDistChart({ data }: SimulationDistChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" vertical={false} />
        <XAxis dataKey="bin" stroke="var(--text-muted)" fontSize={9} tickLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={9} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--background-secondary)',
            borderColor: 'var(--card-border)',
            borderRadius: '8px',
            fontSize: '11px',
            color: 'var(--foreground)'
          }}
          cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
        />
        <Bar dataKey="count" name="Frequency (Number of Runs)" fill="url(#colorMCBar)" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} animationEasing="ease-out">
          <defs>
            <linearGradient id="colorMCBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary-custom)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--primary-custom)" stopOpacity={0.2} />
            </linearGradient>
          </defs>
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
