'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

// Premium Card
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
  const baseStyle = "rounded-2xl p-6 transition-all duration-300 relative overflow-hidden";
  const variants = {
    glass: "glass-premium",
    glow: "glass-premium glow-primary",
    default: "bg-black/30 border border-card-border"
  };
  const hoverStyle = hoverEffect ? "hover:-translate-y-1 hover:border-primary-custom/40 hover:shadow-[0_0_20px_rgba(0,229,255,0.06)]" : "";

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Animated Counter
export const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string; duration?: number }> = ({
  value,
  prefix = '',
  suffix = '',
  duration = 1.5
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMiliseconds = duration * 1000;
    const stepTime = 30; // 30ms interval
    const totalSteps = totalMiliseconds / stepTime;
    const increment = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  // format large numbers
  const formatNumber = (num: number) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
    return num.toLocaleString('en-IN');
  };

  const isLargeNumber = value >= 100000;
  const displayVal = isLargeNumber ? formatNumber(count) : count.toLocaleString('en-IN');

  return <span>{prefix}{displayVal}{suffix}</span>;
};

// Metric/KPI Card
interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  subtext?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    text: string;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  subtext,
  icon: Icon,
  trend,
  color = 'primary'
}) => {
  const colorMap = {
    primary: 'text-primary-custom border-primary-custom/20 bg-primary-custom/5',
    secondary: 'text-secondary-custom border-secondary-custom/20 bg-secondary-custom/5',
    success: 'text-success-custom border-success-custom/20 bg-success-custom/5',
    warning: 'text-warning-custom border-warning-custom/20 bg-warning-custom/5',
    danger: 'text-danger-custom border-danger-custom/20 bg-danger-custom/5'
  };

  return (
    <Card className="flex flex-col justify-between h-full min-h-[140px]">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-text-muted">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="mt-2">
        <h3 className="text-2xl font-bold font-space tracking-tight">
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
        </h3>
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className={trend.isPositive ? "text-success-custom" : "text-danger-custom"}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </span>
            <span className="text-text-muted">{trend.text}</span>
          </div>
        )}
        {subtext && <p className="text-xs text-text-muted mt-1">{subtext}</p>}
      </div>
    </Card>
  );
};

// Custom Slider
interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  prefix = '',
  suffix = '',
  tooltip
}) => {
  const percent = ((value - min) / (max - min)) * 100;
  
  // Format the display value inside the label
  const formatLabelValue = (val: number) => {
    if (val >= 10000000) return `${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)} L`;
    return val.toLocaleString('en-IN');
  };

  return (
    <div className="flex flex-col gap-2 w-full my-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-text-muted flex items-center gap-1 font-medium">
          {label}
          {tooltip && (
            <span className="group relative cursor-help text-xs text-text-muted/60 bg-white/10 rounded-full w-4 h-4 flex items-center justify-center">
              ?
              <span className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-slate-900 text-white text-xs rounded p-2 z-20 shadow-xl border border-white/10">
                {tooltip}
              </span>
            </span>
          )}
        </span>
        <span className="font-space font-semibold text-primary-custom bg-primary-custom/5 px-2 py-0.5 rounded border border-primary-custom/10">
          {prefix}{formatLabelValue(value)}{suffix}
        </span>
      </div>

      <div className="relative flex items-center w-full group">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 focus:outline-none accent-primary-custom"
          style={{
            background: `linear-gradient(to right, var(--primary-custom) 0%, var(--primary-custom) ${percent}%, #1e293b ${percent}%, #1e293b 100%)`
          }}
        />
      </div>
      
      <div className="flex justify-between text-[10px] text-text-muted px-1">
        <span>{prefix}{formatLabelValue(min)}{suffix}</span>
        <span>{prefix}{formatLabelValue(max)}{suffix}</span>
      </div>
    </div>
  );
};

