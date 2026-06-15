'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, Input, Select, Button, Slider, ProgressBar } from '../components/ui';
import { GoalType } from '../types';
import { Target, Plus, Trash2, AlertCircle, Home, Car, Heart, GraduationCap, Landmark, Plane, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TOOLTIP_STYLE = {
  background: 'var(--background-secondary)',
  borderColor: 'var(--card-border)',
  borderRadius: 10,
  fontSize: 12,
  fontFamily: 'Space Grotesk',
  color: 'var(--foreground)',
};

const goalIcons: Record<GoalType, React.ComponentType<{ size?: number; className?: string }>> = {
  house: Home, car: Car, marriage: Heart, education: GraduationCap,
  retirement: Landmark, vacation: Plane, fire: Flame, custom: Target,
};

export const GoalPlanner: React.FC = () => {
  const { goals, addGoal, deleteGoal } = useFinanceStore();

  const [name, setName]                 = useState('');
  const [type, setType]                 = useState<GoalType>('house');
  const [targetAmount, setTargetAmount] = useState(5000000);
  const [currentSavings, setSavings]    = useState(500000);
  const [yearsRemaining, setYears]      = useState(10);
  const [expectedReturn, setReturn]     = useState(12);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addGoal({ name, type, targetAmount, currentSavings, yearsRemaining, expectedReturn });
    setName(''); setTargetAmount(5000000); setSavings(500000); setYears(10); setReturn(12);
  };

  const fmt = (v: number) => v >= 1e7 ? `₹${(v / 1e7).toFixed(2)} Cr` : v >= 1e5 ? `₹${(v / 1e5).toFixed(2)} L` : `₹${v.toLocaleString('en-IN')}`;

  const totalTarget   = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSavings  = goals.reduce((s, g) => s + g.currentSavings, 0);
  const totalGap      = goals.reduce((s, g) => s + g.gapAmount, 0);
  const overallPct    = totalTarget > 0 ? Math.round((totalSavings / totalTarget) * 100) : 0;

  const chartData = goals.map((g) => ({ name: g.name.slice(0, 12), Target: g.targetAmount, Savings: g.currentSavings }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 select-none">

      {/* ── LEFT: FORM ── */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card className="p-6">
          <h3 className="font-space font-bold text-base text-[var(--foreground)] mb-5 flex items-center gap-2">
            <Plus className="text-[var(--primary-custom)]" size={17} />
            Create Financial Goal
          </h3>

          <form onSubmit={handleAdd} className="flex flex-col gap-2">
            <Input label="Goal Name" type="text" placeholder="e.g. Dream Home Down-payment" value={name} onChange={(e) => setName(e.target.value)} required />
            <Select label="Category" value={type} onChange={(e) => setType(e.target.value as GoalType)}
              options={[
                { value: 'house',      label: 'Home Purchase' },
                { value: 'car',        label: 'Car Purchase' },
                { value: 'marriage',   label: 'Wedding / Marriage' },
                { value: 'education',  label: 'Higher Education' },
                { value: 'retirement', label: 'Retirement Fund' },
                { value: 'vacation',   label: 'Travel & Vacation' },
                { value: 'fire',       label: 'Financial Independence' },
                { value: 'custom',     label: 'Custom Goal' },
              ]}
            />
            <Slider label="Target Amount"    min={100000}  max={200000000} step={100000} value={targetAmount}    onChange={setTargetAmount} prefix="₹" />
            <Slider label="Initial Savings"  min={0}       max={Math.min(targetAmount, 50000000)} step={50000}  value={currentSavings}    onChange={setSavings}      prefix="₹" />
            <Slider label="Years to Achieve" min={1}       max={40}                               value={yearsRemaining}     onChange={setYears}        suffix=" Yrs" />
            <Slider label="Expected Return"  min={5}       max={25}        step={0.5}             value={expectedReturn}     onChange={setReturn}        suffix="%" />
            <Button type="submit" className="w-full mt-3" glow>Add Goal to Dashboard</Button>
          </form>
        </Card>

        <div className="p-4 rounded-xl bg-[var(--warning-dim)] border border-[var(--warning-custom)]/25 flex gap-2.5 items-start">
          <AlertCircle size={15} className="text-[var(--warning-custom)] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-[var(--foreground)]">Goal Inflation Warning</span>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Values do not auto-adjust for inflation. Compound your target by ~6% annually before entering the required amount.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: GOALS LIST ── */}
      <div className="lg:col-span-8 flex flex-col gap-5">

        {/* Summary Stats */}
        {goals.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Combined Target',  val: fmt(totalTarget),  color: 'var(--foreground)' },
              { label: 'Current Funds',    val: fmt(totalSavings), color: 'var(--success-custom)' },
              { label: 'Capital Gap',      val: fmt(totalGap),     color: 'var(--warning-custom)' },
            ].map((k, i) => (
              <div key={i} className="glass-premium rounded-2xl p-4">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-medium block mb-1">{k.label}</span>
                <span className="text-base font-bold font-space" style={{ color: k.color }}>{k.val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center px-1">
          <h3 className="font-space font-bold text-base text-[var(--foreground)]">Your Goals ({goals.length})</h3>
          {goals.length > 0 && (
            <span className="text-xs text-[var(--text-muted)]">Overall: <strong className="text-[var(--foreground)]">{overallPct}%</strong> funded</span>
          )}
        </div>

        {/* Empty state */}
        {goals.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 border-dashed border-2 border-[var(--card-border)] text-center">
            <Target size={36} className="text-[var(--text-muted)] mb-3" />
            <p className="text-sm font-semibold text-[var(--foreground)]">No active goals yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
              Create a goal on the left to calculate required SIP and success probability.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {goals.map((goal) => {
              const Icon = goalIcons[goal.type] || Target;
              return (
                <Card key={goal.id} className="p-5 flex flex-col sm:flex-row gap-4">
                  {/* Left section */}
                  <div className="flex-1 flex gap-4 items-start">
                    <div className="p-2.5 bg-[var(--primary-dim)] border border-[var(--primary-custom)]/20 rounded-xl text-[var(--primary-custom)] shrink-0">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 flex flex-col gap-2 min-w-0">
                      <div>
                        <h4 className="font-space font-bold text-sm text-[var(--foreground)]">{goal.name}</h4>
                        <div className="flex gap-3 text-[10px] text-[var(--text-subtle)] mt-0.5 uppercase font-mono tracking-wide">
                          <span>Horizon: {goal.yearsRemaining} yrs</span>
                          <span>Yield: {goal.expectedReturn}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <ProgressBar value={goal.progressPercent} color="primary" />
                        <div className="flex justify-between text-[10px] text-[var(--text-subtle)]">
                          <span>Saved: {fmt(goal.currentSavings)}</span>
                          <span>Target: {fmt(goal.targetAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right section */}
                  <div className="sm:border-l border-[var(--card-border)] sm:pl-5 shrink-0 flex flex-col justify-between gap-3 min-w-[168px]">
                    <div className="flex flex-col gap-1.5">
                      {[
                        { label: 'Required SIP:',  val: goal.requiredSip > 0 ? `₹${goal.requiredSip.toLocaleString('en-IN')}/mo` : 'Achieved!', color: 'var(--primary-custom)' },
                        { label: 'Or Lumpsum:',    val: goal.requiredLumpsum > 0 ? fmt(goal.requiredLumpsum) : 'Achieved!',                        color: 'var(--foreground)' },
                        { label: 'Probability:',   val: `${goal.achievementProbability}%`,                                                         color: 'var(--success-custom)' },
                      ].map((r, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-[var(--text-muted)]">{r.label}</span>
                          <span className="font-mono font-bold" style={{ color: r.color }}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="text-[var(--danger-custom)] hover:bg-[var(--danger-dim)] self-start" onClick={() => deleteGoal(goal.id)}>
                      <Trash2 size={13} /> Remove
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Gap Analysis Chart */}
        {goals.length > 0 && (
          <Card className="p-5">
            <h4 className="font-space font-bold text-sm text-[var(--foreground)] mb-4">Goal Gap Analysis</h4>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false}
                    tickFormatter={(v) => v >= 1e7 ? `${(v / 1e7).toFixed(0)}Cr` : v >= 1e5 ? `${(v / 1e5).toFixed(0)}L` : `${v / 1000}K`}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [fmt(v), '']} />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
                  <Bar dataKey="Savings" name="Current Fund"  fill="var(--secondary-custom)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Target"  name="Target Amount" fill="var(--primary-custom)"   radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
