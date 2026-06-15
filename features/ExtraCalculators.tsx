'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, Slider, Input, Select, Button, ProgressBar } from '../components/ui';
import { Coins, Landmark, ShieldCheck, FileText, ArrowRight, Info, PlusCircle, HelpCircle, Sparkles, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const ExtraCalculators: React.FC = () => {
  const {
    netWorthInputs,
    netWorthOutputs,
    updateNetWorthInputs,
    emergencyInputs,
    emergencyOutputs,
    updateEmergencyInputs,
    passiveIncomeInputs,
    passiveIncomeOutputs,
    updatePassiveIncomeInputs,
    taxInputs,
    taxOutputs,
    updateTaxInputs
  } = useFinanceStore();

  const [activeSubTab, setActiveSubTab] = useState<'networth' | 'emergency' | 'passive' | 'tax'>('networth');

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* LEFT SIDEBAR NAVIGATION: CHOOSE CALCULATOR (3 cols) */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <Card className="p-5 flex flex-col gap-3">
          <h3 className="font-space font-bold text-base text-white flex items-center gap-1.5">
            <Coins className="text-primary-custom" size={16} />
            Secondary Calculators
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Analyze specialized aspects of your finances: from emergency planning and net worth trends to tax loads.
          </p>

          <div className="flex flex-col gap-2 border-t border-card-border/60 pt-3 mt-1">
            <button
              onClick={() => setActiveSubTab('networth')}
              className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'networth'
                  ? 'bg-gradient-to-r from-primary-custom/10 to-transparent text-primary-custom border-l-2 border-primary-custom'
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              Net Worth Tracker
            </button>
            <button
              onClick={() => setActiveSubTab('emergency')}
              className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'emergency'
                  ? 'bg-gradient-to-r from-primary-custom/10 to-transparent text-primary-custom border-l-2 border-primary-custom'
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              Emergency Reserve
            </button>
            <button
              onClick={() => setActiveSubTab('passive')}
              className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'passive'
                  ? 'bg-gradient-to-r from-primary-custom/10 to-transparent text-primary-custom border-l-2 border-primary-custom'
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              Passive Income Solver
            </button>
            <button
              onClick={() => setActiveSubTab('tax')}
              className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'tax'
                  ? 'bg-gradient-to-r from-primary-custom/10 to-transparent text-primary-custom border-l-2 border-primary-custom'
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              Capital Gains Tax
            </button>
          </div>
        </Card>
      </div>

      {/* RIGHT DISPLAY PANEL (9 cols) */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        
        {/* SUB TAB 1: NET WORTH TRACKER */}
        {activeSubTab === 'networth' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <Card className="md:col-span-5 p-5">
              <h4 className="font-space font-bold text-sm text-white mb-4">Assets & Debt Inputs</h4>
              
              <div className="flex flex-col gap-2">
                <Slider
                  label="Liquid Cash / Savings"
                  min={0}
                  max={5000000}
                  step={50000}
                  value={netWorthInputs.assets.cash}
                  onChange={(val) => updateNetWorthInputs({ assets: { ...netWorthInputs.assets, cash: val } })}
                  prefix="₹"
                />
                <Slider
                  label="Investments (Stocks/Mutual Funds)"
                  min={0}
                  max={50000000}
                  step={100000}
                  value={netWorthInputs.assets.investments}
                  onChange={(val) => updateNetWorthInputs({ assets: { ...netWorthInputs.assets, investments: val } })}
                  prefix="₹"
                />
                <Slider
                  label="Gold Value"
                  min={0}
                  max={10000000}
                  step={50000}
                  value={netWorthInputs.assets.gold}
                  onChange={(val) => updateNetWorthInputs({ assets: { ...netWorthInputs.assets, gold: val } })}
                  prefix="₹"
                />
                <Slider
                  label="Real Estate Property"
                  min={0}
                  max={100000000}
                  step={500000}
                  value={netWorthInputs.assets.property}
                  onChange={(val) => updateNetWorthInputs({ assets: { ...netWorthInputs.assets, property: val } })}
                  prefix="₹"
                />
                <Slider
                  label="Crypto Holdings"
                  min={0}
                  max={5000000}
                  step={20000}
                  value={netWorthInputs.assets.crypto}
                  onChange={(val) => updateNetWorthInputs({ assets: { ...netWorthInputs.assets, crypto: val } })}
                  prefix="₹"
                />
                
                <div className="border-t border-card-border/60 my-2 pt-2" />
                
                <Slider
                  label="Short-term Loans"
                  min={0}
                  max={5000000}
                  step={25000}
                  value={netWorthInputs.liabilities.loans}
                  onChange={(val) => updateNetWorthInputs({ liabilities: { ...netWorthInputs.liabilities, loans: val } })}
                  prefix="₹"
                />
                <Slider
                  label="Credit Card Debt"
                  min={0}
                  max={1000000}
                  step={5000}
                  value={netWorthInputs.liabilities.creditCard}
                  onChange={(val) => updateNetWorthInputs({ liabilities: { ...netWorthInputs.liabilities, creditCard: val } })}
                  prefix="₹"
                />
                <Slider
                  label="Mortgages / Home Loans"
                  min={0}
                  max={50000000}
                  step={100000}
                  value={netWorthInputs.liabilities.mortgage}
                  onChange={(val) => updateNetWorthInputs({ liabilities: { ...netWorthInputs.liabilities, mortgage: val } })}
                  prefix="₹"
                />
              </div>
            </Card>

            <div className="md:col-span-7 flex flex-col gap-6">
              {/* Output stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase">Net Worth</span>
                  <span className="text-base font-bold font-space text-white mt-1">
                    {formatCurrency(netWorthOutputs.currentNetWorth)}
                  </span>
                </div>
                <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase">5 Yr projection</span>
                  <span className="text-base font-bold font-space text-primary-custom mt-1">
                    {formatCurrency(netWorthOutputs.projectedNetWorth5Years)}
                  </span>
                </div>
                <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase">10 Yr projection</span>
                  <span className="text-base font-bold font-space text-success-custom mt-1">
                    {formatCurrency(netWorthOutputs.projectedNetWorth10Years)}
                  </span>
                </div>
              </div>

              {/* Chart */}
              <Card className="p-5 flex-1">
                <h4 className="text-xs font-semibold text-text-muted mb-4">Assets vs Liabilities 10-Year Trend</h4>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={netWorthOutputs.yearlyProjection} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={10} tickLine={false} tickFormatter={(v) => `Yr ${v}`} />
                      <YAxis
                        stroke="var(--text-muted)"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(v) => {
                          if (v >= 10000000) return `₹${(v / 10000000).toFixed(0)}Cr`;
                          if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
                          return `₹${v / 1000}K`;
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(5, 8, 22, 0.95)',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                        formatter={(v: any) => formatCurrency(v)}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="assets" name="Total Assets" fill="#00E5FF" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="liabilities" name="Liabilities" fill="#FF5252" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="netWorth" name="Net Worth" fill="#7C4DFF" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* SUB TAB 2: EMERGENCY FUND CALCULATOR */}
        {activeSubTab === 'emergency' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-space font-bold text-sm text-white mb-6">Emergency Assumptions</h4>
              
              <div className="flex flex-col gap-4">
                <Slider
                  label="Monthly Base Expenses"
                  min={5000}
                  max={250000}
                  step={5000}
                  value={emergencyInputs.monthlyExpenses}
                  onChange={(val) => updateEmergencyInputs({ monthlyExpenses: val })}
                  prefix="₹"
                />

                <Slider
                  label="Number of Dependents"
                  min={0}
                  max={10}
                  value={emergencyInputs.dependents}
                  onChange={(val) => updateEmergencyInputs({ dependents: val })}
                  suffix=" Dependents"
                />

                <Select
                  label="Do you have Health & Term Insurance?"
                  value={emergencyInputs.hasInsurance ? 'yes' : 'no'}
                  onChange={(e) => updateEmergencyInputs({ hasInsurance: e.target.value === 'yes' })}
                  options={[
                    { value: 'yes', label: 'Yes (Fully Protected)' },
                    { value: 'no', label: 'No Insurance Cover' }
                  ]}
                />
              </div>
            </Card>

            <div className="flex flex-col gap-6">
              <div className="p-5 rounded-2xl glass border border-card-border/80 flex flex-col justify-between items-center text-center">
                <span className="text-xs text-text-muted font-bold">Recommended Emergency Reserve</span>
                <span className="text-3xl font-black font-space text-success-custom mt-3">
                  {formatCurrency(emergencyOutputs.recommendedEmergencyCorpus)}
                </span>
                <span className="text-xs text-text-muted mt-2 font-mono uppercase">
                  Coverage: {emergencyOutputs.coverageMonths} Months of Expenses
                </span>
              </div>

              <Card className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-sm font-semibold text-text-muted mb-2">Safety Buffer Analysis</h4>
                  <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-card-border mt-3 text-xs">
                    <span className="font-semibold text-white">Emergency Rating:</span>
                    <span className="font-mono text-primary-custom font-bold uppercase">{emergencyOutputs.safetyRating}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-4 leading-relaxed">
                    {emergencyInputs.hasInsurance 
                      ? 'Protected: Because you have medical/life insurance, your emergency reserve is shielded from unexpected hospital bills.'
                      : 'High Risk: Lacking insurance means a medical emergency will completely drain your investment corpus. We highly recommend purchasing base health insurance.'}
                  </p>
                </div>

                <div className="mt-4 border-t border-card-border/60 pt-3 text-[10px] text-text-muted leading-relaxed flex gap-1 items-start">
                  <Info size={12} className="shrink-0 mt-0.5" />
                  <span>Formula: Base 6 months of living expenses + 1 month per dependent + 2 months if uninsured.</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* SUB TAB 3: PASSIVE INCOME PLANNER */}
        {activeSubTab === 'passive' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-space font-bold text-sm text-white mb-6">Passive Goal setup</h4>
              
              <div className="flex flex-col gap-4">
                <Slider
                  label="Desired Monthly Passive Income"
                  min={5000}
                  max={500000}
                  step={5000}
                  value={passiveIncomeInputs.desiredMonthlyIncome}
                  onChange={(val) => updatePassiveIncomeInputs({ desiredMonthlyIncome: val })}
                  prefix="₹"
                />

                <Slider
                  label="Target Safe Withdrawal Rate (SWR)"
                  min={2}
                  max={8}
                  step={0.25}
                  value={passiveIncomeInputs.expectedWithdrawalRate}
                  onChange={(val) => updatePassiveIncomeInputs({ expectedWithdrawalRate: val })}
                  suffix="%"
                />

                <Slider
                  label="Expected Growth Return"
                  min={5}
                  max={18}
                  step={0.5}
                  value={passiveIncomeInputs.expectedReturn}
                  onChange={(val) => updatePassiveIncomeInputs({ expectedReturn: val })}
                  suffix="%"
                />
              </div>
            </Card>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col justify-between">
                  <span className="text-xs text-text-muted">Target Capital Needed</span>
                  <span className="text-base font-bold font-space text-white mt-1">
                    {formatCurrency(passiveIncomeOutputs.requiredCorpus)}
                  </span>
                </div>
                <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col justify-between">
                  <span className="text-xs text-text-muted">Est. Timeline</span>
                  <span className="text-base font-bold font-space text-primary-custom mt-1">
                    {passiveIncomeOutputs.timelineYears} Years
                  </span>
                </div>
              </div>

              <Card className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-text-muted mb-2">Compounding Recommendations</h4>
                  <p className="text-xs text-text-muted mt-3 leading-relaxed">
                    To withdraw <span className="font-semibold text-white">{formatCurrency(passiveIncomeInputs.desiredMonthlyIncome)}/month</span> safely, you must build a capital base of <span className="font-semibold text-white">{formatCurrency(passiveIncomeOutputs.requiredCorpus)}</span>. 
                  </p>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Assuming you save ₹20,000 monthly in a portfolio compounding at {passiveIncomeInputs.expectedReturn}%, you could reach this financial freedom target in approximately {passiveIncomeOutputs.timelineYears} years.
                  </p>
                </div>

                <div className="mt-4 border-t border-card-border/60 pt-3 text-[10px] text-text-muted leading-relaxed flex gap-1 items-start">
                  <Info size={12} className="shrink-0 mt-0.5" />
                  <span>Withdrawal SWR formula: Required Capital = (Monthly Target * 12) / SWR.</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* SUB TAB 4: TAX ESTIMATOR */}
        {activeSubTab === 'tax' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-space font-bold text-sm text-white mb-6">Capital Gains Details</h4>
              
              <div className="flex flex-col gap-4">
                <Slider
                  label="Short Term Capital Gains (STCG)"
                  min={0}
                  max={1000000}
                  step={10000}
                  value={taxInputs.shortTermCapitalGains}
                  onChange={(val) => updateTaxInputs({ shortTermCapitalGains: val })}
                  prefix="₹"
                />

                <Slider
                  label="Long Term Capital Gains (LTCG)"
                  min={0}
                  max={2000000}
                  step={20000}
                  value={taxInputs.longTermCapitalGains}
                  onChange={(val) => updateTaxInputs({ longTermCapitalGains: val })}
                  prefix="₹"
                />

                <Slider
                  label="Asset Holding Duration"
                  min={1}
                  max={60}
                  value={taxInputs.holdingDurationMonths}
                  onChange={(val) => updateTaxInputs({ holdingDurationMonths: val })}
                  suffix=" Months"
                />
              </div>
            </Card>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col justify-between">
                  <span className="text-[10px] text-text-muted uppercase">Est. Tax</span>
                  <span className="text-base font-bold font-space text-white mt-1">
                    {formatCurrency(taxOutputs.capitalGainsTax)}
                  </span>
                </div>
                <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col justify-between">
                  <span className="text-[10px] text-text-muted uppercase">With Cess (4%)</span>
                  <span className="text-base font-bold font-space text-danger-custom mt-1">
                    {formatCurrency(taxOutputs.withdrawalTaxImpact)}
                  </span>
                </div>
                <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col justify-between">
                  <span className="text-[10px] text-text-muted uppercase">Efficiency</span>
                  <span className="text-base font-bold font-space text-success-custom mt-1">
                    {taxOutputs.taxEfficiencyScore}/100
                  </span>
                </div>
              </div>

              <Card className="p-5 flex-1">
                <h4 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-1">
                  <Sparkles size={14} className="text-primary-custom" />
                  Tax Optimization Strategies
                </h4>
                <div className="flex flex-col gap-2.5 text-xs text-text-muted">
                  {taxOutputs.suggestions.map((sug, idx) => (
                    <div key={idx} className="flex gap-2 items-start leading-relaxed border-b border-card-border/30 pb-2 last:border-0 last:pb-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-custom shrink-0 mt-1.5" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
