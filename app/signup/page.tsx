'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, User, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { Button } from '../../components/ui';

function SignupContent() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const { signup, loginWithGoogle, continueAsGuest, error, clearError, loading } = useAuthStore();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successSent, setSuccessSent] = useState(false);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!fullName || !email || !password || !confirmPassword) {
      setLocalError('Please complete all form fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (!agreeTerms) {
      setLocalError('Please agree to the terms and privacy conditions');
      return;
    }

    const res = await signup(email, password, fullName);
    if (res.error) {
      setLocalError(res.error);
    } else {
      setSuccessSent(true);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    clearError();
    const res = await loginWithGoogle();
    if (res.error) {
      setLocalError(res.error);
    }
  };

  const handleGuestLogin = () => {
    continueAsGuest();
    window.location.href = redirectPath === '/dashboard' ? '/calculator' : redirectPath;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex overflow-hidden font-inter relative select-none">
      {/* Background Aurora overlay */}
      <div className="aurora opacity-75" />

      {/* ── LEFT SIDE: FINTECH SHOWCASE ───────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0c0e1a]/20 border-r border-[var(--card-border)] relative flex-col justify-between p-12 overflow-hidden z-10">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
            backgroundSize: '45px 45px',
          }}
        />

        {/* Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[var(--primary-custom)] to-[var(--secondary-custom)] flex items-center justify-center text-black font-black font-space text-xl shadow-[0_0_20px_rgba(0,212,245,0.3)] shrink-0">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-space font-bold text-base tracking-tight leading-none">SIPlytics</span>
            <span className="text-[9px] text-[var(--text-subtle)] mt-0.5 tracking-[0.15em] uppercase font-mono">
              Quantitative Planning
            </span>
          </div>
        </div>

        {/* Showcase Components */}
        <div className="my-auto space-y-8 relative z-10 max-w-md">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold font-space tracking-tight leading-tight text-white">
              Understand Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-custom)] to-[var(--secondary-custom)]">
                Financial Future
              </span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Verify expected returns, model worst-case scenarios, and track milestone goals using real quantitative modeling engines.
            </p>
          </div>

          {/* Snapshot Widgets */}
          <div className="space-y-4">
            {/* Widget 1: Projected Corpus Card */}
            <div className="p-4 bg-[var(--background-secondary)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-subtle)]">
                  Future Corpus projection
                </span>
                <h3 className="text-xl font-bold font-mono text-white">₹2,84,50,000</h3>
              </div>
              <div className="flex items-center gap-1 bg-[var(--success-dim)] border border-[var(--success-custom)]/25 text-[var(--success-custom)] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                <TrendingUp size={11} />
                <span>+14.2% Yr</span>
              </div>
            </div>

            {/* Widget 2: Goal Milestone List Item */}
            <div className="p-4 bg-[var(--background-secondary)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[var(--primary-custom)]" />
                  <span className="text-xs font-bold font-space text-white">FIRE Readiness Index</span>
                </div>
                <span className="font-mono text-xs text-[var(--primary-custom)] font-bold">82%</span>
              </div>
              <div className="w-full bg-[var(--card-border)] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[var(--primary-custom)] h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>

            {/* Widget 3: Asset allocation pill */}
            <div className="p-4 bg-[var(--background-secondary)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-2xl flex justify-between gap-2 text-[10px] font-mono text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--primary-custom)]" /> Equity 60%</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--secondary-custom)]" /> Debt 20%</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--warning-custom)]" /> Alternatives 20%</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-[var(--text-subtle)] relative z-10 flex gap-4">
          <span>Institutional Grade Tools</span>
          <span>·</span>
          <span>Protected RLS Database</span>
        </div>
      </div>

      {/* ── RIGHT SIDE: SIGNUP FORM ──────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile brand view */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[var(--primary-custom)] to-[var(--secondary-custom)] flex items-center justify-center text-black font-black font-space text-base">
              S
            </div>
            <span className="font-space font-bold text-lg">SIPlytics</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-space tracking-tight text-white">
              Create your account
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Create an account below to unlock syncing, scenario comparisons, and onboarding.
            </p>
          </div>

          {/* Form */}
          <div className="bg-[var(--background-secondary)]/50 backdrop-blur-xl border border-[var(--card-border)] rounded-2xl p-6 shadow-xl space-y-6">
            {/* Error alerts */}
            {(localError || error) && (
              <div className="p-3 bg-[var(--error-dim)] border border-[var(--error-custom)]/20 rounded-xl text-xs text-[var(--error-custom)] leading-relaxed flex gap-2 items-start animate-shake">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}

            {successSent ? (
              <div className="text-center py-6 space-y-4">
                <div className="h-12 w-12 rounded-full bg-[var(--success-dim)] border border-[var(--success-custom)]/20 flex items-center justify-center text-[var(--success-custom)] mx-auto">
                  <Mail size={22} />
                </div>
                <h3 className="text-sm font-bold font-space text-white">Confirm Email</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
                  We've sent an activation link to <span className="text-white font-semibold font-mono">{email}</span>. Please click the link inside that email to complete your registration.
                </p>
                <a
                  href="/login"
                  className="inline-block text-xs font-semibold text-[var(--primary-custom)] hover:underline mt-4 cursor-pointer"
                >
                  Return to Login
                </a>
              </div>
            ) : (
              <>
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block">Full Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-custom)]/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block">Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-custom)]/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block">Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-custom)]/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block">Confirm Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-custom)]/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center text-xs py-1.5">
                    <label className="flex items-start gap-2.5 text-[var(--text-muted)] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="h-3.5 w-3.5 accent-[var(--primary-custom)] bg-[var(--card-bg)] rounded border-[var(--card-border)] focus:outline-none mt-0.5"
                      />
                      <span>
                        I agree to the{' '}
                        <a href="#" className="text-white underline hover:text-[var(--primary-custom)] transition-colors">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-white underline hover:text-[var(--primary-custom)] transition-colors">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full justify-center py-2.5">
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                {/* Google OAuth & Guest Mode */}
                <div className="space-y-3 border-t border-[var(--card-border)] pt-5">
                  <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full bg-[#1b1c26]/40 hover:bg-[#1b1c26]/80 text-white font-semibold text-xs border border-[var(--card-border)] rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.67 0 3.2.58 4.38 1.71l3.27-3.27C17.67 1.63 14.98 1 12 1 7.35 1 3.39 3.67 1.5 7.57l3.89 3.02C6.31 7.58 8.94 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.44c-.28 1.48-1.11 2.73-2.37 3.58l3.69 2.86c2.16-1.99 3.41-4.91 3.41-8.57z" />
                      <path fill="#FBBC05" d="M5.39 10.59a7.22 7.22 0 0 1 0-3.32L1.5 4.25a11.96 11.96 0 0 0 0 11.13l3.89-3.02c-.25-.49-.39-1.04-.39-1.77z" />
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.86c-1.03.69-2.35 1.1-4.27 1.1-3.06 0-5.69-2.54-6.61-5.55l-3.89 3.02C3.39 20.33 7.35 23 12 23z" />
                    </svg>
                    Register with Google
                  </button>

                  <button
                    onClick={handleGuestLogin}
                    type="button"
                    className="w-full bg-transparent hover:bg-[var(--card-bg-hover)] text-[var(--text-muted)] hover:text-white font-semibold text-xs border border-dashed border-[var(--card-border)] rounded-xl py-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    Continue as Guest
                    <ArrowRight size={12} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Links */}
          <p className="text-center text-xs text-[var(--text-subtle)]">
            Already have an account?{' '}
            <a href="/login" className="text-[var(--primary-custom)] font-semibold hover:underline cursor-pointer">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070913] flex items-center justify-center text-white font-space">Loading secure check...</div>}>
      <SignupContent />
    </Suspense>
  );
}
