import {
  SipInputs,
  SipOutputs,
  YearlyBreakdownItem,
  MonthlyBreakdownItem,
  RetirementInputs,
  RetirementOutputs,
  RetirementProjectionItem,
  FireInputs,
  FireOutputs,
  FireTimelineItem,
  PortfolioAllocation,
  PortfolioMetrics,
  MonteCarloInputs,
  MonteCarloOutputs,
  EmergencyInputs,
  EmergencyOutputs,
  PassiveIncomeInputs,
  PassiveIncomeOutputs,
  NetWorthInputs,
  NetWorthOutputs,
  TaxInputs,
  TaxOutputs,
  Recommendation,
  Milestone,
  RiskProfile
} from '../types';

// Helper for random normal distribution using Box-Muller transform
export function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.max(Math.random(), 1e-10); // avoid 0
  const u2 = Math.random();
  const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
  return mean + stdDev * randStdNormal;
}

/**
 * Calculates SIP and Lumpsum returns with step-up support.
 */
export function calculateSip(inputs: SipInputs): SipOutputs {
  const {
    monthlySip,
    lumpsum,
    expectedReturn,
    durationYears,
    inflationRate,
    stepUpPercent,
    expenseRatio,
    exitLoad,
    taxRate
  } = inputs;

  const totalMonths = durationYears * 12;
  const netAnnualReturn = expectedReturn - expenseRatio;
  const monthlyReturnRate = netAnnualReturn / 12 / 100;
  const monthlyInflationRate = inflationRate / 12 / 100;

  let currentCorpus = lumpsum;
  let totalInvested = lumpsum;
  let totalReturns = 0;
  let currentMonthlySip = monthlySip;

  const yearlyBreakdown: YearlyBreakdownItem[] = [];
  const monthlyBreakdown: MonthlyBreakdownItem[] = [];

  // Year 0 entry (if lumpsum)
  yearlyBreakdown.push({
    year: 0,
    age: 0,
    investedAmount: totalInvested,
    returnsEarned: 0,
    futureValue: currentCorpus,
    inflationAdjustedValue: currentCorpus,
    stepUpMonthlySip: currentMonthlySip
  });

  for (let month = 1; month <= totalMonths; month++) {
    // Step-up is applied at the start of every new year (months 13, 25, 37, etc.)
    if (month > 1 && (month - 1) % 12 === 0 && stepUpPercent > 0) {
      currentMonthlySip = currentMonthlySip * (1 + stepUpPercent / 100);
    }

    const openingBalance = currentCorpus;
    const investmentThisMonth = currentMonthlySip;
    
    // Add monthly investment to total invested
    totalInvested += investmentThisMonth;

    // Compound interest
    // Investment is made at the start of the month
    const interestThisMonth = (openingBalance + investmentThisMonth) * monthlyReturnRate;
    currentCorpus = openingBalance + investmentThisMonth + interestThisMonth;
    totalReturns += interestThisMonth;

    monthlyBreakdown.push({
      month,
      investedAmount: totalInvested,
      returnsEarned: totalReturns,
      futureValue: currentCorpus
    });

    // Save yearly breakdown
    if (month % 12 === 0) {
      const year = month / 12;
      const inflationDiscount = Math.pow(1 + inflationRate / 100, year);
      
      yearlyBreakdown.push({
        year,
        age: year, // will be offset by user's actual age in the UI
        investedAmount: totalInvested,
        returnsEarned: totalReturns,
        futureValue: currentCorpus,
        inflationAdjustedValue: currentCorpus / inflationDiscount,
        stepUpMonthlySip: currentMonthlySip
      });
    }
  }

  // Calculate taxes and exit load
  const capitalGains = Math.max(0, currentCorpus - totalInvested);
  const exitLoadAmount = currentCorpus * (exitLoad / 100);
  const taxAmount = capitalGains * (taxRate / 100);
  
  const realCorpus = currentCorpus - exitLoadAmount - taxAmount;
  const inflationDiscount = Math.pow(1 + inflationRate / 100, durationYears);
  const inflationAdjustedCorpus = realCorpus / inflationDiscount;

  // CAGR Calculation
  // FV = PV * (1 + r)^n => r = (FV/PV)^(1/n) - 1
  let cagr = 0;
  if (totalInvested > 0) {
    cagr = (Math.pow(currentCorpus / totalInvested, 1 / durationYears) - 1) * 100;
  }
  // Approximate XIRR: For SIP, XIRR is close to Net Annual Return
  const approxXirr = netAnnualReturn;

  const wealthMultiplier = totalInvested > 0 ? currentCorpus / totalInvested : 0;

  // Compounding score based on duration and expected return (longer = higher compounding)
  const compoundingScore = Math.min(100, Math.round((durationYears / 30) * 50 + (wealthMultiplier / 10) * 50));
  
  // Investment efficiency: High returns, low tax, low expense ratio, low exit load
  const investmentEfficiencyScore = Math.max(10, Math.round(100 - (expenseRatio * 15) - (exitLoad * 10) - (taxRate * 0.8)));

  return {
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(totalReturns),
    finalCorpus: Math.round(currentCorpus),
    realCorpus: Math.round(realCorpus),
    inflationAdjustedCorpus: Math.round(inflationAdjustedCorpus),
    cagr: parseFloat(cagr.toFixed(2)),
    approxXirr: parseFloat(approxXirr.toFixed(2)),
    wealthMultiplier: parseFloat(wealthMultiplier.toFixed(2)),
    compoundingScore,
    investmentEfficiencyScore,
    yearlyBreakdown,
    monthlyBreakdown
  };
}

