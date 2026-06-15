'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Button, Card, Slider, ProgressBar, AnimatedCounter } from '../components/ui';
import { Header } from '../components/Header';
import {
  Sparkles, ArrowRight, ShieldCheck, Clock, Award, CheckCircle2,
  TrendingUp, AlertTriangle, Shield, Compass, Calendar, Target,
  Flame, HelpCircle, Info
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, Variants } from 'framer-motion';

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

// Dynamically load charts to avoid hydration shifts on client-side rendering
const HeroPreviewChart = dynamic(() => import('../components/charts/HeroPreviewChart'), { ssr: false });

export const LandingPage: React.FC = () => {
  const { setActiveTab, updateSipInputs } = useFinanceStore();
  const [quickSip, setQuickSip] = useState(15000);
  const [quickYears, setQuickYears] = useState(15);
  const [quickStepUp, setQuickStepUp] = useState(10);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate quick forecasting curve for preview
  useEffect(() => {
    const data = [];
    const monthlyRate = 12.0 / 12 / 100;
    let balance = 0;
    let invested = 0;
    for (let yr = 0; yr <= quickYears; yr++) {
      if (yr > 0) {
        const sip = quickSip * Math.pow(1 + quickStepUp / 100, yr - 1);
        for (let m = 1; m <= 12; m++) {
          invested += sip;
          balance = (balance + sip) * (1 + monthlyRate);
        }
      }
      data.push({ name: `Y${yr}`, Invested: Math.round(invested), Wealth: Math.round(balance) });
    }
    setPreviewData(data);
  }, [quickSip, quickYears, quickStepUp]);

  // Subtle digital network particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const pts = Array.from({ length: 25 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 1.2 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      o: Math.random() * 0.2 + 0.05,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14, 165, 233, ${p.o})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const fmt = (v: number) =>
    v >= 1e7
      ? `₹${(v / 1e7).toFixed(2)} Cr`
      : v >= 1e5
      ? `₹${(v / 1e5).toFixed(2)} L`
      : `₹${v.toLocaleString('en-IN')}`;

  const finalWealth = previewData[previewData.length - 1]?.Wealth || 0;
  const finalInvested = previewData[previewData.length - 1]?.Invested || 0;

  // Handle calculator CTA navigation
  const handleLaunchPlanning = () => {
    updateSipInputs({
      monthlySip: quickSip,
      durationYears: quickYears,
      stepUpPercent: quickStepUp,
    });
    setActiveTab('dashboard');
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--background)] overflow-x-hidden selection:bg-[var(--primary-dim)] text-[var(--foreground)]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-15" />
      <div className="aurora" />

      {/* Global Product Navigation */}
      <Header />

      {/* ── SECTION 1: HERO ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Headline & Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 flex flex-col gap-6 text-left"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary-dim)] border border-[var(--primary-custom)]/20 text-[var(--primary-custom)] text-xs font-semibold w-fit">
            <ShieldCheck size={13} />
            Trusted Wealth Planning Platform
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-5xl font-black font-space tracking-tight leading-[1.15] text-[var(--foreground)]">
            Understand Your <br />
            <span className="bg-gradient-to-r from-[var(--primary-custom)] to-[var(--secondary-custom)] bg-clip-text text-transparent">
              Financial Future
            </span>{" "}
            Before You Invest.
          </h1>

          <p className="text-base text-[var(--text-muted)] leading-relaxed max-w-xl">
            SIPlytics helps investors understand future wealth, retirement readiness, risk exposure, inflation impact, and financial freedom through advanced simulations and investment intelligence.
          </p>

          <div className="flex flex-wrap gap-4 mt-2">
            <Button size="lg" glow onClick={() => setActiveTab('dashboard')}>
              Start Planning <ArrowRight size={16} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setActiveTab('dashboard')}>
              View Demo
            </Button>
          </div>
        </motion.div>

        {/* Right Side: Realistic App Interface Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="lg:col-span-6 w-full"
        >
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--background-secondary)] shadow-2xl p-6 relative overflow-hidden flex flex-col gap-5 select-none transition-all duration-300">
            {/* Header Toolbar */}
            <div className="flex justify-between items-center border-b border-[var(--card-border)] pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--primary-custom)]" />
                <span className="text-xs font-bold text-[var(--foreground)]">SIPlytics Dashboard Preview</span>
              </div>
              <span className="text-[9px] font-mono text-[var(--text-subtle)] uppercase tracking-wider">SECURE ENGINE ACTIVE</span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col gap-0.5">
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Net Worth Corpus</span>
                <span className="text-sm font-bold text-[var(--foreground)] font-space">₹1.48 Cr</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col gap-0.5">
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Risk Score</span>
                <span className="text-sm font-bold text-[var(--primary-custom)] font-space">68/100</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col gap-0.5">
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Goal Probability</span>
                <span className="text-sm font-bold text-[var(--success-custom)] font-space">82%</span>
              </div>
            </div>

            {/* Live Chart Preview */}
            <div className="flex flex-col gap-2 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--foreground)]">Compounding Curve</span>
                <span className="text-[9px] font-mono text-[var(--text-subtle)]">15 YR HORIZON</span>
              </div>
              <div className="h-32 w-full mt-2">
                <HeroPreviewChart data={previewData} fmt={fmt} />
              </div>
            </div>

            {/* Retirement and Milestone footer */}
            <div className="grid grid-cols-2 gap-4 border-t border-[var(--card-border)] pt-4">
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-[10px] text-[var(--text-subtle)] uppercase">Retirement Readiness</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--success-custom)]" />
                  <span className="font-semibold">Fully Funded Target</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-[10px] text-[var(--text-subtle)] uppercase">Milestone Goal</span>
                <span className="font-semibold mt-0.5 text-[var(--primary-custom)]">₹1 Cr Reachable in Yr 11</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 2: TRUST STRIP ── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 border-y border-[var(--card-border)] bg-[var(--background-secondary)]/30 py-8 select-none"
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-6">
          <span className="text-xs font-mono font-bold text-[var(--text-subtle)] uppercase tracking-widest block w-full lg:w-auto text-center lg:text-left mb-2 lg:mb-0">
            PROJECTION CAPABILITIES
          </span>
          <div className="flex flex-wrap justify-center lg:justify-end gap-x-12 gap-y-4 w-full lg:w-auto">
            {[
              'SIP Planning',
              'Retirement Forecasting',
              'Risk Analysis',
              'Monte Carlo Simulations',
              'Goal Planning',
              'Portfolio Insights'
            ].map((cap, i) => (
              <span key={i} className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[var(--primary-custom)] shrink-0" />
                {cap}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 3: WHY SIPLYTICS ── */}
      <motion.section
        id="why-siplytics"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full flex flex-col items-center text-center"
      >
        <div className="max-w-3xl flex flex-col gap-5">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary-custom)] bg-[var(--primary-dim)] border border-[var(--primary-custom)]/20 rounded-full px-3 py-1 w-fit mx-auto">
            Why We Exist
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-space text-[var(--foreground)] leading-tight mt-2">
            Most investors know how much they invest. <br className="hidden md:block" />
            <span className="text-[var(--text-muted)]">Few understand the outcomes.</span>
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xl mx-auto mt-2">
            Traditional calculators spit out simple compound interest metrics. They fail to factor in real-world hazards that alter your actual wealth outcomes. SIPlytics bridges the gap by projecting inflation erode rates, safe withdrawal limits, allocation risk metrics, and worst-case market scenarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16 text-left">
          {[
            {
              icon: <AlertTriangle className="text-[var(--danger-custom)]" size={20} />,
              title: 'Inflation Erosion Tracking',
              text: 'Visualise the impact inflation has on your future purchasing power, so your future ₹1 Crore does not feel like ₹40 Lakhs.'
            },
            {
              icon: <Shield className="text-[var(--success-custom)]" size={20} />,
              title: 'Asset Allocation Modeling',
              text: 'Analyze how splits between equities, debt, gold, and cash protect or expose your capital during market cycles.'
            },
            {
              icon: <TrendingUp className="text-[var(--primary-custom)]" size={20} />,
              title: 'Monte Carlo Stress Tests',
              text: 'Project 1,000 statistical market pathways to verify your success rates, helping you plan around potential volatility.'
            }
          ].map((item, idx) => (
            <Card key={idx} className="p-6">
              <div className="p-3 bg-[var(--card-bg-hover)] border border-[var(--card-border)] rounded-xl w-fit mb-5">
                {item.icon}
              </div>
              <h4 className="font-space font-bold text-base text-[var(--foreground)] mb-2">{item.title}</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.text}</p>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* ── SECTION 4: PROBLEM COMPARISON ── */}
      <motion.section
        id="comparison"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Text Left */}
          <div className="lg:col-span-5 flex flex-col gap-5 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--secondary-custom)] bg-[var(--secondary-dim)] border border-[var(--secondary-custom)]/20 rounded-full px-3 py-1 w-fit">
              Comparison Grid
            </span>
            <h2 className="text-3xl font-bold font-space text-[var(--foreground)] leading-tight mt-1">
              Most SIP Calculators Stop at Returns.
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Standard investment calculators paint an overly simplified financial picture by ignoring market realities. SIPlytics builds a comprehensive planning system that models the factors wealth planners actually care about.
            </p>
          </div>

          {/* Cards Right */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Traditional Calculator */}
            <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-gradient-to-br from-red-500/5 to-transparent flex flex-col justify-between min-h-[260px] text-left">
              <div>
                <span className="text-xs font-bold font-mono text-[var(--danger-custom)] uppercase">Traditional Calculators</span>
                <h4 className="text-lg font-space font-bold mt-2 mb-4 text-[var(--foreground)]">Basic Projections Only</h4>
                <ul className="flex flex-col gap-3 text-xs text-[var(--text-muted)]">
                  <li className="flex items-center gap-2">❌ Compound Interest estimation</li>
                  <li className="flex items-center gap-2">❌ Total Invested / Return metrics</li>
                  <li className="flex items-center gap-2">❌ Static yield lines</li>
                  <li className="flex items-center gap-2">❌ Ignores tax or inflation drags</li>
                </ul>
              </div>
              <span className="text-[10px] text-[var(--text-subtle)] font-mono mt-6">LIMITS LONG-TERM PLANNING ACCURACY</span>
            </div>

            {/* SIPlytics Calculator */}
            <div className="p-6 rounded-2xl border border-[var(--primary-custom)]/30 bg-gradient-to-br from-[var(--primary-dim)] to-transparent flex flex-col justify-between min-h-[260px] text-left">
              <div>
                <span className="text-xs font-bold font-mono text-[var(--primary-custom)] uppercase">SIPlytics System</span>
                <h4 className="text-lg font-space font-bold mt-2 mb-4 text-[var(--foreground)]">Comprehensive Outcomes</h4>
                <ul className="flex flex-col gap-3 text-xs text-[var(--text-muted)]">
                  <li className="flex items-center gap-2 text-[var(--foreground)]"><CheckCircle2 size={13} className="text-[var(--success-custom)] shrink-0" /> Asset Volatility Stress Testing</li>
                  <li className="flex items-center gap-2 text-[var(--foreground)]"><CheckCircle2 size={13} className="text-[var(--success-custom)] shrink-0" /> Inflation Purchasing Power Loss</li>
                  <li className="flex items-center gap-2 text-[var(--foreground)]"><CheckCircle2 size={13} className="text-[var(--success-custom)] shrink-0" /> Monte Carlo Probability Spreads</li>
                  <li className="flex items-center gap-2 text-[var(--foreground)]"><CheckCircle2 size={13} className="text-[var(--success-custom)] shrink-0" /> Retirement Drawdown Survival Years</li>
                </ul>
              </div>
              <span className="text-[10px] text-[var(--primary-custom)] font-mono mt-6 font-semibold">BUILT FOR REALISTIC PLANNING</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 5: FEATURE SHOWCASE ── */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full flex flex-col gap-24"
      >
        {/* Title */}
        <div className="max-w-2xl text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary-custom)] bg-[var(--primary-dim)] border border-[var(--primary-custom)]/20 rounded-full px-3 py-1 w-fit">
            System Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-space text-[var(--foreground)] leading-tight mt-3">
            Core Analytical Modules
          </h2>
        </div>

        {/* Feature 1 */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-7 rounded-2xl border border-[var(--card-border)] bg-[var(--background-secondary)] p-6 relative select-none">
            {/* Mock Panel */}
            <div className="flex flex-col gap-4 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white">Forecasting Ledger</span>
                <span className="text-success-custom font-bold font-mono">10% STEP-UP ACTIVE</span>
              </div>
              <div className="border border-[var(--card-border)] rounded-xl overflow-hidden bg-[var(--card-bg)] text-xs font-mono">
                <div className="bg-slate-900/60 p-2.5 flex justify-between border-b border-[var(--card-border)] text-[10px] text-text-muted">
                  <span>HORIZON</span>
                  <span>INVESTED</span>
                  <span>GROWTH CORPUS</span>
                </div>
                {[
                  { yr: 'Year 5', inv: '₹10.4 Lakhs', Corp: '₹14.8 Lakhs' },
                  { yr: 'Year 10', inv: '₹27.2 Lakhs', Corp: '₹48.3 Lakhs' },
                  { yr: 'Year 15', inv: '₹54.2 Lakhs', Corp: '₹1.18 Crore' },
                ].map((row, i) => (
                  <div key={i} className="p-3 flex justify-between border-b border-[var(--card-border)]/50 last:border-0 hover:bg-white/[0.01]">
                    <span className="font-sans font-semibold text-white">{row.yr}</span>
                    <span>{row.inv}</span>
                    <span className="text-[var(--primary-custom)] font-bold">{row.Corp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 text-left flex flex-col gap-4">
            <h3 className="text-2xl font-bold font-space text-[var(--foreground)]">Wealth Forecasting</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Model compound returns with step-up optimization. Track how small yearly contribution increases dynamically amplify your terminal wealth corpus over 10 to 40 years.
            </p>
          </div>
        </motion.div>

        {/* Feature 2 */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-5 text-left flex flex-col gap-4 order-2 lg:order-1">
            <h3 className="text-2xl font-bold font-space text-[var(--foreground)]">Risk Intelligence</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Define target allocation percentages for equity, fixed income, real estate, and liquidity. Compute expected volatility score adjustments to identify the stability grade of your portfolio.
            </p>
          </div>
          <div className="lg:col-span-7 rounded-2xl border border-[var(--card-border)] bg-[var(--background-secondary)] p-6 relative select-none order-1 lg:order-2">
            {/* Mock Panel */}
            <div className="flex flex-col gap-4 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white">Portfolio Weights Audit</span>
                <span className="text-success-custom font-bold font-mono">DIVERSIFICATION LEVEL: A+</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Equity', pct: '60%', desc: 'Primary Compounder' },
                  { name: 'Debt', pct: '20%', desc: 'Stability Cushion' },
                  { name: 'Gold', pct: '10%', desc: 'Inflation Hedge' },
                ].map((as, i) => (
                  <div key={i} className="p-3.5 border border-[var(--card-border)] rounded-xl bg-[var(--card-bg)] flex flex-col gap-0.5">
                    <span className="text-[10px] text-text-muted">{as.name}</span>
                    <span className="text-base font-bold text-white font-space mt-0.5">{as.pct}</span>
                    <span className="text-[8px] text-text-subtle uppercase tracking-wider">{as.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature 3 */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-7 rounded-2xl border border-[var(--card-border)] bg-[var(--background-secondary)] p-6 relative select-none">
            {/* Mock Panel */}
            <div className="flex flex-col gap-4 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white">Annuity Phase Projection</span>
                <span className="text-warning-custom font-bold font-mono">DRAWDOWN RUNRATE</span>
              </div>
              <div className="p-4 border border-[var(--card-border)] rounded-xl bg-[var(--card-bg)] text-xs text-text-muted flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span>Desired Monthly Withdrawal:</span>
                  <span className="font-bold text-white font-space">₹75,000 / mo</span>
                </div>
                <div className="flex justify-between border-t border-[var(--card-border)]/45 pt-2">
                  <span>Timeline till Corpus Exhaustion:</span>
                  <span className="font-bold text-success-custom font-space">Age 88 (Secure)</span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 text-left flex flex-col gap-4">
            <h3 className="text-2xl font-bold font-space text-[var(--foreground)]">Retirement Decumulation Planning</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Verify how many years your corpus will last post-retirement. Factor in dynamic inflation adjustments to protect your purchasing power during your retirement years.
            </p>
          </div>
        </motion.div>

        {/* Feature 4 */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-5 text-left flex flex-col gap-4 order-2 lg:order-1">
            <h3 className="text-2xl font-bold font-space text-[var(--foreground)]">FIRE Calculator</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Calculate standard, lean, or fat Financial Independence numbers based on annual expenses multiplier targets. Track years-to-independence and coast-crossover timelines.
            </p>
          </div>
          <div className="lg:col-span-7 rounded-2xl border border-[var(--card-border)] bg-[var(--background-secondary)] p-6 relative select-none order-1 lg:order-2">
            {/* Mock Panel */}
            <div className="flex flex-col gap-3 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white">FIRE Progression Scale</span>
                <span className="text-[var(--primary-custom)] font-bold">42% TARGET MET</span>
              </div>
              <div className="p-4 border border-[var(--card-border)] rounded-xl bg-[var(--card-bg)] flex flex-col gap-1.5">
                <ProgressBar value={42} color="primary" />
                <div className="flex justify-between text-[10px] text-[var(--text-subtle)] mt-1.5 font-mono">
                  <span>SAVED: ₹32.4L</span>
                  <span>FIRE TARGET: ₹75.0L</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature 5 */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-7 rounded-2xl border border-[var(--card-border)] bg-[var(--background-secondary)] p-6 relative select-none">
            {/* Mock Panel */}
            <div className="flex flex-col gap-4 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white">Monte Carlo Distribution Trails</span>
                <span className="text-success-custom font-bold font-mono">GOAL SUCCESS RATE: 89%</span>
              </div>
              <div className="grid grid-cols-3 gap-3 bg-[var(--card-bg)] border border-[var(--card-border)] p-4 rounded-xl text-center font-space">
                <div>
                  <span className="text-[9px] text-text-muted uppercase">90th Percentile</span>
                  <p className="text-sm font-bold text-white mt-1">₹3.82 Cr</p>
                </div>
                <div>
                  <span className="text-[9px] text-text-muted uppercase">50th Percentile</span>
                  <p className="text-sm font-bold text-[var(--primary-custom)] mt-1">₹2.45 Cr</p>
                </div>
                <div>
                  <span className="text-[9px] text-text-muted uppercase">10th Percentile</span>
                  <p className="text-sm font-bold text-[var(--danger-custom)] mt-1">₹1.58 Cr</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 text-left flex flex-col gap-4">
            <h3 className="text-2xl font-bold font-space text-[var(--foreground)]">Monte Carlo Simulation</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Stress-test model parameters across 1,000 yields pathways. Review probability bands (Best Case, Median, and worst-case scenarios) to protect against downside risks.
            </p>
          </div>
        </motion.div>
      </motion.section>

      {/* ── SECTION 6: INTERACTIVE EXPERIENCE ── */}
      <motion.section
        id="interactive-calculator"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full bg-[var(--background-secondary)]/30 border-y border-[var(--card-border)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Controls Left */}
          <div className="lg:col-span-5 text-left flex flex-col gap-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary-custom)] bg-[var(--primary-dim)] border border-[var(--primary-custom)]/20 rounded-full px-3 py-1 w-fit">
              Live Playground
            </span>
            <h2 className="text-3xl font-bold font-space text-[var(--foreground)] leading-tight">
              Test Your Compounding Assumptions.
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Adjust the settings below to see how monthly investment amounts, time horizons, and annual step-up rates affect your projected wealth corpus.
            </p>

            <div className="flex flex-col gap-2 mt-4 bg-[var(--card-bg)] border border-[var(--card-border)] p-5 rounded-2xl">
              <Slider label="Monthly SIP Amount" min={2000} max={250000} step={1000} value={quickSip} onChange={setQuickSip} prefix="₹" />
              <Slider label="Investment Horizon"  min={5}    max={40}                  value={quickYears} onChange={setQuickYears} suffix=" Yrs" />
              <Slider label="Annual Step-Up Rate" min={0}    max={30}                  value={quickStepUp} onChange={setQuickStepUp} suffix="%" />
            </div>
          </div>

          {/* Results Right */}
          <div className="lg:col-span-7 flex flex-col gap-5 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl glass border border-card-border/80 flex flex-col justify-between min-h-[120px]">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Total Principal Invested</span>
                <h3 className="text-xl font-bold font-space text-[var(--foreground)] mt-2">
                  <AnimatedCounter value={finalInvested} formatter={fmt} />
                </h3>
              </div>
              <div className="p-5 rounded-2xl glass border border-card-border/80 flex flex-col justify-between min-h-[120px]">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Future Projected wealth</span>
                <h3 className="text-xl font-bold font-space text-[var(--primary-custom)] mt-2">
                  <AnimatedCounter value={finalWealth} formatter={fmt} />
                </h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl glass border border-card-border/80 flex justify-between items-center text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[var(--secondary-custom)]" />
                  Compounding Power Multiplier
                </span>
                <span className="text-[11px] text-[var(--text-muted)] mt-1">
                  Your investments compound to <strong className="text-[var(--foreground)]"><AnimatedCounter value={finalWealth / Math.max(1, finalInvested)} formatter={(v) => v.toFixed(1)} />×</strong> your principal principal.
                </span>
              </div>
            </div>

            <Button variant="primary" size="lg" onClick={handleLaunchPlanning} className="w-full mt-2" glow>
              Start Planning with these settings <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 7: FINANCIAL ROADMAP ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full text-center select-none"
      >
        <div className="max-w-2xl mx-auto mb-16 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--secondary-custom)] bg-[var(--secondary-dim)] border border-[var(--secondary-custom)]/20 rounded-full px-3 py-1 w-fit mx-auto">
            Timeline Map
          </span>
          <h2 className="text-3xl font-bold font-space text-[var(--foreground)] leading-tight mt-2">
            The Journey to Financial Independence
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
            Building significant wealth is a step-by-step process. Here is how your investment roadmap develops over time:
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative pl-8 ml-4 md:ml-0 md:pl-0 md:grid md:grid-cols-7 gap-4 text-left md:text-center items-start">
          {/* Background track line */}
          <div className="absolute left-[3px] top-3 bottom-3 w-[2px] bg-[var(--card-border)] md:left-[5%] md:right-[5%] md:top-[11px] md:bottom-auto md:w-auto md:h-[2px]" />
          
          {/* Active progress line that fills up on scroll */}
          <div className="absolute left-[3px] top-3 bottom-3 w-[2px] md:left-[5%] md:right-[5%] md:top-[11px] md:bottom-auto md:w-auto md:h-[2px] overflow-hidden">
            <motion.div
              className="bg-gradient-to-b from-[var(--primary-custom)] to-[var(--secondary-custom)] md:bg-gradient-to-r h-full w-full origin-top md:origin-left"
              initial={{ scaleY: 0, scaleX: 0 }}
              whileInView={{ scaleY: 1, scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {[
            { step: '01', title: 'Start Investing', desc: 'Begin standard monthly SIP allocations.' },
            { step: '02', title: 'Emergency Fund', desc: 'Set aside 6 months of living costs.' },
            { step: '03', title: 'First ₹10L', desc: 'Reach initial critical capital base.' },
            { step: '04', title: 'Reach ₹50L', desc: 'Accelerated compounding kicks in.' },
            { step: '05', title: 'Reach ₹1Cr', desc: 'Double-digit wealth milestones.' },
            { step: '06', title: 'FIRE Crossover', desc: 'Passive returns match expenses.' },
            { step: '07', title: 'Retirement', desc: 'Secure drawdown annuity phase.' },
          ].map((road, idx) => (
            <div key={idx} className="relative md:flex md:flex-col md:items-center gap-2 mb-10 md:mb-0 group">
              {/* Dot indicator */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                className="absolute -left-[41px] md:left-1/2 md:-translate-x-1/2 -top-1 md:-top-[21px] h-6 w-6 rounded-full bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)] group-hover:border-[var(--primary-custom)] group-hover:text-[var(--primary-custom)] transition-all z-10"
              >
                {road.step}
              </motion.div>
              <h4 className="font-space font-bold text-xs text-[var(--foreground)] group-hover:text-[var(--primary-custom)] transition-colors mt-0 md:mt-4">{road.title}</h4>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mt-1 max-w-[130px] md:mx-auto">{road.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── SECTION 8: PORTFOLIO INSIGHTS ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full text-left"
      >
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary-custom)] bg-[var(--primary-dim)] border border-[var(--primary-custom)]/20 rounded-full px-3 py-1 w-fit">
            Insights Feed
          </span>
          <h2 className="text-2xl md:text-3xl font-bold font-space text-[var(--foreground)] mt-3">
            Financial Intelligence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Compounding Milestones',
              text: 'Your portfolio is projected to cross the ₹1 Crore milestone in Year 11, assuming a 12% annual compounding rate.',
              icon: <Calendar className="text-[var(--primary-custom)]" size={16} />,
              border: 'var(--primary-custom)'
            },
            {
              title: 'Inflation Hazard Warning',
              text: 'An average 6% inflation rate could reduce the purchasing power of your projected corpus by 43% over 15 years.',
              icon: <AlertTriangle className="text-[var(--danger-custom)]" size={16} />,
              border: 'var(--danger-custom)'
            },
            {
              title: 'Step-Up SIP Optimization',
              text: 'Increasing your monthly SIP by just ₹2,500 every year could generate an estimated ₹19 Lakhs in additional corpus.',
              icon: <Sparkles className="text-[var(--secondary-custom)]" size={16} />,
              border: 'var(--secondary-custom)'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex gap-4 items-start p-5 rounded-2xl border bg-white/[0.005]"
              style={{ borderColor: `rgba(${item.border === 'var(--primary-custom)' ? '14,165,233' : item.border === 'var(--danger-custom)' ? '239,68,68' : '99,91,255'}, 0.12)` }}
            >
              <div className="p-2.5 rounded-xl bg-[var(--card-bg-hover)] border border-[var(--card-border)] shrink-0">
                {item.icon}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white">{item.title}</span>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── SECTION 9: METHODOLOGY ── */}
      <motion.section
        id="methodology"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full bg-[var(--background-secondary)]/10 border-t border-[var(--card-border)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          <div className="lg:col-span-5 flex flex-col gap-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary-custom)] bg-[var(--primary-dim)] border border-[var(--primary-custom)]/20 rounded-full px-3 py-1 w-fit">
              Mathematics
            </span>
            <h2 className="text-3xl font-bold font-space text-[var(--foreground)] leading-tight">
              How SIPlytics Calculates Projections
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              We believe in transparency. Unlike basic calculators, our algorithms simulate asset class volatilities and compounding mechanics using established financial models.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: 'Step-Up Compounding',
                text: 'We calculate compounding interest monthly using growing annuity formulas, adding annual step-ups to simulate salary growth offsets.'
              },
              {
                title: 'Inflation Adjustment',
                text: 'Projections are discounted using a standard Fisher Equation calculation to estimate actual future purchasing power in today\'s terms.'
              },
              {
                title: 'Monte Carlo Modeling',
                text: 'We execute 1,000 randomized iterations of geometric Brownian motion using your asset volatility risk weights to map yield probability spreads.'
              },
              {
                title: 'Risk Allocation Weights',
                text: 'Expected returns and volatilities are calculated using historical weighted averages and covariance metrics across primary indices.'
              }
            ].map((meth, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 p-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                <span className="text-xs font-bold text-white">{meth.title}</span>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{meth.text}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 10: FINAL CTA & REGULATORY DISCLOSURES ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full text-center flex flex-col items-center"
      >
        <div className="max-w-2xl flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-bold font-space text-[var(--foreground)] tracking-tight">
            Make Better Financial Decisions.
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">
            Understand your future before you invest. Simulate pathway success rates and build a realistic roadmap.
          </p>

          <div className="flex justify-center gap-4 mt-2">
            <Button size="lg" glow onClick={() => setActiveTab('dashboard')}>
              Start Planning <ArrowRight size={16} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setActiveTab('dashboard')}>
              Open Dashboard
            </Button>
          </div>
        </div>

        {/* Regulatory disclaimers */}
        <div className="max-w-3xl mt-24 border-t border-[var(--card-border)] pt-8 text-[10px] text-[var(--text-subtle)] leading-relaxed text-center font-mono">
          <p className="mb-2 uppercase font-bold tracking-wider text-[var(--foreground)]">Assumptions & Transparency Disclosures</p>
          <p className="mb-1">
            All projections and simulation outcomes generated by SIPlytics are estimates based on user configurations and historical average yields. Future returns are not guaranteed. Actual investment results will depend on market conditions, inflation rates, and asset performance.
          </p>
          <p>
            This tool is designed for informational and educational purposes only and does not constitute formal financial, investment, or tax advice. Consult a qualified financial advisor before making actual investment decisions.
          </p>
        </div>
      </motion.section>
    </div>
  );
};
