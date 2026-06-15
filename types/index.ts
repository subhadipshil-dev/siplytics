export type RiskProfile = 'low' | 'moderate' | 'high' | 'extreme';

export type GoalType = 'house' | 'car' | 'marriage' | 'education' | 'retirement' | 'vacation' | 'fire' | 'custom';

export interface SipInputs {
  monthlySip: number;
  lumpsum: number;
  expectedReturn: number;
  durationYears: number;
  inflationRate: number;
  stepUpPercent: number;
  expenseRatio: number;
  exitLoad: number;
  taxRate: number;
  riskProfile: RiskProfile;
  goalType: GoalType;
  goalTargetAmount?: number;
}

export interface SipOutputs {
  totalInvested: number;
  totalReturns: number;
  finalCorpus: number;
  realCorpus: number; // After tax and exit load
  inflationAdjustedCorpus: number; // Adjusted for inflation
  cagr: number;
  approxXirr: number;
  wealthMultiplier: number;
  compoundingScore: number; // 0-100
  investmentEfficiencyScore: number; // 0-100
  yearlyBreakdown: YearlyBreakdownItem[];
  monthlyBreakdown: MonthlyBreakdownItem[];
}

export interface YearlyBreakdownItem {
  year: number;
  age: number;
  investedAmount: number;
  returnsEarned: number;
  futureValue: number;
  inflationAdjustedValue: number;
  stepUpMonthlySip: number;
}

export interface MonthlyBreakdownItem {
  month: number;
  investedAmount: number;
  returnsEarned: number;
  futureValue: number;
}

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentSavings: number;
  yearsRemaining: number;
  expectedReturn: number;
  requiredSip: number;
  requiredLumpsum: number;
  achievementProbability: number;
  progressPercent: number;
  gapAmount: number;
}

export interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  monthlyInvestment: number;
  expectedReturnPreRetirement: number;
  expectedReturnPostRetirement: number;
  inflationRate: number;
  monthlyExpensesPostRetirement: number; // In today's value
}

export interface RetirementOutputs {
  requiredRetirementCorpus: number;
  projectedCorpusAtRetirement: number;
  monthlyRetirementIncome: number;
  safeWithdrawalAmount: number;
  inflationAdjustedIncome: number;
  retirementReadinessScore: number; // 0-100
  yearlyProjection: RetirementProjectionItem[];
}

export interface RetirementProjectionItem {
  year: number;
  age: number;
  corpus: number;
  withdrawals: number;
  contributions: number;
  isRetired: boolean;
}

export interface FireInputs {
  currentAge: number;
  monthlyExpenses: number;
  currentSavings: number;
  monthlyInvestment: number;
  expectedReturn: number;
  inflationRate: number;
  fireMultiplier: number; // e.g. 25, 30, 50 (representing 25x, 30x, 50x yearly expenses)
}

export interface FireOutputs {
  fireNumber: number;
  requiredCorpus: number;
  yearsToFire: number;
  targetAge: number;
  savingsRate: number;
  monthlyInvestmentNeeded: number;
  currentProgressPercent: number;
  timelineBreakdown: FireTimelineItem[];
}

export interface FireTimelineItem {
  year: number;
  age: number;
  investedCorpus: number;
  fireTargetCorpus: number;
}

export interface PortfolioAllocation {
  equity: number;
  debt: number;
  gold: number;
  internationalEquity: number;
  reits: number;
  cash: number;
}

export interface PortfolioMetrics {
  expectedReturn: number;
  expectedVolatility: number;
  portfolioGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  diversificationScore: number; // 0-100
  riskRating: 'Low' | 'Moderate' | 'High' | 'Aggressive';
}

export interface MonteCarloInputs {
  simulationsCount: number;
  volatility: number; // e.g. 15%
}

export interface MonteCarloOutputs {
  bestCase: number; // 90th percentile
  averageCase: number; // 50th percentile
  worstCase: number; // 10th percentile
  successProbability: number; // percentage of simulations >= goal or baseline
  confidenceInterval: [number, number]; // 95% CI bounds
  runs: number[][]; // sample paths for chart
  distribution: { bin: string; count: number }[];
}

export interface Recommendation {
  id: string;
  category: 'SIP' | 'Savings' | 'Risk' | 'Diversification' | 'Tax' | 'Emergency';
  title: string;
  description: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  actionableText: string;
}

export interface Milestone {
  targetAmount: number;
  label: string;
  estimatedDate: string;
  yearsToReach: number;
  achieved: boolean;
}

export interface EmergencyInputs {
  monthlyExpenses: number;
  dependents: number;
  hasInsurance: boolean;
}

export interface EmergencyOutputs {
  recommendedEmergencyCorpus: number;
  coverageMonths: number;
  safetyRating: 'Poor' | 'Adequate' | 'Good' | 'Excellent' | 'Bulletproof';
}

export interface PassiveIncomeInputs {
  desiredMonthlyIncome: number;
  expectedWithdrawalRate: number; // e.g. 4%
  expectedReturn: number;
}

export interface PassiveIncomeOutputs {
  requiredCorpus: number;
  monthlyInvestmentRequired: number;
  timelineYears: number;
}

export interface NetWorthInputs {
  assets: {
    cash: number;
    investments: number;
    gold: number;
    property: number;
    crypto: number;
  };
  liabilities: {
    loans: number;
    creditCard: number;
    mortgage: number;
  };
}

export interface NetWorthOutputs {
  currentNetWorth: number;
  projectedNetWorth5Years: number;
  projectedNetWorth10Years: number;
  yearlyProjection: { year: number; assets: number; liabilities: number; netWorth: number }[];
}

export interface TaxInputs {
  shortTermCapitalGains: number; // Amount
  longTermCapitalGains: number; // Amount
  holdingDurationMonths: number;
  taxableIncome: number;
}

export interface TaxOutputs {
  capitalGainsTax: number;
  withdrawalTaxImpact: number;
  taxEfficiencyScore: number; // 0-100
  suggestions: string[];
}

export interface Scenario {
  id: string;
  name: string;
  inputs: SipInputs;
  outputs: SipOutputs;
  portfolio: PortfolioAllocation;
  timestamp: number;
}