/**
 * Portfolio Allocation Lab calculations.
 */
const ASSET_RETURNS = {
  equity: 12.0,
  debt: 6.5,
  gold: 9.0,
  internationalEquity: 11.0,
  reits: 8.5,
  cash: 4.5
};

const ASSET_VOLATILITY = {
  equity: 15.0,
  debt: 3.0,
  gold: 11.0,
  internationalEquity: 16.0,
  reits: 9.0,
  cash: 0.5
};

// Correlation Matrix
const CORRELATION_MATRIX: Record<keyof PortfolioAllocation, Record<keyof PortfolioAllocation, number>> = {
  equity: { equity: 1.0, debt: -0.05, gold: -0.15, internationalEquity: 0.55, reits: 0.40, cash: -0.05 },
  debt: { equity: -0.05, debt: 1.0, gold: 0.10, internationalEquity: -0.02, reits: 0.15, cash: 0.45 },
  gold: { equity: -0.15, debt: 0.10, gold: 1.0, internationalEquity: 0.05, reits: 0.05, cash: -0.02 },
  internationalEquity: { equity: 0.55, debt: -0.02, gold: 0.05, internationalEquity: 1.0, reits: 0.30, cash: -0.05 },
  reits: { equity: 0.40, debt: 0.15, gold: 0.05, internationalEquity: 0.30, reits: 1.0, cash: 0.05 },
  cash: { equity: -0.05, debt: 0.45, gold: -0.02, internationalEquity: -0.05, reits: 0.05, cash: 1.0 }
};

export function calculatePortfolioMetrics(allocation: PortfolioAllocation): PortfolioMetrics {
  const keys = Object.keys(allocation) as Array<keyof PortfolioAllocation>;
  
  // Calculate expected return as weighted average
  let expectedReturn = 0;
  for (const key of keys) {
    const weight = allocation[key] / 100;
    expectedReturn += weight * ASSET_RETURNS[key];
  }

  // Calculate variance: sum(w_i^2 * var_i) + sum(2 * w_i * w_j * std_i * std_j * corr_ij)
  let variance = 0;
  for (let i = 0; i < keys.length; i++) {
    const assetI = keys[i];
    const weightI = allocation[assetI] / 100;
    const volI = ASSET_VOLATILITY[assetI];
    
    variance += Math.pow(weightI * volI, 2);

    for (let j = i + 1; j < keys.length; j++) {
      const assetJ = keys[j];
      const weightJ = allocation[assetJ] / 100;
      const volJ = ASSET_VOLATILITY[assetJ];
      const corr = CORRELATION_MATRIX[assetI][assetJ];

      variance += 2 * weightI * weightJ * volI * volJ * corr;
    }
  }

  const expectedVolatility = Math.sqrt(Math.max(0, variance));

  // Portfolio grade based on diversification and return-to-risk ratio (similar to Sharpe ratio)
  // Sharpe = (Return - CashReturn) / Volatility
  const excessReturn = expectedReturn - ASSET_RETURNS.cash;
  const sharpe = expectedVolatility > 0 ? excessReturn / expectedVolatility : 0;

  let portfolioGrade: PortfolioMetrics['portfolioGrade'] = 'C';
  if (sharpe > 0.8) portfolioGrade = 'A+';
  else if (sharpe > 0.6) portfolioGrade = 'A';
  else if (sharpe > 0.4) portfolioGrade = 'B';
  else if (sharpe > 0.2) portfolioGrade = 'C';
  else portfolioGrade = 'D';

  // Diversification score: check how spread out allocation is and standard deviation decrease
  // Herfindahl-Hirschman Index (HHI) concept
  let hhi = 0;
  let activeAssets = 0;
  for (const key of keys) {
    const w = allocation[key];
    if (w > 0) activeAssets++;
    hhi += Math.pow(w / 100, 2);
  }
  
  // 1 - HHI is the diversification. Standardize from 0 to 100.
  // Perfect diversification (equal split) is 1/6 HHI = 0.166 => max score 100. Single asset HHI = 1.0 => min score 10.
  const diversificationScore = Math.min(100, Math.round((1 - hhi) * 120));

  let riskRating: PortfolioMetrics['riskRating'] = 'Moderate';
  if (expectedVolatility < 4) riskRating = 'Low';
  else if (expectedVolatility < 9) riskRating = 'Moderate';
  else if (expectedVolatility < 14) riskRating = 'High';
  else riskRating = 'Aggressive';

  return {
    expectedReturn: parseFloat(expectedReturn.toFixed(2)),
    expectedVolatility: parseFloat(expectedVolatility.toFixed(2)),
    portfolioGrade,
    diversificationScore,
    riskRating
  };
}

