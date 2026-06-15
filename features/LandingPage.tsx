'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../store/useFinanceStore';
import { Button, Card, Slider } from '../components/ui';
import { Sparkles, ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export const LandingPage: React.FC = () => {
  const { setActiveTab, updateSipInputs } = useFinanceStore();
  const [quickSip, setQuickSip] = useState(15000);
  const [quickYears, setQuickYears] = useState(15);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const data = [];
    const monthlyRate = 12.0 / 12 / 100;
    let balance = 0;
    let invested = 0;
    for (let yr = 0; yr <= quickYears; yr++) {
      if (yr > 0) {
        const sip = quickSip * Math.pow(1.1, yr - 1);
        for (let m = 1; m <= 12; m++) {
          invested += sip;
          balance = (balance + sip) * (1 + monthlyRate);
        }
      }
      data.push({ name: `Y${yr}`, Invested: Math.round(invested), Wealth: Math.round(balance) });
    }
    setPreviewData(data);
  }, [quickSip, quickYears]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    const pts = Array.from({ length: 35 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      size: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.35 + 0.05,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,245,${p.o})`; ctx.shadowBlur = 8; ctx.shadowColor = '#00d4f5'; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, []);

  const fmt = (v: number) => v >= 1e7 ? `₹${(v / 1e7).toFixed(2)} Cr` : v >= 1e5 ? `₹${(v / 1e5).toFixed(2)} L` : `₹${v.toLocaleString('en-IN')}`;
  const finalWealth   = previewData[previewData.length - 1]?.Wealth   || 0;
  const finalInvested = previewData[previewData.length - 1]?.Invested || 0;

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden py-16 px-4 select-none bg-[var(--background)]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-30" />
      <div className="aurora" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="lg:col-span-7 flex flex-col gap-6"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary-dim)] border border-[var(--primary-custom)]/25 text-[var(--primary-custom)] text-xs font-semibold w-fit">
            <Sparkles size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
            Next-Gen Investment Planning Engine
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-[3.75rem] font-black font-space tracking-tight leading-[1.06] text-[var(--foreground)]">
            Visualize Your{' '}
            <span className="bg-gradient-to-r from-[var(--primary-custom)] via-cyan-400 to-[var(--secondary-custom)] bg-clip-text text-transparent">
              Financial Future
            </span>{' '}
            Before You Invest.
          </h1>

          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed max-w-xl">
            SIPlytics converts compounding calculations into wealth intelligence. Simulate 1,000 market paths,
            calculate your FIRE retirement score, run portfolio stress tests, and project tax liabilities in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Button size="lg" glow onClick={() => { updateSipInputs({ monthlySip: quickSip, durationYears: quickYears }); setActiveTab('dashboard'); }}>
              Start Planning <ArrowRight size={16} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => { updateSipInputs({ monthlySip: quickSip, durationYears: quickYears }); setActiveTab('sip-calc'); }}>
              Explore Analytics
            </Button>
          </div>

          {/* Trust stats */}
          <div className="grid grid-cols-3 gap-6 border-t border-[var(--card-border)] pt-7 mt-2 max-w-lg">
            {[
              { icon: <ShieldCheck size={16} className="text-[var(--success-custom)]" />, val: '99.8%', label: 'Sim Accuracy' },
              { icon: <Clock size={16} className="text-[var(--primary-custom)]" />,       val: '< 50ms', label: 'Engine Speed' },
              { icon: <Award size={16} className="text-[var(--secondary-custom)]" />,    val: 'A+',    label: 'UI Standard'  },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="text-xl font-bold font-space text-[var(--foreground)] flex items-center gap-1.5">
                  {s.icon}{s.val}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── INTERACTIVE PANEL ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="lg:col-span-5 w-full flex flex-col gap-4"
        >
          <Card className="p-6 relative">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--primary-dim)] border border-[var(--primary-custom)]/20 text-[9px] text-[var(--primary-custom)] font-mono uppercase tracking-widest font-bold">
              ● Live
            </div>

            <h3 className="font-space font-bold text-lg text-[var(--foreground)] mb-5">Interactive Simulator</h3>

            <div className="flex flex-col gap-1">
              <Slider label="Monthly SIP Amount" min={2000} max={100000} step={2000} value={quickSip} onChange={setQuickSip} prefix="₹" />
              <Slider label="Investment Horizon"  min={5}    max={30}     value={quickYears} onChange={setQuickYears} suffix=" Yrs" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5 border-t border-[var(--card-border)] pt-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-medium">Total Invested</span>
                <span className="font-space font-bold text-[var(--foreground)] text-sm">{fmt(finalInvested)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-medium">Future Wealth</span>
                <span className="font-space font-bold text-[var(--primary-custom)] text-sm">{fmt(finalWealth)}</span>
              </div>
            </div>

            <div className="h-44 w-full mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={previewData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="landingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--primary-custom)" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="var(--primary-custom)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={9} tickLine={false} axisLine={false}
                    tickFormatter={(v) => v >= 1e7 ? `${(v/1e7).toFixed(0)}Cr` : v >= 1e5 ? `${(v/1e5).toFixed(0)}L` : `${v/1000}K`}
                  />
                  <Tooltip
                    contentStyle={{ background: 'var(--background-secondary)', borderColor: 'var(--card-border)', borderRadius: 10, fontSize: 12, fontFamily: 'Space Grotesk', color: 'var(--foreground)' }}
                    formatter={(v: any) => [fmt(v), '']}
                  />
                  <Area type="monotone" dataKey="Wealth" stroke="var(--primary-custom)" strokeWidth={2} fillOpacity={1} fill="url(#landingGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--secondary-dim)] to-[var(--primary-dim)] border border-[var(--secondary-custom)]/25 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <Sparkles size={13} className="text-[var(--secondary-custom)]" />
                Compounding Power
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                Your wealth grows <strong className="text-[var(--foreground)]">{(finalWealth / Math.max(1, finalInvested)).toFixed(1)}×</strong> your principal
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('dashboard')}>
              Configure
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
