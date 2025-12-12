import React, { useState, useRef } from 'react';
import Hero from './Hero';
import InfoCards from './InfoCards';
import { FomoAnalysisResult, UserProfile, LegalVaultItem } from '../types';
import { LineChart, TrendingUp, PieChart, Briefcase, Calculator, X, CheckCircle2, AlertCircle, ArrowRight, Upload, Loader2, Plane, Baby, GraduationCap, Coffee, AlertTriangle, Flame, ShieldAlert, Thermometer, SearchCheck, Mic, Lock, FileText, UserCheck, ShieldCheck, Trash2, Plus, Palmtree, Stethoscope, Car, Wine, Sparkles, Coins, CreditCard, Banknote, Percent, TrendingDown } from 'lucide-react';
import { analyzeSalarySlip, analyzeFomo } from '../services/geminiService';

interface SmartHomeProps {
  user: UserProfile;
  onNavigateToGyaan: () => void;
}

const SmartHome: React.FC<SmartHomeProps> = ({ user, onNavigateToGyaan }) => {
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isAnalyzingSlip, setIsAnalyzingSlip] = useState(false);
  
  // Tax Calculator State
  const [salaryDetails, setSalaryDetails] = useState({
      gross: 1500000,
      basic: 600000, 
      hraReceived: 300000,
      rentPaid: 240000,
      investments80C: 150000,
      investmentsNPS: 0,
      healthInsurance: 25000
  });

  // Runway Calculator State
  const [isRunwayModalOpen, setIsRunwayModalOpen] = useState(false);
  const [runwayData, setRunwayData] = useState({
      monthlyExpenses: 50000,
      breakDurationMonths: 6,
      existingSavings: 200000,
      breakType: 'chill' as 'chill' | 'maternity' | 'study',
      startDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] // Default 1 year from now
  });

  // FOMO Filter State
  const [isFomoModalOpen, setIsFomoModalOpen] = useState(false);
  const [fomoQuery, setFomoQuery] = useState('');
  const [fomoResult, setFomoResult] = useState<FomoAnalysisResult | null>(null);
  const [isFomoLoading, setIsFomoLoading] = useState(false);
  
  // FOMO Voice State
  const [isFomoListening, setIsFomoListening] = useState(false);
  const fomoRecognitionRef = useRef<any>(null);

  // Legal Shield State
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'vault' | 'nominee'>('vault');
  const [vaultItems, setVaultItems] = useState<LegalVaultItem[]>([]);
  const [newVaultItem, setNewVaultItem] = useState<Partial<LegalVaultItem>>({ category: 'property_contribution' });
  const [isAddingVaultItem, setIsAddingVaultItem] = useState(false);

  // Lifestyle Goal Manager State
  const [isLifestyleModalOpen, setIsLifestyleModalOpen] = useState(false);
  const [lifestyleTab, setLifestyleTab] = useState<'goals' | 'fun'>('goals');
  
  // Credit & Loan Optimizer State
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditTab, setCreditTab] = useState<'score' | 'loans'>('score');
  
  // Loan Calculator State
  const [loanDetails, setLoanDetails] = useState({
      personalLoanAmt: '',
      personalLoanRate: '',
      homeLoanAmt: '',
      homeLoanRate: '',
      surplusAmount: ''
  });
  
  // Goal Calculator
  const [selectedGoal, setSelectedGoal] = useState('travel');
  const [goalCost, setGoalCost] = useState('');
  const [goalYears, setGoalYears] = useState(3);
  
  // Fun Fund
  const [funIncome, setFunIncome] = useState('');
  const [funFixed, setFunFixed] = useState('');
  const [funInvest, setFunInvest] = useState('');
  
  // Nominee Audit State (Mock Data)
  const [nomineeAudit, setNomineeAudit] = useState([
      { id: '1', account: 'Salary Account (HDFC)', nominee: 'Husband', status: 'warning' },
      { id: '2', account: 'Term Insurance', nominee: 'Mother', status: 'safe' },
      { id: '3', account: 'Mutual Funds (Groww)', nominee: 'Husband', status: 'warning' },
      { id: '4', account: 'EPF / PF', nominee: 'Not Updated', status: 'danger' },
  ]);

  const GOAL_TEMPLATES: any = {
      travel: { label: 'Euro Trip', icon: <Plane size={20}/>, inflation: 0.10, color: 'bg-blue-100 text-blue-600 border-blue-300' },
      wedding: { label: 'Designer Wedding', icon: <Sparkles size={20}/>, inflation: 0.12, color: 'bg-pink-100 text-pink-600 border-pink-300' },
      medical: { label: 'Egg Freezing', icon: <Stethoscope size={20}/>, inflation: 0.14, color: 'bg-teal-100 text-teal-600 border-teal-300' },
      car: { label: 'Luxury Car', icon: <Car size={20}/>, inflation: 0.08, color: 'bg-purple-100 text-purple-600 border-purple-300' },
  };

  const calculateGoalMetrics = () => {
      const currentCost = parseInt(goalCost) || 0;
      if (currentCost === 0) return { futureCost: 0, sip: 0 };
      
      const inflation = GOAL_TEMPLATES[selectedGoal].inflation;
      const futureCost = Math.round(currentCost * Math.pow(1 + inflation, goalYears));
      
      // SIP Formula: FutureValue = P * [ (1+i)^n - 1 ] * (1+i) / i
      // We need P. P = FutureValue / ( ... )
      const r = 0.12 / 12; // 12% annual return assumption for investments
      const n = goalYears * 12;
      
      // Simple recurring deposit formula approximation for target corpus
      const sip = Math.round(futureCost / ((Math.pow(1 + r, n) - 1) / r * (1 + r)));
      
      return { futureCost, sip, inflationPercent: inflation * 100 };
  };

  const calculateFunFund = () => {
      const income = parseInt(funIncome) || 0;
      const fixed = parseInt(funFixed) || 0;
      const invest = parseInt(funInvest) || 0;
      const guiltFree = Math.max(0, income - fixed - invest);
      const percent = income > 0 ? Math.round((guiltFree / income) * 100) : 0;
      return { guiltFree, percent };
  };

  const calculateLoanPayoff = () => {
      const pAmt = parseInt(loanDetails.personalLoanAmt) || 0;
      const pRate = parseFloat(loanDetails.personalLoanRate) || 0;
      const hAmt = parseInt(loanDetails.homeLoanAmt) || 0;
      const hRate = parseFloat(loanDetails.homeLoanRate) || 0;
      const surplus = parseInt(loanDetails.surplusAmount) || 0;

      if(surplus === 0) return null;

      // Avalanche Method: High interest first
      // Logic: If Personal Loan Rate > Home Loan Rate, pay Personal Loan.
      // Liquidity Rule: Keep 20% of surplus for emergency if not specifically allocated? 
      // For simplicity, we assume 'surplus' is AFTER setting aside emergency fund.
      
      let recommendation = '';
      let savedInterest = 0;
      let targetLoan = '';
      
      if (pRate > hRate && pAmt > 0) {
          targetLoan = 'Personal Loan';
          recommendation = `Pay off the Personal Loan first! It costs you ${pRate}% vs ${hRate}%.`;
          // Approximate annual saving on the surplus amount
          savedInterest = Math.round(surplus * (pRate - hRate) / 100); 
      } else if (hRate > pRate && hAmt > 0) {
          targetLoan = 'Home Loan';
          recommendation = `Surprisingly, your Home Loan is more expensive. Pre-pay that.`;
          savedInterest = Math.round(surplus * (hRate - pRate) / 100);
      } else {
          targetLoan = 'Either';
          recommendation = 'Both loans have same rates. Clear the smaller one to free up monthly cashflow.';
      }

      return { targetLoan, recommendation, savedInterest };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingSlip(true);
    try {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            // Remove data URL prefix for API
            const base64Data = base64String.split(',')[1];
            const mimeType = base64String.split(';')[0].split(':')[1];

            const result = await analyzeSalarySlip(base64Data, mimeType);
            if (result) {
                setSalaryDetails(prev => ({
                    ...prev,
                    gross: result.gross || prev.gross,
                    basic: result.basic || prev.basic,
                    hraReceived: result.hraReceived || prev.hraReceived,
                    investments80C: result.investments80C || prev.investments80C
                }));
            }
        };
        reader.readAsDataURL(file);
    } catch (error) {
        alert("Could not analyze file. Please fill details manually.");
    } finally {
        setIsAnalyzingSlip(false);
    }
  };

  const handleStartFomoListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = user.language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsFomoListening(true);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setFomoQuery(text);
      setIsFomoListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("FOMO speech error", event.error);
      setIsFomoListening(false);
    };

    recognition.onend = () => {
      setIsFomoListening(false);
    };

    recognition.start();
    fomoRecognitionRef.current = recognition;
  };

  const handleStopFomoListening = () => {
    if (fomoRecognitionRef.current) {
        fomoRecognitionRef.current.stop();
        setIsFomoListening(false);
    }
  };

  const handleFomoCheck = async () => {
    if(!fomoQuery.trim()) return;
    setIsFomoLoading(true);
    setFomoResult(null);
    try {
        const result = await analyzeFomo(fomoQuery);
        setFomoResult(result);
    } catch (error) {
        alert("Failed to analyze. Please try again.");
    } finally {
        setIsFomoLoading(false);
    }
  };

  // Legal Shield Handlers
  const handleVaultUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setNewVaultItem((prev) => ({ ...prev, image: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveVaultItem = () => {
      if (!newVaultItem.title || !newVaultItem.amount) return;
      const item: LegalVaultItem = {
          id: Date.now().toString(),
          title: newVaultItem.title,
          amount: newVaultItem.amount,
          category: newVaultItem.category as any,
          date: newVaultItem.date || new Date().toISOString().split('T')[0],
          notes: newVaultItem.notes || '',
          image: newVaultItem.image
      };
      setVaultItems([item, ...vaultItems]);
      setNewVaultItem({ category: 'property_contribution' });
      setIsAddingVaultItem(false);
  };

  const calculateTaxes = () => {
      // 1. New Regime (FY 2024-25)
      // Standard Deduction increased to 75k
      const newRegimeStdDed = 75000;
      const taxableIncomeNew = Math.max(0, salaryDetails.gross - newRegimeStdDed);
      
      let taxNew = 0;
      if (taxableIncomeNew > 300000) {
           // Slabs: 0-3L: 0, 3-7L: 5%, 7-10L: 10%, 10-12L: 15%, 12-15L: 20%, >15L: 30%
           // Simplified calculation
           if (taxableIncomeNew <= 700000) {
               taxNew = (taxableIncomeNew - 300000) * 0.05;
               // Rebate 87A
               if (taxableIncomeNew <= 700000) taxNew = 0; 
           } else {
               // 3-7L
               taxNew += 400000 * 0.05; // 20000
               
               if (taxableIncomeNew > 700000) {
                   const slab3 = Math.min(taxableIncomeNew, 1000000) - 700000;
                   if (slab3 > 0) taxNew += slab3 * 0.10;
               }
               if (taxableIncomeNew > 1000000) {
                   const slab4 = Math.min(taxableIncomeNew, 1200000) - 1000000;
                   if (slab4 > 0) taxNew += slab4 * 0.15;
               }
               if (taxableIncomeNew > 1200000) {
                   const slab5 = Math.min(taxableIncomeNew, 1500000) - 1200000;
                   if (slab5 > 0) taxNew += slab5 * 0.20;
               }
               if (taxableIncomeNew > 1500000) {
                   const slab6 = taxableIncomeNew - 1500000;
                   if (slab6 > 0) taxNew += slab6 * 0.30;
               }
           }
      }
      const cessNew = taxNew * 0.04;
      const totalTaxNew = taxNew + cessNew;

      // 2. Old Regime
      const oldRegimeStdDed = 50000;
      
      // HRA Exemption
      // Min of: HRA Received, Rent Paid - 10% of Basic, 50% of Basic (assuming Metro)
      const hraExemption = Math.max(0, Math.min(
          salaryDetails.hraReceived,
          salaryDetails.rentPaid - (0.10 * salaryDetails.basic),
          0.50 * salaryDetails.basic
      ));

      const totalDeductions = 
          Math.min(150000, salaryDetails.investments80C) + // 80C Cap
          Math.min(50000, salaryDetails.investmentsNPS) + // 80CCD(1B)
          Math.min(25000, salaryDetails.healthInsurance); // 80D (Self)

      const taxableIncomeOld = Math.max(0, salaryDetails.gross - oldRegimeStdDed - hraExemption - totalDeductions);

      let taxOld = 0;
      if (taxableIncomeOld > 250000) {
          // Slabs: 0-2.5L: 0, 2.5-5L: 5%, 5-10L: 20%, >10L: 30%
          if (taxableIncomeOld <= 500000) {
              taxOld = (taxableIncomeOld - 250000) * 0.05;
              if (taxableIncomeOld <= 500000) taxOld = 0; // Rebate
          } else {
              taxOld += 250000 * 0.05; // 12500
              
              if (taxableIncomeOld > 500000) {
                  const slab3 = Math.min(taxableIncomeOld, 1000000) - 500000;
                  if (slab3 > 0) taxOld += slab3 * 0.20;
              }
              if (taxableIncomeOld > 1000000) {
                  const slab4 = taxableIncomeOld - 1000000;
                  if (slab4 > 0) taxOld += slab4 * 0.30;
              }
          }
      }
      const cessOld = taxOld * 0.04;
      const totalTaxOld = taxOld + cessOld;

      return {
          new: Math.round(totalTaxNew),
          old: Math.round(totalTaxOld),
          diff: Math.round(Math.abs(totalTaxNew - totalTaxOld)),
          better: totalTaxNew < totalTaxOld ? 'New Regime' : 'Old Regime',
          taxableNew: taxableIncomeNew,
          taxableOld: taxableIncomeOld,
          hraExempt: hraExemption
      };
  };

  const calculateRunway = () => {
    const today = new Date();
    const start = new Date(runwayData.startDate);
    const monthsUntilStart = Math.max(0, (start.getFullYear() - today.getFullYear()) * 12 + (start.getMonth() - today.getMonth()));
    
    // Inflation Adjustment (7% p.a.)
    const inflationFactor = Math.pow(1.07, monthsUntilStart / 12);
    let adjustedMonthlyExpense = Math.round(runwayData.monthlyExpenses * inflationFactor);

    let extraCosts = 0;
    let extraCostsDescription = '';

    if (runwayData.breakType === 'maternity') {
        // Medical Inflation 10% on base 1.5L
        const medicalCost = Math.round(150000 * Math.pow(1.10, monthsUntilStart / 12));
        extraCosts += medicalCost;
        // Baby expenses increase monthly burn by 20%
        adjustedMonthlyExpense = Math.round(adjustedMonthlyExpense * 1.20);
        extraCostsDescription = `Includes ₹${(medicalCost/1000).toFixed(0)}k for medical & baby setup.`;
    } else if (runwayData.breakType === 'study') {
        // Course Fees approx 2L
        extraCosts += 200000;
        extraCostsDescription = `Includes ₹2L for course fees/laptop.`;
    }

    const totalCost = (adjustedMonthlyExpense * runwayData.breakDurationMonths) + extraCosts;
    const shortfall = Math.max(0, totalCost - runwayData.existingSavings);
    
    // Available runway with current savings
    const availableRunway = Math.max(0, (runwayData.existingSavings - extraCosts) / adjustedMonthlyExpense);

    return {
        totalCost,
        shortfall,
        availableRunway,
        adjustedMonthlyExpense,
        extraCosts,
        extraCostsDescription,
        monthsUntilStart
    };
  };

  const taxResult = calculateTaxes();
  const runwayResult = calculateRunway();
  const goalMetrics = calculateGoalMetrics();
  const funFundMetrics = calculateFunFund();
  const loanPayoff = calculateLoanPayoff();

  return (
    <>
      <div className="bg-india-cream border-b-4 border-black">
          {/* Smart Dashboard Header */}
          <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                  <div>
                    <h2 className="text-2xl font-serif text-india-blue">Welcome back, <span className="text-india-pink">Boss Lady</span></h2>
                    <p className="font-sans text-sm text-gray-600">Your empire is growing. Sensex is up 1.2% today.</p>
                  </div>
                  
                  {/* Quick Stats Strip */}
                  <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                      <div className="bg-white p-3 rounded-lg border-2 border-gray-200 min-w-[120px] shadow-sm">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                             <PieChart size={14} /> Portfolio
                          </div>
                          <div className="text-xl font-bold text-india-green">+12.4%</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border-2 border-gray-200 min-w-[120px] shadow-sm">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                             <Briefcase size={14} /> Tax Saved
                          </div>
                          <div className="text-xl font-bold text-india-blue">₹45,000</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <Hero />
      
      <div className="py-8 flex items-center justify-center bg-india-pink text-white overflow-hidden">
          <div className="whitespace-nowrap animate-marquee font-serif text-4xl uppercase tracking-widest opacity-90">
             ★ Savings ★ Investment ★ Growth ★ Future ★ Wealth ★ Savings ★ Investment ★ Growth ★ Future ★ Wealth ★
          </div>
      </div>

      <InfoCards onViewMore={onNavigateToGyaan} />

      {/* TOOLS SECTION */}
      <section className="py-16 bg-india-cream border-t-8 border-india-marigold relative overflow-hidden">
         <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif text-center mb-12 text-india-blue drop-shadow-md">
               Tools for the Modern Woman
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {/* Tax Decoder Card */}
                <div className="bg-india-green text-white rounded-2xl p-8 border-4 border-black shadow-pop hover:-translate-y-2 transition-transform relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white text-india-green rounded-full flex items-center justify-center mb-6 border-2 border-black">
                            <Calculator size={32} />
                        </div>
                        <h3 className="text-2xl font-serif mb-2">Salary Decoder</h3>
                        <p className="font-sans opacity-90 mb-6 text-sm">Stop leaving money on the table. Compare Old vs New Regime and optimize your CTC.</p>
                        <button 
                            onClick={() => setIsTaxModalOpen(true)}
                            className="bg-india-yellow text-black font-bold uppercase px-6 py-3 rounded-lg border-2 border-black shadow-sm flex items-center gap-2 hover:bg-white transition-colors text-sm"
                        >
                            Check Taxes <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Career Break Runway Card */}
                <div className="bg-india-purple text-white rounded-2xl p-8 border-4 border-black shadow-pop hover:-translate-y-2 transition-transform relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white text-india-purple rounded-full flex items-center justify-center mb-6 border-2 border-black">
                            <Plane size={32} />
                        </div>
                        <h3 className="text-2xl font-serif mb-2">Break Runway</h3>
                        <p className="font-sans opacity-90 mb-6 text-sm">Planning a baby, sabbatical, or upskilling? Check if your savings can survive the landing.</p>
                        <button 
                            onClick={() => setIsRunwayModalOpen(true)}
                            className="bg-india-yellow text-black font-bold uppercase px-6 py-3 rounded-lg border-2 border-black shadow-sm flex items-center gap-2 hover:bg-white transition-colors text-sm"
                        >
                            Plan Break <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* FOMO Filter Card */}
                <div className="bg-india-chili text-white rounded-2xl p-8 border-4 border-black shadow-pop hover:-translate-y-2 transition-transform relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white text-india-chili rounded-full flex items-center justify-center mb-6 border-2 border-black">
                            <Flame size={32} className="animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-serif mb-2">FOMO Filter</h3>
                        <p className="font-sans opacity-90 mb-6 text-sm">Colleague suggested a "Hot Tip"? Filter the hype before you burn your fingers.</p>
                        <button 
                            onClick={() => setIsFomoModalOpen(true)}
                            className="bg-india-yellow text-black font-bold uppercase px-6 py-3 rounded-lg border-2 border-black shadow-sm flex items-center gap-2 hover:bg-white transition-colors text-sm"
                        >
                            Check Hype <ShieldAlert size={16} />
                        </button>
                    </div>
                </div>

                {/* Legal Shield Card */}
                <div className="bg-india-blue text-white rounded-2xl p-8 border-4 border-black shadow-pop hover:-translate-y-2 transition-transform relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white text-india-blue rounded-full flex items-center justify-center mb-6 border-2 border-black">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-2xl font-serif mb-2">Legal Shield</h3>
                        <p className="font-sans opacity-90 mb-6 text-sm">Document your financial contributions in joint assets. Protect your future.</p>
                        <button 
                            onClick={() => setIsLegalModalOpen(true)}
                            className="bg-india-yellow text-black font-bold uppercase px-6 py-3 rounded-lg border-2 border-black shadow-sm flex items-center gap-2 hover:bg-white transition-colors text-sm"
                        >
                            Open Vault <Lock size={16} />
                        </button>
                    </div>
                </div>

                {/* Lifestyle Goals Card */}
                <div className="bg-india-marigold text-black rounded-2xl p-8 border-4 border-black shadow-pop hover:-translate-y-2 transition-transform relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white text-india-marigold rounded-full flex items-center justify-center mb-6 border-2 border-black">
                            <Palmtree size={32} />
                        </div>
                        <h3 className="text-2xl font-serif mb-2">Lifestyle Goals</h3>
                        <p className="font-sans opacity-90 mb-6 text-sm text-gray-800 font-medium">Plan for Solo Trips, Egg Freezing, or a Luxe Wedding with real inflation.</p>
                        <button 
                            onClick={() => setIsLifestyleModalOpen(true)}
                            className="bg-india-blue text-white font-bold uppercase px-6 py-3 rounded-lg border-2 border-black shadow-sm flex items-center gap-2 hover:bg-white hover:text-india-blue transition-colors text-sm"
                        >
                            Plan Dreams <Sparkles size={16} />
                        </button>
                    </div>
                </div>

                {/* Credit & Loan Optimizer Card */}
                <div className="bg-gray-800 text-white rounded-2xl p-8 border-4 border-black shadow-pop hover:-translate-y-2 transition-transform relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white text-gray-800 rounded-full flex items-center justify-center mb-6 border-2 border-black">
                            <CreditCard size={32} />
                        </div>
                        <h3 className="text-2xl font-serif mb-2">Credit Optimizer</h3>
                        <p className="font-sans opacity-90 mb-6 text-sm">Add-on cards don't build YOUR score. Get independent & kill debt smart.</p>
                        <button 
                            onClick={() => setIsCreditModalOpen(true)}
                            className="bg-india-yellow text-black font-bold uppercase px-6 py-3 rounded-lg border-2 border-black shadow-sm flex items-center gap-2 hover:bg-white transition-colors text-sm"
                        >
                            Boost Score <TrendingDown size={16} />
                        </button>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* Credit & Loan Optimizer Modal */}
      {isCreditModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="w-full max-w-lg bg-india-cream rounded-2xl p-0 relative border-[6px] border-gray-800 shadow-pop overflow-hidden h-[85vh] flex flex-col">
                <div className="bg-gray-800 p-4 flex justify-between items-center border-b-4 border-black shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full border-2 border-black">
                            <CreditCard size={24} className="text-gray-800" />
                        </div>
                        <h3 className="text-2xl font-bold text-white font-serif">Credit Optimizer</h3>
                    </div>
                    <button onClick={() => setIsCreditModalOpen(false)} className="text-white hover:bg-white/20 rounded-full p-1">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex bg-white border-b-2 border-black">
                    <button 
                        onClick={() => setCreditTab('score')}
                        className={`flex-1 p-3 font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 ${creditTab === 'score' ? 'bg-india-yellow text-black border-b-4 border-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <UserCheck size={16} /> Build Score
                    </button>
                    <button 
                        onClick={() => setCreditTab('loans')}
                        className={`flex-1 p-3 font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 ${creditTab === 'loans' ? 'bg-india-yellow text-black border-b-4 border-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <TrendingDown size={16} /> Kill Debt
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {creditTab === 'score' ? (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
                                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><CreditCard size={18}/> Why you need this?</h4>
                                <p className="text-sm text-gray-700">
                                    "Add-on" cards from your spouse do NOT build your CIBIL score. If you want a loan later (for business or home), you need your OWN history.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-serif text-lg">Let's find your Starter Card</h4>
                                
                                <div className="bg-white p-4 rounded-xl border-2 border-black shadow-sm">
                                    <p className="font-bold text-sm mb-4">Do you have a salary slip / income proof?</p>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                            <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <span className="font-bold text-green-800 text-sm">Yes, I do.</span>
                                                <p className="text-xs text-gray-600 mt-1">Apply for an Entry-Level Card (e.g. Amazon Pay ICICI, HDFC MoneyBack). It's free and builds history fast.</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                            <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <span className="font-bold text-yellow-800 text-sm">No, I don't.</span>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Start with a <strong>Fixed Deposit (FD) Backed Card</strong>. 
                                                    <br/>Example: IDFC WOW or OneCard. 
                                                    <br/>1. Create FD of ₹5,000.
                                                    <br/>2. Get Card limit of ~₹4,500.
                                                    <br/>3. Use it for groceries & pay bill on time. Score builds in 6 months!
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gray-100 p-4 rounded-xl text-center border-2 border-gray-300">
                                <p className="text-sm font-medium text-gray-600">Got extra cash? Don't just spend it. Use it to kill the 'Bad Debt' first.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Surplus Cash to Pay Off (₹)</label>
                                        <input 
                                            type="number" 
                                            value={loanDetails.surplusAmount}
                                            onChange={(e) => setLoanDetails({...loanDetails, surplusAmount: e.target.value})}
                                            className="w-full p-3 border-2 border-green-500 rounded-lg font-bold text-lg bg-green-50 text-green-900"
                                            placeholder="50000"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Personal Loan (₹)</label>
                                        <input 
                                            type="number" 
                                            value={loanDetails.personalLoanAmt}
                                            onChange={(e) => setLoanDetails({...loanDetails, personalLoanAmt: e.target.value})}
                                            className="w-full p-2 border-2 border-black rounded-lg font-bold"
                                            placeholder="Remaining"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Interest Rate (%)</label>
                                        <input 
                                            type="number" 
                                            value={loanDetails.personalLoanRate}
                                            onChange={(e) => setLoanDetails({...loanDetails, personalLoanRate: e.target.value})}
                                            className="w-full p-2 border-2 border-black rounded-lg font-bold"
                                            placeholder="e.g. 14"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Home Loan (₹)</label>
                                        <input 
                                            type="number" 
                                            value={loanDetails.homeLoanAmt}
                                            onChange={(e) => setLoanDetails({...loanDetails, homeLoanAmt: e.target.value})}
                                            className="w-full p-2 border-2 border-black rounded-lg font-bold"
                                            placeholder="Remaining"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Interest Rate (%)</label>
                                        <input 
                                            type="number" 
                                            value={loanDetails.homeLoanRate}
                                            onChange={(e) => setLoanDetails({...loanDetails, homeLoanRate: e.target.value})}
                                            className="w-full p-2 border-2 border-black rounded-lg font-bold"
                                            placeholder="e.g. 8.5"
                                        />
                                    </div>
                                </div>
                            </div>

                            {loanPayoff && (
                                <div className="animate-in slide-in-from-bottom-4">
                                    <div className="bg-india-yellow border-4 border-black p-4 rounded-xl shadow-[4px_4px_0_0_black] transform rotate-1">
                                        <h4 className="font-bold text-center text-xs uppercase tracking-widest mb-4 border-b-2 border-black pb-2">Mathematical Strategy</h4>
                                        
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-bold opacity-70">Target:</span>
                                            <span className="font-black text-xl text-india-chili uppercase">{loanPayoff.targetLoan}</span>
                                        </div>

                                        <p className="text-sm font-medium mb-4 leading-relaxed bg-white p-3 rounded border border-black/10">
                                            {loanPayoff.recommendation}
                                        </p>

                                        <div className="text-center bg-black text-white p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Estimated Interest Saved</p>
                                            <p className="text-2xl font-bold text-india-green">₹{loanPayoff.savedInterest.toLocaleString('en-IN')}</p>
                                            <p className="text-[10px] opacity-60 mt-1">*vs paying normally over a year</p>
                                        </div>
                                        
                                        <p className="text-[10px] text-center mt-3 font-medium opacity-70">
                                            Note: Keep 6 months expenses in Bank before pre-paying loans!
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
             </div>
          </div>
      )}

      {/* Lifestyle Goal Manager Modal */}
      {isLifestyleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="w-full max-w-lg bg-india-cream rounded-2xl p-0 relative border-[6px] border-india-marigold shadow-pop overflow-hidden h-[85vh] flex flex-col">
                <div className="bg-india-marigold p-4 flex justify-between items-center border-b-4 border-black shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full border-2 border-black">
                            <Palmtree size={24} className="text-india-marigold" />
                        </div>
                        <h3 className="text-2xl font-bold text-black font-serif">Lifestyle Manager</h3>
                    </div>
                    <button onClick={() => setIsLifestyleModalOpen(false)} className="text-black hover:bg-black/10 rounded-full p-1">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex bg-white border-b-2 border-black">
                    <button 
                        onClick={() => setLifestyleTab('goals')}
                        className={`flex-1 p-3 font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 ${lifestyleTab === 'goals' ? 'bg-india-yellow text-black border-b-4 border-india-marigold' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Sparkles size={16} /> Dream Calculator
                    </button>
                    <button 
                        onClick={() => setLifestyleTab('fun')}
                        className={`flex-1 p-3 font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 ${lifestyleTab === 'fun' ? 'bg-india-yellow text-black border-b-4 border-india-marigold' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Wine size={16} /> Guilt-Free Fun
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {lifestyleTab === 'goals' ? (
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-xl border-2 border-gray-200 text-center">
                                <p className="text-sm text-gray-600 mb-4">Select a goal. We account for specific inflation (e.g. Travel costs rise faster than Milk!)</p>
                                
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {Object.entries(GOAL_TEMPLATES).map(([key, t]: [string, any]) => (
                                        <button 
                                            key={key}
                                            onClick={() => setSelectedGoal(key)}
                                            className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${selectedGoal === key ? `${t.color} border-current shadow-sm scale-105` : 'bg-gray-50 border-gray-200 opacity-60'}`}
                                        >
                                            {t.icon}
                                            <span className="font-bold text-xs">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Cost Today (₹)</label>
                                    <input 
                                        type="number" 
                                        value={goalCost}
                                        onChange={(e) => setGoalCost(e.target.value)}
                                        className="w-full p-3 border-2 border-black rounded-lg font-bold"
                                        placeholder="200000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Years to Goal</label>
                                    <input 
                                        type="range" 
                                        min="1" max="10" 
                                        value={goalYears}
                                        onChange={(e) => setGoalYears(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-india-marigold"
                                    />
                                    <div className="text-right font-bold text-india-marigold mt-1">{goalYears} Years</div>
                                </div>
                            </div>

                            {calculateGoalMetrics().futureCost > 0 && (
                                <div className="animate-in slide-in-from-bottom-4">
                                    <div className="bg-india-yellow border-4 border-black p-4 rounded-xl shadow-[4px_4px_0_0_black] transform rotate-1">
                                        <h4 className="font-bold text-center text-xs uppercase tracking-widest mb-4 border-b-2 border-black pb-2">Reality Check</h4>
                                        
                                        <div className="flex justify-between items-center mb-2 text-sm">
                                            <span className="opacity-70">Inflation Rate:</span>
                                            <span className="font-bold text-red-600">{(GOAL_TEMPLATES[selectedGoal] as any).inflation * 100}% (Specific)</span>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border-2 border-black text-center mb-3">
                                            <p className="text-xs text-gray-500 uppercase font-bold">Cost in {goalYears} Years</p>
                                            <p className="text-3xl font-black text-india-blue">₹{calculateGoalMetrics().futureCost.toLocaleString('en-IN')}</p>
                                        </div>

                                        <div className="text-center">
                                            <p className="text-sm font-bold">Save <span className="bg-black text-white px-2 py-0.5 rounded">₹{calculateGoalMetrics().sip.toLocaleString('en-IN')}/mo</span></p>
                                            <p className="text-[10px] opacity-60 mt-1">*Assuming 12% investment returns</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-pink-50 border-2 border-pink-200 p-4 rounded-xl">
                                <h4 className="font-bold text-pink-600 mb-2 flex items-center gap-2"><Coffee size={18}/> The Latte Factor</h4>
                                <p className="text-sm text-gray-700">
                                    Stop feeling guilty about your coffee or outings. Once you pay your future self (Investments) and your present self (Bills), the rest is yours to BURN!
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Monthly Take-home Income</label>
                                    <input 
                                        type="number" 
                                        value={funIncome}
                                        onChange={(e) => setFunIncome(e.target.value)}
                                        className="w-full p-3 border-2 border-black rounded-lg font-bold"
                                        placeholder="e.g. 80000"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fixed Bills (Rent/EMI)</label>
                                        <input 
                                            type="number" 
                                            value={funFixed}
                                            onChange={(e) => setFunFixed(e.target.value)}
                                            className="w-full p-3 border-2 border-black rounded-lg font-bold"
                                            placeholder="e.g. 30000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">SIPs / Savings</label>
                                        <input 
                                            type="number" 
                                            value={funInvest}
                                            onChange={(e) => setFunInvest(e.target.value)}
                                            className="w-full p-3 border-2 border-black rounded-lg font-bold"
                                            placeholder="e.g. 15000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {parseInt(funIncome) > 0 && (
                                <div className="animate-in zoom-in-95 mt-4">
                                    <div className="bg-india-blue text-white p-6 rounded-full aspect-square flex flex-col items-center justify-center border-4 border-black shadow-[4px_4px_0_0_#FF9933] mx-auto w-64 relative">
                                        <Sparkles className="absolute top-4 right-8 text-india-yellow animate-pulse" />
                                        <p className="font-serif text-lg text-india-yellow mb-1">Guilt-Free Fund</p>
                                        <h3 className="text-4xl font-black mb-2">₹{calculateFunFund().guiltFree.toLocaleString('en-IN')}</h3>
                                        <p className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">{calculateFunFund().percent}% of Income</p>
                                        <p className="text-[10px] mt-4 opacity-70 max-w-[150px] text-center">Spend this on whatever makes you happy!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
             </div>
          </div>
      )}
    </>
  );
};

export default SmartHome;