/**
 * Monte Carlo Simulation using Box-Muller normal returns.
 */
export function runMonteCarlo(
  sipInputs: SipInputs,
  portfolioVolatility: number
): MonteCarloOutputs {
  const simsCount = 1000;
  const duration = sipInputs.durationYears;
  const months = duration * 12;
  const meanReturn = sipInputs.expectedReturn - sipInputs.expenseRatio;
  
  const finalBalances: number[] = [];
  const samplePaths: number[][] = [];
  const samplePathsCount = 5; // paths to export for plotting

  for (let sim = 0; sim < simsCount; sim++) {
    let balance = sipInputs.lumpsum;
    let monthlySip = sipInputs.monthlySip;
    const path: number[] = [balance];

    for (let yr = 1; yr <= duration; yr++) {
      // Draw a random annual return for this year
      const annualReturn = randomNormal(meanReturn, portfolioVolatility);
      const monthlyReturn = annualReturn / 12 / 100;

      for (let m = 1; m <= 12; m++) {
        // Step up Monthly SIP at start of year
        if (m === 1 && yr > 1 && sipInputs.stepUpPercent > 0) {
          monthlySip = monthlySip * (1 + sipInputs.stepUpPercent / 100);
        }
        balance = (balance + monthlySip) * (1 + monthlyReturn);
      }
      path.push(Math.round(balance));
    }

    finalBalances.push(balance);
    if (sim < samplePathsCount) {
      samplePaths.push(path);
    }
  }

  // Sort final balances to compute percentiles
  finalBalances.sort((a, b) => a - b);

  const worstCase = finalBalances[Math.floor(simsCount * 0.1)]; // 10th percentile
  const averageCase = finalBalances[Math.floor(simsCount * 0.5)]; // 50th percentile (median)
  const bestCase = finalBalances[Math.floor(simsCount * 0.9)]; // 90th percentile

  // Target success criteria: achieve the regular static final corpus
  const targetOutput = calculateSip(sipInputs);
  const targetCorpus = targetOutput.finalCorpus;
  const successSims = finalBalances.filter(val => val >= targetCorpus).length;
  const successProbability = Math.round((successSims / simsCount) * 100);

  // 95% Confidence Interval for the final wealth
  const meanWealth = finalBalances.reduce((sum, v) => sum + v, 0) / simsCount;
  const stdDevWealth = Math.sqrt(finalBalances.reduce((sum, v) => sum + Math.pow(v - meanWealth, 2), 0) / simsCount);
  const marginOfError = 1.96 * (stdDevWealth / Math.sqrt(simsCount));
  const confidenceInterval: [number, number] = [
    Math.max(0, Math.round(meanWealth - marginOfError)),
    Math.round(meanWealth + marginOfError)
  ];

  // Distribution buckets (histogram)
  const minBal = finalBalances[0];
  const maxBal = finalBalances[simsCount - 1];
  const range = maxBal - minBal;
  const binsCount = 10;
  const binWidth = range / binsCount;
  const distribution: { bin: string; count: number }[] = [];

  for (let b = 0; b < binsCount; b++) {
    const startVal = minBal + b * binWidth;
    const endVal = startVal + binWidth;
    const count = finalBalances.filter(v => v >= startVal && v < endVal).length;
    
    // Formatting label in Lakhs/Crores
    const formatValue = (v: number) => {
      if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
      if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
      return `₹${Math.round(v / 1000)}K`;
    };

    distribution.push({
      bin: `${formatValue(startVal)}-${formatValue(endVal)}`,
      count
    });
  }

  return {
    bestCase: Math.round(bestCase),
    averageCase: Math.round(averageCase),
    worstCase: Math.round(worstCase),
    successProbability,
    confidenceInterval,
    runs: samplePaths,
    distribution
  };
}

/**
 * Retirement Planner calculations.
 */
