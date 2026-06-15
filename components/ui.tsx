'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

/* ─── Card ─────────────────────────────────────────────────── */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'glass' | 'glow' | 'default';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'glass',
  hoverEffect = true,
  ...props
}) => {
  const base = 'rounded-2xl p-6 transition-all duration-300 relative overflow-hidden';
  const variants = {
    glass:   'glass-premium',
    glow:    'glass-premium glow-primary',
    default: 'bg-[var(--card-bg)] border border-[var(--card-border)]',
  };
  const hover = hoverEffect
    ? 'hover:-translate-y-0.5 hover:border-[var(--card-border-hover)]'
    : '';

  return (
    <div className={`${base} ${variants[variant]} ${hover} ${className}`} {...props}>
      {children}
    </div>
  );
};

/* ─── AnimatedCounter ──────────────────────────────────────── */
export const AnimatedCounter: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}> = ({ value, prefix = '', suffix = '', duration = 1.5 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    if (start === value) { setCount(value); return; }
    const steps = (duration * 1000) / 30;
    const inc = (value - start) / steps;
    const timer = setInterval(() => {
      start += inc;
      if (start >= value) { clearInterval(timer); setCount(value); }
      else setCount(Math.round(start));
    }, 30);
    return () => clearInterval(timer);
  }, [value, duration]);

  const fmt = (n: number) => {
    if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)} Cr`;
    if (n >= 100_000)    return `${(n / 100_000).toFixed(2)} L`;
    return n.toLocaleString('en-IN');
  };

  return (
    <span>
      {prefix}{value >= 100_000 ? fmt(count) : count.toLocaleString('en-IN')}{suffix}
    </span>
  );
};

/* ─── MetricCard ───────────────────────────────────────────── */
interface MetricCardProps {
  title:    string;
  value:    number;
  prefix?:  string;
  suffix?:  string;
  subtext?: string;
  icon?:    LucideIcon;
  trend?: { value: number; isPositive: boolean; text: string };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title, value, prefix = '', suffix = '',
  subtext, icon: Icon, trend, color = 'primary',
}) => {
  const colorMap = {
    primary:   'text-[var(--primary-custom)]   border-[var(--primary-custom)]/20   bg-[var(--primary-dim)]',
    secondary: 'text-[var(--secondary-custom)] border-[var(--secondary-custom)]/20 bg-[var(--secondary-dim)]',
    success:   'text-[var(--success-custom)]   border-[var(--success-custom)]/20   bg-[var(--success-dim)]',
    warning:   'text-[var(--warning-custom)]   border-[var(--warning-custom)]/20   bg-[var(--warning-dim)]',
    danger:    'text-[var(--danger-custom)]    border-[var(--danger-custom)]/20    bg-[var(--danger-dim)]',
  };

  return (
    <Card className="flex flex-col justify-between h-full min-h-[140px]">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-[var(--text-muted)]">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="text-2xl font-bold font-space tracking-tight text-[var(--foreground)]">
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
        </h3>
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className={trend.isPositive ? 'text-[var(--success-custom)]' : 'text-[var(--danger-custom)]'}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </span>
            <span className="text-[var(--text-muted)]">{trend.text}</span>
          </div>
        )}
        {subtext && <p className="text-xs text-[var(--text-muted)] mt-1">{subtext}</p>}
      </div>
    </Card>
  );
};

/* ─── Slider ───────────────────────────────────────────────── */
interface SliderProps {
  label:     string;
  min:       number;
  max:       number;
  step?:     number;
  value:     number;
  onChange:  (val: number) => void;
  prefix?:   string;
  suffix?:   string;
  tooltip?:  string;
}

export const Slider: React.FC<SliderProps> = ({
  label, min, max, step = 1, value, onChange,
  prefix = '', suffix = '', tooltip,
}) => {
  const percent = ((value - min) / (max - min)) * 100;

  const fmt = (val: number) => {
    if (val >= 10_000_000) return `${(val / 10_000_000).toFixed(1)} Cr`;
    if (val >= 100_000)    return `${(val / 100_000).toFixed(1)} L`;
    return val.toLocaleString('en-IN');
  };

  return (
    <div className="flex flex-col gap-2 w-full my-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
          {label}
          {tooltip && (
            <span className="group relative cursor-help text-[10px] text-[var(--text-subtle)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full w-4 h-4 flex items-center justify-center">
              ?
              <span className="absolute bottom-full mb-2 hidden group-hover:block w-52 bg-[var(--background-secondary)] text-[var(--foreground)] text-xs rounded-lg p-2.5 z-20 shadow-xl border border-[var(--card-border)] leading-relaxed">
                {tooltip}
              </span>
            </span>
          )}
        </span>
        <span className="font-space font-semibold text-[var(--primary-custom)] bg-[var(--primary-dim)] px-2.5 py-0.5 rounded-lg border border-[var(--primary-custom)]/20 text-sm">
          {prefix}{fmt(value)}{suffix}
        </span>
      </div>

      <div className="relative flex items-center w-full py-2">
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none bg-[var(--input-border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--primary-custom)] hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
          style={{
            background: `linear-gradient(to right, var(--primary-custom) 0%, var(--primary-custom) ${percent}%, var(--input-border) ${percent}%, var(--input-border) 100%)`
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-[var(--text-subtle)] px-0.5">
        <span>{prefix}{fmt(min)}{suffix}</span>
        <span>{prefix}{fmt(max)}{suffix}</span>
      </div>
    </div>
  );
};

/* ─── Button ───────────────────────────────────────────────── */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children:  React.ReactNode;
  variant?:  'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?:     'sm' | 'md' | 'lg';
  glow?:     boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children, className = '',
  variant = 'primary', size = 'md', glow = false,
  ...props
}) => {
  const base = 'font-space font-medium rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-gradient-to-r from-[var(--primary-custom)] to-[var(--secondary-custom)] text-black font-semibold shadow-lg hover:opacity-90 hover:shadow-[var(--shadow-primary)]',
    secondary: 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-[var(--card-border-hover)] hover:bg-[var(--card-bg-hover)]',
    outline:   'border border-[var(--primary-custom)]/40 text-[var(--primary-custom)] bg-[var(--primary-dim)] hover:border-[var(--primary-custom)] hover:bg-[var(--primary-dim)]',
    danger:    'bg-gradient-to-r from-[var(--danger-custom)] to-rose-600 text-white hover:opacity-90',
    ghost:     'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg-hover)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  const glowCls = glow && variant === 'primary' ? 'glow-primary' : '';

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${glowCls} ${className}`} {...props}>
      {children}
    </button>
  );
};