// Premium Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  glow = false,
  ...props
}) => {
  const baseStyle = "font-space font-medium rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-custom to-secondary-custom text-black hover:opacity-90 font-semibold shadow-lg shadow-primary-custom/10",
    secondary: "bg-slate-850 hover:bg-slate-800 text-white border border-card-border",
    outline: "border border-primary-custom/30 hover:border-primary-custom/100 text-primary-custom bg-primary-custom/5 hover:bg-primary-custom/10",
    danger: "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-95 shadow-md shadow-red-500/10",
    ghost: "text-text-muted hover:text-white hover:bg-white/5"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base"
  };

  const glowStyle = glow && variant === 'primary' ? "glow-primary shadow-[0_0_20px_rgba(0,229,255,0.3)]" : "";

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${glowStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Sleek Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefix?: string;
  suffix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  prefix,
  suffix,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full my-2">
      {label && <label className="text-xs font-semibold text-text-muted">{label}</label>}
      <div className="relative flex items-center w-full">
        {prefix && (
          <span className="absolute left-3 text-text-muted text-sm font-space font-medium">{prefix}</span>
        )}
        <input
          className={`w-full bg-slate-900/40 border border-card-border focus:border-primary-custom/80 focus:ring-1 focus:ring-primary-custom/40 rounded-xl py-2 px-3 text-sm font-space transition-all duration-300 outline-none
            ${prefix ? 'pl-8' : ''} 
            ${suffix ? 'pr-8' : ''} 
            ${className}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-text-muted text-sm font-space font-medium">{suffix}</span>
        )}
      </div>
    </div>
  );
};

// Sleek Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full my-2">
      {label && <label className="text-xs font-semibold text-text-muted">{label}</label>}
      <select
        className={`w-full bg-slate-900/40 border border-card-border focus:border-primary-custom/80 focus:ring-1 focus:ring-primary-custom/40 rounded-xl py-2.5 px-3 text-sm font-space transition-all duration-300 outline-none cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-950 text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Circular/Semi-circular Gauge Meter
interface GaugeMeterProps {
  value: number; // 0-100
  title: string;
  subtitle?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const GaugeMeter: React.FC<GaugeMeterProps> = ({
  value,
  title,
  subtitle,
  color = 'primary'
}) => {
  const radius = 50;
  const strokeWidth = 10;
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  // Semi-circle path params (180 degrees)
  // Circumference of half circle = PI * R
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  const colorMap = {
    primary: 'stroke-primary-custom',
    secondary: 'stroke-secondary-custom',
    success: 'stroke-success-custom',
    warning: 'stroke-warning-custom',
    danger: 'stroke-danger-custom'
  };

  const colorTextMap = {
    primary: 'text-primary-custom',
    secondary: 'text-secondary-custom',
    success: 'text-success-custom',
    warning: 'text-warning-custom',
    danger: 'text-danger-custom'
  };

  return (
    <Card className="flex flex-col items-center justify-center p-6 text-center">
      <span className="text-sm font-medium text-text-muted mb-4">{title}</span>
      
      <div className="relative w-36 h-20 flex items-center justify-center overflow-hidden">
        <svg className="w-full h-full transform translate-y-3" viewBox="0 0 120 70">
          {/* Background Arc */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Value Arc */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            className={colorMap[color]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>

        {/* Floating Value */}
        <div className="absolute bottom-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black font-space">
            {value}
          </span>
        </div>
      </div>
      
      {subtitle && (
        <span className={`text-xs font-semibold uppercase tracking-wider mt-2 ${colorTextMap[color]}`}>
          {subtitle}
        </span>
      )}
    </Card>
  );
};

// Progress bar
interface ProgressBarProps {
  value: number; // 0-100
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'primary'
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));

  const colorMap = {
    primary: 'bg-gradient-to-r from-primary-custom to-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.3)]',
    secondary: 'bg-gradient-to-r from-secondary-custom to-indigo-500 shadow-[0_0_10px_rgba(124,77,255,0.3)]',
    success: 'bg-gradient-to-r from-success-custom to-emerald-400 shadow-[0_0_10px_rgba(0,230,118,0.3)]',
    warning: 'bg-gradient-to-r from-warning-custom to-yellow-500 shadow-[0_0_10px_rgba(255,179,0,0.3)]',
    danger: 'bg-gradient-to-r from-danger-custom to-rose-600 shadow-[0_0_10px_rgba(255,82,82,0.3)]'
  };

  return (
    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-900 relative">
      <motion.div
        className={`h-full rounded-full ${colorMap[color]}`}
        initial={{ width: 0 }}
        animate={{ width: `${normalizedValue}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
};
