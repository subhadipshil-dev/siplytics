import React, { useEffect, useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const { theme, setTheme, setActiveTab } = useFinanceStore();
  const { user, isGuest } = useAuthStore();
  const [activeSection, setActiveSection] = useState<string>('');

  const navLinks = [
    { label: 'Why SIPlytics', href: '#why-siplytics' },
    { label: 'Comparison', href: '#comparison' },
    { label: 'Features', href: '#features' },
    { label: 'Interactive Calc', href: '#interactive-calculator' },
    { label: 'Methodology', href: '#methodology' },
  ];

  useEffect(() => {
    const sections = navLinks.map(link => document.querySelector(link.href));
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((sec) => {
      if (sec) observer.observe(sec);
    });

    return () => {
      sections.forEach((sec) => {
        if (sec) observer.unobserve(sec);
      });
    };
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenApp = () => {
    if (user || isGuest) {
      setActiveTab(user ? 'dashboard' : 'sip-calc');
    } else {
      window.location.href = '/login';
    }
  };

  const handleGetStarted = () => {
    if (user || isGuest) {
      setActiveTab(user ? 'dashboard' : 'sip-calc');
    } else {
      window.location.href = '/signup';
    }
  };

  return (
    <header className="w-full border-b border-[var(--card-border)] bg-[var(--background)]/60 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2.5 hover:opacity-85 transition-all duration-200 cursor-pointer"
        >
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[var(--primary-custom)] to-[var(--secondary-custom)] flex items-center justify-center text-black font-black font-space text-base shadow-[var(--shadow-primary)] shrink-0">
            S
          </div>
          <div className="flex flex-col text-left">
            <span className="font-space font-bold text-sm tracking-tight text-[var(--foreground)] leading-none">
              SIPlytics
            </span>
            <span className="text-[8px] text-[var(--text-subtle)] mt-0.5 tracking-wider uppercase font-mono">
              Wealth Intelligence
            </span>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const sectionId = link.href.substring(1);
            const isActive = activeSection === sectionId;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                className={`text-xs font-semibold relative py-1 transition-colors duration-200 cursor-pointer ${
                  isActive ? 'text-[var(--foreground)]' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="header-nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary-custom)] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Theme Selector */}
          <div className="flex items-center gap-0.5 bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--card-border)] relative">
            {[
              { mode: 'dark' as const, icon: Moon, label: 'Dark' },
              { mode: 'light' as const, icon: Sun, label: 'Light' },
              { mode: 'system' as const, icon: Monitor, label: 'System' },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                title={`${label} theme`}
                className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer relative z-10 ${
                  theme === mode
                    ? 'text-black font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <Icon size={12} />
                {theme === mode && (
                  <motion.div
                    layoutId="header-active-theme-bg"
                    className="absolute inset-0 bg-[var(--primary-custom)] rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenApp}
            className="text-xs"
          >
            Open App
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleGetStarted}
            className="text-xs hidden sm:flex"
            glow
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};
