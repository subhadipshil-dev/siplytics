'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, Slider, Input, Select, Button } from '../components/ui';
import { calculateSip } from '../utils/finance';
import { Layers } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const TOOLTIP_STYLE = {
  background: 'var(--background-secondary)',
  borderColor: 'var(--card-border)',
  borderRadius: 10,
  fontSize: 12,
  fontFamily: 'Space Grotesk',
  color: 'var(--foreground)',
};

export const SipCalculator: React.FC = () => {
  const { sipInputs, sipOutputs, updateSipInputs } = useFinanceStore();
  const [tab, setTab] = useState<'chart' | 'table' | 'stepup'>('chart');

  const fmt = (v: number) => v >= 1e7 ? `₹${(v / 1e7).toFixed(2)} Cr` : v >= 1e5 ? `₹${(v / 1e5).toFixed(2)} L` : `₹${v.toLocaleString('en-IN')}`;
  const yAxis = (v: number) => v >= 1e7 ? `₹${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `₹${(v / 1e5).toFixed(0)}L` : `₹${v / 1000}K`;

  const stepUpScenarios = [0, 5, 10, 15, 20].map((pct) => {
    const out = calculateSip({ ...sipInputs, stepUpPercent: pct });
    const flat = calculateSip({ ...sipInputs, stepUpPercent: 0 }).finalCorpus;
    return { label: pct === 0 ? 'Regular SIP (0%)' : `${pct}% Step-Up`, pct, finalCorpus: out.finalCorpus, invested: out.totalInvested, extra: pct > 0 ? out.finalCorpus - flat : 0 };
  });

  const chartData = sipOutputs.yearlyBreakdown.map((r) => ({
    name: `Y${r.year}`, Invested: r.investedAmount, Returns: r.returnsEarned, Corpus: r.futureValue,
  }));

  const tabs = [
    { id: 'chart' as const,  label: 'Growth Chart' },
    { id: 'table' as const,  label: 'Yearly Ledger' },
    { id: 'stepup' as const, label: 'Step-Up Uplift' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 select-none">

      {/* ── LEFT: SETTINGS ── */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className="p-6">
          <h3 className="font-space font-bold text-base text-[var(--foreground)] mb-5 flex items-center gap-2">
            <Layers className="text-[var(--primary-custom)]" size={17} />
            SIP Settings
          </h3>

          <Slider label="Monthly Investment"       min={1000}    max={250000} step={1000}  value={sipInputs.monthlySip}      onChange={(v) => updateSipInputs({ monthlySip: v })}      prefix="₹"  tooltip="Amount you invest every month." />
          <Slider label="One-time Lumpsum"          min={0}       max={5000000} step={10000} value={sipInputs.lumpsum}          onChange={(v) => updateSipInputs({ lumpsum: v })}          prefix="₹"  tooltip="Optional initial sum at month zero." />
          <Slider label="Expected Annual Return"    min={1}       max={30}      step={0.5}  value={sipInputs.expectedReturn}  onChange={(v) => updateSipInputs({ expectedReturn: v })}  suffix="%"  tooltip="Expected compound annual rate of return." />
          <Slider label="Duration"                  min={1}       max={40}                  value={sipInputs.durationYears}   onChange={(v) => updateSipInputs({ durationYears: v })}   suffix=" Yrs" />
          <Slider label="Annual Step-Up"            min={0}       max={30}                  value={sipInputs.stepUpPercent}   onChange={(v) => updateSipInputs({ stepUpPercent: v })}   suffix="%" tooltip="Increase SIP contribution by this % each year." />

          <div className="mt-5 border-t border-[var(--card-border)] pt-4 flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">Advanced Settings</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Inflation (%)"    type="number" step="0.5"  value={sipInputs.inflationRate}  onChange={(e) => updateSipInputs({ inflationRate: parseFloat(e.target.value) || 0 })}  suffix="%" />
              <Input label="Expense Ratio (%)" type="number" step="0.05" value={sipInputs.expenseRatio}   onChange={(e) => updateSipInputs({ expenseRatio: parseFloat(e.target.value) || 0 })}   suffix="%" />
              <Input label="Capital Gains (%)" type="number" step="0.5"  value={sipInputs.taxRate}        onChange={(e) => updateSipInputs({ taxRate: parseFloat(e.target.value) || 0 })}        suffix="%" />
              <Input label="Exit Load (%)"     type="number" step="0.1"  value={sipInputs.exitLoad}       onChange={(e) => updateSipInputs({ exitLoad: parseFloat(e.target.value) || 0 })}       suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Risk Profile" value={sipInputs.riskProfile} onChange={(e) => updateSipInputs({ riskProfile: e.target.value as any })}
                options={[{ value: 'low', label: 'Conservative' }, { value: 'moderate', label: 'Balanced' }, { value: 'high', label: 'Growth' }, { value: 'extreme', label: 'Aggressive' }]} />
              <Select label="Goal Category" value={sipInputs.goalType} onChange={(e) => updateSipInputs({ goalType: e.target.value as any })}
                options={[{ value: 'retirement', label: 'Retirement' }, { value: 'house', label: 'Real Estate' }, { value: 'car', label: 'Vehicle' }, { value: 'education', label: 'Education' }, { value: 'marriage', label: 'Wedding' }, { value: 'fire', label: 'FIRE' }, { value: 'custom', label: 'Custom' }]} />
            </div>
          </div>
        </Card>
      </div>

      {/* ── RIGHT: OUTPUT ── */}
      <div className="lg:col-span-7 flex flex-col gap-5">

        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Invested', val: fmt(sipOutputs.totalInvested),           color: 'var(--secondary-custom)' },
            { label: 'Est. Returns',   val: fmt(sipOutputs.totalReturns),             color: 'var(--success-custom)' },
            { label: 'Future Corpus',  val: fmt(sipOutputs.finalCorpus),              color: 'var(--primary-custom)' },
            { label: 'Real Corpus',    val: fmt(sipOutputs.realCorpus),               color: 'var(--warning-custom)' },
          ].map((k, i) => (
            <div key={i} className="glass-premium rounded-2xl p-4 flex flex-col gap-0.5">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-medium">{k.label}</span>
              <span className="text-base font-bold font-space mt-0.5" style={{ color: k.color }}>{k.val}</span>
            </div>
          ))}
        </div>

        {/* Chart / Table / Step-up tabs */}
        <Card className="flex-1 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5 border-b border-[var(--card-border)] pb-4">
            <div className="flex gap-1 bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--card-border)]">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    tab === t.id
                      ? 'bg-[var(--primary-custom)] text-black shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-[var(--text-subtle)] font-mono uppercase tracking-wider hidden sm:block">
              Compounding Projection
            </span>
          </div>

          {/* Growth Chart */}
          {tab === 'chart' && (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
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
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={yAxis} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [fmt(v), '']} />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
                  <Area type="monotone" name="Total Invested" dataKey="Invested" stroke="var(--secondary-custom)" strokeWidth={2} fillOpacity={1} fill="url(#gInv)" />
                  <Area type="monotone" name="Future Corpus"  dataKey="Corpus"   stroke="var(--primary-custom)"   strokeWidth={2} fillOpacity={1} fill="url(#gWlth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Yearly Table */}
          {tab === 'table' && (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-[var(--card-border)]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-[var(--background-secondary)] border-b border-[var(--card-border)]">
                  <tr>
                    {['Year', 'Invested', 'Returns', 'Corpus', 'Inf. Adj.'].map((h) => (
                      <th key={h} className="py-2.5 px-4 text-[var(--text-muted)] font-semibold uppercase tracking-wide text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sipOutputs.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="border-b border-[var(--card-border)] hover:bg-[var(--card-bg-hover)] transition-colors">
                      <td className="py-2 px-4 font-sans font-semibold text-[var(--foreground)]">Year {row.year}</td>
                      <td className="py-2 px-4 font-mono text-[var(--text-muted)]">{row.investedAmount.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 font-mono text-[var(--success-custom)]">+{row.returnsEarned.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 font-mono text-[var(--primary-custom)] font-semibold">{row.futureValue.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 font-mono text-[var(--warning-custom)]">{Math.round(row.inflationAdjustedValue).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Step-Up Comparer */}
          {tab === 'stepup' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Step-up SIP increases your monthly contribution each year, dramatically amplifying final wealth without huge initial commitments.
              </p>
              {stepUpScenarios.map((sc, i) => {
                const maxCorpus = stepUpScenarios[stepUpScenarios.length - 1].finalCorpus;
                const barWidth = (sc.finalCorpus / maxCorpus) * 100;
                return (
                  <div key={i} className="flex flex-col gap-1.5 border border-[var(--card-border)] p-3.5 rounded-xl bg-[var(--card-bg)]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[var(--foreground)]">{sc.label}</span>
                      <span className="font-mono text-[var(--primary-custom)] font-bold">{fmt(sc.finalCorpus)}</span>
                    </div>
                    <div className="w-full bg-[var(--input-border)] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[var(--primary-custom)] to-[var(--secondary-custom)] rounded-full transition-all duration-700" style={{ width: `${barWidth}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-subtle)]">
                      <span>Invested: {fmt(sc.invested)}</span>
                      {sc.extra > 0 && <span className="text-[var(--success-custom)] font-semibold">+{fmt(sc.extra)} extra</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Score footer */}
          <div className="grid grid-cols-3 gap-4 border-t border-[var(--card-border)] pt-4 mt-5 text-center">
            {[
              { label: 'Compounding Power', val: `${sipOutputs.compoundingScore}/100`,         color: 'var(--foreground)' },
              { label: 'Efficiency Score',  val: `${sipOutputs.investmentEfficiencyScore}/100`, color: 'var(--success-custom)' },
              { label: 'Wealth Multiplier', val: `${sipOutputs.wealthMultiplier}×`,             color: 'var(--primary-custom)' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[9px] text-[var(--text-subtle)] uppercase font-semibold tracking-wide">{s.label}</span>
                <span className="text-sm font-bold mt-0.5" style={{ color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
