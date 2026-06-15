'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { Card, Input, Button, AnimatedCounter } from '../components/ui';
import { calculatePortfolioMetrics } from '../utils/finance';
import dynamic from 'next/dynamic';

const ReportChart = dynamic(() => import('../components/charts/ReportChart'), { ssr: false });
import {
  FileText,
  Save,
  Trash2,
  Printer,
  Download,
  CheckCircle2,
  Scale,
  Sparkles,
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const Reports: React.FC = () => {
  const {
    sipInputs,
    sipOutputs,
    portfolio,
    portfolioMetrics,
    scenarios,
    goals,
    retirementOutputs,
    fireOutputs,
    saveCurrentScenario,
    deleteScenario,
    loadScenario
  } = useFinanceStore();
  const { isGuest, setUpgradeModalOpen } = useAuthStore();

  const [scenarioName, setScenarioName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleSaveScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioName.trim()) return;
    if (isGuest) {
      setUpgradeModalOpen(true);
      return;
    }
    saveCurrentScenario(scenarioName);
    setScenarioName('');
  };

  // TXT Report Export
  const handleExportTXT = () => {
    if (isGuest) {
      setUpgradeModalOpen(true);
      return;
    }
    let text = `==================================================\n`;
    text += `          SIPlytics Wealth Intelligence Report\n`;
    text += `==================================================\n\n`;
    text += `1. SIP Projections:\n`;
    text += `- Monthly SIP: ₹${sipInputs.monthlySip.toLocaleString('en-IN')}\n`;
    text += `- Lumpsum: ₹${sipInputs.lumpsum.toLocaleString('en-IN')}\n`;
    text += `- Expected Return: ${sipInputs.expectedReturn}%\n`;
    text += `- Duration: ${sipInputs.durationYears} Years\n`;
    text += `- Total Invested: ₹${sipOutputs.totalInvested.toLocaleString('en-IN')}\n`;
    text += `- Est. Returns: ₹${sipOutputs.totalReturns.toLocaleString('en-IN')}\n`;
    text += `- Future Corpus: ₹${sipOutputs.finalCorpus.toLocaleString('en-IN')}\n`;
    text += `- Real Net Corpus: ₹${sipOutputs.realCorpus.toLocaleString('en-IN')}\n\n`;
    text += `2. Portfolio Allocation:\n`;
    text += `- Equity: ${portfolio.equity}%\n`;
    text += `- Debt: ${portfolio.debt}%\n`;
    text += `- Gold: ${portfolio.gold}%\n`;
    text += `- International: ${portfolio.internationalEquity}%\n`;
    text += `- REITs: ${portfolio.reits}%\n`;
    text += `- Cash: ${portfolio.cash}%\n`;
    text += `- Volatility Risk: ${portfolioMetrics.expectedVolatility}%\n`;
    text += `- Portfolio Grade: ${portfolioMetrics.portfolioGrade}\n\n`;
    text += `3. Financial Freedom (FIRE):\n`;
    text += `- Target FIRE Number: ₹${fireOutputs.fireNumber.toLocaleString('en-IN')}\n`;
    text += `- Years to FIRE: ${fireOutputs.yearsToFire} Years\n`;
    text += `- Progress: ${fireOutputs.currentProgressPercent}%\n\n`;
    text += `4. Retirement Readiness:\n`;
    text += `- Required Retirement Corpus: ₹${retirementOutputs.requiredRetirementCorpus.toLocaleString('en-IN')}\n`;
    text += `- Projected Wealth: ₹${retirementOutputs.projectedCorpusAtRetirement.toLocaleString('en-IN')}\n`;
    text += `- Readiness Score: ${retirementOutputs.retirementReadinessScore}%\n\n`;
    text += `5. Active Goals:\n`;
    if (goals.length === 0) {
      text += `- No active goals found.\n`;
    } else {
      goals.forEach((g, idx) => {
        text += `- Goal ${idx + 1}: ${g.name} (${g.yearsRemaining} yrs remaining) | Target: ₹${g.targetAmount.toLocaleString('en-IN')} | Required SIP: ₹${g.requiredSip.toLocaleString('en-IN')}/mo | Success Prob: ${g.achievementProbability}%\n`;
      });
    }
    text += `\n==================================================\n`;
    text += `Report generated via SIPlytics Platform\n`;
    text += `==================================================`;
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SIPlytics-Wealth-Report.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  // PDF Report Export using html2canvas & jsPDF
  const handleExportPDF = async () => {
    if (isGuest) {
      setUpgradeModalOpen(true);
      return;
    }
    const reportElement = document.getElementById('wealth-report-preview');
    if (!reportElement) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#050816'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; 
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('SIPlytics-Premium-Wealth-Report.pdf');
    } catch (error) {
      console.error('Error compiling PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Chart data for scenario comparison
  const comparisonChartData = scenarios.map(sc => ({
    name: sc.name,
    Corpus: sc.outputs.finalCorpus,
    Invested: sc.outputs.totalInvested
  }));

  // Add current configuration as comparative element
  const fullChartData = [
    { name: 'Current Config', Corpus: sipOutputs.finalCorpus, Invested: sipOutputs.totalInvested },
    ...comparisonChartData
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* LEFT: SAVE SCENARIO & COMPARISONS (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Save Scenario Form */}
        <Card className="p-5">
          <h3 className="font-space font-bold text-sm text-white mb-4 flex items-center gap-1.5">
            <Save size={16} className="text-primary-custom" />
            Save Current Scenario
          </h3>
          <form onSubmit={handleSaveScenario} className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                placeholder="e.g. 15% return high risk"
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="md" className="shrink-0 mb-2">
              Save Set
            </Button>
          </form>
        </Card>

        {/* Saved Scenarios Comparison Table */}
        <Card className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-space font-bold text-sm text-white mb-4 flex items-center gap-1.5">
              <Scale size={16} className="text-secondary-custom" />
              Scenario Analysis ({scenarios.length})
            </h3>
            
            {scenarios.length === 0 ? (
              <p className="text-xs text-text-muted leading-relaxed">
                Save your current configuration to compare it side-by-side with alternate yield and duration assumptions.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {scenarios.map((sc) => {
                  const met = calculatePortfolioMetrics(sc.portfolio);
                  return (
                    <div key={sc.id} className="p-3 border border-card-border rounded-xl bg-white/[0.01] flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{sc.name}</span>
                        <span className="text-[10px] text-text-muted mt-0.5">
                          SIP: ₹{sc.inputs.monthlySip.toLocaleString('en-IN')}/mo | Yield: {sc.inputs.expectedReturn}% | Horizon: {sc.inputs.durationYears} yrs
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="px-2.5 py-1 text-[10px] cursor-pointer" onClick={() => loadScenario(sc)}>
                          Load
                        </Button>
                        <button className="p-1.5 rounded text-danger-custom hover:bg-red-500/10 transition-colors cursor-pointer" onClick={() => deleteScenario(sc.id)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {scenarios.length > 0 && (
            <div className="mt-6">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">Scenario Corpus Comparison</h4>
              <div className="h-40 w-full">
                <ReportChart data={fullChartData} formatCurrency={formatCurrency} />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* RIGHT: PREMIUM REPORT SHEET VIEW (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <h4 className="font-space font-bold text-sm text-white flex items-center gap-1.5">
            <FileText size={16} className="text-primary-custom" />
            Prospectus Report Preview
          </h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportTXT} className="text-xs">
              <Download size={12} />
              Export TXT
            </Button>
            <Button size="sm" onClick={handleExportPDF} disabled={isExporting} className="text-xs">
              <Printer size={12} />
              {isExporting ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          </div>
        </div>

        {/* Printable/Exportable Report Container */}
        <div
          id="wealth-report-preview"
          className="p-8 rounded-2xl glass border border-card-border/80 bg-slate-950 text-white flex flex-col gap-6 min-h-[580px] overflow-hidden"
        >
          {/* Report Header */}
          <div className="flex justify-between items-start border-b border-card-border/60 pb-6">
            <div>
              <h2 className="text-2xl font-black font-space tracking-tight bg-gradient-to-r from-primary-custom to-white bg-clip-text text-transparent">
                SIPlytics Pro
              </h2>
              <span className="text-[10px] text-text-muted tracking-widest font-mono font-semibold">PREMIUM WEALTH PROSPECTUS</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-white">Report Date: 15-Jun-2026</span>
              <p className="text-[10px] text-text-muted mt-0.5">Asset Intelligence Division</p>
            </div>
          </div>

          {/* Section 1: SIP parameters table */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold font-space text-primary-custom uppercase tracking-wider">1. Core SIP Parameters</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/[0.01] border border-card-border p-4 rounded-xl">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted">Monthly SIP</span>
                <span className="text-sm font-semibold font-mono text-white mt-1">₹{sipInputs.monthlySip.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted">Expected Yield</span>
                <span className="text-sm font-semibold font-mono text-white mt-1">{sipInputs.expectedReturn}% p.a.</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted">Duration</span>
                <span className="text-sm font-semibold font-mono text-white mt-1">{sipInputs.durationYears} Years</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted">Annual Step-Up</span>
                <span className="text-sm font-semibold font-mono text-white mt-1">{sipInputs.stepUpPercent}%</span>
              </div>
            </div>
          </div>

          {/* Section 2: Projections */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold font-space text-secondary-custom uppercase tracking-wider">2. Wealth Accumulation Outcomes</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-card-border rounded-xl bg-white/[0.01] flex justify-between items-center text-xs">
                <span className="text-text-muted">Total Principal Invested:</span>
                <span className="font-mono text-white font-bold"><AnimatedCounter value={sipOutputs.totalInvested} formatter={formatCurrency} /></span>
              </div>
              <div className="p-3 border border-card-border rounded-xl bg-white/[0.01] flex justify-between items-center text-xs">
                <span className="text-text-muted">Estimated Returns Earned:</span>
                <span className="font-mono text-success-custom font-bold"><AnimatedCounter value={sipOutputs.totalReturns} formatter={formatCurrency} /></span>
              </div>
              <div className="p-3 border border-card-border rounded-xl bg-white/[0.01] flex justify-between items-center text-xs">
                <span className="text-text-muted">Projected Future Wealth:</span>
                <span className="font-mono text-primary-custom font-bold"><AnimatedCounter value={sipOutputs.finalCorpus} formatter={formatCurrency} /></span>
              </div>
              <div className="p-3 border border-card-border rounded-xl bg-white/[0.01] flex justify-between items-center text-xs">
                <span className="text-text-muted">Inflation-Adjusted Corpus:</span>
                <span className="font-mono text-warning-custom font-bold"><AnimatedCounter value={sipOutputs.inflationAdjustedCorpus} formatter={formatCurrency} /></span>
              </div>
            </div>
          </div>

          {/* Section 3: Risk and Allocation */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold font-space text-primary-custom uppercase tracking-wider">3. Asset Risk profiling</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-card-border rounded-xl bg-white/[0.01] flex flex-col justify-between text-xs gap-1">
                <span className="text-text-muted">Volatility Risk rating:</span>
                <span className="font-bold text-white uppercase">{portfolioMetrics.riskRating}</span>
              </div>
              <div className="p-3 border border-card-border rounded-xl bg-white/[0.01] flex flex-col justify-between text-xs gap-1">
                <span className="text-text-muted">Diversification Quality:</span>
                <span className="font-bold text-success-custom uppercase">Grade {portfolioMetrics.portfolioGrade}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-1 text-[10px] text-text-muted bg-white/[0.01] border border-card-border p-3 rounded-xl">
              <span>Domestic Equity: {portfolio.equity}%</span>
              <span>Fixed Income: {portfolio.debt}%</span>
              <span>Gold Commodities: {portfolio.gold}%</span>
              <span>Intl Equity: {portfolio.internationalEquity}%</span>
              <span>Real Estate: {portfolio.reits}%</span>
              <span>Cash Liquid: {portfolio.cash}%</span>
            </div>
          </div>

          {/* Section 4: Retirement Planner Readiness */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold font-space text-secondary-custom uppercase tracking-wider">4. Retirement readiness analysis</h4>
            <div className="p-4 border border-card-border rounded-xl bg-white/[0.01] flex flex-col gap-2.5 text-xs text-text-muted">
              <div className="flex justify-between items-center">
                <span>Required Corpus target:</span>
                <span className="font-bold text-white font-mono"><AnimatedCounter value={retirementOutputs.requiredRetirementCorpus} formatter={formatCurrency} /></span>
              </div>
              <div className="flex justify-between items-center border-t border-card-border/40 pt-2">
                <span>Projected wealth corpus:</span>
                <span className="font-bold text-white font-mono"><AnimatedCounter value={retirementOutputs.projectedCorpusAtRetirement} formatter={formatCurrency} /></span>
              </div>
              <div className="flex justify-between items-center border-t border-card-border/40 pt-2">
                <span>Security / Readiness Score:</span>
                <span className="font-bold text-success-custom font-mono"><AnimatedCounter value={retirementOutputs.retirementReadinessScore} suffix="%" /></span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-card-border/60 pt-4 mt-auto text-center text-[9px] text-text-muted font-mono leading-relaxed">
            CONFIDENTIAL WEALTH PROJECTIONS FOR INDIVIDUAL PLANNING ONLY. ALL COMPUTATIONS ASSUME DYNAMIC COMPOUNDING FORMULAS STATED BY THE RESERVE BANK INDEXING RATINGS.
          </div>
        </div>
      </div>

    </div>
  );
};
