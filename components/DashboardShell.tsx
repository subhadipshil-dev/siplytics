'use client';

import React, { useEffect, useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calculator,
  Target,
  Landmark,
  Flame,
  PieChart,
  ShieldAlert,
  LineChart,
  FileText,
  Coins,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Sparkles,
  Share2,
  TrendingUp,
  TrendingDown,
  Percent
} from 'lucide-react';
import { Button } from './ui';

interface SidebarItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'sip-calc', name: 'SIP Calculator', icon: Calculator },
  { id: 'goal-planner', name: 'Goal Planner', icon: Target },
  { id: 'retirement', name: 'Retirement Planner', icon: Landmark },
  { id: 'fire', name: 'FIRE Planner', icon: Flame },
  { id: 'portfolio', name: 'Portfolio Allocation', icon: PieChart },
  { id: 'risk-analysis', name: 'Risk Analysis', icon: ShieldAlert },
  { id: 'simulations', name: 'Simulations', icon: LineChart },
  { id: 'extra', name: 'Extra Calculators', icon: Coins },
  { id: 'reports', name: 'Saved & Reports', icon: FileText }
];

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTab, setActiveTab, theme, setTheme, sipOutputs } = useFinanceStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync theme with HTML document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'dark') {
      root.classList.remove('light');
    } else {
      // System preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const handleChange = () => {
        if (mediaQuery.matches) {
          root.classList.add('light');
        } else {
          root.classList.remove('light');
        }
      };
      handleChange();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Share calculation summary
  const shareSummary = () => {
    const text = `SIPlytics Wealth Projection:\nTotal Invested: ₹${sipOutputs.totalInvested.toLocaleString('en-IN')}\nProjected Corpus: ₹${sipOutputs.finalCorpus.toLocaleString('en-IN')}\nInflation Adjusted: ₹${sipOutputs.inflationAdjustedCorpus.toLocaleString('en-IN')}\nAnalyze your wealth at SIPlytics!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Animated Background Aurora */}
      <div className="aurora opacity-40 dark:opacity-60" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 glass z-20 sticky top-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-custom to-secondary-custom flex items-center justify-center text-black font-black font-space text-lg shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            S
          </div>
          <span className="font-space font-bold text-lg tracking-tight bg-gradient-to-r from-primary-custom to-white bg-clip-text text-transparent">
            SIPlytics
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-slate-800/40 text-text-muted hover:text-white"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-slate-800/40 text-text-muted hover:text-white"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 md:hidden"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-4/5 max-w-sm h-full bg-slate-950/90 border-r border-card-border p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-custom to-secondary-custom flex items-center justify-center text-black font-black font-space text-lg">
                      S
                    </div>
                    <span className="font-space font-bold text-lg tracking-tight bg-gradient-to-r from-primary-custom to-white bg-clip-text text-transparent">
                      SIPlytics
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/5"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-custom/15 to-secondary-custom/5 text-primary-custom border-l-2 border-primary-custom'
                            : 'text-text-muted hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-card-border pt-4">
                <p className="text-xs text-text-muted text-center">Analyze. Forecast. Grow.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 h-screen border-r border-card-border/60 bg-black/20 backdrop-blur-xl z-10 shrink-0 sticky top-0 select-none">
        <div className="px-6 py-8 flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-custom to-secondary-custom flex items-center justify-center text-black font-black font-space text-xl shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-space font-bold text-lg tracking-tight leading-none bg-gradient-to-r from-primary-custom to-white bg-clip-text text-transparent">
              SIPlytics
            </span>
            <span className="text-[10px] text-text-muted mt-0.5 tracking-widest font-mono">FINTECH PLATFORM</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-2 flex flex-col gap-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-primary-custom/10 text-primary-custom border-l-2 border-primary-custom'
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary-custom' : 'text-text-muted'}`} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-glow"
                    className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary-custom shadow-[0_0_8px_var(--primary-custom)]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Insights Indicator */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-white/[0.02] border border-card-border text-xs flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-primary-custom font-semibold">
            <Sparkles size={12} />
            <span>Compounding Score</span>
          </div>
          <div className="flex items-center justify-between text-text-muted">
            <span>Progress Grade:</span>
            <span className="font-mono text-white font-semibold">A+ Excellent</span>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-card-border/60 flex items-center justify-between text-xs text-text-muted">
          <span>Theme</span>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-card-border">
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-slate-800 text-white' : 'hover:text-white'}`}
              title="Dark Theme"
            >
              <Moon size={12} />
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-md ${theme === 'light' ? 'bg-slate-300 text-black' : 'hover:text-white'}`}
              title="Light Theme"
            >
              <Sun size={12} />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-md ${theme === 'system' ? 'bg-slate-800 text-white' : 'hover:text-white'}`}
              title="System Default"
            >
              <Monitor size={12} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-y-auto max-h-screen">
        {/* DESKTOP HEADER */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-card-border/40 bg-black/10 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-bold font-space capitalize tracking-tight flex items-center gap-2 text-foreground">
              {sidebarItems.find((s) => s.id === activeTab)?.name || 'Welcome'}
              <span className="text-xs font-normal text-text-muted">/ SIPlytics Intelligence</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={shareSummary}>
              <Share2 size={14} />
              {copied ? 'Copied summary!' : 'Share projections'}
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-card-border text-xs">
              <div className="h-2 w-2 rounded-full bg-success-custom animate-pulse" />
              <span className="text-text-muted font-medium">Calculation Engine: Active</span>
            </div>
          </div>
        </header>

        {/* ACTIVE TAB DISPLAY AREA */}
        <div className="flex-1 p-6 md:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
