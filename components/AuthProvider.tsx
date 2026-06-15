'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { createClient } from '../utils/supabase/client';
import { useFinanceStore } from '../store/useFinanceStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { initialize, loading, user, session } = useAuthStore();
  const { theme } = useFinanceStore();
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Run initialization on load
    initialize().then(() => setMounted(true));

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession) {
        useAuthStore.setState({
          session: currentSession,
          user: currentSession.user,
          isGuest: false,
        });

        // Trigger guest to cloud migration check
        const guestData = localStorage.getItem('siplytics-storage');
        const migrationDone = localStorage.getItem(`siplytics-migrated-${currentSession.user.id}`);
        
        if (guestData && !migrationDone) {
          try {
            const parsed = JSON.parse(guestData);
            const state = parsed.state || {};
            
            // Sync goals to database
            if (state.goals && state.goals.length > 0) {
              const goalsToSync = state.goals.map((g: any) => ({
                id: g.id,
                user_id: currentSession.user.id,
                name: g.name,
                type: g.type,
                target_amount: g.targetAmount,
                current_savings: g.currentSavings,
                years_remaining: g.yearsRemaining,
                expected_return: g.expectedReturn,
              }));
              
              const { error } = await supabase.from('goals').upsert(goalsToSync);
              if (error) console.error('Error syncing guest goals:', error);
            }

            // Sync scenarios to database
            if (state.scenarios && state.scenarios.length > 0) {
              const scenariosToSync = state.scenarios.map((s: any) => ({
                id: s.id,
                user_id: currentSession.user.id,
                name: s.name,
                inputs: s.inputs,
                outputs: s.outputs,
                portfolio: s.portfolio,
              }));
              
              const { error } = await supabase.from('scenarios').upsert(scenariosToSync);
              if (error) console.error('Error syncing guest scenarios:', error);
            }

            // Sync user preferences
            const prefData = {
              user_id: currentSession.user.id,
              theme: state.theme || 'dark',
              risk_profile: (state.sipInputs && state.sipInputs.riskProfile) || 'moderate',
              preferred_currency: 'INR',
              saved_assumptions: {
                sipInputs: state.sipInputs,
                portfolio: state.portfolio,
                retirementInputs: state.retirementInputs,
                fireInputs: state.fireInputs,
              }
            };
            await supabase.from('user_preferences').upsert(prefData);

            // Mark migration as done
            localStorage.setItem(`siplytics-migrated-${currentSession.user.id}`, 'true');
            console.log('Guest progression successfully migrated to Supabase Cloud!');
          } catch (e) {
            console.error('Failed to migrate guest session:', e);
          }
        }
      } else {
        useAuthStore.setState({
          session: null,
          user: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Hydrate theme variables instantly to prevent flashing
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      if (theme === 'light') {
        root.classList.add('light');
      } else {
        root.classList.remove('light');
      }
    }
  }, [theme, mounted]);

  // Auth Loading Skeleton
  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-[#070913] text-white flex flex-col md:flex-row overflow-hidden font-inter relative select-none">
        {/* Sidebar Skeleton */}
        <aside className="hidden md:flex flex-col w-[230px] h-screen border-r border-white/5 bg-[#0c0e1a]/40 backdrop-blur-2xl shrink-0 p-5">
          <div className="flex items-center gap-3 mb-10 animate-pulse">
            <div className="h-9 w-9 rounded-xl bg-white/10 shrink-0" />
            <div className="flex flex-col gap-1.5 w-24">
              <div className="h-3 w-20 bg-white/10 rounded-full" />
              <div className="h-2 w-12 bg-white/5 rounded-full" />
            </div>
          </div>
          <nav className="flex-1 flex flex-col gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div key={n} className="flex items-center gap-3 py-1 animate-pulse">
                <div className="h-4 w-4 bg-white/10 rounded-md" />
                <div className="h-3.5 w-24 bg-white/10 rounded-full" />
              </div>
            ))}
          </nav>
          <div className="h-10 w-full bg-white/5 rounded-xl border border-white/5 animate-pulse mt-auto" />
        </aside>

        {/* Content Shell Skeleton */}
        <main className="flex-1 flex flex-col min-w-0 max-h-screen">
          <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#070913] animate-pulse">
            <div className="h-4 w-32 bg-white/10 rounded-full" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-20 bg-white/10 rounded-lg" />
              <div className="h-8 w-24 bg-white/10 rounded-lg" />
            </div>
          </header>
          <div className="flex-1 p-8 overflow-y-auto space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 bg-[#0c0e1a] border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="h-3.5 w-1/3 bg-white/10 rounded-full" />
                  <div className="h-6 w-1/2 bg-white/15 rounded-full" />
                </div>
              ))}
            </div>
            <div className="h-[320px] w-full bg-[#0c0e1a] border border-white/5 rounded-2xl p-6 flex flex-col justify-end">
              <div className="flex gap-4 items-end h-3/4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-md" style={{ height: `${(i % 4 + 1) * 20}%` }} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <>{children}</>;
};
