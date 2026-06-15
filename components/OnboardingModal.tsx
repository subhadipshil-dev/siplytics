'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Compass, Sparkles, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { createClient } from '../utils/supabase/client';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { Button } from './ui';

export const OnboardingModal: React.FC = () => {
  const { user } = useAuthStore();
  const { updateSipInputs, updateRetirementInputs, updateFireInputs } = useFinanceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Form states
  const [age, setAge] = useState<number>(30);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(100000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(40000);
  const [experience, setExperience] = useState<string>('intermediate');
  const [riskAppetite, setRiskAppetite] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [primaryGoal, setPrimaryGoal] = useState<string>('retirement');

  useEffect(() => {
    // Check if onboarding is completed
    const checkOnboardingStatus = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data && !data.onboarding_completed) {
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to retrieve profile onboarding status:', err);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleNext = () => {
    if (step < 3) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const onboardingData = {
        age,
        monthly_income: monthlyIncome,
        monthly_expenses: monthlyExpenses,
        investment_experience: experience,
        risk_appetite: riskAppetite,
        primary_goal: primaryGoal,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_data: onboardingData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Map onboarding appetite to standard RiskProfile options
      let mappedRiskProfile: 'low' | 'moderate' | 'high' = 'moderate';
      if (riskAppetite === 'conservative') mappedRiskProfile = 'low';
      if (riskAppetite === 'aggressive') mappedRiskProfile = 'high';

      // Sync these assumptions into user's active calculators
      updateSipInputs({
        riskProfile: mappedRiskProfile,
        goalType: primaryGoal as any,
      });

      updateRetirementInputs({
        currentAge: age,
        monthlyInvestment: Math.round(monthlyIncome * 0.2), // Default to 20% savings rate
        monthlyExpensesPostRetirement: Math.round(monthlyExpenses * 0.8), // Assume 80% post-retirement
      });

      updateFireInputs({
        currentAge: age,
        monthlyExpenses: monthlyExpenses,
        monthlyInvestment: Math.round(monthlyIncome * 0.3), // Recommend 30% savings rate for FIRE
      });

      setIsOpen(false);
    } catch (err) {
      console.error('Failed to submit profile onboarding data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[var(--background-secondary)] border border-[var(--card-border)] rounded-2xl p-8 shadow-2xl overflow-hidden z-10 font-inter text-[var(--foreground)]"
          >
            {/* Top background accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--primary-custom)]/5 blur-[50px] pointer-events-none" />

            {/* Stepper Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--primary-custom)]" />
                <span className="font-space font-bold text-xs uppercase tracking-wider text-[var(--text-subtle)]">
                  Personalizing Dashboard
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      step === s ? 'w-4 bg-[var(--primary-custom)]' : 'bg-[var(--card-border)]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Form Steps */}
            <div className="min-h-[260px] flex flex-col justify-between">
              {/* Step 1: Financial Scope */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-xl font-bold font-space tracking-tight mb-1">
                      Welcome to SIPlytics
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Let's set your starting benchmarks to customize projections.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
                        Current Age (Years)
                      </label>
                      <input
                        type="number"
                        min={18}
                        max={100}
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-custom)]/40 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
                          Monthly Income (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                          className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-custom)]/40 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
                          Monthly Expenses (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={monthlyExpenses}
                          onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                          className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-custom)]/40 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Risk Profiler */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-xl font-bold font-space tracking-tight mb-1">
                      Experience & Risk
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      How comfortable are you with portfolio volatility and drawdown?
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Experience selection */}
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
                        Investment Experience
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setExperience(lvl)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border capitalize transition-colors cursor-pointer ${
                              experience === lvl
                                ? 'bg-[var(--primary-dim)] border-[var(--primary-custom)] text-[var(--primary-custom)]'
                                : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--card-border-hover)]'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Risk Tolerance */}
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
                        Risk Tolerance
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: 'conservative' as const, title: 'Conservative', desc: 'Focus on wealth preservation. Low equity weights.' },
                          { id: 'moderate' as const, title: 'Moderate', desc: 'Balanced risk/return curve. Standard index weights.' },
                          { id: 'aggressive' as const, title: 'Aggressive', desc: 'Maximized compound curves. Equity/international focus.' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setRiskAppetite(opt.id)}
                            className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                              riskAppetite === opt.id
                                ? 'bg-[var(--primary-dim)] border-[var(--primary-custom)] text-[var(--primary-custom)]'
                                : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--card-border-hover)]'
                            }`}
                          >
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                              riskAppetite === opt.id ? 'border-[var(--primary-custom)]' : 'border-[var(--card-border)]'
                            }`}>
                              {riskAppetite === opt.id && <div className="h-2 w-2 rounded-full bg-[var(--primary-custom)]" />}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[var(--foreground)]">{opt.title}</h4>
                              <p className="text-[10px] text-[var(--text-subtle)] mt-0.5">{opt.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Objective Selection */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-xl font-bold font-space tracking-tight mb-1">
                      Primary Objective
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      What is the primary target for your SIP allocations?
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'retirement', label: 'Early Retirement', icon: Target },
                      { id: 'house', label: 'Property / House', icon: Compass },
                      { id: 'education', label: 'Higher Education', icon: Compass },
                      { id: 'wealth', label: 'General Compounding', icon: Sparkles },
                    ].map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => setPrimaryGoal(goal.id)}
                        className={`p-4 rounded-xl border flex flex-col gap-3 text-left transition-colors cursor-pointer ${
                          primaryGoal === goal.id
                            ? 'bg-[var(--primary-dim)] border-[var(--primary-custom)] text-[var(--primary-custom)]'
                            : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--card-border-hover)]'
                        }`}
                      >
                        <goal.icon size={18} className={primaryGoal === goal.id ? 'text-[var(--primary-custom)]' : 'text-[var(--text-subtle)]'} />
                        <span className="text-xs font-bold font-space text-[var(--foreground)]">{goal.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step Navigation Actions */}
              <div className="flex justify-between items-center mt-8 border-t border-[var(--card-border)] pt-5">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={step === 1}
                  className="gap-1.5"
                >
                  <ChevronLeft size={14} />
                  Back
                </Button>

                {step < 3 ? (
                  <Button onClick={handleNext} className="gap-1.5">
                    Next
                    <ChevronRight size={14} />
                  </Button>
                ) : (
                  <Button onClick={handleComplete} disabled={loading} className="gap-1.5">
                    {loading ? 'Saving...' : 'Explore Dashboard'}
                    <CheckCircle2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