/* ─── Input ────────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:   string;
  prefix?:  string;
  suffix?:  string;
  error?:   string;
}

export const Input: React.FC<InputProps> = ({
  label, prefix, suffix, error, className = '', ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full my-2">
      {label && (
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {prefix && (
          <span className="absolute left-3 text-[var(--text-muted)] text-sm font-space font-medium z-10 pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          className={`
            w-full bg-[var(--input-bg)] border border-[var(--input-border)]
            focus:border-[var(--primary-custom)] focus:ring-2 focus:ring-[var(--primary-custom)]/20
            rounded-xl py-2.5 px-3.5 text-sm font-space text-[var(--foreground)]
            placeholder:text-[var(--text-subtle)]
            transition-all duration-200 outline-none
            ${prefix ? 'pl-8' : ''}
            ${suffix ? 'pr-8' : ''}
            ${error ? 'border-[var(--danger-custom)]' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-[var(--text-muted)] text-sm font-space font-medium z-10 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-[var(--danger-custom)] mt-0.5">{error}</p>}
    </div>
  );
};

/* ─── Select ───────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string;
  options:  { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label, options, className = '', ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full my-2">
      {label && (
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        className={`
          w-full bg-[var(--input-bg)] border border-[var(--input-border)]
          focus:border-[var(--primary-custom)] focus:ring-2 focus:ring-[var(--primary-custom)]/20
          rounded-xl py-2.5 px-3.5 text-sm font-space text-[var(--foreground)]
          transition-all duration-200 outline-none cursor-pointer
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

/* ─── GaugeMeter ───────────────────────────────────────────── */
interface GaugeMeterProps {
  value:     number; // 0–100
  title:     string;
  subtitle?: string;
  color?:    'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const GaugeMeter: React.FC<GaugeMeterProps> = ({
  value, title, subtitle, color = 'primary',
}) => {
  const radius = 50;
  const strokeWidth = 10;
  const normalized = Math.min(100, Math.max(0, value));
  const circumference = Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  const strokeColors = {
    primary:   'var(--primary-custom)',
    secondary: 'var(--secondary-custom)',
    success:   'var(--success-custom)',
    warning:   'var(--warning-custom)',
    danger:    'var(--danger-custom)',
  };

  const textColors = {
    primary:   'text-[var(--primary-custom)]',
    secondary: 'text-[var(--secondary-custom)]',
    success:   'text-[var(--success-custom)]',
    warning:   'text-[var(--warning-custom)]',
    danger:    'text-[var(--danger-custom)]',
  };

  return (
    <Card className="flex flex-col items-center justify-center p-6 text-center">
      <span className="text-sm font-medium text-[var(--text-muted)] mb-4">{title}</span>
      <div className="relative w-36 h-20 flex items-center justify-center overflow-hidden">
        <svg className="w-full h-full transform translate-y-3" viewBox="0 0 120 70">
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none"
            stroke="var(--input-border)" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none"
            stroke={strokeColors[color]} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute bottom-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black font-space text-[var(--foreground)]">{value}</span>
        </div>
      </div>
      {subtitle && (
        <span className={`text-xs font-semibold uppercase tracking-wider mt-2 ${textColors[color]}`}>
          {subtitle}
        </span>
      )}
    </Card>
  );
};

