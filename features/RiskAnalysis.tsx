'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, Button, GaugeMeter, ProgressBar } from '../components/ui';
import { ShieldCheck, ArrowRight, HelpCircle, Check, Award, RefreshCw, Scale } from 'lucide-react';
import { RiskProfile } from '../types';

interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    points: number;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'What is your primary investment time horizon?',
    options: [
      { label: 'Short term (Less than 3 years)', points: 1 },
      { label: 'Medium term (3 to 7 years)', points: 3 },
      { label: 'Long term (Over 7 years)', points: 5 }
    ]
  },
  {
    id: 2,
    text: 'If your investment portfolio drops by 20% due to a sudden market correction, what would you do?',
    options: [
      { label: 'Sell everything immediately to protect remaining capital', points: 1 },
      { label: 'Hold tight and wait for the market to recover', points: 3 },
      { label: 'Buy more shares at discounted prices to lower average cost', points: 5 }
    ]
  },
  {
    id: 3,
    text: 'How would you describe your understanding of financial markets and instruments?',
    options: [
      { label: 'Basic: I understand savings accounts, insurance and fixed deposits', points: 1 },
      { label: 'Intermediate: I understand mutual funds, bond options and basic ETFs', points: 3 },
      { label: 'Advanced: I understand direct equities, leverage, futures and options', points: 5 }
    ]
  },
  {
    id: 4,
    text: 'How stable and predictable is your primary source of household income?',
    options: [
      { label: 'Variable: My earnings fluctuate (e.g. freelance, commissions, startup)', points: 1 },
      { label: 'Stable: Predictable monthly salary or steady income streams', points: 3 },
      { label: 'Highly Secure: Guaranteed tenure (e.g. government, senior professional)', points: 5 }
    ]
  },
  {
    id: 5,
    text: 'What is your primary investment goal regarding risk vs. returns?',
    options: [
      { label: 'Capital Preservation: Protect principal and generate safe yields', points: 1 },
      { label: 'Balanced Compounder: Match standard indices with controlled drawdowns', points: 3 },
      { label: 'Wealth Maximizer: Focus on high growth, accepting severe short term drops', points: 5 }
    ]
  }
];

