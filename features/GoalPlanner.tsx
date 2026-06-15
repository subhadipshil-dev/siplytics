'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, Input, Select, Button, Slider, ProgressBar } from '../components/ui';
import { GoalType } from '../types';
import {
  Target,
  Plus,
  Trash2,
  AlertCircle,
  Home,
  Car,
  Heart,
  GraduationCap,
  Landmark,
  Plane,
  Flame,
  Award,
  Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const GoalPlanner: React.FC = () => {
  const { goals, addGoal, deleteGoal } = useFinanceStore();

  // Local state for the goal creation form
  const [name, setName] = useState('');
  const [type, setType] = useState<GoalType>('house');
  const [targetAmount, setTargetAmount] = useState(5000000);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [yearsRemaining, setYearsRemaining] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);

  const goalIcons: Record<GoalType, React.ComponentType<any>> = {
    house: Home,
    car: Car,
    marriage: Heart,
    education: GraduationCap,
    retirement: Landmark,
    vacation: Plane,
    fire: Flame,
    custom: Target
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addGoal({
      name,
      type,
      targetAmount,
      currentSavings,
      yearsRemaining,
      expectedReturn
    });

    // Reset Form
    setName('');
    setTargetAmount(5000000);
    setCurrentSavings(500000);
    setYearsRemaining(10);
    setExpectedReturn(12);
  };

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Chart data: Target vs Savings for active goals
  const chartData = goals.map((g) => ({
    name: g.name,
    Target: g.targetAmount,
    Savings: g.currentSavings
  }));

  // Calculations for summary card
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavings = goals.reduce((sum, g) => sum + g.currentSavings, 0);
  const totalGap = goals.reduce((sum, g) => sum + g.gapAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSavings / totalTarget) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* LEFT: ADD GOAL FORM (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card className="p-6">
          <h3 className="font-space font-bold text-lg text-white mb-6 flex items-center gap-2">
            <Plus className="text-primary-custom" size={18} />
            Create Financial Goal
          </h3>

          <form onSubmit={handleAddGoal} className="flex flex-col gap-4">
            <Input
              label="Goal Name"
              type="text"
              placeholder="e.g. Dream Home Downpayment"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Select
              label="Goal Category"
              value={type}
              onChange={(e) => setType(e.target.value as GoalType)}
              options={[
                { value: 'house', label: 'Home Purchase' },
                { value: 'car', label: 'Car Purchase' },
                { value: 'marriage', label: 'Wedding / Marriage' },
                { value: 'education', label: 'Higher Education' },
                { value: 'retirement', label: 'Retirement fund' },
                { value: 'vacation', label: 'Travel & Vacation' },
                { value: 'fire', label: 'Financial Independence (FIRE)' },
                { value: 'custom', label: 'Custom Goal' }
              ]}
            />

            <Slider
              label="Target Amount Required"
              min={100000}
              max={200000000}
              step={100000}
              value={targetAmount}
              onChange={setTargetAmount}
              prefix="₹"
            />

            <Slider
              label="Initial Savings Already Made"
              min={0}
              max={Math.min(targetAmount, 50000000)}
              step={50000}
              value={currentSavings}
              onChange={setCurrentSavings}
              prefix="₹"
            />

            <Slider
              label="Years to Achieve"
              min={1}
              max={40}
              value={yearsRemaining}
              onChange={setYearsRemaining}
              suffix=" Years"
            />

            <Slider
              label="Expected Return Yield"
              min={5}
              max={25}
              step={0.5}
              value={expectedReturn}
              onChange={setExpectedReturn}
              suffix="%"
            />

            <Button type="submit" className="w-full mt-2" glow>
              Add Goal to Dashboard
            </Button>
          </form>
        </Card>

        {/* GOAL PLANNING INSIGHT */}
        <Card className="bg-gradient-to-br from-secondary-custom/10 to-primary-custom/5 p-4 border border-secondary-custom/20">
          <div className="flex gap-2.5 items-start text-xs leading-relaxed text-text-muted">
            <AlertCircle size={16} className="text-secondary-custom shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-white">
              <span className="font-semibold text-white">Goal Inflation Warning</span>
              <span>Values in this section do not automatically adjust for future inflation. We recommend compounding your target goal by ~6% annually before entering your final required target.</span>
            </div>
          </div>
        </Card>
      </div>

      {/* RIGHT: LIST OF GOALS & COMPARISON CHART (8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Goal Summary Statistics */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
              <span className="text-xs text-text-muted">Combined Target</span>
              <span className="text-lg font-bold font-space text-white mt-1">
                {formatCurrency(totalTarget)}
              </span>
            </div>
            <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
              <span className="text-xs text-text-muted">Current Fund</span>
              <span className="text-lg font-bold font-space text-success-custom mt-1">
                {formatCurrency(totalSavings)}
              </span>
            </div>
            <div className="p-4 rounded-2xl glass border border-card-border/80 flex flex-col">
              <span className="text-xs text-text-muted">Required Capital Gap</span>
              <span className="text-lg font-bold font-space text-warning-custom mt-1">
                {formatCurrency(totalGap)}
              </span>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="flex flex-col gap-4">
          <h3 className="font-space font-bold text-lg text-white px-1 flex items-center justify-between">
            <span>Your Goals ({goals.length})</span>
            {goals.length > 0 && (
              <span className="text-xs font-normal text-text-muted">Overall Progress: {overallProgress}%</span>
            )}
          </h3>

          {goals.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 border-dashed border-2 border-card-border/50 text-center">
              <Target size={40} className="text-text-muted mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-white">No active goals found</p>
              <p className="text-xs text-text-muted mt-1 max-w-sm">
                Enter your goal details in the left panel to calculate required SIP investments and success rates.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {goals.map((goal) => {
                const Icon = goalIcons[goal.type] || Target;
                return (
                  <Card key={goal.id} className="p-5 flex flex-col sm:flex-row justify-between gap-4 relative">
                    <div className="flex-1 flex gap-4 items-start">
                      <div className="p-3 bg-primary-custom/5 border border-primary-custom/10 rounded-xl text-primary-custom shrink-0">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <div>
                          <h4 className="font-space font-bold text-base text-white">{goal.name}</h4>
                          <div className="flex gap-3 text-[10px] text-text-muted mt-1 uppercase font-mono">
                            <span>Horizon: {goal.yearsToReach || goal.yearsRemaining} Years</span>
                            <span>Yield: {goal.expectedReturn}%</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 mt-1">
                          <ProgressBar value={goal.progressPercent} color="primary" />
                          <div className="flex justify-between text-[10px] text-text-muted mt-1">
                            <span>Fund: {formatCurrency(goal.currentSavings)}</span>
                            <span>Target: {formatCurrency(goal.targetAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="sm:border-l border-card-border/60 sm:pl-6 shrink-0 flex flex-col justify-between items-end gap-3 min-w-[170px]">
                      <div className="text-right w-full">
                        <div className="flex justify-between sm:justify-end gap-2 text-xs">
                          <span className="text-text-muted">Required SIP:</span>
                          <span className="font-mono text-primary-custom font-bold">
                            {goal.requiredSip > 0 ? `₹${goal.requiredSip.toLocaleString('en-IN')}/mo` : 'Achieved!'}
                          </span>
                        </div>
                        <div className="flex justify-between sm:justify-end gap-2 text-xs mt-1">
                          <span className="text-text-muted">Or Lumpsum:</span>
                          <span className="font-mono text-white">
                            {goal.requiredLumpsum > 0 ? `₹${goal.requiredLumpsum.toLocaleString('en-IN')}` : 'Achieved!'}
                          </span>
                        </div>
                        <div className="flex justify-between sm:justify-end gap-2 text-xs mt-1">
                          <span className="text-text-muted">Probability:</span>
                          <span className="font-mono text-success-custom font-bold">{goal.achievementProbability}%</span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger-custom hover:text-red-400 p-1 rounded hover:bg-red-500/10 cursor-pointer"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 size={14} />
                        <span>Remove Goal</span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Goals Comparison Bar Chart */}
        {goals.length > 0 && (
          <Card className="p-6">
            <h4 className="font-space font-bold text-sm text-white mb-4">Goal Gap Analysis</h4>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
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
                      fontSize: '12px'
                    }}
                    formatter={(v: any) => formatCurrency(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Savings" name="Current Fund" fill="#7C4DFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Target" name="Target Amount" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};
