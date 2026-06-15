'use client';

import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, Slider, Button } from '../components/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon, Award, Sparkles, Scale, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { PortfolioAllocation as PortfolioAllocType } from '../types';

const COLORS = ['#00E5FF', '#7C4DFF', '#FFB300', '#00E676', '#FF5252', '#64748B'];

export const PortfolioAllocation: React.FC = () => {
  const { portfolio, portfolioMetrics, updatePortfolio } = useFinanceStore();

  const totalAlloc =
    portfolio.equity +
    portfolio.debt +
    portfolio.gold +
    portfolio.internationalEquity +
    portfolio.reits +
    portfolio.cash;

  const isBalanced = totalAlloc === 100;

  // Auto-balance/normalize function
  const handleAutoBalance = () => {
    if (totalAlloc === 0) {
      updatePortfolio({ equity: 60, debt: 20, gold: 10, internationalEquity: 5, reits: 0, cash: 5 });
      return;
    }
    const factor = 100 / totalAlloc;
    updatePortfolio({
      equity: Math.round(portfolio.equity * factor),
      debt: Math.round(portfolio.debt * factor),
      gold: Math.round(portfolio.gold * factor),
      internationalEquity: Math.round(portfolio.internationalEquity * factor),
      reits: Math.round(portfolio.reits * factor),
      cash: Math.round(portfolio.cash * factor)
    });

    // Make sure it sums EXACTLY to 100 due to rounding
    setTimeout(() => {
      const current = useFinanceStore.getState().portfolio;
      const sum = current.equity + current.debt + current.gold + current.internationalEquity + current.reits + current.cash;
      if (sum !== 100) {
        const diff = 100 - sum;
        updatePortfolio({ cash: Math.max(0, current.cash + diff) });
      }
    }, 20);
  };

  const chartData = [
    { name: 'Domestic Equity', value: portfolio.equity },
    { name: 'Debt & Fixed Income', value: portfolio.debt },
    { name: 'Gold & Commodities', value: portfolio.gold },
    { name: 'International Equity', value: portfolio.internationalEquity },
    { name: 'REITs (Real Estate)', value: portfolio.reits },
    { name: 'Cash / Liquid', value: portfolio.cash }
  ].filter(item => item.value > 0);

  // Descriptions of allocations
  const allocDescriptions = {
    equity: 'Drives primary wealth compounding through standard large/midcap indices.',
    debt: 'Provides critical portfolio buffering, dampening downside volatility.',
    gold: 'Acts as an inflation hedge and store of value during market distress.',
    internationalEquity: 'Protects capital from local currency depreciation and global exposure.',
    reits: 'Offers dividend yield from real estate holdings with low correlation to equities.',
    cash: 'Dry powder for opportunistic buying or short term emergency needs.'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* LEFT PANEL: SLIDERS & BALANCING WARNING (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-space font-bold text-lg text-white flex items-center gap-2">
              <Scale className="text-primary-custom" size={18} />
              Allocation Sliders
            </h3>
            <span className={`text-xs px-2 py-0.5 font-bold font-mono rounded border
              ${isBalanced 
                ? 'bg-success-custom/10 text-success-custom border-success-custom/20' 
                : 'bg-warning-custom/10 text-warning-custom border-warning-custom/20 animate-pulse'}`}
            >
              Total: {totalAlloc}%
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <Slider
              label="Domestic Equity"
              min={0}
              max={100}
              value={portfolio.equity}
              onChange={(val) => updatePortfolio({ equity: val })}
              suffix="%"
            />
            <Slider
              label="Debt & Fixed Income"
              min={0}
              max={100}
              value={portfolio.debt}
              onChange={(val) => updatePortfolio({ debt: val })}
              suffix="%"
            />
            <Slider
              label="Gold & Commodities"
              min={0}
              max={100}
              value={portfolio.gold}
              onChange={(val) => updatePortfolio({ gold: val })}
              suffix="%"
            />
            <Slider
              label="International Equity"
              min={0}
              max={100}
              value={portfolio.internationalEquity}
              onChange={(val) => updatePortfolio({ internationalEquity: val })}
              suffix="%"
            />
            <Slider
              label="REITs (Real Estate)"
              min={0}
              max={100}
              value={portfolio.reits}
              onChange={(val) => updatePortfolio({ reits: val })}
              suffix="%"
            />
            <Slider
              label="Cash / Liquidity"
              min={0}
              max={100}
              value={portfolio.cash}
              onChange={(val) => updatePortfolio({ cash: val })}
              suffix="%"
            />
          </div>

          {/* Validation Alert / Auto Balance button */}
          {!isBalanced && (
            <div className="mt-6 p-4 rounded-xl bg-warning-custom/10 border border-warning-custom/20 flex flex-col gap-3 text-white">
              <div className="flex gap-2 items-start text-xs leading-relaxed">
                <AlertCircle size={16} className="text-warning-custom shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Allocation Imbalance</span>
                  <p className="text-text-muted mt-0.5">Your asset classes must sum up to exactly 100% to output accurate portfolio estimations.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleAutoBalance} className="text-warning-custom border-warning-custom/30 hover:bg-warning-custom/10 w-full">
                Auto-Balance Weights
              </Button>
            </div>
          )}

          {isBalanced && (
            <div className="mt-6 p-3 rounded-xl bg-success-custom/10 border border-success-custom/20 flex gap-2 items-center text-xs text-success-custom">
              <CheckCircle2 size={16} />
              <span className="font-semibold">Weights perfectly balanced (100%)</span>
            </div>
          )}
        </Card>
      </div>

      {/* RIGHT PANEL: VISUALS & METRICS (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col justify-between">
            <span className="text-xs text-text-muted">Expected Return</span>
            <span className="text-lg font-bold font-space text-white mt-1">
              {portfolioMetrics.expectedReturn}%
            </span>
          </div>
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col justify-between">
            <span className="text-xs text-text-muted">Volatility Risk</span>
            <span className="text-lg font-bold font-space text-danger-custom mt-1">
              {portfolioMetrics.expectedVolatility}%
            </span>
          </div>
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col justify-between">
            <span className="text-xs text-text-muted">Diversification</span>
            <span className="text-lg font-bold font-space text-success-custom mt-1">
              {portfolioMetrics.diversificationScore}/100
            </span>
          </div>
          <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col justify-between">
            <span className="text-xs text-text-muted">Portfolio Grade</span>
            <span className="text-lg font-bold font-space text-warning-custom mt-1">
              {portfolioMetrics.portfolioGrade}
            </span>
          </div>
        </div>

        {/* Visual Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-stretch">
          
          {/* Pie chart */}
          <Card className="sm:col-span-7 p-6 flex flex-col justify-between min-h-[280px]">
            <h4 className="text-sm font-semibold text-text-muted flex items-center gap-1.5 mb-4">
              <PieIcon size={14} className="text-primary-custom" />
              Asset Mix
            </h4>
            <div className="h-48 w-full relative flex items-center justify-center">
              {chartData.length === 0 ? (
                <span className="text-xs text-text-muted">No assets selected. Adjust sliders to see breakdown.</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(5, 8, 22, 0.95)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                      formatter={(v) => `${v}%`}
                    />
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
              {isBalanced && (
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-text-muted uppercase font-mono">Risk Level</span>
                  <span className="text-xs font-bold font-space text-white">{portfolioMetrics.riskRating}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 border-t border-card-border/60 pt-4 text-[10px] text-text-muted">
              {chartData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate">{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Allocation Quality Grade Info */}
          <Card className="sm:col-span-5 p-6 flex flex-col justify-between">
            <h4 className="text-sm font-semibold text-text-muted flex items-center gap-1.5 mb-3">
              <Award size={14} className="text-secondary-custom" />
              Allocation Grades
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-text-muted">
              <div>
                <span className="font-semibold text-white">Grade A+ / A (Efficient)</span>
                <p className="mt-0.5 leading-relaxed">High diversification, high returns per unit of volatility risk.</p>
              </div>
              <div className="border-t border-card-border/40 pt-2">
                <span className="font-semibold text-white">Grade B / C (Balanced)</span>
                <p className="mt-0.5 leading-relaxed">Moderate returns with robust protection during down markets.</p>
              </div>
              <div className="border-t border-card-border/40 pt-2">
                <span className="font-semibold text-white">Grade D (Sub-Optimal)</span>
                <p className="mt-0.5 leading-relaxed">Highly concentrated. Add non-correlated assets to boost grade.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Breakdown items */}
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-text-muted mb-4 flex items-center gap-1.5">
            <Sparkles size={14} className="text-primary-custom" />
            Asset Allocation Intelligence
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-white">Equity ({portfolio.equity}%)</span>
              <p className="text-text-muted leading-relaxed">{allocDescriptions.equity}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-white">Debt ({portfolio.debt}%)</span>
              <p className="text-text-muted leading-relaxed">{allocDescriptions.debt}</p>
            </div>
            <div className="flex flex-col gap-1 border-t border-card-border/40 sm:border-t-0 sm:pt-0 pt-2">
              <span className="font-bold text-white">Gold ({portfolio.gold}%)</span>
              <p className="text-text-muted leading-relaxed">{allocDescriptions.gold}</p>
            </div>
            <div className="flex flex-col gap-1 border-t border-card-border/40 sm:border-t-0 sm:pt-0 pt-2">
              <span className="font-bold text-white">International Equity ({portfolio.internationalEquity}%)</span>
              <p className="text-text-muted leading-relaxed">{allocDescriptions.internationalEquity}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-card-border/60 pt-3 text-[10px] text-text-muted leading-relaxed flex gap-1 items-start">
            <Info size={12} className="shrink-0 mt-0.5" />
            <span>Note: Returns are calculated as historical weighted averages: Domestic Equity (12%), Debt (6.5%), Gold (9%), International Equity (11%), REITs (8.5%), Cash (4.5%). Volatilities and correlations are based on standard 10-year market indexes.</span>
          </div>
        </Card>

      </div>

    </div>
  );
};