/* ─── ProgressBar ──────────────────────────────────────────── */
interface ProgressBarProps {
  value: number; // 0–100
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value, color = 'primary',
}) => {
  const normalized = Math.min(100, Math.max(0, value));

  const gradients = {
    primary:   'from-[var(--primary-custom)] to-cyan-400',
    secondary: 'from-[var(--secondary-custom)] to-indigo-500',
    success:   'from-[var(--success-custom)] to-emerald-400',
    warning:   'from-[var(--warning-custom)] to-yellow-400',
    danger:    'from-[var(--danger-custom)] to-rose-500',
  };

  return (
    <div className="w-full bg-[var(--input-border)] rounded-full h-2 overflow-hidden relative">
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${gradients[color]}`}
        initial={{ width: 0 }}
        animate={{ width: `${normalized}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
};

/* ─── SectionHeader ────────────────────────────────────────── */
export const SectionHeader: React.FC<{
  title:     string;
  subtitle?: string;
  badge?:    string;
}> = ({ title, subtitle, badge }) => (
  <div className="mb-6">
    {badge && (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--primary-custom)] bg-[var(--primary-dim)] border border-[var(--primary-custom)]/20 rounded-full px-3 py-1 mb-3">
        {badge}
      </span>
    )}
    <h1 className="text-2xl md:text-3xl font-bold font-space text-[var(--foreground)] leading-tight">
      {title}
    </h1>
    {subtitle && (
      <p className="text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">{subtitle}</p>
    )}
  </div>
);

/* ─── StatRow ──────────────────────────────────────────────── */
export const StatRow: React.FC<{
  label:   string;
  value:   string | number;
  accent?: boolean;
}> = ({ label, value, accent = false }) => (
  <div className={`flex items-center justify-between py-3 border-b border-[var(--card-border)] last:border-0 ${accent ? 'text-[var(--primary-custom)]' : ''}`}>
    <span className="text-sm text-[var(--text-muted)]">{label}</span>
    <span className={`text-sm font-semibold font-space ${accent ? 'text-[var(--primary-custom)]' : 'text-[var(--foreground)]'}`}>
      {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
    </span>
  </div>
);