export function calculateRetirement(inputs: RetirementInputs): RetirementOutputs {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentSavings,
    monthlyInvestment,
    expectedReturnPreRetirement,
    expectedReturnPostRetirement,
    inflationRate,
    monthlyExpensesPostRetirement
  } = inputs;

  const yearsToRetire = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;
  
  // 1. Calculate future expenses at age of retirement
  // Expenses compound at inflation rate
  const annualExpensesAtRetirement = monthlyExpensesPostRetirement * 12 * Math.pow(1 + inflationRate / 100, yearsToRetire);

  // 2. Calculate retirement corpus required
  // We need to support monthly withdrawals that increase with inflation, using post-retirement returns.
  // We use the annuity formula or month-by-month drawdowns to compute the required starting capital.
  // Adjusting post-retirement return for inflation: Real return = (1 + r) / (1 + i) - 1
  const realReturnPost = ((1 + expectedReturnPostRetirement / 100) / (1 + inflationRate / 100)) - 1;
  
  let requiredRetirementCorpus = 0;
  if (realReturnPost > 0) {
    // Annuity factor for growing annuity: PV = PMT * (1 - (1+g)^-n / (r - g)) * (1+r) if paid at start
    // Here we can simulate it yearly:
    let tempCorpus = 0;
    for (let yr = retirementYears; yr > 0; yr--) {
      // The expense of that year in retirement value, discounted back to retirement age
      // Expenses are growing with inflation, but we can discount them at the post-retirement nominal rate.
      const yearExpense = annualExpensesAtRetirement * Math.pow(1 + inflationRate / 100, yr - 1);
      tempCorpus = (tempCorpus + yearExpense) / (1 + expectedReturnPostRetirement / 100);
    }
    requiredRetirementCorpus = tempCorpus;
  } else {
    // If real return is negative or zero, simple multiplication
    requiredRetirementCorpus = annualExpensesAtRetirement * retirementYears;
  }

  // 3. Project retirement corpus growth pre-retirement
  let currentCorpus = currentSavings;
  const preRetirementMonthlyReturn = expectedReturnPreRetirement / 12 / 100;
  const yearlyProjection: RetirementProjectionItem[] = [];

  yearlyProjection.push({
    year: 0,
    age: currentAge,
    corpus: currentSavings,
    withdrawals: 0,
    contributions: monthlyInvestment * 12,
    isRetired: false
  });

  // Pre-retirement accumulation phase
  for (let yr = 1; yr <= yearsToRetire; yr++) {
    for (let m = 1; m <= 12; m++) {
      currentCorpus = (currentCorpus + monthlyInvestment) * (1 + preRetirementMonthlyReturn);
    }
    yearlyProjection.push({
      year: yr,
      age: currentAge + yr,
      corpus: Math.round(currentCorpus),
      withdrawals: 0,
      contributions: monthlyInvestment * 12,
      isRetired: false
    });
  }

  const projectedCorpusAtRetirement = currentCorpus;

  // Post-retirement decumulation phase
  let postCorpus = projectedCorpusAtRetirement;
  let activeExpense = annualExpensesAtRetirement;
  const postRetirementMonthlyReturn = expectedReturnPostRetirement / 12 / 100;
  const monthlyInflation = inflationRate / 12 / 100;

  for (let yr = 1; yr <= retirementYears; yr++) {
    const yearlyWithdrawal = activeExpense;
    const monthlyWithdrawal = activeExpense / 12;
    
    // Simulate year month-by-month
    for (let m = 1; m <= 12; m++) {
      // Subtract withdrawal, compound remaining balance
      postCorpus = Math.max(0, postCorpus - monthlyWithdrawal);
      postCorpus = postCorpus * (1 + postRetirementMonthlyReturn);
    }

    yearlyProjection.push({
      year: yearsToRetire + yr,
      age: retirementAge + yr,
      corpus: Math.round(postCorpus),
      withdrawals: Math.round(yearlyWithdrawal),
      contributions: 0,
      isRetired: true
    });

    // Inflate expenses for next year
    activeExpense = activeExpense * (1 + inflationRate / 100);
  }

  // 4. Safe withdrawal rate and scores
  const safeWithdrawalPercent = 4.0; // standard 4% rule
  const safeWithdrawalAmount = (projectedCorpusAtRetirement * (safeWithdrawalPercent / 100)) / 12;
  const monthlyRetirementIncome = (projectedCorpusAtRetirement * (expectedReturnPostRetirement / 100)) / 12;
  
  // Inflation adjusted safe withdrawal
  const inflationDiscount = Math.pow(1 + inflationRate / 100, yearsToRetire);
  const inflationAdjustedIncome = safeWithdrawalAmount / inflationDiscount;

  // Retirement readiness score: scale of projected vs required corpus
  const readinessRatio = requiredRetirementCorpus > 0 ? projectedCorpusAtRetirement / requiredRetirementCorpus : 1;
  const retirementReadinessScore = Math.min(100, Math.round(readinessRatio * 100));

  return {
    requiredRetirementCorpus: Math.round(requiredRetirementCorpus),
    projectedCorpusAtRetirement: Math.round(projectedCorpusAtRetirement),
    monthlyRetirementIncome: Math.round(monthlyRetirementIncome),
    safeWithdrawalAmount: Math.round(safeWithdrawalAmount),
    inflationAdjustedIncome: Math.round(inflationAdjustedIncome),
    retirementReadinessScore,
    yearlyProjection
  };
}

