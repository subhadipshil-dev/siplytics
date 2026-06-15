'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, Slider, Input, Select, Button } from '../components/ui';
import { calculateSip } from '../utils/finance';
import {
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  Coins,
  ShieldCheck,
  Zap,
  Info,
  ChevronDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const SipCalculator: React.FC = () => {
  const { sipInputs, sipOutputs, updateSipInputs } = useFinanceStore();
  const [activeSubTab, setActiveSubTab] = useState<'chart' | 'table' | 'stepup'>('chart');

  // Format currency helper
  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Step-up comparisons calculator
  const stepUpScenarios = [
    { label: 'Regular SIP (0%)', percent: 0 },
    { label: '5% Step-Up', percent: 5 },
    { label: '10% Step-Up', percent: 10 },
    { label: '15% Step-Up', percent: 15 },
    { label: '20% Step-Up', percent: 20 }
  ].map((sc) => {
    const scOutputs = calculateSip({ ...sipInputs, stepUpPercent: sc.percent });
    const diff = scOutputs.finalCorpus - sipOutputs.finalCorpus;
    const diffFromFlat = sc.percent === 0 ? 0 : scOutputs.finalCorpus - calculateSip({ ...sipInputs, stepUpPercent: 0 }).finalCorpus;
    return {
      percent: sc.percent,
      label: sc.label,
      finalCorpus: scOutputs.finalCorpus,
      invested: scOutputs.totalInvested,
      diffFromFlat
    };
  });

  const chartData = sipOutputs.yearlyBreakdown.map((item) => ({
    name: `Year ${item.year}`,
    Invested: item.investedAmount,
    Returns: item.returnsEarned,
    Wealth: item.futureValue,
    'Real Wealth': Math.round(item.inflationAdjustedValue)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* LEFT PANEL: SLIDERS & CONFIGS (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className="p-6">
          <h3 className="font-space font-bold text-lg text-white mb-6 flex items-center gap-2">
            <Layers className="text-primary-custom" size={18} />
            SIP Settings
          </h3>

          <div className="flex flex-col gap-2">
            <Slider
              label="Monthly Investment"
              min={1000}
              max={250000}
              step={1000}
              value={sipInputs.monthlySip}
              onChange={(val) => updateSipInputs({ monthlySip: val })}
              prefix="₹"
              tooltip="The amount you plan to invest every month."
            />

            <Slider
              label="One-time (Lumpsum) Initial"
              min={0}
              max={5000000}
              step={10000}
              value={sipInputs.lumpsum}
              onChange={(val) => updateSipInputs({ lumpsum: val })}
              prefix="₹"
              tooltip="An optional initial sum added at month zero."
            />

            <Slider
              label="Expected Annual Return"
              min={1}
              max={30}
              step={0.5}
              value={sipInputs.expectedReturn}
              onChange={(val) => updateSipInputs({ expectedReturn: val })}
              suffix="%"
              tooltip="Expected compound rate of return per annum."
            />

            <Slider
              label="Duration"
              min={1}
              max={40}
              value={sipInputs.durationYears}
              onChange={(val) => updateSipInputs({ durationYears: val })}
              suffix=" Years"
              tooltip="The length of time you plan to stay invested."
            />

            <Slider
              label="Annual Step-Up"
              min={0}
              max={30}
              step={1}
              value={sipInputs.stepUpPercent}
              onChange={(val) => updateSipInputs({ stepUpPercent: val })}
              suffix="%"
              tooltip="The percentage by which you'll increase your monthly SIP contribution each year."
            />
          </div>

          {/* ADVANCED ADVANCED SETTINGS ACCORDION */}
          <div className="mt-6 border-t border-card-border/60 pt-4 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold text-text-muted mb-1">
              <span>Advanced Fee & Tax Assumptions</span>
              <span className="text-primary-custom/75">Options active</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Inflation Rate (%)"
                type="number"
                step="0.5"
                value={sipInputs.inflationRate}
                onChange={(e) => updateSipInputs({ inflationRate: parseFloat(e.target.value) || 0 })}
                suffix="%"
              />
              <Input
                label="Expense Ratio (%)"
                type="number"
                step="0.05"
                value={sipInputs.expenseRatio}
                onChange={(e) => updateSipInputs({ expenseRatio: parseFloat(e.target.value) || 0 })}
                suffix="%"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Capital Gains Tax (%)"
                type="number"
                step="0.5"
                value={sipInputs.taxRate}
                onChange={(e) => updateSipInputs({ taxRate: parseFloat(e.target.value) || 0 })}
                suffix="%"
              />
              <Input
                label="Exit Load (%)"
                type="number"
                step="0.1"
                value={sipInputs.exitLoad}
                onChange={(e) => updateSipInputs({ exitLoad: parseFloat(e.target.value) || 0 })}
                suffix="%"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Risk Profile"
                value={sipInputs.riskProfile}
                onChange={(e) => updateSipInputs({ riskProfile: e.target.value as any })}
                options={[
                  { value: 'low', label: 'Conservative (Low)' },
                  { value: 'moderate', label: 'Balanced (Moderate)' },
                  { value: 'high', label: 'Growth (High)' },
                  { value: 'extreme', label: 'Aggressive (Extreme)' }
                ]}
              />
              <Select
                label="Goal Category"
                value={sipInputs.goalType}
                onChange={(e) => updateSipInputs({ goalType: e.target.value as any })}
                options={[
                  { value: 'retirement', label: 'Retirement' },
                  { value: 'house', label: 'Real Estate' },
                  { value: 'car', label: 'Vehicle Purchase' },
                  { value: 'education', label: 'Child Education' },
                  { value: 'marriage', label: 'Wedding' },
                  { value: 'vacation', label: 'Travel & Leisure' },
                  { value: 'fire', label: 'Financial Freedom' },
                  { value: 'custom', label: 'Other/Custom' }
                ]}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* RIGHT PANEL: METRICS & VISUAL RESULTS (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Core Calculation Output Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
            <span className="text-xs text-text-muted">Total Invested</span>
            <span className="text-lg font-bold font-space text-white mt-1">
              {formatCurrency(sipOutputs.totalInvested)}
            </span>
          </div>
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
            <span className="text-xs text-text-muted">Est. Returns</span>
            <span className="text-lg font-bold font-space text-success-custom mt-1">
              {formatCurrency(sipOutputs.totalReturns)}
            </span>
          </div>
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
            <span className="text-xs text-text-muted">Future Corpus</span>
            <span className="text-lg font-bold font-space text-primary-custom mt-1">
              {formatCurrency(sipOutputs.finalCorpus)}
            </span>
          </div>
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
            <span className="text-xs text-text-muted">Real Corpus (Net)</span>
            <span className="text-lg font-bold font-space text-warning-custom mt-1">
              {formatCurrency(sipOutputs.realCorpus)}
            </span>
          </div>
        </div>

        {/* Dynamic Display Sub-Tabs */}
        <Card className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6 border-b border-card-border/60 pb-3">
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-card-border">
              <button
                onClick={() => setActiveSubTab('chart')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSubTab === 'chart' ? 'bg-slate-800 text-white shadow-sm' : 'text-text-muted hover:text-white'
                }`}
              >
                Growth Chart
              </button>
              <button
                onClick={() => setActiveSubTab('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSubTab === 'table' ? 'bg-slate-800 text-white shadow-sm' : 'text-text-muted hover:text-white'
                }`}
              >
                Yearly Ledger
              </button>
              <button
                onClick={() => setActiveSubTab('stepup')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSubTab === 'stepup' ? 'bg-slate-800 text-white shadow-sm' : 'text-text-muted hover:text-white'
                }`}
              >
                Step-Up Uplift
              </button>
            </div>
            <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider hidden sm:block">Compounding projection</span>
          </div>

          {/* Sub-Tab 1: Area Chart */}
          {activeSubTab === 'chart' && (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--secondary-custom)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--secondary-custom)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-custom)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary-custom)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
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
                      background: 'rgba(5, 8, 22, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontFamily: 'Space Grotesk'
                    }}
                    formatter={(value: any) => [formatCurrency(value), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
                  <Area
                    type="monotone"
                    name="Total Invested"
                    dataKey="Invested"
                    stroke="var(--secondary-custom)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInvested)"
                  />
                  <Area
                    type="monotone"
                    name="Future Corpus"
                    dataKey="Wealth"
                    stroke="var(--primary-custom)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorWealth)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Sub-Tab 2: Yearly Table */}
          {activeSubTab === 'table' && (
            <div className="max-h-72 overflow-y-auto w-full border border-card-border/60 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900/60 sticky top-0 border-b border-card-border text-text-muted font-space">
                  <tr>
                    <th className="py-2.5 px-4">Year</th>
                    <th className="py-2.5 px-4 text-right">Invested</th>
                    <th className="py-2.5 px-4 text-right">Returns</th>
                    <th className="py-2.5 px-4 text-right">Corpus</th>
                    <th className="py-2.5 px-4 text-right">Inf. Adj</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/40 font-mono">
                  {sipOutputs.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 px-4 font-sans font-semibold text-white">Year {row.year}</td>
                      <td className="py-2 px-4 text-right">{row.investedAmount.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right text-success-custom">+{row.returnsEarned.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right text-primary-custom font-semibold">{row.futureValue.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right text-warning-custom">{Math.round(row.inflationAdjustedValue).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sub-Tab 3: Step-Up Comparer */}
          {activeSubTab === 'stepup' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-text-muted leading-relaxed">
                Step-up SIP increases your monthly contribution annually. This compounding amplifier drastically inflates your end wealth without requiring massive initial commitments.
              </p>
              
              <div className="flex flex-col gap-2.5">
                {stepUpScenarios.map((sc, i) => {
                  const percentOfFlat = sc.percent === 0 ? 100 : Math.round((sc.finalCorpus / stepUpScenarios[0].finalCorpus) * 100);
                  return (
                    <div key={i} className="flex flex-col gap-1 border border-card-border/40 p-3 rounded-xl bg-white/[0.01]">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white">{sc.label}</span>
                        <span className="font-mono text-primary-custom font-bold">{formatCurrency(sc.finalCorpus)}</span>
                      </div>
                      
                      {/* Visual scale comparison */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5 relative">
                        <div
                          className="h-full bg-gradient-to-r from-primary-custom to-secondary-custom rounded-full"
                          style={{ width: `${Math.min(100, (sc.finalCorpus / stepUpScenarios[stepUpScenarios.length - 1].finalCorpus) * 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-text-muted mt-1">
                        <span>Invested: {formatCurrency(sc.invested)}</span>
                        {sc.diffFromFlat > 0 && (
                          <span className="text-success-custom font-semibold">
                            +{formatCurrency(sc.diffFromFlat)} Extra Wealth
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Core score cards */}
          <div className="grid grid-cols-3 gap-4 border-t border-card-border/60 pt-4 mt-4 text-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Compounding Power</span>
              <span className="text-sm font-bold text-white mt-0.5">{sipOutputs.compoundingScore}/100</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Efficiency score</span>
              <span className="text-sm font-bold text-success-custom mt-0.5">{sipOutputs.investmentEfficiencyScore}/100</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Wealth Multiplier</span>
              <span className="text-sm font-bold text-primary-custom mt-0.5">{sipOutputs.wealthMultiplier}x</span>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};
