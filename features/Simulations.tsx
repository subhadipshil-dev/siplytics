'use client';

import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, Button } from '../components/ui';
import {
  runMonteCarlo,
  getMarketScenarioImpact
} from '../utils/finance';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { LineChart as LineIcon, AlertTriangle, ShieldCheck, HelpCircle, Sparkles, TrendingUp, Compass, Cpu, Layers } from 'lucide-react';

export const Simulations: React.FC = () => {
  const { sipInputs, portfolioMetrics } = useFinanceStore();
  const [activeTab, setActiveTab] = useState<'montecarlo' | 'scenarios'>('montecarlo');
  const [rerunTrigger, setRerunTrigger] = useState(0);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Run Monte Carlo engine memoized or recalculated on rerunTrigger
  const mcResults = useMemo(() => {
    // default to 15% volatility if none calculated
    const vol = portfolioMetrics.expectedVolatility > 0 ? portfolioMetrics.expectedVolatility : 15;
    return runMonteCarlo(sipInputs, vol);
  }, [sipInputs, portfolioMetrics.expectedVolatility, rerunTrigger]);

  // Run Market Scenarios
  const scenarioImpacts = useMemo(() => {
    return getMarketScenarioImpact(sipInputs);
  }, [sipInputs]);

  // Format Monte Carlo paths for Recharts Line Chart
  const pathsChartData = useMemo(() => {
    const data = [];
    const numYears = sipInputs.durationYears;
    for (let yr = 0; yr <= numYears; yr++) {
      const point: any = { name: `Yr ${yr}` };
      mcResults.runs.forEach((path, idx) => {
        point[`Path ${idx + 1}`] = path[yr];
      });
      data.push(point);
    }
    return data;
  }, [mcResults, sipInputs.durationYears]);

  const PATH_COLORS = ['#00E5FF', '#7C4DFF', '#00E676', '#FFB300', '#FF5252'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* LEFT: SUB TABS SELECTION & DESCRIPTION (3 cols) */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <Card className="p-5 flex flex-col gap-3">
          <h3 className="font-space font-bold text-base text-white flex items-center gap-1.5">
            <Cpu className="text-primary-custom" size={16} />
            Simulation Lab
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Stress-test your investment model against hundreds of random yield pathways and extreme macro climates.
          </p>
          
          <div className="flex flex-col gap-2 border-t border-card-border/60 pt-3 mt-1">
            <button
              onClick={() => setActiveTab('montecarlo')}
              className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'montecarlo' 
                  ? 'bg-gradient-to-r from-primary-custom/10 to-transparent text-primary-custom border-l-2 border-primary-custom' 
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              Monte Carlo Engine
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'scenarios' 
                  ? 'bg-gradient-to-r from-primary-custom/10 to-transparent text-primary-custom border-l-2 border-primary-custom' 
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              Market Scenarios
            </button>
          </div>
        </Card>

        {activeTab === 'montecarlo' && (
          <Button onClick={() => setRerunTrigger(prev => prev + 1)} className="w-full flex items-center justify-center gap-2">
            <Cpu size={14} />
            Re-run 1000+ Trials
          </Button>
        )}
      </div>

      {/* RIGHT: SIMULATIONS AND SCENARIOS GRAPHICAL VIEW (9 cols) */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        
        {activeTab === 'montecarlo' ? (
          <>
            {/* Simulation KPI outcomes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
                <span className="text-xs text-text-muted">Goal Success Rate</span>
                <span className="text-lg font-bold font-space text-success-custom mt-1">
                  {mcResults.successProbability}%
                </span>
              </div>
              <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
                <span className="text-xs text-text-muted">Best Case (90th %)</span>
                <span className="text-lg font-bold font-space text-white mt-1">
                  {formatCurrency(mcResults.bestCase)}
                </span>
              </div>
              <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
                <span className="text-xs text-text-muted">Median Case (50th %)</span>
                <span className="text-lg font-bold font-space text-primary-custom mt-1">
                  {formatCurrency(mcResults.averageCase)}
                </span>
              </div>
              <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
                <span className="text-xs text-text-muted">Worst Case (10th %)</span>
                <span className="text-lg font-bold font-space text-danger-custom mt-1">
                  {formatCurrency(mcResults.worstCase)}
                </span>
              </div>
            </div>

            {/* Confidence Interval Alert */}
            <div className="p-4 rounded-xl bg-primary-custom/5 border border-primary-custom/25 text-xs flex gap-3 items-center text-white">
              <ShieldCheck size={18} className="text-primary-custom shrink-0" />
              <div>
                <span className="font-semibold">95% Confidence Bounds</span>
                <p className="text-text-muted mt-0.5">
                  The model is 95% confident your final wealth falls between <span className="font-bold text-white">{formatCurrency(mcResults.confidenceInterval[0])}</span> and <span className="font-bold text-white">{formatCurrency(mcResults.confidenceInterval[1])}</span>.
                </p>
              </div>
            </div>

            {/* Multi-Path Sample Line Chart */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-semibold text-text-muted flex items-center gap-1.5">
                  <LineIcon size={14} className="text-primary-custom" />
                  Monte Carlo Projection Paths (Random Trials)
                </h4>
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Asset Volatility: {portfolioMetrics.expectedVolatility || 15}%</span>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pathsChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <YAxis
                      stroke="var(--text-muted)"
                      fontSize={10}
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
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                      formatter={(value: any) => [formatCurrency(value), '']}
                    />
                    {mcResults.runs.map((_, idx) => (
                      <Line
                        key={idx}
                        type="monotone"
                        name={`Path ${idx + 1}`}
                        dataKey={`Path ${idx + 1}`}
                        stroke={PATH_COLORS[idx % PATH_COLORS.length]}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Outcome distribution bar chart */}
            <Card className="p-6">
              <h4 className="text-sm font-semibold text-text-muted mb-4 flex items-center gap-1.5">
                <Layers size={14} className="text-secondary-custom" />
                Wealth Probability Distribution
              </h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mcResults.distribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="bin" stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(5, 8, 22, 0.95)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="count" name="Frequency (Number of Runs)" fill="url(#colorMCBar)" radius={[4, 4, 0, 0]}>
                      <defs>
                        <linearGradient id="colorMCBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary-custom)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--primary-custom)" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </>
        ) : (
          <>
            {/* Scenario Simulator Grid */}
            <div className="flex flex-col gap-4">
              <h4 className="font-space font-bold text-base text-white px-1 flex items-center gap-1.5">
                <Compass size={18} className="text-primary-custom" />
                Macro Market Scenario Simulator
              </h4>
              <p className="text-xs text-text-muted leading-relaxed px-1">
                Estimate how major economic shifts modify annual yields and erode or enhance your final accumulated wealth corpus:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {scenarioImpacts.map((sc, idx) => {
                  const isLoss = sc.differencePercent < 0;
                  return (
                    <Card key={idx} className="p-4 flex flex-col justify-between gap-3 border border-card-border bg-white/[0.01]">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-white">{sc.name}</span>
                          <span className="text-[10px] text-text-muted">
                            Yield Modifier: {sc.expectedReturnModifier >= 0 ? `+${sc.expectedReturnModifier}` : sc.expectedReturnModifier}%
                          </span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono border
                          ${isLoss 
                            ? 'bg-danger-custom/10 text-danger-custom border-danger-custom/20' 
                            : 'bg-success-custom/10 text-success-custom border-success-custom/20'}`}
                        >
                          {isLoss ? '' : '+'}{sc.differencePercent}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs mt-1">
                        <span className="text-text-muted">Adjusted Corpus:</span>
                        <span className="font-mono text-white font-bold">{formatCurrency(sc.finalCorpus)}</span>
                      </div>

                      {/* Visual marker scale */}
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1 relative">
                        <div
                          className={`h-full rounded-full ${isLoss ? 'bg-danger-custom' : 'bg-success-custom'}`}
                          style={{ width: `${Math.min(100, Math.max(10, 100 + sc.differencePercent))}%` }}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
};