/**
 * FIRE Calculator.
 */
export function calculateFire(inputs: FireInputs): FireOutputs {
  const {
    currentAge,
    monthlyExpenses,
    currentSavings,
    monthlyInvestment,
    expectedReturn,
    inflationRate,
    fireMultiplier
  } = inputs;

  const annualExpenses = monthlyExpenses * 12;
  
  // FIRE number is in current value: e.g. 25 * annual expenses
  const fireNumber = annualExpenses * fireMultiplier;

  // Solve for years to FIRE taking into account inflation and compounding returns.
  // Each year expenses grow by inflation.
  // Savings compound by expected return.
  let yearsToFire = 0;
  let currentCorpus = currentSavings;
  let targetCorpus = fireNumber;
  
  const timelineBreakdown: FireTimelineItem[] = [];
  timelineBreakdown.push({
    year: 0,
    age: currentAge,
    investedCorpus: Math.round(currentCorpus),
    fireTargetCorpus: Math.round(targetCorpus)
  });

  const monthlyReturn = expectedReturn / 12 / 100;
  const maxSearchYears = 50;

  while (currentCorpus < targetCorpus && yearsToFire < maxSearchYears) {
    yearsToFire++;
    
    // Simulate one year of compounding and savings
    for (let m = 1; m <= 12; m++) {
      currentCorpus = (currentCorpus + monthlyInvestment) * (1 + monthlyReturn);
    }
    
    // Inflate the FIRE target corpus (since target needs to be in future value)
    targetCorpus = targetCorpus * (1 + inflationRate / 100);

    timelineBreakdown.push({
      year: yearsToFire,
      age: currentAge + yearsToFire,
      investedCorpus: Math.round(currentCorpus),
      fireTargetCorpus: Math.round(targetCorpus)
    });
  }

  const savingsRate = monthlyInvestment + monthlyExpenses > 0 
    ? (monthlyInvestment / (monthlyInvestment + monthlyExpenses)) * 100 
    : 0;

  // Required monthly investment to reach FIRE in 10 years
  let monthlyInvestmentNeeded = monthlyInvestment;
  const tenYearsMonths = 10 * 12;
  const targetCorpus10Years = fireNumber * Math.pow(1 + inflationRate / 100, 10);
  
  // FV of current savings after 10 years:
  const fvSavings10 = currentSavings * Math.pow(1 + expectedReturn / 100, 10);
  const gap10 = Math.max(0, targetCorpus10Years - fvSavings10);
  
  // Required monthly PMT for gap
  if (gap10 > 0 && expectedReturn > 0) {
    const monthlyRate = expectedReturn / 12 / 100;
    monthlyInvestmentNeeded = gap10 / (((Math.pow(1 + monthlyRate, tenYearsMonths) - 1) / monthlyRate) * (1 + monthlyRate));
  }

  const currentProgressPercent = Math.min(100, Math.round((currentSavings / fireNumber) * 100));

  return {
    fireNumber: Math.round(fireNumber),
    requiredCorpus: Math.round(targetCorpus), // future inflated value
    yearsToFire: currentCorpus >= targetCorpus ? yearsToFire : maxSearchYears,
    targetAge: currentAge + (currentCorpus >= targetCorpus ? yearsToFire : maxSearchYears),
    savingsRate: parseFloat(savingsRate.toFixed(1)),
    monthlyInvestmentNeeded: Math.round(monthlyInvestmentNeeded),
    currentProgressPercent,
    timelineBreakdown
  };
}

/**
 * Emergency Fund calculations.
 */
export function calculateEmergencyFund(inputs: EmergencyInputs): EmergencyOutputs {
  const { monthlyExpenses, dependents, hasInsurance } = inputs;
  
  // Base coverage is 6 months of expenses.
  // Add 1 month for each dependent.
  // Add 2 months if they don't have insurance.
  let coverageMonths = 6 + dependents * 1;
  if (!hasInsurance) {
    coverageMonths += 2;
  }

  const recommendedEmergencyCorpus = monthlyExpenses * coverageMonths;

  let safetyRating: EmergencyOutputs['safetyRating'] = 'Adequate';
  if (coverageMonths <= 3) safetyRating = 'Poor';
  else if (coverageMonths <= 5) safetyRating = 'Adequate';
  else if (coverageMonths <= 7) safetyRating = 'Good';
  else if (coverageMonths <= 9) safetyRating = 'Excellent';
  else safetyRating = 'Bulletproof';

  return {
    recommendedEmergencyCorpus,
    coverageMonths,
    safetyRating
  };
}

/**
 * Passive Income Planner.
 */
