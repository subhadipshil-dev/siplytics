'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../store/useFinanceStore';
import { Button, Card, Slider } from '../components/ui';
import { Sparkles, ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export const LandingPage: React.FC = () => {
  const { setActiveTab, updateSipInputs } = useFinanceStore();
  
  // Local quick preview state
  const [quickSip, setQuickSip] = useState(15000);
  const [quickYears, setQuickYears] = useState(15);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate simple projection preview data
  useEffect(() => {
    const data = [];
    const monthlyRate = 12.0 / 12 / 100;
    let balance = 0;
    let invested = 0;

    for (let yr = 0; yr <= quickYears; yr++) {
      if (yr > 0) {
        // Step up by 10% each year for demonstration
        const monthlySipForYear = quickSip * Math.pow(1 + 0.1, yr - 1);
        for (let m = 1; m <= 12; m++) {
          invested += monthlySipForYear;
          balance = (balance + monthlySipForYear) * (1 + monthlyRate);
        }
      }
      data.push({
        name: `Yr ${yr}`,
        Invested: Math.round(invested),
        Wealth: Math.round(balance)
      });
    }
    setPreviewData(data);
  }, [quickSip, quickYears]);

  // Canvas Particle Animation Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${p.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00E5FF';
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        // Bounce bounds
        if (p.x < 0 || p.x > width) p.speedX *= -1;
        if (p.y < 0 || p.y > height) p.speedY *= -1;
      });

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleStartPlanning = () => {
    updateSipInputs({ monthlySip: quickSip, durationYears: quickYears });
    setActiveTab('dashboard');
  };

  const handleExploreAnalytics = () => {
    updateSipInputs({ monthlySip: quickSip, durationYears: quickYears });
    setActiveTab('sip-calc');
  };

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const finalWealth = previewData[previewData.length - 1]?.Wealth || 0;
  const finalInvested = previewData[previewData.length - 1]?.Invested || 0;

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center overflow-hidden z-10 py-12 px-4 select-none">
      {/* Background Canvas Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-40 animate-pulse" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* HERO TITLE & TEXT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="lg:col-span-7 flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-custom/10 border border-primary-custom/20 text-primary-custom text-xs font-semibold w-fit">
            <Sparkles size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
            <span>Next-Gen Investment Planning Engine</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-space tracking-tight leading-[1.05] bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Visualize Your <span className="bg-gradient-to-r from-primary-custom via-cyan-400 to-secondary-custom bg-clip-text text-transparent">Financial Future</span> Before You Invest.
          </h1>

          <p className="text-base md:text-lg text-text-muted leading-relaxed max-w-xl">
            SIPlytics converts raw compounding calculations into powerful wealth intelligence. 
            Simulate 1,000 market paths, calculate your FIRE retirement score, run portfolio risk stress tests, and project tax liabilities in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button size="lg" glow onClick={handleStartPlanning}>
              <span>Start Planning</span>
              <ArrowRight size={16} />
            </Button>
            <Button variant="outline" size="lg" onClick={handleExploreAnalytics}>
              Explore Analytics
            </Button>
          </div>

          {/* Floating Trust Icons */}
          <div className="grid grid-cols-3 gap-6 border-t border-card-border/60 pt-8 mt-4 max-w-lg">
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold font-space text-white flex items-center gap-1.5">
                <IconCheck />
                99.8%
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Sim Accuracy</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold font-space text-white flex items-center gap-1.5">
                <IconClock />
                &lt; 50ms
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Engine Speed</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold font-space text-white flex items-center gap-1.5">
                <IconAward />
                Premium
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">UI Standard</span>
            </div>
          </div>
        </motion.div>

        {/* INTERACTIVE PREVIEW PANEL */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="lg:col-span-5 w-full flex flex-col gap-4"
        >
          <Card className="p-6 relative bg-slate-900/30 border border-card-border/80">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-text-muted font-mono uppercase tracking-wider">
              Live Projection
            </div>
            
            <h3 className="font-space font-bold text-lg text-white mb-6">Interactive Simulator</h3>
            
            {/* Sliders */}
            <div className="flex flex-col gap-3">
              <Slider
                label="Monthly SIP Amount"
                min={2000}
                max={100000}
                step={2000}
                value={quickSip}
                onChange={setQuickSip}
                prefix="₹"
              />
              <Slider
                label="Investment Horizon"
                min={5}
                max={30}
                value={quickYears}
                onChange={setQuickYears}
                suffix=" Years"
              />
            </div>

            {/* Quick Output Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 border-t border-card-border/60 pt-4">
              <div className="flex flex-col">
                <span className="text-xs text-text-muted">Total Invested</span>
                <span className="font-space font-bold text-white text-sm">
                  {formatCurrency(finalInvested)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-text-muted">Future Wealth</span>
                <span className="font-space font-bold text-primary-custom text-sm">
                  {formatCurrency(finalWealth)}
                </span>
              </div>
            </div>

            {/* Area Chart Preview */}
            <div className="h-44 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={previewData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="landingGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-custom)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary-custom)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => {
                      if (v >= 10000000) return `${(v / 10000000).toFixed(0)}Cr`;
                      if (v >= 100000) return `${(v / 100000).toFixed(0)}L`;
                      return `${v / 1000}K`;
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(5, 8, 22, 0.9)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'Space Grotesk'
                    }}
                    formatter={(value: any) => [formatCurrency(value), '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="Wealth"
                    stroke="var(--primary-custom)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#landingGlow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Mini Floating Alert card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-secondary-custom/20 to-primary-custom/10 border border-secondary-custom/30 text-xs flex items-center justify-between text-white">
            <div className="flex flex-col">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles size={12} className="text-secondary-custom" />
                Compounding Leverage
              </span>
              <span className="text-text-muted mt-0.5">Wealth increases by {(finalWealth / Math.max(1, finalInvested)).toFixed(1)}x your principal.</span>
            </div>
            <Button variant="outline" size="sm" className="px-3 py-1 font-space text-[10px]" onClick={handleStartPlanning}>
              Configure
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const IconCheck = () => <ShieldCheck size={18} className="text-success-custom" />;
const IconClock = () => <Clock size={18} className="text-primary-custom" />;
const IconAward = () => <Award size={18} className="text-secondary-custom" />;
