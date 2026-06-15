'use client';

import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, MetricCard, GaugeMeter, ProgressBar, Button, AnimatedCounter } from '../components/ui';
import {
  TrendingUp, Award, Calendar, Sparkles, ArrowUpRight,
  Milestone as MilestoneIcon, CheckCircle, Clock, Compass,
  AlertTriangle, Flame, ArrowRight
} from 'lucide-react';
import { calculateFinancialHealthScore, calculateRiskScore, getMilestones } from '../utils/finance';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const DashboardChart = dynamic(() => import('../components/charts/DashboardChart'), { ssr: false });

export const Dashboard: React.FC = () => {
  const {
    sipInputs, sipOutputs, portfolio, portfolioMetrics, goals,
    retirementOutputs, fireOutputs, emergencyOutputs,
    netWorthInputs, netWorthOutputs, setActiveTab,
  } = useFinanceStore();

  const currentAssets = netWorthInputs.assets.cash + netWorthInputs.assets.investments + netWorthInputs.assets.gold + netWorthInputs.assets.property + netWorthInputs.assets.crypto;
  const currentLiabilities = netWorthInputs.liabilities.loans + netWorthInputs.liabilities.creditCard + netWorthInputs.liabilities.mortgage;
  const debtRatio = currentLiabilities / Math.max(1, currentAssets);

  const healthScore = calculateFinancialHealthScore(
    fireOutputs.savingsRate, emergencyOutputs.coverageMonths,
    netWorthOutputs.currentNetWorth, debtRatio, retirementOutputs.retirementReadinessScore,
  );
  const equityAllocation = portfolio.equity + portfolio.internationalEquity;
  const riskResult = calculateRiskScore(sipInputs.riskProfile, equityAllocation, sipInputs.durationYears);
  const goalRate = goals.length > 0 ? Math.round(goals.reduce((a, g) => a + g.achievementProbability, 0) / goals.length) : 0;

  const milestones = getMilestones(sipInputs, sipOutputs.yearlyBreakdown);
  const crMilestone = milestones.find((m) => m.targetAmount === 10000000);
  const crText = crMilestone && crMilestone.yearsToReach < 99
    ? `Your projected corpus may reach ₹1 Crore in Year ${Math.ceil(crMilestone.yearsToReach)}.`
    : `With current settings you will reach ₹50L in Year ${Math.ceil(milestones.find((m) => m.targetAmount === 5000000)?.yearsToReach || 30)}.`;

  const inflationLoss = Math.round(((sipOutputs.finalCorpus - sipOutputs.inflationAdjustedCorpus) / sipOutputs.finalCorpus) * 100);
  const extraStepUp = Math.round(sipOutputs.finalCorpus * 0.35);
  const stepUpText = sipInputs.stepUpPercent > 0
    ? `Your Step-Up SIP is generating ₹${(extraStepUp / 1e5).toFixed(0)}L extra vs a flat SIP.`
    : `A 10% annual SIP increase could add ₹${(extraStepUp / 1e5).toFixed(0)}L to your wealth.`;

  const insights = [
    { title: 'Compounding Milestones',  text: crText,                                                    icon: MilestoneIcon,   bg: 'var(--primary-dim)',   border: 'var(--primary-custom)',   fg: 'var(--primary-custom)' },
    { title: 'Inflation Vulnerability', text: `Inflation may erode ${inflationLoss}% of real value over ${sipInputs.durationYears} years.`, icon: AlertTriangle, bg: 'var(--danger-dim)', border: 'var(--danger-custom)', fg: 'var(--danger-custom)' },
    { title: 'Step-Up Accelerator',     text: stepUpText,                                                icon: Sparkles,        bg: 'var(--secondary-dim)', border: 'var(--secondary-custom)', fg: 'var(--secondary-custom)' },
  ];

  const pieData = [
    { name: 'Invested', value: sipOutputs.totalInvested, color: 'var(--secondary-custom)' },
    { name: 'Returns',  value: sipOutputs.totalReturns,  color: 'var(--primary-custom)'   },
  ];

  const fmt = (v: number) => v >= 1e7 ? `₹${(v / 1e7).toFixed(2)} Cr` : v >= 1e5 ? `₹${(v / 1e5).toFixed(2)} L` : `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col gap-6">

      {/* ── KPI ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Invested"      value={sipOutputs.totalInvested}           prefix="₹" icon={Calendar}    color="secondary" subtext={`Duration: ${sipInputs.durationYears} yrs`} />
        <MetricCard title="Returns Earned"      value={sipOutputs.totalReturns}            prefix="₹" icon={TrendingUp}  color="success"   subtext={`CAGR: ${sipOutputs.cagr}%`} />
        <MetricCard title="Projected Corpus"    value={sipOutputs.finalCorpus}             prefix="₹" icon={ArrowUpRight} color="primary"  subtext={`XIRR: ~${sipOutputs.approxXirr}%`} />
        <MetricCard title="Inflation-Adjusted"  value={sipOutputs.inflationAdjustedCorpus} prefix="₹" icon={Award}       color="warning"   subtext={`Inflation: ${sipInputs.inflationRate}%`} />
      </div>

      {/* ── GAUGES + PIE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GaugeMeter title="Financial Health"      value={healthScore}                              subtitle={healthScore > 80 ? 'Excellent' : healthScore > 50 ? 'Good' : 'Needs Work'} color={healthScore > 80 ? 'success' : healthScore > 50 ? 'warning' : 'danger'} />
          <GaugeMeter title="Risk Exposure"         value={riskResult.score}                         subtitle={riskResult.rating}  color={riskResult.rating === 'Low' ? 'success' : riskResult.rating === 'Moderate' ? 'warning' : 'danger'} />
          <GaugeMeter title="Retirement Readiness"  value={retirementOutputs.retirementReadinessScore} subtitle={retirementOutputs.retirementReadinessScore > 80 ? 'Ready' : 'Underfunded'} color={retirementOutputs.retirementReadinessScore > 80 ? 'success' : 'danger'} />
        </div>

        <Card className="lg:col-span-4 flex flex-col p-5">
          <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Wealth Composition</h4>
          <div className="relative h-32 w-full flex items-center justify-center">
            <DashboardChart data={pieData} fmt={fmt} />
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[9px] text-[var(--text-muted)] font-mono uppercase">Profit</span>
              <span className="text-xs font-bold font-space text-[var(--foreground)]">
                <AnimatedCounter value={Math.round((sipOutputs.totalReturns / Math.max(1, sipOutputs.finalCorpus)) * 100)} suffix="%" />
              </span>
            </div>
          </div>
          <div className="flex justify-around text-[11px] mt-3 border-t border-[var(--card-border)] pt-3">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                <span className="text-[var(--text-muted)]">
                  {d.name} (<AnimatedCounter value={Math.round((d.value / Math.max(1, sipOutputs.finalCorpus)) * 100)} suffix="%" />)
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── FIRE PROGRESS + PORTFOLIO GRADE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-space font-bold text-sm text-[var(--foreground)] flex items-center gap-1.5">
              <Flame className="text-orange-500" size={16} />
              Financial Independence Progress
            </h4>
            <span className="text-xs text-[var(--primary-custom)] bg-[var(--primary-dim)] px-2 py-0.5 border border-[var(--primary-custom)]/20 rounded-lg font-semibold font-mono">
              <AnimatedCounter value={fireOutputs.currentProgressPercent} suffix="%" />
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
            FIRE target: <strong className="text-[var(--foreground)]"><AnimatedCounter value={fireOutputs.fireNumber} formatter={fmt} /></strong> — savings rate <AnimatedCounter value={fireOutputs.savingsRate} suffix="%" />. Need <AnimatedCounter value={fireOutputs.yearsToFire} /> more years.
          </p>
          <ProgressBar value={fireOutputs.currentProgressPercent} color="primary" />
          <div className="flex justify-between text-[10px] text-[var(--text-subtle)] mt-2">
            <span>Saved: <AnimatedCounter value={netWorthInputs.assets.cash + netWorthInputs.assets.investments} formatter={fmt} /></span>
            <span>Target: <AnimatedCounter value={fireOutputs.fireNumber} formatter={fmt} /></span>
          </div>
        </Card>

        <Card className="grid grid-cols-2 gap-4 items-center">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold tracking-wider">Allocation Quality</span>
            <h4 className="text-3xl font-black font-space text-[var(--foreground)] flex items-center gap-2">
              {portfolioMetrics.portfolioGrade}
              <span className="text-xs px-2 py-0.5 bg-[var(--success-dim)] text-[var(--success-custom)] border border-[var(--success-custom)]/20 rounded-lg font-normal font-sans">
                Stable
              </span>
            </h4>
            <p className="text-xs text-[var(--text-muted)]">
              Diversification: <span className="text-[var(--foreground)] font-semibold">
                <AnimatedCounter value={portfolioMetrics.diversificationScore} />/100
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-3 border-l border-[var(--card-border)] pl-4">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)]">Volatility:</span>
              <span className="font-mono font-bold text-[var(--foreground)]">
                <AnimatedCounter value={portfolioMetrics.expectedVolatility} suffix="%" />
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)]">Diversif.:</span>
              <span className="font-mono font-bold text-[var(--success-custom)]">Good</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)]">Goal Success:</span>
              <span className="font-mono font-bold text-[var(--primary-custom)]">
                <AnimatedCounter value={goalRate} suffix="%" />
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── INSIGHTS + MILESTONES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1 mb-1">
            <Compass size={16} className="text-[var(--primary-custom)]" />
            <h4 className="font-space font-bold text-sm text-[var(--foreground)]">AI Wealth Insights</h4>
          </div>
          {insights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex gap-3 items-start p-4 rounded-xl border"
                style={{ background: item.bg, borderColor: `${item.border}30` }}
              >
                <div className="p-2 rounded-lg shrink-0" style={{ background: `${item.bg}`, border: `1px solid ${item.border}40` }}>
                  <Icon size={15} style={{ color: item.fg }} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-[var(--foreground)]">{item.title}</span>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Card className="lg:col-span-7 p-5">
          <div className="flex justify-between items-center mb-5">
            <h4 className="font-space font-bold text-sm text-[var(--foreground)] flex items-center gap-1.5">
              <MilestoneIcon size={16} className="text-[var(--secondary-custom)]" />
              Wealth Milestone Tracker
            </h4>
            <span className="text-[10px] text-[var(--text-subtle)] uppercase font-mono tracking-wider">SIP Projections</span>
          </div>
          <div className="relative pl-6 ml-2 flex flex-col gap-4 py-2">
            {/* Background line track */}
            <div className="absolute left-[3px] top-3 bottom-3 w-[2px] bg-[var(--card-border)]" />
            {/* Achieved progress overlay line */}
            <div className="absolute left-[3px] top-3 bottom-3 w-[2px]">
              <motion.div
                className="w-full bg-gradient-to-b from-[var(--success-custom)] to-[var(--primary-custom)]"
                initial={{ height: 0 }}
                animate={{ height: `${(milestones.filter(m => m.achieved).length / Math.max(1, milestones.length)) * 100}%` }}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            {milestones.map((m, idx) => {
              const Icon = m.achieved ? CheckCircle : Clock;
              return (
                <div key={idx} className="relative flex justify-between items-center group">
                  <motion.div
                    className="absolute -left-[27px] p-0.5 rounded-full bg-[var(--background)] border z-10"
                    animate={{
                      borderColor: m.achieved ? 'var(--success-custom)' : 'var(--card-border)',
                      scale: m.achieved ? [1, 1.15, 1] : 1,
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <Icon size={12} className={m.achieved ? 'text-[var(--success-custom)]' : 'text-[var(--text-muted)]'} />
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--primary-custom)] transition-colors">{m.label} Milestone</span>
                    <span className="text-[10px] text-[var(--text-subtle)]">{m.achieved ? 'Achieved ✓' : 'Projected'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-semibold text-[var(--foreground)]">{m.estimatedDate}</span>
                    <p className="text-[10px] text-[var(--text-subtle)]">
                      {m.yearsToReach < 99 ? (
                        <>
                          <AnimatedCounter value={m.yearsToReach} formatter={(v) => v.toFixed(1)} /> yrs
                        </>
                      ) : 'Beyond horizon'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── GOALS FOOTER ── */}
      <Card className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--primary-dim)] border border-[var(--primary-custom)]/20 rounded-xl text-[var(--primary-custom)]">
            <Compass size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[var(--foreground)]">Active Goals: {goals.length}</span>
            <span className="text-xs text-[var(--text-muted)]">Average success probability {goalRate}%</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setActiveTab('goal-planner')}>
          View Goal Planner <ArrowRight size={13} />
        </Button>
      </Card>

    </div>
  );
};