export function calculatePassiveIncome(inputs: PassiveIncomeInputs): PassiveIncomeOutputs {
  const { desiredMonthlyIncome, expectedWithdrawalRate, expectedReturn } = inputs;
  
  // required corpus = yearly income / SWR
  const requiredCorpus = (desiredMonthlyIncome * 12) / (expectedWithdrawalRate / 100);

  // estimate timeline assuming they invest ₹20,000 monthly starting from 0
  const defaultMonthlyInvestment = 20000;
  const monthlyRate = expectedReturn / 12 / 100;
  
  let timelineYears = 0;
  let balance = 0;
  if (expectedReturn > 0) {
    while (balance < requiredCorpus && timelineYears < 50) {
      timelineYears += 1/12;
      balance = (balance + defaultMonthlyInvestment) * (1 + monthlyRate);
    }
  }

  return {
    requiredCorpus: Math.round(requiredCorpus),
    monthlyInvestmentRequired: Math.round((requiredCorpus * (expectedWithdrawalRate / 100)) / 12), // simple PMT solver can also be used
    timelineYears: parseFloat(timelineYears.toFixed(1))
  };
}

/**
 * Net Worth Projector.
 */
export function calculateNetWorth(inputs: NetWorthInputs): NetWorthOutputs {
  const { assets, liabilities } = inputs;

  const currentAssets = assets.cash + assets.investments + assets.gold + assets.property + assets.crypto;
  const currentLiabilities = liabilities.loans + liabilities.creditCard + liabilities.mortgage;
  const currentNetWorth = currentAssets - currentLiabilities;

  // Growth assumptions
  const assetGrowth = { cash: 0.04, investments: 0.12, gold: 0.08, property: 0.07, crypto: 0.20 };
  const liabilityPaydown = 0.15; // Assume they pay down 15% of debt yearly

  const yearlyProjection: NetWorthOutputs['yearlyProjection'] = [];
  
  yearlyProjection.push({
    year: 0,
    assets: currentAssets,
    liabilities: currentLiabilities,
    netWorth: currentNetWorth
  });

  let projAssets = { ...assets };
  let projLiabilities = { ...liabilities };

  for (let yr = 1; yr <= 10; yr++) {
    projAssets.cash *= (1 + assetGrowth.cash);
    projAssets.investments *= (1 + assetGrowth.investments);
    projAssets.gold *= (1 + assetGrowth.gold);
    projAssets.property *= (1 + assetGrowth.property);
    projAssets.crypto *= (1 + assetGrowth.crypto);

    projLiabilities.loans = Math.max(0, projLiabilities.loans * (1 - liabilityPaydown));
    projLiabilities.creditCard = Math.max(0, projLiabilities.creditCard * 0.5); // credit cards paid faster
    projLiabilities.mortgage = Math.max(0, projLiabilities.mortgage * 0.93); // mortgages are paid slower

    const yrAssets = projAssets.cash + projAssets.investments + projAssets.gold + projAssets.property + projAssets.crypto;
    const yrLiabilities = projLiabilities.loans + projLiabilities.creditCard + projLiabilities.mortgage;
    const yrNetWorth = yrAssets - yrLiabilities;

    yearlyProjection.push({
      year: yr,
      assets: Math.round(yrAssets),
      liabilities: Math.round(yrLiabilities),
      netWorth: Math.round(yrNetWorth)
    });
  }

  return {
    currentNetWorth,
    projectedNetWorth5Years: yearlyProjection[5].netWorth,
    projectedNetWorth10Years: yearlyProjection[10].netWorth,
    yearlyProjection
  };
}

/**
 * Tax Estimator.
 */
export function calculateTax(inputs: TaxInputs): TaxOutputs {
  const { shortTermCapitalGains, longTermCapitalGains, holdingDurationMonths, taxableIncome } = inputs;

  // Indian/Standard taxation rules approximation:
  // Equity: STCG (holding < 12 months) = 20%, LTCG (holding >= 12 months) = 12.5% (first 1.25L exempt)
  // Non-equity: added to income tax slab or STCG rate
  const isLongTerm = holdingDurationMonths >= 12;

  let capitalGainsTax = 0;
  const suggestions: string[] = [];

  if (isLongTerm) {
    const ltcgExempt = 125000;
    const taxableLtcg = Math.max(0, longTermCapitalGains - ltcgExempt);
    capitalGainsTax = taxableLtcg * 0.125;
    suggestions.push("Utilize LTCG tax harvesting: Book up to ₹1.25 Lakhs in profits every year to pay zero tax on capital gains.");
  } else {
    capitalGainsTax = shortTermCapitalGains * 0.20;
    suggestions.push("Avoid short-term trading: Hold equity investments for more than 12 months to qualify for LTCG (12.5% instead of 20% STCG).");
  }

  // Add search tax suggestions
  suggestions.push("Invest in ELSS (Equity Linked Savings Schemes) under Section 80C to save up to ₹46,800 in taxes annually (under old regime).");
  suggestions.push("Consider investing in NPS (National Pension System) for an additional tax deduction of up to ₹50,000 under Section 80CCD(1B).");

  const totalGains = shortTermCapitalGains + longTermCapitalGains;
  const taxEfficiencyScore = totalGains > 0 ? Math.max(10, Math.round(100 - (capitalGainsTax / totalGains) * 100)) : 100;

  return {
    capitalGainsTax: Math.round(capitalGainsTax),
    withdrawalTaxImpact: Math.round(capitalGainsTax * 1.04), // include cess
    taxEfficiencyScore,
    suggestions
  };
}

