import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SipInputs,
  SipOutputs,
  PortfolioAllocation,
  PortfolioMetrics,
  Goal,
  RetirementInputs,
  RetirementOutputs,
  FireInputs,
  FireOutputs,
  EmergencyInputs,
  EmergencyOutputs,
  PassiveIncomeInputs,
  PassiveIncomeOutputs,
  NetWorthInputs,
  NetWorthOutputs,
  TaxInputs,
  TaxOutputs,
  Scenario
} from '../types';
import {
  calculateSip,
  calculatePortfolioMetrics,
  calculateRetirement,
  calculateFire,
  calculateEmergencyFund,
  calculatePassiveIncome,
  calculateNetWorth,
  calculateTax
} from '../utils/finance';

interface FinanceState {
  // Navigation & UI
  activeTab: string;
  theme: 'dark' | 'light' | 'system';
  setActiveTab: (tab: string) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;

  // Calculators & Outputs
  sipInputs: SipInputs;
  sipOutputs: SipOutputs;
  portfolio: PortfolioAllocation;
  portfolioMetrics: PortfolioMetrics;
  goals: Goal[];
  retirementInputs: RetirementInputs;
  retirementOutputs: RetirementOutputs;
  fireInputs: FireInputs;
  fireOutputs: FireOutputs;
  emergencyInputs: EmergencyInputs;
  emergencyOutputs: EmergencyOutputs;
  passiveIncomeInputs: PassiveIncomeInputs;
  passiveIncomeOutputs: PassiveIncomeOutputs;
  netWorthInputs: NetWorthInputs;
  netWorthOutputs: NetWorthOutputs;
  taxInputs: TaxInputs;
  taxOutputs: TaxOutputs;
  scenarios: Scenario[];

  // Setters & Triggers
  updateSipInputs: (inputs: Partial<SipInputs>) => void;
  updatePortfolio: (allocation: Partial<PortfolioAllocation>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'requiredSip' | 'requiredLumpsum' | 'achievementProbability' | 'progressPercent' | 'gapAmount'>) => void;
  deleteGoal: (id: string) => void;
  updateRetirementInputs: (inputs: Partial<RetirementInputs>) => void;
  updateFireInputs: (inputs: Partial<FireInputs>) => void;
  updateEmergencyInputs: (inputs: Partial<EmergencyInputs>) => void;
  updatePassiveIncomeInputs: (inputs: Partial<PassiveIncomeInputs>) => void;
  updateNetWorthInputs: (inputs: Partial<NetWorthInputs>) => void;
  updateTaxInputs: (inputs: Partial<TaxInputs>) => void;

  // Scenarios
  saveCurrentScenario: (name: string) => void;
  deleteScenario: (id: string) => void;
  loadScenario: (scenario: Scenario) => void;
}

const defaultSipInputs: SipInputs = {
  monthlySip: 10000,
  lumpsum: 100000,
  expectedReturn: 12,
  durationYears: 15,
  inflationRate: 6,
  stepUpPercent: 10,
  expenseRatio: 0.5,
  exitLoad: 1,
  taxRate: 12.5,
  riskProfile: 'moderate',
  goalType: 'retirement'
};

const defaultPortfolio: PortfolioAllocation = {
  equity: 60,
  debt: 20,
  gold: 10,
  internationalEquity: 5,
  reits: 0,
  cash: 5
};

const defaultRetirementInputs: RetirementInputs = {
  currentAge: 30,
  retirementAge: 60,
  lifeExpectancy: 85,
  currentSavings: 500000,
  monthlyInvestment: 15000,
  expectedReturnPreRetirement: 12,
  expectedReturnPostRetirement: 8,
  inflationRate: 6,
  monthlyExpensesPostRetirement: 50000
};

const defaultFireInputs: FireInputs = {
  currentAge: 30,
  monthlyExpenses: 40000,
  currentSavings: 1000000,
  monthlyInvestment: 30000,
  expectedReturn: 12,
  inflationRate: 6,
  fireMultiplier: 25
};

const defaultEmergencyInputs: EmergencyInputs = {
  monthlyExpenses: 30000,
  dependents: 1,
  hasInsurance: true
};

const defaultPassiveIncomeInputs: PassiveIncomeInputs = {
  desiredMonthlyIncome: 50000,
  expectedWithdrawalRate: 4,
  expectedReturn: 9
};

