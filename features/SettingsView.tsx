'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { Shield, Sparkles, Sliders, Moon, Sun, Monitor, RefreshCw, Key, Cloud, Eye } from 'lucide-react';
import { Button, Card } from '../components/ui';

export const SettingsView: React.FC = () => {
  const { theme, setTheme, sipInputs, updateSipInputs, goals, scenarios } = useFinanceStore();
  const { user, isGuest, logout } = useAuthStore();
  const [resetting, setResetting] = useState(false);

  const riskOptions = [
    { id: 'conservative', label: 'Conservative', desc: 'Focus on index tracking & capital protection' },
    { id: 'moderate', label: 'Moderate', desc: 'Standard growth indexing with balanced allocation' },
    { id: 'aggressive', label: 'Aggressive', desc: 'Maximizing compound gains via equity weight' }
  ];

  const handleClearCache = () => {
    setResetting(true);
    setTimeout(() => {
      localStorage.clear();
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-inter text-[var(--foreground)] animate-fade-in select-none">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-space tracking-tight">System Settings</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Manage your account assumptions, data sync configurations, and interface options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Assumption Sync Controls */}
        <div className="md:col-span-2 space-y-6">
          {/* Section 1: Financial Assumptions */}
          <Card className="p-6 space-y-6 bg-[var(--background-secondary)]/30">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--card-border)]">
              <Sliders size={16} className="text-[var(--primary-custom)]" />
              <h2 className="text-sm font-bold font-space">Global Assumptions</h2>
            </div>

            {/* Risk profile sync */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-[var(--text-muted)] block">
                Default Risk Profile
              </label>
              <div className="space-y-2.5">
                {riskOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateSipInputs({ riskProfile: opt.id as any })}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer ${
                      sipInputs.riskProfile === opt.id
                        ? 'bg-[var(--primary-dim)] border-[var(--primary-custom)] text-[var(--primary-custom)]'
                        : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--card-border-hover)]'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      sipInputs.riskProfile === opt.id ? 'border-[var(--primary-custom)]' : 'border-[var(--card-border)]'
                    }`}>
                      {sipInputs.riskProfile === opt.id && <div className="h-2 w-2 rounded-full bg-[var(--primary-custom)]" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--foreground)]">{opt.label}</h4>
                      <p className="text-[10px] text-[var(--text-subtle)] leading-normal mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Section 2: Visual options */}
          <Card className="p-6 space-y-6 bg-[var(--background-secondary)]/30">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--card-border)]">
              <Moon size={16} className="text-[var(--primary-custom)]" />
              <h2 className="text-sm font-bold font-space">Interface Options</h2>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-[var(--text-muted)] block">Color Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { mode: 'dark' as const, label: 'Dark Mode', icon: Moon },
                  { mode: 'light' as const, label: 'Light Mode', icon: Sun },
                  { mode: 'system' as const, label: 'System', icon: Monitor }
                ].map((opt) => (
                  <button
                    key={opt.mode}
                    onClick={() => setTheme(opt.mode)}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold capitalize transition-all cursor-pointer ${
                      theme === opt.mode
                        ? 'bg-[var(--primary-dim)] border-[var(--primary-custom)] text-[var(--primary-custom)]'
                        : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--card-border-hover)] text-[var(--text-muted)]'
                    }`}
                  >
                    <opt.icon size={16} />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Section 3: Danger Zone */}
          <Card className="p-6 space-y-4 border-[var(--error-custom)]/25 bg-[var(--error-dim)]/5">
            <div className="pb-2">
              <h2 className="text-sm font-bold text-[var(--error-custom)] font-space">Danger Zone</h2>
              <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">
                These options alter local caching variables permanently.
              </p>
            </div>
            <div className="flex justify-between items-center bg-[var(--card-bg)] border border-[var(--card-border)] p-4 rounded-xl">
              <div>
                <h4 className="text-xs font-bold">Reset Local Application Cache</h4>
                <p className="text-[10px] text-[var(--text-subtle)] mt-0.5">
                  Erases all local settings, saved scenarios, and custom target variables.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                disabled={resetting}
                className="border-[var(--error-custom)]/30 text-[var(--error-custom)] hover:bg-[var(--error-dim)] shrink-0 cursor-pointer"
              >
                {resetting ? 'Resetting...' : 'Reset Cache'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Profile & Health sync status */}
        <div className="space-y-6">
          {/* Connection Status Card */}
          <Card className="p-5 bg-[var(--background-secondary)]/30 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-subtle)]">
              Cloud Synchronizer
            </h3>
            
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[var(--success-custom)] text-xs font-semibold bg-[var(--success-dim)] border border-[var(--success-custom)]/10 p-2.5 rounded-xl">
                  <Cloud size={14} className="animate-pulse" />
                  <span>Cloud Storage Connected</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Your variables and plans are protected by RLS rules and synced to Supabase database.
                </p>
                <div className="border-t border-[var(--card-border)] pt-3 text-[10px] space-y-1.5 font-mono text-[var(--text-subtle)]">
                  <div className="flex justify-between">
                    <span>Active Goals:</span>
                    <span className="text-white font-bold">{goals.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saved Scenarios:</span>
                    <span className="text-white font-bold">{scenarios.length}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[var(--warning-custom)] text-xs font-semibold bg-[var(--warning-dim)] border border-[var(--warning-custom)]/10 p-2.5 rounded-xl">
                  <Shield size={14} />
                  <span>Offline Guest Session</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Your data is stored locally in this browser. Creating a member account protects your projections from cache erasures.
                </p>
                <Button
                  onClick={() => window.location.href = '/signup'}
                  size="sm"
                  className="w-full justify-center text-xs"
                >
                  Create Cloud Account
                </Button>
              </div>
            )}
          </Card>

          {/* User Profile Summary */}
          {user && (
            <Card className="p-5 bg-[var(--background-secondary)]/30 space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                User Account
              </h3>
              <div className="space-y-2">
                <div className="text-xs font-bold text-white leading-normal truncate">
                  {user.user_metadata?.full_name || 'Member Account'}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-mono leading-none truncate select-all">
                  {user.email}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="w-full justify-center border-white/5 text-[var(--text-muted)] hover:text-white cursor-pointer"
              >
                Sign Out
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
