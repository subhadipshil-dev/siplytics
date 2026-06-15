'use client';

import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, MetricCard, GaugeMeter, ProgressBar, Button } from '../components/ui';
import {
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Milestone as MilestoneIcon,
  CheckCircle,
  Clock,
  Compass,
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  calculateFinancialHealthScore,
  calculateRiskScore,
  getMilestones
} from '../utils/finance';

export const Dashboard: React.FC = () => {
  const {
    sipInputs,
    sipOutputs,
    portfolio,
    portfolioMetrics,
    goals,
    retirementOutputs,
    fireOutputs,
    emergencyOutputs,
    netWorthInputs,
    netWorthOutputs,
    setActiveTab
  } = useFinanceStore();

  // 1. Calculate Scores
  // Calculate Debt Ratio
  const currentAssets =
    netWorthInputs.assets.cash +
    netWorthInputs.assets.investments +
    netWorthInputs.assets.gold +
    netWorthInputs.assets.property +
    netWorthInputs.assets.crypto;
  const currentLiabilities =
    netWorthInputs.liabilities.loans +
    netWorthInputs.liabilities.creditCard +
    netWorthInputs.liabilities.mortgage;
  const debtRatio = currentLiabilities / Math.max(1, currentAssets);

  const healthScore = calculateFinancialHealthScore(
    fireOutputs.savingsRate,
    emergencyOutputs.coverageMonths,
    netWorthOutputs.currentNetWorth,
    debtRatio,
    retirementOutputs.retirementReadinessScore
  );

  const equityAllocation = portfolio.equity + portfolio.internationalEquity;
  const riskResult = calculateRiskScore(
    sipInputs.riskProfile,
    equityAllocation,
    sipInputs.durationYears
  );

  // Goal achievement rate average
  const goalAchievementRate =
    goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + g.achievementProbability, 0) / goals.length)
      : 0;

  // 2. Generate Milestones
  const milestones = getMilestones(sipInputs, sipOutputs.yearlyBreakdown);

  // 3. AI Insights items
  // Ins 1: 1 Crore milestone check
  const crMilestone = milestones.find((m) => m.targetAmount === 10000000);
  const crText =
    crMilestone && crMilestone.yearsToReach < 99
      ? `Your projected corpus may reach ₹1 Crore in Year ${Math.ceil(crMilestone.yearsToReach)}.`
      : `With current settings, you will reach ₹50 Lakh in Year ${Math.ceil(
          milestones.find((m) => m.targetAmount === 5000000)?.yearsToReach || 30
        )}.`;

  // Ins 2: Inflation impact
  const inflationLossPercent = Math.round(
    ((sipOutputs.finalCorpus - sipOutputs.inflationAdjustedCorpus) / sipOutputs.finalCorpus) * 100
  );
  const inflationText = `Inflation will erode your purchasing power by ${inflationLossPercent}% over the next ${sipInputs.durationYears} years.`;

  // Ins 3: Step-up comparison
  const stepUpMultiplier = 1.35; // approximate effect of 10% step up
  const extraStepUpAmount = Math.round(sipOutputs.finalCorpus * (stepUpMultiplier - 1));
  const stepUpText =
    sipInputs.stepUpPercent > 0
      ? `Your 10% Step-Up SIP is generating ₹${(extraStepUpAmount / 100000).toFixed(0)} Lakhs extra compared to a flat SIP.`
      : `Increasing your monthly SIP by 10% annually could add an estimated ₹${(extraStepUpAmount / 100000).toFixed(0)} Lakhs to your wealth.`;

  const insightItems = [
    {
      title: 'Compounding Milestones',
      text: crText,
      icon: MilestoneIcon,
      color: 'text-primary-custom bg-primary-custom/5 border-primary-custom/10'
    },
    {
      title: 'Inflation Vulnerability',
      text: inflationText,
      icon: AlertTriangle,
      color: 'text-danger-custom bg-danger-custom/5 border-danger-custom/10'
    },
    {
      title: 'Step-Up Accelerator',
      text: stepUpText,
      icon: Sparkles,
      color: 'text-secondary-custom bg-secondary-custom/5 border-secondary-custom/10'
    }
  ];

  // 4. Recharts Chart data
  const pieData = [
    { name: 'Total Invested', value: sipOutputs.totalInvested, color: '#7C4DFF' },
    { name: 'Total Returns', value: sipOutputs.totalReturns, color: '#00E5FF' }
  ];

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      
      {/* SECTION 1: TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Invested"
          value={sipOutputs.totalInvested}
          prefix="₹"
          icon={Calendar}
          color="secondary"
          subtext={`Duration: ${sipInputs.durationYears} Years`}
        />
        <MetricCard
          title="Returns Earned"
          value={sipOutputs.totalReturns}
          prefix="₹"
          icon={TrendingUp}
          color="success"
          subtext={`CAGR: ${sipOutputs.cagr}%`}
        />
        <MetricCard
          title="Projected Corpus"
          value={sipOutputs.finalCorpus}
          prefix="₹"
          icon={ArrowUpRight}
          color="primary"
          subtext={`XIRR: ~${sipOutputs.approxXirr}%`}
        />
        <MetricCard
          title="Inflation Adjusted Corpus"
          value={sipOutputs.inflationAdjustedCorpus}
          prefix="₹"
          icon={Award}
          color="warning"
          subtext={`Assumed Inflation: ${sipInputs.inflationRate}%`}
        />
      </div>

      {/* SECTION 2: GAUGE METERS & CHART BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Three Gauge Scores */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GaugeMeter
            title="Financial Health"
            value={healthScore}
            subtitle={healthScore > 80 ? 'Excellent' : healthScore > 50 ? 'Good' : 'Needs Work'}
            color={healthScore > 80 ? 'success' : healthScore > 50 ? 'warning' : 'danger'}
          />
          <GaugeMeter
            title="Risk Exposure"
            value={riskResult.score}
            subtitle={riskResult.rating}
            color={riskResult.rating === 'Low' ? 'success' : riskResult.rating === 'Moderate' ? 'warning' : 'danger'}
          />
          <GaugeMeter
            title="Retirement Readiness"
            value={retirementOutputs.retirementReadinessScore}
            subtitle={retirementOutputs.retirementReadinessScore > 80 ? 'Ready' : 'Underfunded'}
            color={retirementOutputs.retirementReadinessScore > 80 ? 'success' : 'danger'}
          />
        </div>

        {/* Invested vs Returns Pie */}
        <Card className="lg:col-span-4 flex flex-col justify-between p-6 h-full min-h-[220px]">
          <h4 className="text-sm font-semibold text-text-muted mb-2">Wealth Composition</h4>
          <div className="h-32 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(5, 8, 22, 0.95)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                  formatter={(v: any) => formatCurrency(v)}
                />
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Absolute Centered Stats */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] text-text-muted font-mono uppercase">Ratio</span>
              <span className="text-xs font-bold font-space text-white">
                {((sipOutputs.totalReturns / Math.max(1, sipOutputs.finalCorpus)) * 100).toFixed(0)}% Profit
              </span>
            </div>
          </div>

          <div className="flex justify-around text-xs mt-2 border-t border-card-border/60 pt-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-secondary-custom" />
              <span className="text-text-muted">Invested ({((sipOutputs.totalInvested / Math.max(1, sipOutputs.finalCorpus)) * 100).toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-primary-custom" />
              <span className="text-text-muted">Returns ({((sipOutputs.totalReturns / Math.max(1, sipOutputs.finalCorpus)) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 3: PORTFOLIO GRADE & FINANCIAL FREEDOM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Financial Freedom Tracker */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-space font-bold text-base text-white flex items-center gap-1.5">
                <Flame className="text-red-500 fill-red-500/20" size={18} />
                Financial Independence progress
              </h4>
              <span className="text-xs text-primary-custom bg-primary-custom/5 px-2 py-0.5 border border-primary-custom/10 rounded font-semibold font-mono">
                {fireOutputs.currentProgressPercent}% Complete
              </span>
            </div>
            <p className="text-xs text-text-muted mb-4">
              FIRE Number target: <span className="text-white font-semibold">{formatCurrency(fireOutputs.fireNumber)}</span> (representing {fireOutputs.savingsRate}% savings rate). You need {fireOutputs.yearsToFire} more years of savings to declare freedom.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <ProgressBar value={fireOutputs.currentProgressPercent} color="primary" />
            <div className="flex justify-between text-[10px] text-text-muted mt-1">
              <span>Savings: {formatCurrency(netWorthInputs.assets.cash + netWorthInputs.assets.investments)}</span>
              <span>Target: {formatCurrency(fireOutputs.fireNumber)}</span>
            </div>
          </div>
        </Card>

        {/* Portfolio Grade & Diversification Card */}
        <Card className="grid grid-cols-2 gap-4 items-center">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-text-muted uppercase font-semibold tracking-wider">Allocation Quality</span>
            <h4 className="text-3xl font-black font-space text-white flex items-center gap-2">
              Grade {portfolioMetrics.portfolioGrade}
              <span className="text-xs px-2 py-0.5 bg-success-custom/10 text-success-custom border border-success-custom/20 rounded font-normal font-sans">
                Stable
              </span>
            </h4>
            <p className="text-xs text-text-muted mt-1">
              Diversification Score is <span className="text-white font-semibold">{portfolioMetrics.diversificationScore}/100</span>. Return efficiency is rated High.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 border-l border-card-border/60 pl-4">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Expected Volatility:</span>
              <span className="font-mono text-white font-bold">{portfolioMetrics.expectedVolatility}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Diversification Rating:</span>
              <span className="font-mono text-success-custom font-bold">Good</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Goal Success Likelihood:</span>
              <span className="font-mono text-primary-custom font-bold">{goalAchievementRate}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 4: AI INSIGHTS & MILESTONE TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AI INSIGHT PANEL */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <Compass size={18} className="text-primary-custom" />
            <h4 className="font-space font-bold text-base text-white">AI Wealth Insights</h4>
          </div>

          <div className="flex flex-col gap-3">
            {insightItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="p-4 flex gap-3 items-start border border-card-border bg-white/[0.01]">
                  <div className={`p-2 rounded-lg border shrink-0 ${item.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-white">{item.title}</span>
                    <p className="text-xs text-text-muted leading-relaxed">{item.text}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* MILESTONE TRACKER */}
        <Card className="lg:col-span-7 p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-space font-bold text-base text-white flex items-center gap-1.5">
              <MilestoneIcon size={18} className="text-secondary-custom" />
              Wealth Milestone Tracker
            </h4>
            <span className="text-[10px] text-text-muted uppercase font-mono tracking-wider">SIP Projections</span>
          </div>

          <div className="relative border-l border-card-border pl-6 ml-2 flex flex-col gap-4 py-2">
            {milestones.map((m, idx) => {
              const Icon = m.achieved ? CheckCircle : Clock;
              return (
                <div key={idx} className="relative flex justify-between items-center group">
                  
                  {/* Timeline Node Icon */}
                  <div className={`absolute -left-[31px] p-0.5 rounded-full bg-background border transition-colors duration-300
                    ${m.achieved ? 'border-success-custom text-success-custom' : 'border-card-border text-text-muted'}`}
                  >
                    <Icon size={14} className={m.achieved ? "fill-success-custom/10" : ""} />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white group-hover:text-primary-custom transition-colors duration-200">
                      {m.label} Milestone
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {m.achieved ? 'Achieved' : 'Projected'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-semibold text-white">
                      {m.estimatedDate}
                    </span>
                    <p className="text-[10px] text-text-muted">
                      {m.yearsToReach < 99 ? `${m.yearsToReach} yrs` : 'Beyond'}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* SECTION 5: GOALS SUMMARY QUICK NAV */}
      <Card className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-custom/5 border border-primary-custom/10 rounded-xl text-primary-custom">
            <Compass size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">Active Goals Planned: {goals.length}</span>
            <span className="text-xs text-text-muted">Average goal success probability is {goalAchievementRate}%</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setActiveTab('goal-planner')}>
          <span>View Goal Planner</span>
          <ArrowRight size={14} />
        </Button>
      </Card>

    </div>
  );
};