export const RiskAnalysis: React.FC = () => {
  const { sipInputs, updateSipInputs, portfolio, portfolioMetrics } = useFinanceStore();

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelectOption = (points: number) => {
    const updatedAnswers = [...answers, points];
    setAnswers(updatedAnswers);

    if (currentQIndex < QUESTIONS.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      setIsCompleted(true);
      
      // Calculate total points and update store
      const totalPoints = updatedAnswers.reduce((sum, p) => sum + p, 0);
      let calculatedProfile: RiskProfile = 'moderate';
      if (totalPoints <= 9) calculatedProfile = 'low';
      else if (totalPoints <= 15) calculatedProfile = 'moderate';
      else if (totalPoints <= 20) calculatedProfile = 'high';
      else calculatedProfile = 'extreme';

      updateSipInputs({ riskProfile: calculatedProfile });
    }
  };

  const handleReset = () => {
    setCurrentQIndex(0);
    setAnswers([]);
    setIsCompleted(false);
  };

  // Advice mapping based on risk profile
  const riskAdvice = {
    low: {
      title: 'Conservative (Low Risk)',
      description: 'Your responses indicate that you prioritize capital preservation and peace of mind over raw yield growth. Large market swings cause you anxiety, or your investment horizon is relatively short. Focus on fixed income, liquid assets, and index tracking.',
      recommendedAlloc: 'Equity: 20-30%, Debt/Gold: 70-80%'
    },
    moderate: {
      title: 'Balanced (Moderate Risk)',
      description: 'You seek a middle ground. You appreciate standard growth yields but prefer to shield a portion of your capital from severe volatility. You can tolerate small temporary drawdowns as long as the core trend is upward.',
      recommendedAlloc: 'Equity: 50-60%, Debt/Gold: 40-50%'
    },
    high: {
      title: 'Growth (High Risk)',
      description: 'You are focused on long-term compound growth and have a multi-year timeline. You understand that volatility is the price of high returns and can comfortably ride out standard bear markets without panic selling.',
      recommendedAlloc: 'Equity: 70-80%, Debt/Gold/REITs: 20-30%'
    },
    extreme: {
      title: 'Aggressive (Extreme Risk)',
      description: 'You are an aggressive wealth maximizer. You view corrections as buying opportunities rather than threats. Your income stability is high, or your horizon is extremely long, allowing you to stomach severe stock market corrections.',
      recommendedAlloc: 'Equity: 85-95%, Gold/REITs/Crypto: 5-15%'
    }
  };

  const currentProfile = sipInputs.riskProfile;
  const advice = riskAdvice[currentProfile];

  // Map risk profile to numeric scale for gauge (out of 100)
  const profileScores = {
    low: 25,
    moderate: 50,
    high: 75,
    extreme: 95
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* LEFT: QUESTIONNAIRE OR PROFILE REPORT (6 cols) */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        {!isCompleted ? (
          <Card className="p-6 h-full flex flex-col justify-between min-h-[360px]">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-primary-custom" />
                  Question {QUESTIONS[currentQIndex].id} of {QUESTIONS.length}
                </span>
                <span className="text-[10px] text-text-muted font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  Risk Profiler
                </span>
              </div>

              <h3 className="font-space font-bold text-lg text-white mb-6 leading-snug">
                {QUESTIONS[currentQIndex].text}
              </h3>

              <div className="flex flex-col gap-3">
                {QUESTIONS[currentQIndex].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt.points)}
                    className="w-full text-left p-4 rounded-xl border border-card-border/80 bg-slate-900/30 hover:border-primary-custom/60 hover:bg-primary-custom/5 text-xs text-white transition-all duration-300 font-medium cursor-pointer active:scale-[0.99] flex items-center justify-between"
                  >
                    <span>{opt.label}</span>
                    <ArrowRight size={14} className="text-text-muted opacity-0 hover:opacity-100 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-card-border/60 pt-4">
              <ProgressBar value={((currentQIndex) / QUESTIONS.length) * 100} color="primary" />
            </div>
          </Card>
        ) : (
          <Card className="p-6 flex flex-col justify-between h-full min-h-[360px]">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-space font-bold text-lg text-white flex items-center gap-2">
                  <ShieldCheck className="text-success-custom" size={20} />
                  Risk Assessment Complete
                </h3>
                <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
                  <RefreshCw size={12} />
                  Retake Test
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-primary-custom/5 border border-primary-custom/15 flex flex-col gap-1.5 mt-2">
                <span className="text-xs font-mono uppercase tracking-wider text-primary-custom">Determined Profile</span>
                <h4 className="text-2xl font-black font-space text-white">{advice.title}</h4>
                <p className="text-xs text-text-muted leading-relaxed mt-1">{advice.description}</p>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <span className="text-xs text-text-muted font-bold">Recommended Tactical Asset Class Ratio:</span>
                <span className="text-sm font-semibold text-white font-space bg-slate-900/60 p-2.5 rounded-lg border border-card-border">
                  {advice.recommendedAlloc}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-card-border/60 pt-4 flex gap-2 items-center text-xs text-text-muted leading-relaxed">
              <Check size={14} className="text-success-custom shrink-0" />
              <span>We have automatically updated your calculations across the entire dashboard to reflect the <span className="font-semibold text-white uppercase">{currentProfile}</span> risk parameters.</span>
            </div>
          </Card>
        )}
      </div>

      {/* RIGHT: RISK PROFILE REPORT VISUALS (6 cols) */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        
        {/* Risk profile score indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GaugeMeter
            title="Portfolio Risk Score"
            value={profileScores[currentProfile]}
            subtitle={currentProfile.toUpperCase()}
            color={currentProfile === 'low' ? 'success' : currentProfile === 'moderate' ? 'warning' : 'danger'}
          />

          <Card className="p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs text-text-muted uppercase font-semibold">Active Profile Setting</span>
              <h4 className="text-2xl font-bold font-space text-white mt-1 capitalize">{currentProfile} Profile</h4>
              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                Your portfolio currently carries an estimated expected volatility of <span className="font-semibold text-white">{portfolioMetrics.expectedVolatility}%</span> with an expected return of <span className="font-semibold text-white">{portfolioMetrics.expectedReturn}%</span>.
              </p>
            </div>
            
            <div className="border-t border-card-border/60 pt-3 mt-4 flex items-center justify-between text-xs font-mono text-text-muted">
              <span>Goal Success Rate:</span>
              <span className="text-success-custom font-bold">A+ Secure</span>
            </div>
          </Card>
        </div>

        {/* Tactical asset allocation feedback loop */}
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-text-muted mb-4 flex items-center gap-1.5">
            <Scale size={14} className="text-secondary-custom" />
            Risk Alignment Feedback
          </h4>

          <div className="flex flex-col gap-4 text-xs text-text-muted">
            <p className="leading-relaxed">
              To maximize efficiency and protect your principal from unnecessary drawdowns, your active portfolio assets in the **Allocation Lab** should align with your risk rating:
            </p>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-card-border">
                <span className="font-semibold text-white">Current Stock Weight:</span>
                <span className="font-mono text-white font-bold">{portfolio.equity + portfolio.internationalEquity}%</span>
              </div>
              <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-card-border">
                <span className="font-semibold text-white">Current Debt & Cash Weight:</span>
                <span className="font-mono text-white font-bold">{portfolio.debt + portfolio.cash}%</span>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-primary-custom/10 to-secondary-custom/5 border border-primary-custom/15 rounded-lg text-white leading-relaxed flex gap-2 items-start">
              <Award size={16} className="text-primary-custom shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Optimize Your Allocation</span>
                <p className="text-[11px] text-text-muted mt-0.5">Head over to the **Portfolio Allocation** tab to fine-tune your asset sliders to match this recommended mix.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};