/**
 * Financial Health Score.
 */
export function calculateFinancialHealthScore(
  savingsRate: number,
  emergencyFundCoverage: number, // months
  netWorth: number,
  debtRatio: number, // liabilities/assets
  retirementScore: number
): number {
  // savingsRate (weight 25%): 0-50% scale
  const wSavings = Math.min(25, (savingsRate / 50) * 25);
  
  // emergency fund coverage (weight 20%): 0-6 months scale
  const wEmergency = Math.min(20, (emergencyFundCoverage / 6) * 20);

  // debtRatio (weight 20%): 0% = 20 pts, 50% = 10 pts, >= 100% = 0 pts
  const wDebt = Math.max(0, Math.min(20, 20 - (debtRatio * 40)));

  // retirementScore (weight 20%): 0-100 scale
  const wRetirement = (retirementScore / 100) * 20;

  // netWorth (weight 15%): positive is 15, negative is 0
  const wNetWorth = netWorth > 0 ? 15 : 0;

  return Math.round(wSavings + wEmergency + wDebt + wRetirement + wNetWorth);
}

/**
 * Risk Score calculation.
 */
export function calculateRiskScore(
  profile: RiskProfile,
  stockAllocationPercent: number,
  durationYears: number
): { score: number; rating: 'Low' | 'Moderate' | 'High' | 'Extreme' } {
  let baseScore = 30;
  if (profile === 'low') baseScore = 20;
  else if (profile === 'moderate') baseScore = 50;
  else if (profile === 'high') baseScore = 75;
  else if (profile === 'extreme') baseScore = 95;

  // Add stock allocation influence
  const stockInfluence = (stockAllocationPercent / 100) * 20;
  
  // Short duration increases risk of capital loss in equities (duration discount for long term)
  const durationModifier = durationYears < 5 ? 10 : (durationYears > 15 ? -10 : 0);

  const finalScore = Math.min(100, Math.max(1, Math.round(baseScore + stockInfluence + durationModifier)));
  
  let rating: 'Low' | 'Moderate' | 'High' | 'Extreme' = 'Moderate';
  if (finalScore < 35) rating = 'Low';
  else if (finalScore < 65) rating = 'Moderate';
  else if (finalScore < 85) rating = 'High';
  else rating = 'Extreme';

  return { score: finalScore, rating };
}

/**
 * Market Scenario Impact.
 */
export interface ScenarioImpactResult {
  name: string;
  expectedReturnModifier: number; // e.g. -15% for crash
  finalCorpus: number;
  differencePercent: number;
}

export function getMarketScenarioImpact(
  sipInputs: SipInputs
): ScenarioImpactResult[] {
  const baseOutputs = calculateSip(sipInputs);
  const baseCorpus = baseOutputs.finalCorpus;

  const scenarios = [
    { name: 'Bull Market', returnModifier: 3.5 },
    { name: 'Bear Market', returnModifier: -3.0 },
    { name: 'Market Crash', returnModifier: -8.0 },
    { name: 'High Inflation', returnModifier: -2.0, inflationModifier: 4.0 },
    { name: 'Recession', returnModifier: -5.0 },
    { name: 'Fast Recovery', returnModifier: 2.0 },
    { name: 'Slow Recovery', returnModifier: -1.5 }
  ];

  return scenarios.map(sc => {
    const adjustedReturn = Math.max(1, sipInputs.expectedReturn + sc.returnModifier);
    const adjustedInflation = sipInputs.inflationRate + (sc.inflationModifier || 0);
    
    const adjOutputs = calculateSip({
      ...sipInputs,
      expectedReturn: adjustedReturn,
      inflationRate: adjustedInflation
    });

    const diffPercent = ((adjOutputs.finalCorpus - baseCorpus) / baseCorpus) * 100;

    return {
      name: sc.name,
      expectedReturnModifier: sc.returnModifier,
      finalCorpus: adjOutputs.finalCorpus,
      differencePercent: parseFloat(diffPercent.toFixed(1))
    };
  });
}

/**
 * AI & Smart Recommendation Engine.
 */
