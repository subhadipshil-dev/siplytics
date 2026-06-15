'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CloudLightning, X, Compass, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui';

export const GuestUpgradeModal: React.FC = () => {
  const { upgradeModalOpen, setUpgradeModalOpen } = useAuthStore();

  const handleSignUpRedirect = () => {
    setUpgradeModalOpen(false);
    // Redirect to signup page
    window.location.href = '/signup';
  };

  return (
    <AnimatePresence>
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUpgradeModalOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-[var(--background-secondary)] border border-[var(--card-border)] rounded-2xl p-6 shadow-2xl overflow-hidden z-10 font-inter text-[var(--foreground)]"
          >
            {/* Ambient Aurora glow */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 rounded-full bg-[var(--primary-custom)]/10 blur-[60px] pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="h-10 w-10 rounded-xl bg-[var(--primary-dim)] border border-[var(--primary-custom)]/20 flex items-center justify-center text-[var(--primary-custom)]">
                <CloudLightning size={20} />
              </div>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--card-bg-hover)] text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <h3 className="text-xl font-bold font-space tracking-tight mb-2">
              Save Your Wealth Projections
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
              As a guest, your calculators and projection sliders are fully functional. However, creating a free account unlocks premium features to help manage your long-term plan:
            </p>

            {/* Features list */}
            <div className="space-y-4 mb-8">
              {[
                {
                  title: 'Cloud Sync & Persistence',
                  desc: 'Save unlimited goals, retirement settings, and allocations across devices.'
                },
                {
                  title: 'Custom Scenarios Saving',
                  desc: 'Compare multiple Step-Up SIP rates and risk profiles side-by-side.'
                },
                {
                  title: 'Shareable Financial Reports',
                  desc: 'Export detailed PDFs with asset breakdowns and Monte Carlo curves.'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <ShieldCheck size={16} className="text-[var(--primary-custom)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold font-space">{item.title}</h4>
                    <p className="text-[11px] text-[var(--text-subtle)] leading-normal mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Button
                onClick={handleSignUpRedirect}
                className="flex-1 justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,212,245,0.15)]"
              >
                Create Free Account
                <ArrowRight size={13} />
              </Button>
              <Button
                variant="outline"
                onClick={() => setUpgradeModalOpen(false)}
                className="flex-1 justify-center"
              >
                Continue Exploring
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
