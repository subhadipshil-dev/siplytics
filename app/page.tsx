'use client';

import React, { useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { DashboardShell } from '../components/DashboardShell';
import { LandingPage } from '../features/LandingPage';
import { Dashboard } from '../features/Dashboard';
import { SipCalculator } from '../features/SipCalculator';
import { GoalPlanner } from '../features/GoalPlanner';
import { RetirementPlanner } from '../features/RetirementPlanner';
import { FirePlanner } from '../features/FirePlanner';
import { PortfolioAllocation } from '../features/PortfolioAllocation';
import { RiskAnalysis } from '../features/RiskAnalysis';
import { Simulations } from '../features/Simulations';
import { ExtraCalculators } from '../features/ExtraCalculators';
import { Reports } from '../features/Reports';
import { SettingsView } from '../features/SettingsView';


export default function Home() {
  const { activeTab, setActiveTab } = useFinanceStore();
  const { user, isGuest } = useAuthStore();

  // If a session starts, automatically transition activeTab out of 'landing'
  useEffect(() => {
    if ((user || isGuest) && activeTab === 'landing') {
      setActiveTab(user ? 'dashboard' : 'sip-calc');
    } else if (!user && !isGuest && activeTab !== 'landing') {
      setActiveTab('landing');
    }
  }, [user, isGuest, activeTab]);

  // If logged out and not a guest, render the landing page directly
  if (!user && !isGuest) {
    return <LandingPage />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sip-calc':
        return <SipCalculator />;
      case 'goal-planner':
        return <GoalPlanner />;
      case 'retirement':
        return <RetirementPlanner />;
      case 'fire':
        return <FirePlanner />;
      case 'portfolio':
        return <PortfolioAllocation />;
      case 'risk-analysis':
        return <RiskAnalysis />;
      case 'simulations':
        return <Simulations />;
      case 'extra':
        return <ExtraCalculators />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return <DashboardShell>{renderActiveTab()}</DashboardShell>;
}
