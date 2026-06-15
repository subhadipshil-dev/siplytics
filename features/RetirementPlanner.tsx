'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, Slider, Input, AnimatedCounter } from '../components/ui';
import {
  TrendingUp,
  Award,
  ChevronDown,
  Info,
  Calendar,
  Layers,
  HeartHandshake
} from 'lucide-react';
import dynamic from 'next/dynamic';

const RetirementChart = dynamic(() => import('../components/charts/RetirementChart'), { ssr: false });

export const RetirementPlanner: React.FC = () => {
  const { retirementInputs, retirementOutputs, updateRetirementInputs } = useFinanceStore();
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const chartData = retirementOutputs.yearlyProjection.map((item) => ({
    name: `Age ${item.age}`,
    Corpus: item.corpus,
    Withdrawals: item.withdrawals,
    Contributions: item.contributions
  }));

  const isUnderfunded = retirementOutputs.projectedCorpusAtRetirement < retirementOutputs.requiredRetirementCorpus;
  const deficit = Math.max(0, retirementOutputs.requiredRetirementCorpus - retirementOutputs.projectedCorpusAtRetirement);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* LEFT: SLIDERS & PARAMETERS (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className="p-6">
          <h3 className="font-space font-bold text-lg text-white mb-6 flex items-center gap-2">
            <HeartHandshake className="text-primary-custom" size={18} />
            Retirement Setup
          </h3>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Current Age"
                type="number"
                min={18}
                max={retirementInputs.retirementAge - 1}
                value={retirementInputs.currentAge}
                onChange={(e) => updateRetirementInputs({ currentAge: parseInt(e.target.value) || 30 })}
              />
              <Input
                label="Retirement Age"
                type="number"
                min={retirementInputs.currentAge + 1}
                max={90}
                value={retirementInputs.retirementAge}
                onChange={(e) => updateRetirementInputs({ retirementAge: parseInt(e.target.value) || 60 })}
              />
            </div>

            <Slider
              label="Life Expectancy"
              min={Math.max(80, retirementInputs.retirementAge + 1)}
              max={110}
              value={retirementInputs.lifeExpectancy}
              onChange={(val) => updateRetirementInputs({ lifeExpectancy: val })}
              suffix=" Years"
            />

            <Slider
              label="Desired Monthly Expenses (Today's Value)"
              min={10000}
              max={1000000}
              step={5000}
              value={retirementInputs.monthlyExpensesPostRetirement}
              onChange={(val) => updateRetirementInputs({ monthlyExpensesPostRetirement: val })}
              prefix="₹"
            />

            <Slider
              label="Current Retirement Savings"
              min={0}
              max={50000000}
              step={50000}
              value={retirementInputs.currentSavings}
              onChange={(val) => updateRetirementInputs({ currentSavings: val })}
              prefix="₹"
            />

            <Slider
              label="Monthly Retirement Investment"
              min={1000}
              max={500000}
              step={1000}
              value={retirementInputs.monthlyInvestment}
              onChange={(val) => updateRetirementInputs({ monthlyInvestment: val })}
              prefix="₹"
            />
          </div>

          {/* ADVANCED ADVANCED SETTINGS ACCORDION */}
          <div className="mt-6 border-t border-card-border/60 pt-4 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold text-text-muted mb-1">
              <span>Financial Yield & Inflation Setup</span>
              <span className="text-primary-custom/75">Active</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Pre-Ret Return (%)"
                type="number"
                step="0.5"
                value={retirementInputs.expectedReturnPreRetirement}
                onChange={(e) => updateRetirementInputs({ expectedReturnPreRetirement: parseFloat(e.target.value) || 0 })}
                suffix="%"
              />
              <Input
                label="Post-Ret Return (%)"
                type="number"
                step="0.5"
                value={retirementInputs.expectedReturnPostRetirement}
                onChange={(e) => updateRetirementInputs({ expectedReturnPostRetirement: parseFloat(e.target.value) || 0 })}
                suffix="%"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Inflation Rate (%)"
                type="number"
                step="0.5"
                value={retirementInputs.inflationRate}
                onChange={(e) => updateRetirementInputs({ inflationRate: parseFloat(e.target.value) || 0 })}
                suffix="%"
              />
              <div className="flex flex-col gap-1 w-full my-2">
                <span className="text-xs font-semibold text-text-muted">Annuity Phase Type</span>
                <span className="text-xs bg-slate-900/40 border border-card-border text-white rounded-xl py-2.5 px-3 font-semibold text-center select-none cursor-default mt-1">
                  Inflation-Adjusted
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* RIGHT: RESULTS DISPLAY (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Core numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
            <span className="text-xs text-text-muted">Target Corpus</span>
            <span className="text-lg font-bold font-space text-white mt-1">
              <AnimatedCounter value={retirementOutputs.requiredRetirementCorpus} formatter={formatCurrency} />
            </span>
          </div>
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
            <span className="text-xs text-text-muted">Projected Corpus</span>
            <span className="text-lg font-bold font-space text-primary-custom mt-1">
              <AnimatedCounter value={retirementOutputs.projectedCorpusAtRetirement} formatter={formatCurrency} />
            </span>
          </div>
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
            <span className="text-xs text-text-muted">Safe Withdrawal/mo</span>
            <span className="text-lg font-bold font-space text-success-custom mt-1">
              <AnimatedCounter value={retirementOutputs.safeWithdrawalAmount} formatter={formatCurrency} />
            </span>
          </div>
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
            <span className="text-xs text-text-muted">Readiness Score</span>
            <span className="text-lg font-bold font-space text-warning-custom mt-1">
              <AnimatedCounter value={retirementOutputs.retirementReadinessScore} suffix="%" />
            </span>
          </div>
        </div>

        {/* Dynamic Alert card based on readiness */}
        {isUnderfunded ? (
          <div className="p-4 rounded-xl bg-danger-custom/10 border border-danger-custom/20 text-xs flex items-center justify-between text-white">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold flex items-center gap-1.5">
                <Info size={12} className="text-danger-custom" />
                Retirement Funding Deficit
              </span>
              <span>
                Your projected wealth falls short of the target by <span className="font-bold text-danger-custom"><AnimatedCounter value={deficit} formatter={formatCurrency} /></span>. Consider increasing monthly investments by ₹3,500 or delaying retirement by 3 years to close this gap.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-success-custom/10 border border-success-custom/20 text-xs flex items-center justify-between text-white">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold flex items-center gap-1.5">
                <Award size={12} className="text-success-custom" />
                Retirement Fully Funded!
              </span>
              <span>
                Congratulations! Your projected corpus exceeds the required fund by <span className="font-bold text-success-custom"><AnimatedCounter value={-deficit} formatter={formatCurrency} /></span>. You have a highly secure retirement path.
              </span>
            </div>
          </div>
        )}

        {/* Projection Visualization Tabs */}
        <Card className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6 border-b border-card-border/60 pb-3">
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-card-border">
              <button
                onClick={() => setActiveTab('chart')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'chart' ? 'bg-slate-800 text-white shadow-sm' : 'text-text-muted hover:text-white'
                }`}
              >
                Wealth Timeline
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'table' ? 'bg-slate-800 text-white shadow-sm' : 'text-text-muted hover:text-white'
                }`}
              >
                Projection Table
              </button>
            </div>
            <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider hidden sm:block">Accumulation & Decumulation</span>
          </div>

          {/* Tab 1: Accumulation & Drawdown Area Chart */}
          {activeTab === 'chart' && (
            <div className="h-72 w-full">
              <RetirementChart data={chartData} formatCurrency={formatCurrency} />
            </div>
          )}

          {/* Tab 2: Ledger Table */}
          {activeTab === 'table' && (
            <div className="max-h-72 overflow-y-auto w-full border border-card-border/60 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900/60 sticky top-0 border-b border-card-border text-text-muted font-space">
                  <tr>
                    <th className="py-2.5 px-4">Age</th>
                    <th className="py-2.5 px-4">Phase</th>
                    <th className="py-2.5 px-4 text-right">Contributions</th>
                    <th className="py-2.5 px-4 text-right">Withdrawals</th>
                    <th className="py-2.5 px-4 text-right">End Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/40 font-mono">
                  {retirementOutputs.yearlyProjection.map((row) => (
                    <tr key={row.year} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 px-4 font-sans font-semibold text-white">Age {row.age}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-0.5 text-[9px] font-semibold uppercase rounded
                          ${row.isRetired ? 'bg-danger-custom/10 text-danger-custom border border-danger-custom/10' : 'bg-success-custom/10 text-success-custom border border-success-custom/10'}`}
                        >
                          {row.isRetired ? 'Retired' : 'Working'}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right text-success-custom">
                        {row.contributions > 0 ? `+${row.contributions.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-2 px-4 text-right text-danger-custom">
                        {row.withdrawals > 0 ? `-${row.withdrawals.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-2 px-4 text-right text-primary-custom font-semibold">
                        {row.corpus.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick info note */}
          <div className="mt-4 border-t border-card-border/60 pt-3 text-[10px] text-text-muted leading-relaxed flex gap-1 items-start">
            <Info size={12} className="shrink-0 mt-0.5" />
            <span>Note: This model uses a dynamic growing annuity calculation. It assumes that post-retirement withdrawals are inflation-adjusted, meaning your withdrawals will increase by {retirementInputs.inflationRate}% every year to maintain purchasing power.</span>
          </div>

        </Card>
      </div>

    </div>
  );
};
