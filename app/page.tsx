'use client';

import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
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

export default function Home() {
  const { activeTab } = useFinanceStore();

  if (activeTab === 'landing') {
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
      default:
        return <Dashboard />;
    }
  };

  return <DashboardShell>{renderActiveTab()}</DashboardShell>;
}
