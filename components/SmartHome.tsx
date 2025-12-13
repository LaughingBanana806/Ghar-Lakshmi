import React, { useState, useRef, useEffect } from 'react';
import InfoCards from './InfoCards';
import { FomoAnalysisResult, UserProfile, LegalVaultItem } from '../types';
import { LineChart, TrendingUp, PieChart, Briefcase, Calculator, X, CheckCircle2, AlertCircle, ArrowRight, Upload, Loader2, Plane, Baby, GraduationCap, Coffee, AlertTriangle, Flame, ShieldAlert, Thermometer, SearchCheck, Mic, Lock, FileText, UserCheck, ShieldCheck, Trash2, Plus, Palmtree, Stethoscope, Car, Wine, Sparkles, Coins, CreditCard, Banknote, Percent, TrendingDown, MessageCircle, Send, Paperclip, Bot, PiggyBank, Calendar } from 'lucide-react';
import { analyzeSalarySlip, analyzeFomo, chatWithDidi } from '../services/geminiService';

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

  // --- DIDI CHAT STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([
      { role: 'model', text: "Hello Boss Lady! I'm Didi. How can I help you dominate your finances today? You can ask me to analyze bills, check stock tips, or explain taxes." }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatImage, setChatImage] = useState<{data: string, mimeType: string} | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  // --- DIDI CHAT HANDLERS ---
  const handleChatSubmit = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if((!chatInput.trim() && !chatImage) || isChatLoading) return;

    const newMessage = chatInput;
    const currentImage = chatImage;
    
    // Optimistic Update
    setChatMessages(prev => [...prev, { role: 'user', text: newMessage + (currentImage ? ' [Image Attached]' : '') }]);
    setChatInput('');
    setChatImage(null);
    setIsChatLoading(true);

    try {
        const responseText = await chatWithDidi(chatMessages, newMessage, 'smart', currentImage || undefined);
        setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
        setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I ran into a technical glitch. Can you ask again?" }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleChatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result as string;
              const base64Data = base64String.split(',')[1];
              const mimeType = base64String.split(';')[0].split(':')[1];
              setChatImage({ data: base64Data, mimeType });
          };
          reader.readAsDataURL(file);
      }
  };

  // ... (Existing Calculator Functions)
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
      const r = 0.12 / 12; 
      const n = goalYears * 12;
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
      
      let recommendation = '';
      let savedInterest = 0;
      let targetLoan = '';
      
      if (pRate > hRate && pAmt > 0) {
          targetLoan = 'Personal Loan';
          recommendation = `Pay off the Personal Loan first! It costs you ${pRate}% vs ${hRate}%.`;
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
      // New Regime FY 24-25 (Assessment Year 25-26)
      const newRegimeStdDed = 75000;
      const taxableIncomeNew = Math.max(0, salaryDetails.gross - newRegimeStdDed);
      let taxNew = 0;
      if (taxableIncomeNew > 300000) {
           if (taxableIncomeNew <= 700000) {
               // 3-7L: 5%
               taxNew = (taxableIncomeNew - 300000) * 0.05;
               // Rebate u/s 87A makes it 0 if income <= 7L
               if (taxableIncomeNew <= 700000) taxNew = 0; 
           } else {
               // 3-7L: 4L * 5% = 20000
               taxNew += 400000 * 0.05; 
               if (taxableIncomeNew > 700000) {
                   // 7-10L: 10%
                   const slab3 = Math.min(taxableIncomeNew, 1000000) - 700000;
                   if (slab3 > 0) taxNew += slab3 * 0.10;
               }
               if (taxableIncomeNew > 1000000) {
                   // 10-12L: 15%
                   const slab4 = Math.min(taxableIncomeNew, 1200000) - 1000000;
                   if (slab4 > 0) taxNew += slab4 * 0.15;
               }
               if (taxableIncomeNew > 1200000) {
                   // 12-15L: 20%
                   const slab5 = Math.min(taxableIncomeNew, 1500000) - 1200000;
                   if (slab5 > 0) taxNew += slab5 * 0.20;
               }
               if (taxableIncomeNew > 1500000) {
                   // >15L: 30%
                   const slab6 = taxableIncomeNew - 1500000;
                   if (slab6 > 0) taxNew += slab6 * 0.30;
               }
           }
      }
      const cessNew = taxNew * 0.04;
      const totalTaxNew = taxNew + cessNew;

      // Old Regime
      const oldRegimeStdDed = 50000;
      const hraExemption = Math.max(0, Math.min(
          salaryDetails.hraReceived,
          salaryDetails.rentPaid - (0.10 * salaryDetails.basic),
          0.50 * salaryDetails.basic // Assuming Metro 50% for simplicity, or we can toggle
      ));
      const totalDeductions = 
          Math.min(150000, salaryDetails.investments80C) + 
          Math.min(50000, salaryDetails.investmentsNPS) + 
          Math.min(25000, salaryDetails.healthInsurance); 
      const taxableIncomeOld = Math.max(0, salaryDetails.gross - oldRegimeStdDed - hraExemption - totalDeductions);
      let taxOld = 0;
      if (taxableIncomeOld > 250000) {
          if (taxableIncomeOld <= 500000) {
              taxOld = (taxableIncomeOld - 250000) * 0.05;
              if (taxableIncomeOld <= 500000) taxOld = 0; // Rebate
          } else {
              taxOld += 250000 * 0.05; 
              if (taxableIncomeOld > 500000) {
                  // 5-10L: 20%
                  const slab3 = Math.min(taxableIncomeOld, 1000000) - 500000;
                  if (slab3 > 0) taxOld += slab3 * 0.20;
              }
              if (taxableIncomeOld > 1000000) {
                  // >10L: 30%
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
    // Assume 7% average inflation
    const inflationFactor = Math.pow(1.07, monthsUntilStart / 12);
    
    // Future Monthly Expense
    let adjustedMonthlyExpense = Math.round(runwayData.monthlyExpenses * inflationFactor);
    
    let extraCosts = 0;
    let extraCostsDescription = '';
    
    // Special additions based on type
    if (runwayData.breakType === 'maternity') {
        // Assume medical costs inflate at 10%
        const medicalCost = Math.round(150000 * Math.pow(1.10, monthsUntilStart / 12));
        extraCosts += medicalCost;
        // Baby expenses increase monthly burn by 20%
        adjustedMonthlyExpense = Math.round(adjustedMonthlyExpense * 1.20);
        extraCostsDescription = `Includes ₹${(medicalCost/1000).toFixed(0)}k for delivery & baby gear. Monthly expenses +20%.`;
    } else if (runwayData.breakType === 'study') {
        extraCosts += 200000; // Tuition fees
        extraCostsDescription = `Includes ₹2L for course fees & laptop.`;
    }
    
    // Total corpus required for the entire break duration
    const totalCost = (adjustedMonthlyExpense * runwayData.breakDurationMonths) + extraCosts;
    const shortfall = Math.max(0, totalCost - runwayData.existingSavings);
    
    // How many months can current savings last?
    const availableRunway = Math.max(0, (runwayData.existingSavings - extraCosts) / adjustedMonthlyExpense);
    const monthlySavingsNeeded = monthsUntilStart > 0 ? Math.round(shortfall / monthsUntilStart) : shortfall;

    return {
        totalCost,
        shortfall,
        availableRunway,
        adjustedMonthlyExpense,
        extraCosts,
        extraCostsDescription,
        monthsUntilStart,
        monthlySavingsNeeded
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
      
      <div className="py-8 flex items-center justify-center bg-india-pink text-white overflow-hidden">
          <div className="whitespace-nowrap animate-marquee font-serif text-4xl uppercase tracking-widest opacity-90">
             ★ Savings ★ Investment ★ Growth ★ Future ★ Wealth ★ Savings ★ Investment ★ Growth ★ Future ★ Wealth ★
          </div>
      </div>

      {/* TOOLS SECTION */}
      <section className="py-16 bg-india-cream border-t-8 border-india-marigold relative overflow-hidden">
         <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif text-center mb-12 text-india-blue drop-shadow-md">
               Tools for the Modern Woman
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {/* Tax Decoder Card */}
                <div className="bg-india-green text-white rounded-2xl p-8 border-4 border-black shadow-pop hover:-translate-y-2 transition-transform relative overflow-hidden group">
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

      <InfoCards onViewMore={onNavigateToGyaan} />

      {/* --- FLOATING CHAT WIDGET (URBAN DIDI) --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {/* Chat Button */}
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-16 h-16 bg-india-pink rounded-full border-4 border-white shadow-pop flex items-center justify-center hover:scale-110 transition-transform group"
          >
              {isChatOpen ? <X size={32} className="text-white" /> : <Bot size={32} className="text-white animate-bounce" />}
              {!isChatOpen && (
                 <span className="absolute right-full mr-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Ask Didi
                 </span>
              )}
          </button>

          {/* Chat Window */}
          {isChatOpen && (
              <div className="absolute bottom-20 right-0 w-[350px] md:w-[400px] bg-india-cream rounded-2xl border-[6px] border-india-blue shadow-2xl overflow-hidden flex flex-col max-h-[600px] animate-in slide-in-from-bottom-10 fade-in">
                  {/* Header */}
                  <div className="bg-india-blue p-4 flex justify-between items-center border-b-4 border-black">
                      <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-full border-2 border-black">
                              <Bot size={20} className="text-india-blue" />
                          </div>
                          <div>
                             <h3 className="text-xl font-bold text-white font-serif leading-none">Didi AI</h3>
                             <span className="text-[10px] text-white/80 uppercase tracking-widest font-bold">Smart Assistant</span>
                          </div>
                      </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white min-h-[300px]">
                      {chatMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] p-3 rounded-xl border-2 text-sm font-medium ${
                                  msg.role === 'user' 
                                  ? 'bg-india-yellow text-black border-black rounded-tr-none' 
                                  : 'bg-gray-100 text-gray-800 border-gray-300 rounded-tl-none'
                              }`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                      {isChatLoading && (
                          <div className="flex justify-start">
                              <div className="bg-gray-100 p-3 rounded-xl rounded-tl-none border-2 border-gray-300">
                                  <Loader2 size={16} className="animate-spin text-gray-500" />
                              </div>
                          </div>
                      )}
                      <div ref={chatEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-3 bg-gray-50 border-t-2 border-black">
                      {chatImage && (
                          <div className="mb-2 flex items-center gap-2 bg-white p-2 rounded border border-gray-300">
                              <span className="text-xs font-bold text-green-600 truncate flex-1">Image Attached</span>
                              <button onClick={() => setChatImage(null)}><X size={14} /></button>
                          </div>
                      )}
                      <form onSubmit={handleChatSubmit} className="flex gap-2">
                          <label className="p-3 bg-white border-2 border-black rounded-lg cursor-pointer hover:bg-gray-100 flex items-center justify-center">
                              <Paperclip size={20} className="text-gray-600" />
                              <input type="file" accept="image/*" onChange={handleChatImageUpload} className="hidden" />
                          </label>
                          <input 
                              type="text" 
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder="Ask anything..."
                              className="flex-1 p-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 ring-india-blue"
                          />
                          <button 
                              type="submit" 
                              disabled={isChatLoading || (!chatInput && !chatImage)}
                              className="p-3 bg-india-blue text-white rounded-lg border-2 border-black hover:bg-india-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              <Send size={20} />
                          </button>
                      </form>
                  </div>
              </div>
          )}
      </div>

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

      {/* FOMO Filter Modal */}
      {isFomoModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="w-full max-w-lg bg-india-cream rounded-2xl p-0 relative border-[6px] border-india-chili shadow-pop overflow-hidden h-auto max-h-[85vh] flex flex-col">
                <div className="bg-india-chili p-4 flex justify-between items-center border-b-4 border-black shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full border-2 border-black">
                            <Flame size={24} className="text-india-chili" />
                        </div>
                        <h3 className="text-2xl font-bold text-white font-serif">FOMO Filter</h3>
                    </div>
                    <button onClick={() => setIsFomoModalOpen(false)} className="text-white hover:bg-white/20 rounded-full p-1">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {!fomoResult ? (
                        <>
                            <div className="bg-orange-100 border-2 border-orange-300 p-4 rounded-xl mb-6 text-center">
                                <h4 className="font-bold text-orange-800 mb-1">Did someone say "Double your money"?</h4>
                                <p className="text-sm text-gray-700">Tell us the "Hot Tip" you heard. Didi will check if it's a trap.</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">The Rumor / Tip</label>
                                <textarea 
                                    value={fomoQuery}
                                    onChange={(e) => setFomoQuery(e.target.value)}
                                    className="w-full p-3 border-2 border-black rounded-lg font-bold min-h-[100px]"
                                    placeholder="e.g. My neighbor said buy 'MoonCoin', it will go 10x in 2 days..."
                                />
                            </div>

                            <button 
                                onClick={isFomoListening ? handleStopFomoListening : handleStartFomoListening}
                                className={`w-full mb-4 py-3 rounded-xl font-bold border-2 border-black border-dashed flex items-center justify-center gap-2 transition-all
                                    ${isFomoListening ? 'bg-red-50 text-red-600 animate-pulse border-red-500 border-solid' : 'bg-white text-gray-700 hover:bg-india-yellow/20'}`}
                            >
                                {isFomoListening ? <Loader2 className="animate-spin" size={20} /> : <Mic size={20} />}
                                {isFomoListening ? 'Listening...' : 'Bolkar Batayein (Speak)'}
                            </button>

                            <button 
                                onClick={handleFomoCheck}
                                disabled={isFomoLoading || !fomoQuery.trim()}
                                className="w-full bg-india-blue text-white font-bold uppercase text-lg py-4 rounded-xl border-2 border-black shadow-pop active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {isFomoLoading ? <Loader2 className="animate-spin" /> : <ShieldAlert />}
                                {isFomoLoading ? 'Checking Risk...' : 'Scan for Risk'}
                            </button>
                        </>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-4">
                            <div className={`p-4 rounded-xl border-4 border-black mb-6 text-center shadow-md
                                ${fomoResult.riskLevel === 'High' ? 'bg-red-100 border-red-600' : 
                                  fomoResult.riskLevel === 'Medium' ? 'bg-yellow-100 border-yellow-600' : 
                                  'bg-green-100 border-green-600'}`}>
                                
                                <div className="font-black text-3xl mb-1 uppercase tracking-tight">
                                    {fomoResult.riskLevel} Risk
                                </div>
                                <div className="font-serif text-xl font-bold">
                                    "{fomoResult.verdict}"
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                        <SearchCheck size={18} className="text-india-blue" /> Reality Check
                                    </h4>
                                    <p className="text-sm font-medium text-gray-600 leading-relaxed">
                                        {fomoResult.analysis}
                                    </p>
                                </div>

                                <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                                    <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                                        <Sparkles size={18} /> Better Alternative
                                    </h4>
                                    <p className="text-sm font-medium text-gray-800 leading-relaxed">
                                        {fomoResult.recommendation}
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={() => { setFomoResult(null); setFomoQuery(''); }}
                                className="w-full mt-6 bg-black text-white font-bold py-3 rounded-xl border-2 border-gray-600 hover:bg-gray-800"
                            >
                                Check Another Tip
                            </button>
                        </div>
                    )}
                </div>
             </div>
          </div>
      )}

      {/* Tax Modal */}
      {isTaxModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="w-full max-w-5xl bg-india-cream rounded-2xl relative border-[6px] border-india-green shadow-pop overflow-hidden h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-india-green p-4 flex justify-between items-center border-b-4 border-black shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full border-2 border-black">
                            <Calculator size={24} className="text-india-green" />
                        </div>
                        <h3 className="text-2xl font-bold text-white font-serif">Salary Decoder</h3>
                    </div>
                    <button onClick={() => setIsTaxModalOpen(false)} className="text-white hover:bg-white/20 rounded-full p-1"><X size={24} /></button>
                </div>
                
                {/* Body - Split View */}
                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-white">
                    {/* Left Panel: Inputs */}
                    <div className="flex-1 overflow-y-auto p-6 lg:border-r-4 lg:border-gray-200 custom-scrollbar bg-white">
                        
                        {/* File Upload Banner */}
                        <div className="mb-8 bg-blue-50 p-5 rounded-xl border-2 border-dashed border-blue-300 relative group hover:border-blue-500 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                    {isAnalyzingSlip ? <Loader2 className="animate-spin"/> : <Upload size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900">Auto-fill from Payslip</h4>
                                    <p className="text-sm text-blue-700">Upload an image of your salary slip to fill details instantly.</p>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileUpload} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isAnalyzingSlip}
                            />
                        </div>

                        <div className="space-y-8">
                            {/* Section 1: Income */}
                            <div className="relative border-l-4 border-india-blue pl-6 py-1">
                                <h4 className="font-serif text-xl text-india-blue mb-4 flex items-center gap-2">
                                    <span className="bg-india-blue text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-sans font-bold">1</span>
                                    Income Details (Yearly)
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Gross Annual Salary (CTC)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
                                            <input 
                                                type="number" 
                                                value={salaryDetails.gross} 
                                                onChange={(e) => setSalaryDetails({...salaryDetails, gross: parseInt(e.target.value) || 0})}
                                                className="w-full p-3 pl-8 border-2 border-gray-300 rounded-lg font-bold focus:border-india-blue focus:ring-4 focus:ring-blue-100 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Basic Salary</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
                                                <input 
                                                    type="number" 
                                                    value={salaryDetails.basic} 
                                                    onChange={(e) => setSalaryDetails({...salaryDetails, basic: parseInt(e.target.value) || 0})}
                                                    className="w-full p-3 pl-8 border-2 border-gray-300 rounded-lg font-bold focus:border-india-blue focus:ring-4 focus:ring-blue-100 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">HRA Received</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
                                                <input 
                                                    type="number" 
                                                    value={salaryDetails.hraReceived} 
                                                    onChange={(e) => setSalaryDetails({...salaryDetails, hraReceived: parseInt(e.target.value) || 0})}
                                                    className="w-full p-3 pl-8 border-2 border-gray-300 rounded-lg font-bold focus:border-india-blue focus:ring-4 focus:ring-blue-100 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Deductions */}
                            <div className="relative border-l-4 border-india-green pl-6 py-1">
                                <h4 className="font-serif text-xl text-india-green mb-4 flex items-center gap-2">
                                    <span className="bg-india-green text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-sans font-bold">2</span>
                                    Exemptions & Investments
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Rent Paid (Yearly)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
                                            <input 
                                                type="number" 
                                                value={salaryDetails.rentPaid} 
                                                onChange={(e) => setSalaryDetails({...salaryDetails, rentPaid: parseInt(e.target.value) || 0})}
                                                className="w-full p-3 pl-8 border-2 border-gray-300 rounded-lg font-bold focus:border-india-green focus:ring-4 focus:ring-green-100 transition-all"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1">*Required for HRA Exemption calculation</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">80C Investments (PPF, ELSS, LIC)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
                                            <input 
                                                type="number" 
                                                value={salaryDetails.investments80C} 
                                                onChange={(e) => setSalaryDetails({...salaryDetails, investments80C: parseInt(e.target.value) || 0})}
                                                className="w-full p-3 pl-8 border-2 border-gray-300 rounded-lg font-bold focus:border-india-green focus:ring-4 focus:ring-green-100 transition-all"
                                            />
                                        </div>
                                        <div className="w-full bg-gray-200 h-1.5 mt-2 rounded-full overflow-hidden">
                                            <div className={`h-full ${salaryDetails.investments80C >= 150000 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${Math.min(100, (salaryDetails.investments80C/150000)*100)}%`}}></div>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1 flex justify-between">
                                            <span>Limit: ₹1.5 Lakh</span>
                                            <span>{salaryDetails.investments80C >= 150000 ? 'Maxed Out!' : `Can invest ₹${(150000 - salaryDetails.investments80C).toLocaleString()} more`}</span>
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">NPS (80CCD)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
                                                <input 
                                                    type="number" 
                                                    value={salaryDetails.investmentsNPS} 
                                                    onChange={(e) => setSalaryDetails({...salaryDetails, investmentsNPS: parseInt(e.target.value) || 0})}
                                                    className="w-full p-3 pl-8 border-2 border-gray-300 rounded-lg font-bold focus:border-india-green focus:ring-4 focus:ring-green-100 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Medical Ins. (80D)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
                                                <input 
                                                    type="number" 
                                                    value={salaryDetails.healthInsurance} 
                                                    onChange={(e) => setSalaryDetails({...salaryDetails, healthInsurance: parseInt(e.target.value) || 0})}
                                                    className="w-full p-3 pl-8 border-2 border-gray-300 rounded-lg font-bold focus:border-india-green focus:ring-4 focus:ring-green-100 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Verdict */}
                    <div className="flex-1 bg-gray-50 p-6 lg:p-8 overflow-y-auto custom-scrollbar flex flex-col">
                         <div className="text-center mb-8">
                             <h4 className="font-serif text-3xl text-gray-800 mb-2">Verdict ⚖️</h4>
                             <p className="text-sm text-gray-500">Based on FY 2024-25 Rates</p>
                         </div>

                         {/* Comparison Cards */}
                         <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className={`p-4 rounded-xl border-4 transition-all relative overflow-hidden ${taxResult.better === 'Old Regime' ? 'border-india-green bg-green-50 scale-105 shadow-md z-10' : 'border-gray-300 bg-white opacity-60 grayscale'}`}>
                                {taxResult.better === 'Old Regime' && <div className="absolute top-0 right-0 bg-india-green text-white text-[10px] font-bold px-2 py-1 rounded-bl">WINNER</div>}
                                <div className="text-xs uppercase font-bold text-gray-500 mb-2">Old Regime</div>
                                <div className="text-2xl font-black text-gray-900 mb-1">₹{taxResult.old.toLocaleString()}</div>
                                <div className="text-[10px] text-gray-500 font-medium border-t border-gray-200 pt-2 mt-2">
                                    Taxable Income: ₹{taxResult.taxableOld.toLocaleString()}
                                    <br/>
                                    (HRA Exempt: ₹{taxResult.hraExempt.toLocaleString()})
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl border-4 transition-all relative overflow-hidden ${taxResult.better === 'New Regime' ? 'border-india-green bg-green-50 scale-105 shadow-md z-10' : 'border-gray-300 bg-white opacity-60 grayscale'}`}>
                                {taxResult.better === 'New Regime' && <div className="absolute top-0 right-0 bg-india-green text-white text-[10px] font-bold px-2 py-1 rounded-bl">WINNER</div>}
                                <div className="text-xs uppercase font-bold text-gray-500 mb-2">New Regime</div>
                                <div className="text-2xl font-black text-gray-900 mb-1">₹{taxResult.new.toLocaleString()}</div>
                                <div className="text-[10px] text-gray-500 font-medium border-t border-gray-200 pt-2 mt-2">
                                    Taxable Income: ₹{taxResult.taxableNew.toLocaleString()}
                                    <br/>
                                    (Std Ded: ₹75k)
                                </div>
                            </div>
                         </div>

                         {/* Result Box */}
                         <div className="bg-india-yellow border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0_0_black] mb-8 text-center relative overflow-hidden transform rotate-1 hover:rotate-0 transition-transform">
                             <div className="relative z-10">
                                <h3 className="font-bold uppercase tracking-widest text-xs mb-2 opacity-60">Guru-ji Recommends</h3>
                                <p className="font-serif text-3xl md:text-4xl text-india-blue mb-3 leading-none">
                                    Choose {taxResult.better}
                                </p>
                                <div className="inline-block bg-white px-4 py-2 rounded-full border-2 border-black font-bold text-green-700 shadow-sm">
                                    You save <span className="text-xl">₹{taxResult.diff.toLocaleString()}</span>
                                </div>
                             </div>
                             {/* Decor */}
                             <div className="absolute top-0 left-0 w-full h-full bg-pattern-dots opacity-10"></div>
                         </div>

                         {/* Actionable Nudges */}
                         <div className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm">
                             <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-4 border-b pb-2">
                                 <Sparkles size={18} className="text-india-pink" /> Smart Nudges
                             </h4>
                             <div className="space-y-3">
                                {taxResult.better === 'Old Regime' && salaryDetails.investments80C < 150000 && (
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                        <TrendingUp className="text-blue-600 shrink-0 mt-0.5" size={16} />
                                        <p className="text-sm text-blue-900">
                                            <strong>Maximize 80C:</strong> Invest <span className="font-bold">₹{(150000 - salaryDetails.investments80C).toLocaleString()}</span> more in ELSS/PPF to reduce tax further.
                                        </p>
                                    </div>
                                )}
                                {taxResult.better === 'Old Regime' && salaryDetails.rentPaid > 100000 && salaryDetails.hraReceived > 0 && (
                                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                                        <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={16} />
                                        <p className="text-sm text-green-900">
                                            <strong>Rent Receipt:</strong> Ensure you have PAN of landlord since rent is {'>'} ₹1L.
                                        </p>
                                    </div>
                                )}
                                {salaryDetails.investmentsNPS === 0 && (
                                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                                        <PiggyBank className="text-purple-600 shrink-0 mt-0.5" size={16} />
                                        <p className="text-sm text-purple-900">
                                            <strong>NPS Trick:</strong> Invest ₹50,000 in NPS (Tier 1) for extra deduction u/s 80CCD(1B).
                                        </p>
                                    </div>
                                )}
                                {taxResult.better === 'New Regime' && (
                                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                                        <Coffee className="text-yellow-700 shrink-0 mt-0.5" size={16} />
                                        <p className="text-sm text-yellow-900">
                                            <strong>Relax!</strong> New Regime is paperless. No need to submit investment proofs to HR.
                                        </p>
                                    </div>
                                )}
                             </div>
                         </div>
                    </div>
                </div>
             </div>
          </div>
      )}

      {/* Runway Calculator Modal */}
      {isRunwayModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="w-full max-w-4xl bg-india-cream rounded-2xl relative border-[6px] border-india-purple shadow-pop overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-india-purple p-4 flex justify-between items-center border-b-4 border-black shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full border-2 border-black">
                            <Plane size={24} className="text-india-purple" />
                        </div>
                        <h3 className="text-2xl font-bold text-white font-serif">Career Runway Planner</h3>
                    </div>
                    <button onClick={() => setIsRunwayModalOpen(false)} className="text-white hover:bg-white/20 rounded-full p-1"><X size={24} /></button>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-white">
                    {/* Inputs Panel */}
                    <div className="flex-1 overflow-y-auto p-6 lg:border-r-4 lg:border-gray-200 custom-scrollbar bg-white">
                        <div className="mb-6 bg-purple-50 p-4 rounded-xl border-l-4 border-purple-500 text-sm text-purple-900">
                            <strong>Why plan?</strong> Hidden costs (like medical inflation) can eat your savings faster than you think.
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">When do you want to start?</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18}/>
                                    <input 
                                        type="date"
                                        value={runwayData.startDate}
                                        onChange={(e) => setRunwayData({...runwayData, startDate: e.target.value})}
                                        className="w-full p-3 pl-10 border-2 border-gray-300 rounded-lg font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Current Monthly Expenses (Burn Rate)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
                                    <input 
                                        type="number" 
                                        value={runwayData.monthlyExpenses}
                                        onChange={(e) => setRunwayData({...runwayData, monthlyExpenses: parseInt(e.target.value) || 0})}
                                        className="w-full p-3 pl-8 border-2 border-gray-300 rounded-lg font-bold focus:border-india-purple focus:ring-4 focus:ring-purple-100 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Planned Break Duration (Months)</label>
                                <input 
                                    type="range"
                                    min="1" max="36"
                                    value={runwayData.breakDurationMonths}
                                    onChange={(e) => setRunwayData({...runwayData, breakDurationMonths: parseInt(e.target.value)})}
                                    className="w-full accent-india-purple h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2"
                                />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400">1 Month</span>
                                    <span className="bg-india-purple text-white px-3 py-1 rounded-full font-bold text-sm">{runwayData.breakDurationMonths} Months</span>
                                    <span className="text-xs font-bold text-gray-400">3 Years</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Existing Savings for Break</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
                                    <input 
                                        type="number" 
                                        value={runwayData.existingSavings}
                                        onChange={(e) => setRunwayData({...runwayData, existingSavings: parseInt(e.target.value) || 0})}
                                        className="w-full p-3 pl-8 border-2 border-gray-300 rounded-lg font-bold focus:border-india-purple focus:ring-4 focus:ring-purple-100 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Purpose of Break</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={() => setRunwayData({...runwayData, breakType: 'maternity'})}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${runwayData.breakType === 'maternity' ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <Baby size={24} />
                                        <span className="text-xs font-bold">Maternity</span>
                                    </button>
                                    <button 
                                        onClick={() => setRunwayData({...runwayData, breakType: 'study'})}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${runwayData.breakType === 'study' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <GraduationCap size={24} />
                                        <span className="text-xs font-bold">Upskilling</span>
                                    </button>
                                    <button 
                                        onClick={() => setRunwayData({...runwayData, breakType: 'chill'})}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${runwayData.breakType === 'chill' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <Coffee size={24} />
                                        <span className="text-xs font-bold">Sabbatical</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="flex-1 bg-gray-50 p-6 lg:p-8 overflow-y-auto custom-scrollbar flex flex-col">
                        <div className="text-center mb-6">
                             <h4 className="font-serif text-3xl text-gray-800 mb-1">The Reality Check</h4>
                             <p className="text-sm text-gray-500">
                                Starting in {runwayResult.monthsUntilStart} months
                             </p>
                        </div>

                        <div className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm mb-6">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                                <span className="text-sm text-gray-600">Monthly Burn (Inflation Adjusted)</span>
                                <span className="font-bold text-lg">₹{runwayResult.adjustedMonthlyExpense.toLocaleString()}</span>
                            </div>
                            {runwayResult.extraCosts > 0 && (
                                <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3 text-purple-700">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">One-time Costs</span>
                                        <span className="text-[10px] opacity-70">{runwayResult.extraCostsDescription}</span>
                                    </div>
                                    <span className="font-bold text-lg">+ ₹{runwayResult.extraCosts.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-sm font-bold text-gray-800 uppercase">Total Corpus Needed</span>
                                <span className="font-black text-2xl text-india-purple">₹{runwayResult.totalCost.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Gap Analysis */}
                        <div className="relative mb-6">
                            <div className={`p-6 rounded-xl border-4 shadow-pop text-center relative overflow-hidden ${runwayResult.shortfall > 0 ? 'bg-red-50 border-red-500 text-red-900' : 'bg-green-50 border-green-500 text-green-900'}`}>
                                <div className="relative z-10">
                                    <p className="font-bold uppercase tracking-widest text-xs mb-2">
                                        {runwayResult.shortfall > 0 ? 'Gap to Bridge' : 'You are Safe!'}
                                    </p>
                                    <p className="font-black text-4xl mb-2">
                                        {runwayResult.shortfall > 0 ? `₹${runwayResult.shortfall.toLocaleString()}` : 'Fully Funded!'}
                                    </p>
                                    {runwayResult.shortfall > 0 && runwayResult.monthsUntilStart > 0 && (
                                        <div className="inline-block bg-white px-4 py-2 rounded-lg border border-red-200 shadow-sm mt-2">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Target Monthly Savings</p>
                                            <p className="font-black text-xl text-red-600">₹{runwayResult.monthlySavingsNeeded.toLocaleString()}/mo</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Runway Visualization */}
                        <div className="bg-white p-5 rounded-xl border-2 border-gray-200">
                            <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Plane size={18} className="text-india-purple" /> Runway Visualizer
                            </h4>
                            
                            <div className="relative pt-6 pb-2">
                                <div className="h-4 bg-gray-200 rounded-full w-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${runwayResult.availableRunway >= runwayData.breakDurationMonths ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min(100, (runwayResult.availableRunway / runwayData.breakDurationMonths) * 100)}%` }}
                                    ></div>
                                </div>
                                
                                {/* Labels */}
                                <div className="absolute top-0 left-0 -translate-x-1/2" style={{ left: `${Math.min(100, (runwayResult.availableRunway / runwayData.breakDurationMonths) * 100)}%` }}>
                                    <div className="bg-black text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                        You have {runwayResult.availableRunway.toFixed(1)} Months
                                    </div>
                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black mx-auto"></div>
                                </div>

                                <div className="flex justify-between text-xs font-bold text-gray-400 mt-2 uppercase">
                                    <span>Start</span>
                                    <span>Goal: {runwayData.breakDurationMonths} Months</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
      )}
    </>
  );
};

export default SmartHome;