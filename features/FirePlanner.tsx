'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, Slider, Input, Select, Button, ProgressBar, AnimatedCounter } from '../components/ui';
import { Flame, ShieldAlert, Award, Landmark, Info, Calendar, Sparkles, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';

const FireChart = dynamic(() => import('../components/charts/FireChart'), { ssr: false });

export const FirePlanner: React.FC = () => {
  const { fireInputs, fireOutputs, updateFireInputs } = useFinanceStore();
  const [activeTab, setActiveTab] = useState<'chart' | 'milestones'>('chart');

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const chartData = fireOutputs.timelineBreakdown.map((item) => ({
    name: `Age ${item.age}`,
    'Invested Corpus': item.investedCorpus,
    'FIRE Target': item.fireTargetCorpus
  }));

  // Auxiliary FIRE Types calculations
  const annualExpenses = fireInputs.monthlyExpenses * 12;
  const leanFireTarget = annualExpenses * 20;
  const standardFireTarget = annualExpenses * fireInputs.fireMultiplier;
  const fatFireTarget = annualExpenses * 40;

  // Coast FIRE: target corpus / (1 + real_rate)^years
  const yearsToRetire = Math.max(0, 60 - fireInputs.currentAge);
  const realReturn = (1 + fireInputs.expectedReturn / 100) / (1 + fireInputs.inflationRate / 100) - 1;
  const coastFireTarget = realReturn > 0 
    ? standardFireTarget / Math.pow(1 + realReturn, yearsToRetire) 
    : standardFireTarget;

  const currentInvestments = fireInputs.currentSavings;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* LEFT: SLIDERS & PARAMETERS (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className="p-6">
          <h3 className="font-space font-bold text-lg text-white mb-6 flex items-center gap-2">
            <Flame className="text-red-500 animate-pulse" size={18} />
            FIRE Configurations
          </h3>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Current Age"
                type="number"
                min={18}
                max={80}
                value={fireInputs.currentAge}
                onChange={(e) => updateFireInputs({ currentAge: parseInt(e.target.value) || 30 })}
              />
              <Select
                label="FIRE Multiplier"
                value={fireInputs.fireMultiplier.toString()}
                onChange={(e) => updateFireInputs({ fireMultiplier: parseInt(e.target.value) || 25 })}
                options={[
                  { value: '20', label: '20x Expenses (Lean)' },
                  { value: '25', label: '25x Expenses (Standard)' },
                  { value: '33', label: '33x Expenses (Safe)' },
                  { value: '40', label: '40x Expenses (Fat)' },
                  { value: '50', label: '50x Expenses (Super-Safe)' }
                ]}
              />
            </div>

            <Slider
              label="Monthly Living Expenses (Today's Value)"
              min={10000}
              max={500000}
              step={5000}
              value={fireInputs.monthlyExpenses}
              onChange={(val) => updateFireInputs({ monthlyExpenses: val })}
              prefix="₹"
              tooltip="Your estimate of current monthly living costs."
            />

            <Slider
              label="Current Liquid Net Worth"
              min={0}
              max={50000000}
              step={50000}
              value={fireInputs.currentSavings}
              onChange={(val) => updateFireInputs({ currentSavings: val })}
              prefix="₹"
              tooltip="The value of your current liquid assets and investments."
            />

            <Slider
              label="Monthly Savings Contribution"
              min={1000}
              max={500000}
              step={1000}
              value={fireInputs.monthlyInvestment}
              onChange={(val) => updateFireInputs({ monthlyInvestment: val })}
              prefix="₹"
              tooltip="How much you save/invest specifically towards FIRE every month."
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
                label="Return Rate (%)"
                type="number"
                step="0.5"
                value={fireInputs.expectedReturn}
                onChange={(e) => updateFireInputs({ expectedReturn: parseFloat(e.target.value) || 0 })}
                suffix="%"
              />
              <Input
                label="Inflation Rate (%)"
                type="number"
                step="0.5"
                value={fireInputs.inflationRate}
                onChange={(e) => updateFireInputs({ inflationRate: parseFloat(e.target.value) || 0 })}
                suffix="%"
              />
            </div>
          </div>
        </Card>

        {/* Dynamic savings rate grade card */}
        <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 p-4 border border-red-500/10">
          <div className="flex gap-3 items-start text-xs leading-relaxed text-text-muted">
            <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-white">
              <span className="font-semibold text-white">
                FIRE Savings Rate: <AnimatedCounter value={fireOutputs.savingsRate} suffix="%" />
              </span>
              <span>
                {fireOutputs.savingsRate >= 50
                  ? 'Excellent savings rate! Saving over half your income dramatically accelerates your timeline by compounding assets far quicker than standard retirement models.'
                  : 'A standard savings rate. If you increase your savings rate to 50% by pruning discretionary spending, you could reduce your years-to-FIRE substantially.'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* RIGHT: RESULTS DISPLAY (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Core numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
            <span className="text-xs text-text-muted">FIRE Target (Today)</span>
            <span className="text-lg font-bold font-space text-white mt-1">
              <AnimatedCounter value={fireOutputs.fireNumber} formatter={formatCurrency} />
            </span>
          </div>
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
            <span className="text-xs text-text-muted">Required Future Corpus</span>
            <span className="text-lg font-bold font-space text-primary-custom mt-1">
              <AnimatedCounter value={fireOutputs.requiredCorpus} formatter={formatCurrency} />
            </span>
          </div>
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
            <span className="text-xs text-text-muted">Years to FIRE</span>
            <span className="text-lg font-bold font-space text-success-custom mt-1">
              {fireOutputs.yearsToFire < 50 ? (
                <>
                  <AnimatedCounter value={fireOutputs.yearsToFire} /> Years
                </>
              ) : '50+ Years'}
            </span>
          </div>
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
            <span className="text-xs text-text-muted">Target Age</span>
            <span className="text-lg font-bold font-space text-warning-custom mt-1">
              {fireOutputs.yearsToFire < 50 ? (
                <>
                  Age <AnimatedCounter value={fireOutputs.targetAge} />
                </>
              ) : 'Beyond 80'}
            </span>
          </div>
        </div>

        {/* Timeline Visualization Tabs */}
        <Card className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6 border-b border-card-border/60 pb-3">
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-card-border">
              <button
                onClick={() => setActiveTab('chart')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'chart' ? 'bg-slate-800 text-white shadow-sm' : 'text-text-muted hover:text-white'
                }`}
              >
                FIRE Timeline Chart
              </button>
              <button
                onClick={() => setActiveTab('milestones')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'milestones' ? 'bg-slate-800 text-white shadow-sm' : 'text-text-muted hover:text-white'
                }`}
              >
                FIRE Milestones
              </button>
            </div>
            <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider hidden sm:block">Timeline Projection</span>
          </div>

          {/* Tab 1: Timeline Area Chart */}
          {activeTab === 'chart' && (
            <div className="h-72 w-full">
              <FireChart data={chartData} formatCurrency={formatCurrency} />
            </div>
          )}

          {/* Tab 2: FIRE Milestones */}
          {activeTab === 'milestones' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-text-muted leading-relaxed">
                Reaching financial independence occurs in distinct stages. Check your progress towards each tier based on your current savings of <span className="font-semibold text-white"><AnimatedCounter value={currentInvestments} formatter={formatCurrency} /></span>:
              </p>

              <div className="flex flex-col gap-3">
                
                {/* Lean FIRE */}
                <div className="p-3 border border-card-border rounded-xl bg-white/[0.01]">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">Lean FIRE (20x Expenses)</span>
                      <span className="text-[10px] text-text-muted">For a minimalist lifestyle</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-primary-custom font-bold"><AnimatedCounter value={leanFireTarget} formatter={formatCurrency} /></span>
                      <p className="text-[10px] text-text-muted">
                        {currentInvestments >= leanFireTarget 
                          ? <span className="text-success-custom font-semibold">✓ Achieved!</span> 
                          : <>
                              <AnimatedCounter value={Math.min(100, Math.round((currentInvestments / leanFireTarget) * 100))} suffix="% complete" />
                            </>}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={Math.min(100, Math.round((currentInvestments / leanFireTarget) * 100))} color={currentInvestments >= leanFireTarget ? 'success' : 'primary'} />
                  </div>
                </div>

                {/* Standard FIRE */}
                <div className="p-3 border border-card-border rounded-xl bg-white/[0.01]">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">Standard FIRE ({fireInputs.fireMultiplier}x Expenses)</span>
                      <span className="text-[10px] text-text-muted">Your specified safety target</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-secondary-custom font-bold"><AnimatedCounter value={standardFireTarget} formatter={formatCurrency} /></span>
                      <p className="text-[10px] text-text-muted">
                        {currentInvestments >= standardFireTarget 
                          ? <span className="text-success-custom font-semibold">✓ Achieved!</span> 
                          : <>
                              <AnimatedCounter value={Math.min(100, Math.round((currentInvestments / standardFireTarget) * 100))} suffix="% complete" />
                            </>}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={Math.min(100, Math.round((currentInvestments / standardFireTarget) * 100))} color={currentInvestments >= standardFireTarget ? 'success' : 'secondary'} />
                  </div>
                </div>

                {/* Fat FIRE */}
                <div className="p-3 border border-card-border rounded-xl bg-white/[0.01]">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">Fat FIRE (40x Expenses)</span>
                      <span className="text-[10px] text-text-muted">For an abundant / luxury retirement</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-warning-custom font-bold"><AnimatedCounter value={fatFireTarget} formatter={formatCurrency} /></span>
                      <p className="text-[10px] text-text-muted">
                        {currentInvestments >= fatFireTarget 
                          ? <span className="text-success-custom font-semibold">✓ Achieved!</span> 
                          : <>
                              <AnimatedCounter value={Math.min(100, Math.round((currentInvestments / fatFireTarget) * 100))} suffix="% complete" />
                            </>}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={Math.min(100, Math.round((currentInvestments / fatFireTarget) * 100))} color={currentInvestments >= fatFireTarget ? 'success' : 'warning'} />
                  </div>
                </div>

                {/* Coast FIRE */}
                <div className="p-3 border border-card-border rounded-xl bg-white/[0.01]">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">Coast FIRE (Early Reserve)</span>
                      <span className="text-[10px] text-text-muted">Grow standard FIRE target passively by Age 60</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-white font-bold"><AnimatedCounter value={coastFireTarget} formatter={formatCurrency} /></span>
                      <p className="text-[10px] text-text-muted">
                        {currentInvestments >= coastFireTarget 
                          ? <span className="text-success-custom font-semibold">✓ Achieved!</span> 
                          : <>
                              <AnimatedCounter value={Math.min(100, Math.round((currentInvestments / coastFireTarget) * 100))} suffix="% complete" />
                            </>}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={Math.min(100, Math.round((currentInvestments / coastFireTarget) * 100))} color={currentInvestments >= coastFireTarget ? 'success' : 'primary'} />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Quick info note */}
          <div className="mt-4 border-t border-card-border/60 pt-3 text-[10px] text-text-muted leading-relaxed flex gap-1 items-start">
            <Info size={12} className="shrink-0 mt-0.5" />
            <span>Note: Early retirement calculations assume that you stop contributing immediately upon hitting standard FIRE targets, and that your assets continue compounding in a balanced portfolio during retirement.</span>
          </div>

        </Card>
      </div>

    </div>
  );
};