export function getRecommendations(
  inputs: SipInputs,
  outputs: SipOutputs,
  portfolioMetrics: PortfolioMetrics,
  healthScore: number
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // SIP Recommendations
  if (inputs.stepUpPercent === 0) {
    const stepUpOutputs = calculateSip({ ...inputs, stepUpPercent: 10 });
    const diff = stepUpOutputs.finalCorpus - outputs.finalCorpus;
    const formatDiff = diff >= 10000000 ? `₹${(diff/10000000).toFixed(2)} Crore` : `₹${(diff/100000).toFixed(2)} Lakh`;
    recommendations.push({
      id: 'rec-stepup',
      category: 'SIP',
      title: 'Enable Step-Up SIP',
      description: `Adding a simple 10% annual Step-Up to your SIP could increase your final wealth by ${formatDiff}.`,
      impactLevel: 'High',
      actionableText: 'Set Step-Up SIP to 10%'
    });
  }

  // Volatility and Risk Recommendations
  if (portfolioMetrics.riskRating === 'Aggressive' && inputs.durationYears < 5) {
    recommendations.push({
      id: 'rec-risk-dur',
      category: 'Risk',
      title: 'Reduce Equity Risk for Short Horizon',
      description: `Your investment horizon is short (${inputs.durationYears} years), but your risk profile is Aggressive. Consider increasing your Debt allocation to shield capital from volatility.`,
      impactLevel: 'High',
      actionableText: 'Increase Debt by 20% in Allocation Lab'
    });
  }

  // Expense Ratio recommendation
  if (inputs.expenseRatio > 1.0) {
    recommendations.push({
      id: 'rec-expense',
      category: 'Diversification',
      title: 'Switch to Low-Cost Index Funds',
      description: `Your current expense ratio of ${inputs.expenseRatio}% is eating into your returns. Switching to direct plan index funds can reduce expenses below 0.3%, boosting compounding.`,
      impactLevel: 'Medium',
      actionableText: 'Configure Expense Ratio to 0.2%'
    });
  }

  // Tax Recommendation
  if (outputs.finalCorpus - outputs.totalInvested > 125000 && inputs.taxRate > 10) {
    recommendations.push({
      id: 'rec-tax',
      category: 'Tax',
      title: 'Capital Gains Tax Harvesting',
      description: 'Since equity capital gains are tax-exempt up to ₹1.25 Lakhs per year, you should book profits annually up to this threshold and reinvest to reset your purchase price.',
      impactLevel: 'Medium',
      actionableText: 'Read Tax Harvesting Guide'
    });
  }

  // Health Score Recommendation
  if (healthScore < 50) {
    recommendations.push({
      id: 'rec-health',
      category: 'Savings',
      title: 'Build a Solid Financial Base',
      description: 'Your Financial Health Score is low. Focus on setting up a 6-month emergency reserve and reducing short-term high-interest credit card debt before investing aggressively.',
      impactLevel: 'High',
      actionableText: 'Use Emergency Fund Calculator'
    });
  } else if (healthScore >= 80) {
    recommendations.push({
      id: 'rec-health-good',
      category: 'Savings',
      title: 'Optimize Core Portfolio Yield',
      description: 'Excellent financial health! You are ready to explore advanced wealth strategies such as International Equity or REITs for optimal asset diversification.',
      impactLevel: 'Low',
      actionableText: 'Add REITs / International Equity'
    });
  }

  return recommendations;
}

/**
 * Generate milestones estimated dates.
 */
export function getMilestones(
  inputs: SipInputs,
  yearlyBreakdown: YearlyBreakdownItem[]
): Milestone[] {
  const targets = [
    { targetAmount: 100000, label: '₹1 Lakh' },
    { targetAmount: 500000, label: '₹5 Lakh' },
    { targetAmount: 1000000, label: '₹10 Lakh' },
    { targetAmount: 2500000, label: '₹25 Lakh' },
    { targetAmount: 5000000, label: '₹50 Lakh' },
    { targetAmount: 10000000, label: '₹1 Crore' },
    { targetAmount: 50000000, label: '₹5 Crore' },
    { targetAmount: 100000000, label: '₹10 Crore' }
  ];

  const milestones: Milestone[] = [];
  const monthlyBreakdown = calculateSip(inputs).monthlyBreakdown;

  for (const t of targets) {
    const monthIndex = monthlyBreakdown.findIndex(m => m.futureValue >= t.targetAmount);
    
    if (monthIndex !== -1) {
      const years = monthIndex / 12;
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + monthIndex);
      
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
      const formattedDate = targetDate.toLocaleDateString('en-US', options);

      milestones.push({
        targetAmount: t.targetAmount,
        label: t.label,
        estimatedDate: formattedDate,
        yearsToReach: parseFloat(years.toFixed(1)),
        achieved: years <= inputs.durationYears
      });
    } else {
      milestones.push({
        targetAmount: t.targetAmount,
        label: t.label,
        estimatedDate: 'Beyond Timeline',
        yearsToReach: 99,
        achieved: false
      });
    }
  }

  return milestones;
}
