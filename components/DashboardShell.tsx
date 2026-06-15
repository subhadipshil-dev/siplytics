'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calculator, Target, Landmark, Flame,
  PieChart, ShieldAlert, LineChart, FileText, Coins,
  Sun, Moon, Monitor, Menu, X, Sparkles, Share2, TrendingUp,
  CloudOff, User as UserIcon, Settings as SettingsIcon, LogOut
} from 'lucide-react';
import { Button } from './ui';
import { GuestUpgradeModal } from './GuestUpgradeModal';
import { OnboardingModal } from './OnboardingModal';

interface SidebarItem {
  id:   string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard',    name: 'Dashboard',           icon: LayoutDashboard },
  { id: 'sip-calc',     name: 'SIP Calculator',      icon: Calculator },
  { id: 'goal-planner', name: 'Goal Planner',         icon: Target },
  { id: 'retirement',   name: 'Retirement Planner',   icon: Landmark },
  { id: 'fire',         name: 'FIRE Planner',         icon: Flame, badge: 'NEW' },
  { id: 'portfolio',    name: 'Portfolio Lab',        icon: PieChart },
  { id: 'risk-analysis',name: 'Risk Profiler',        icon: ShieldAlert },
  { id: 'simulations',  name: 'Simulations',          icon: LineChart },
  { id: 'extra',        name: 'Extra Calculators',    icon: Coins },
  { id: 'reports',      name: 'Saved & Reports',      icon: FileText },
];