const defaultNetWorthInputs: NetWorthInputs = {
  assets: {
    cash: 200000,
    investments: 1000000,
    gold: 300000,
    property: 4500000,
    crypto: 150000
  },
  liabilities: {
    loans: 150000,
    creditCard: 20000,
    mortgage: 1200000
  }
};

const defaultTaxInputs: TaxInputs = {
  shortTermCapitalGains: 50000,
  longTermCapitalGains: 180000,
  holdingDurationMonths: 18,
  taxableIncome: 1200000
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => {
      // Calculate derived outputs initially
      const initSipOutputs = calculateSip(defaultSipInputs);
      const initPortfolioMetrics = calculatePortfolioMetrics(defaultPortfolio);
      const initRetirementOutputs = calculateRetirement(defaultRetirementInputs);
      const initFireOutputs = calculateFire(defaultFireInputs);
      const initEmergencyOutputs = calculateEmergencyFund(defaultEmergencyInputs);
      const initPassiveIncomeOutputs = calculatePassiveIncome(defaultPassiveIncomeInputs);
      const initNetWorthOutputs = calculateNetWorth(defaultNetWorthInputs);
      const initTaxOutputs = calculateTax(defaultTaxInputs);

      return {
        activeTab: 'landing',
        theme: 'dark',
        setActiveTab: (activeTab) => set({ activeTab }),
        setTheme: (theme) => set({ theme }),

        // Initial States
        sipInputs: defaultSipInputs,
        sipOutputs: initSipOutputs,
        portfolio: defaultPortfolio,
        portfolioMetrics: initPortfolioMetrics,
        goals: [
          {
            id: 'goal-retirement',
            name: 'Retirement Fund',
            type: 'retirement',
            targetAmount: 50000000,
            currentSavings: 500000,
            yearsRemaining: 30,
            expectedReturn: 12,
            requiredSip: 14100,
            requiredLumpsum: 1670000,
            achievementProbability: 78,
            progressPercent: 1,
            gapAmount: 49500000
          },
          {
            id: 'goal-car',
            name: 'Tesla Model S',
            type: 'car',
            targetAmount: 3000000,
            currentSavings: 300000,
            yearsRemaining: 5,
            expectedReturn: 11,
            requiredSip: 32000,
            requiredLumpsum: 1780000,
            achievementProbability: 92,
            progressPercent: 10,
            gapAmount: 2700000
          }
        ],
        retirementInputs: defaultRetirementInputs,
        retirementOutputs: initRetirementOutputs,
        fireInputs: defaultFireInputs,
        fireOutputs: initFireOutputs,
        emergencyInputs: defaultEmergencyInputs,
        emergencyOutputs: initEmergencyOutputs,
        passiveIncomeInputs: defaultPassiveIncomeInputs,
        passiveIncomeOutputs: initPassiveIncomeOutputs,
        netWorthInputs: defaultNetWorthInputs,
        netWorthOutputs: initNetWorthOutputs,
        taxInputs: defaultTaxInputs,
        taxOutputs: initTaxOutputs,
        scenarios: [],

        updateSipInputs: (newInputs) => {
          const updatedInputs = { ...get().sipInputs, ...newInputs };
          const updatedOutputs = calculateSip(updatedInputs);
          set({ sipInputs: updatedInputs, sipOutputs: updatedOutputs });
        },

        updatePortfolio: (newAlloc) => {
          const updatedAlloc = { ...get().portfolio, ...newAlloc };
          const updatedMetrics = calculatePortfolioMetrics(updatedAlloc);
          set({ portfolio: updatedAlloc, portfolioMetrics: updatedMetrics });
        },

        addGoal: (goalData) => {
          const { name, type, targetAmount, currentSavings, yearsRemaining, expectedReturn } = goalData;
          
          // Calculate required SIP/Lumpsum for the goal
          const r = expectedReturn / 12 / 100;
          const months = yearsRemaining * 12;
          
          // FV of current savings
          const fvSavings = currentSavings * Math.pow(1 + expectedReturn / 100, yearsRemaining);
          const gap = Math.max(0, targetAmount - fvSavings);
          
          // PMT Solver for SIP: Gap = SIP * (((1+r)^n - 1)/r) * (1+r)
          let requiredSip = 0;
          if (gap > 0 && r > 0) {
            requiredSip = Math.round(gap / (((Math.pow(1 + r, months) - 1) / r) * (1 + r)));
          }
          
          // Required Lumpsum to bridge target today: target / (1+r)^n
          const requiredLumpsum = Math.round(targetAmount / Math.pow(1 + expectedReturn / 100, yearsRemaining));

          const progressPercent = Math.min(100, Math.round((currentSavings / targetAmount) * 100));
          const achievementProbability = Math.round(Math.min(99, Math.max(5, 100 - (yearsRemaining * 2) - (gap / targetAmount) * 30)));

          const newGoal: Goal = {
            id: `goal-${Date.now()}`,
            name,
            type,
            targetAmount,
            currentSavings,
            yearsRemaining,
            expectedReturn,
            requiredSip,
            requiredLumpsum,
            achievementProbability,
            progressPercent,
            gapAmount: Math.round(gap)
          };

          set((state) => ({ goals: [...state.goals, newGoal] }));
        },

        deleteGoal: (id) => {
          set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
        },

        updateRetirementInputs: (newInputs) => {
          const updatedInputs = { ...get().retirementInputs, ...newInputs };
          const updatedOutputs = calculateRetirement(updatedInputs);
          set({ retirementInputs: updatedInputs, retirementOutputs: updatedOutputs });
        },

        updateFireInputs: (newInputs) => {
          const updatedInputs = { ...get().fireInputs, ...newInputs };
          const updatedOutputs = calculateFire(updatedInputs);
          set({ fireInputs: updatedInputs, fireOutputs: updatedOutputs });
        },

        updateEmergencyInputs: (newInputs) => {
          const updatedInputs = { ...get().emergencyInputs, ...newInputs };
          const updatedOutputs = calculateEmergencyFund(updatedInputs);
          set({ emergencyInputs: updatedInputs, emergencyOutputs: updatedOutputs });
        },

        updatePassiveIncomeInputs: (newInputs) => {
          const updatedInputs = { ...get().passiveIncomeInputs, ...newInputs };
          const updatedOutputs = calculatePassiveIncome(updatedInputs);
          set({ passiveIncomeInputs: updatedInputs, passiveIncomeOutputs: updatedOutputs });
        },

        updateNetWorthInputs: (newInputs) => {
          const updatedAssets = { ...get().netWorthInputs.assets, ...newInputs.assets };
          const updatedLiabilities = { ...get().netWorthInputs.liabilities, ...newInputs.liabilities };
          const updatedInputs = { assets: updatedAssets, liabilities: updatedLiabilities };
          const updatedOutputs = calculateNetWorth(updatedInputs);
          set({ netWorthInputs: updatedInputs, netWorthOutputs: updatedOutputs });
        },

        updateTaxInputs: (newInputs) => {
          const updatedInputs = { ...get().taxInputs, ...newInputs };
          const updatedOutputs = calculateTax(updatedInputs);
          set({ taxInputs: updatedInputs, taxOutputs: updatedOutputs });
        },

        saveCurrentScenario: (name) => {
          const newScenario: Scenario = {
            id: `scenario-${Date.now()}`,
            name,
            inputs: get().sipInputs,
            outputs: get().sipOutputs,
            portfolio: get().portfolio,
            timestamp: Date.now()
          };
          set((state) => ({ scenarios: [...state.scenarios, newScenario] }));
        },

        deleteScenario: (id) => {
          set((state) => ({ scenarios: state.scenarios.filter((s) => s.id !== id) }));
        },

        loadScenario: (scenario) => {
          set({
            sipInputs: scenario.inputs,
            sipOutputs: scenario.outputs,
            portfolio: scenario.portfolio,
            portfolioMetrics: calculatePortfolioMetrics(scenario.portfolio)
          });
        }
      };
    },
    {
      name: 'siplytics-storage',
      partialize: (state) => ({
        theme: state.theme,
        scenarios: state.scenarios,
        goals: state.goals,
        sipInputs: state.sipInputs,
        portfolio: state.portfolio,
        retirementInputs: state.retirementInputs,
        fireInputs: state.fireInputs,
        emergencyInputs: state.emergencyInputs,
        passiveIncomeInputs: state.passiveIncomeInputs,
        netWorthInputs: state.netWorthInputs,
        taxInputs: state.taxInputs
      })
    }
  )
);