/* ─── Theme Toggle Button ──────────────────────────────────── */
const ThemeToggle: React.FC<{
  theme: 'dark' | 'light' | 'system';
  setTheme: (t: 'dark' | 'light' | 'system') => void;
}> = ({ theme, setTheme }) => (
  <div className="flex items-center gap-1 bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--card-border)] relative">
    {[
      { mode: 'dark' as const,   icon: Moon,    label: 'Dark' },
      { mode: 'light' as const,  icon: Sun,     label: 'Light' },
      { mode: 'system' as const, icon: Monitor, label: 'System' },
    ].map(({ mode, icon: Icon, label }) => (
      <button
        key={mode}
        onClick={() => setTheme(mode)}
        title={`${label} theme`}
        className={`p-1.5 rounded-lg transition-all duration-200 relative z-10 cursor-pointer ${
          theme === mode
            ? 'text-black font-semibold'
            : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
        }`}
      >
        <Icon size={12} />
        {theme === mode && (
          <motion.div
            layoutId="sidebar-active-theme-bg"
            className="absolute inset-0 bg-[var(--primary-custom)] rounded-lg -z-10"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
      </button>
    ))}
  </div>
);

/* ─── Sidebar Nav Item ─────────────────────────────────────── */
const NavItem: React.FC<{
  item: SidebarItem;
  isActive: boolean;
  onClick: () => void;
  collapsed?: boolean;
}> = ({ item, isActive, onClick, collapsed = false }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 w-full rounded-xl transition-all duration-200 cursor-pointer
        ${collapsed ? 'px-3 py-2.5 justify-center' : 'px-3.5 py-2.5 text-sm font-medium'}
        ${isActive
          ? 'bg-[var(--primary-dim)] text-[var(--primary-custom)] font-semibold'
          : 'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg-hover)]'}
      `}
    >
      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="active-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[var(--primary-custom)]"
        />
      )}

      <Icon
        size={16}
        className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
          isActive ? 'text-[var(--primary-custom)]' : ''
        }`}
      />

      {!collapsed && (
        <>
          <span className="truncate">{item.name}</span>
          {item.badge && (
            <span className="ml-auto text-[9px] font-bold bg-[var(--primary-custom)] text-black px-1.5 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </>
      )}

      {isActive && !collapsed && (
        <motion.div
          layoutId="sidebar-dot"
          className="absolute right-3 h-1.5 w-1.5 rounded-full bg-[var(--primary-custom)] shadow-[0_0_6px_var(--primary-custom)]"
        />
      )}
    </button>
  );
};

/* ─── DashboardShell ───────────────────────────────────────── */
export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTab, setActiveTab, theme, setTheme, sipOutputs } = useFinanceStore();
  const { user, isGuest, logout, setUpgradeModalOpen } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied]         = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  /* Sync theme on HTML root */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'dark') {
      root.classList.remove('light');
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      const apply = () => mq.matches ? root.classList.add('light') : root.classList.remove('light');
      apply();
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  const shareSummary = () => {
    const text = `📊 SIPlytics Wealth Projection\n\n💰 Total Invested: ₹${sipOutputs.totalInvested.toLocaleString('en-IN')}\n📈 Projected Corpus: ₹${sipOutputs.finalCorpus.toLocaleString('en-IN')}\n🎯 Inflation Adjusted: ₹${sipOutputs.inflationAdjustedCorpus.toLocaleString('en-IN')}\n\nAnalyze your wealth at SIPlytics!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPage = sidebarItems.find((s) => s.id === activeTab)?.name || 'Overview';

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col md:flex-row overflow-hidden font-inter relative">
      {/* Aurora Background */}
      <div className="aurora" />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, black 60%, transparent 100%)',
        }}
      />

      {/* ── MOBILE HEADER ─────────────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between px-5 py-3.5 border-b border-[var(--card-border)] bg-[var(--background)]/90 backdrop-blur-xl z-20 sticky top-0">
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2.5"
        >
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[var(--primary-custom)] to-[var(--secondary-custom)] flex items-center justify-center text-black font-black font-space text-base shadow-[0_0_15px_rgba(0,212,245,0.35)]">
            S
          </div>
          <span className="font-space font-bold text-base tracking-tight text-[var(--foreground)]">
            SIPlytics
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--foreground)] transition-all"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--foreground)] transition-all"
          >
            <Menu size={16} />
          </button>
        </div>
      </header>

      {/* ── MOBILE DRAWER ─────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 200 }}
              className="w-4/5 max-w-[280px] h-full bg-[var(--background-secondary)] border-r border-[var(--card-border)] p-5 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[var(--primary-custom)] to-[var(--secondary-custom)] flex items-center justify-center text-black font-black font-space text-base">
                    S
                  </div>
                  <span className="font-space font-bold text-base text-[var(--foreground)]">SIPlytics</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--card-bg-hover)] text-[var(--text-muted)]">
                  <X size={16} />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
                {sidebarItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={activeTab === item.id}
                    onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
                  />
                ))}
              </nav>

              <div className="border-t border-[var(--card-border)] pt-4 mt-4">
                <ThemeToggle theme={theme} setTheme={setTheme} />
                <p className="text-[10px] text-[var(--text-subtle)] mt-3 text-center tracking-wide">
                  Analyze · Forecast · Grow
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DESKTOP SIDEBAR ───────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-[230px] h-screen border-r border-[var(--card-border)] bg-[var(--sidebar-bg)] backdrop-blur-2xl z-10 shrink-0 sticky top-0 overflow-hidden">

        {/* Logo */}
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 px-5 py-6 w-full text-left hover:opacity-80 transition-opacity"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[var(--primary-custom)] to-[var(--secondary-custom)] flex items-center justify-center text-black font-black font-space text-xl shadow-[0_0_20px_rgba(0,212,245,0.3)] shrink-0">
            S
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-space font-bold text-base tracking-tight leading-none text-[var(--foreground)]">
              SIPlytics
            </span>
            <span className="text-[9px] text-[var(--text-subtle)] mt-0.5 tracking-[0.15em] uppercase font-mono">
              Fintech Platform
            </span>
          </div>
        </button>

        {/* Section label */}
        <div className="px-5 pb-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
            Navigation
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto pb-4">
          {sidebarItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        {/* Sync Status / Account widget */}
        {user ? (
          <button
            onClick={() => setActiveTab('settings')}
            className="mx-3 mb-3 p-3 text-left rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--card-bg-hover)] border border-[var(--card-border)] flex items-center gap-3 transition-colors cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--primary-custom)] to-[var(--secondary-custom)] flex items-center justify-center text-black font-black text-xs">
              {user.user_metadata?.full_name ? user.user_metadata.full_name[0].toUpperCase() : user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-white truncate">
                {user.user_metadata?.full_name || 'Member'}
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[9px] text-[var(--success-custom)] font-mono">
                <div className="h-1 w-1 rounded-full bg-[var(--success-custom)] animate-pulse" />
                <span>Cloud Synced</span>
              </div>
            </div>
          </button>
        ) : (
          <div className="mx-3 mb-3 p-3.5 rounded-xl bg-[var(--warning-dim)]/30 border border-[var(--warning-custom)]/25">
            <div className="flex items-center gap-1.5 text-[var(--warning-custom)] font-semibold text-xs mb-1">
              <CloudOff size={11} />
              <span>Offline Mode</span>
            </div>
            <p className="text-[10px] text-[var(--text-subtle)] leading-normal mt-0.5">
              Sync calculations and goals to your cloud profile.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full text-center mt-2.5 py-1.5 rounded-lg bg-[var(--warning-custom)] text-black font-bold text-[10px] transition-opacity hover:opacity-90 cursor-pointer animate-pulse"
            >
              Connect Profile
            </button>
          </div>
        )}

        {/* Theme & Footer */}
        <div className="p-3 border-t border-[var(--card-border)] flex items-center justify-between gap-2">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">Theme</span>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-y-auto max-h-screen">
        {/* Top bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-[var(--card-border)] bg-[var(--background)]/70 backdrop-blur-xl sticky top-0 z-20">
          <div>
            <h2 className="text-lg font-bold font-space tracking-tight text-[var(--foreground)] flex items-center gap-2">
              {currentPage}
              <span className="text-xs font-normal text-[var(--text-subtle)] hidden lg:inline">
                / SIPlytics Intelligence
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={shareSummary}>
              <Share2 size={13} />
              {copied ? '✓ Copied!' : 'Share'}
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--success-dim)] border border-[var(--success-custom)]/20 text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--success-custom)] animate-pulse" />
              <span className="text-[var(--success-custom)] font-medium hidden sm:inline">Live</span>
              <span className="text-[var(--text-muted)] hidden lg:inline">Engine Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--text-muted)]">
              <TrendingUp size={12} className="text-[var(--primary-custom)]" />
              <span className="font-space font-semibold text-[var(--foreground)]">
                ₹{(sipOutputs.finalCorpus / 100000).toFixed(1)}L
              </span>
              <span className="hidden sm:inline">projected</span>
            </div>

            {/* Guest status warning or Profile dropdown */}
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUpgradeModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--warning-dim)] border border-[var(--warning-custom)]/20 text-xs text-[var(--warning-custom)] cursor-pointer hover:bg-[var(--warning-dim)]/80 transition-colors"
                >
                  <CloudOff size={12} />
                  <span className="hidden sm:inline font-semibold">Local Save Only</span>
                </button>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/login'}>
                  Sign In
                </Button>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--primary-custom)] to-[var(--secondary-custom)] flex items-center justify-center text-black font-black text-sm select-none cursor-pointer focus:outline-none shadow-[0_0_10px_rgba(0,212,245,0.2)]"
                >
                  {user.user_metadata?.full_name ? user.user_metadata.full_name[0].toUpperCase() : user.email?.[0].toUpperCase()}
                </button>
                
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-[var(--background-secondary)] border border-[var(--card-border)] rounded-xl p-2 shadow-2xl z-50 font-inter text-[var(--foreground)]"
                    >
                      <div className="px-3 py-2 border-b border-[var(--card-border)] mb-1">
                        <div className="text-xs font-bold text-white truncate">
                          {user.user_metadata?.full_name || 'Member'}
                        </div>
                        <div className="text-[10px] text-[var(--text-subtle)] truncate mt-0.5 font-mono">
                          {user.email}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => { setProfileDropdownOpen(false); setActiveTab('dashboard'); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-[var(--card-bg-hover)] transition-colors flex items-center gap-2 cursor-pointer text-[var(--text-muted)] hover:text-white"
                      >
                        <LayoutDashboard size={12} />
                        Overview
                      </button>
                      <button
                        onClick={() => { setProfileDropdownOpen(false); setActiveTab('reports'); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-[var(--card-bg-hover)] transition-colors flex items-center gap-2 cursor-pointer text-[var(--text-muted)] hover:text-white"
                      >
                        <FileText size={12} />
                        Saved Plans
                      </button>
                      <button
                        onClick={() => { setProfileDropdownOpen(false); setActiveTab('settings'); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-[var(--card-bg-hover)] transition-colors flex items-center gap-2 cursor-pointer text-[var(--text-muted)] hover:text-white"
                      >
                        <SettingsIcon size={12} />
                        Settings
                      </button>
                      
                      <button
                        onClick={() => { setProfileDropdownOpen(false); logout(); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-[var(--error-dim)] hover:text-[var(--error-custom)] transition-colors flex items-center gap-2 cursor-pointer mt-1 border-t border-[var(--card-border)] pt-2 text-[var(--text-muted)]"
                      >
                        <LogOut size={12} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-5 md:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <GuestUpgradeModal />
      <OnboardingModal />
    </div>
  );
};
