import React, { useState, useEffect, useRef } from 'react';
import { Mic, Landmark, Gem, ScrollText, PhoneCall, ShieldCheck, Sun, X, Loader2, Volume2, StopCircle, AlertTriangle, SearchCheck, TrendingUp, Minus, Plus, ArrowRight, Info, PiggyBank, Coins, CheckCircle2, UserCheck, Video, Lock, Camera, Image as ImageIcon, Trash2, KeyRound, Rocket, Calculator, Calendar } from 'lucide-react';
import { DecorativeCorner, WavySeparator } from './GeometricDecorations';
import { UserProfile, ScamAnalysisResult, SchemeResult, StreeDhanItem } from '../types';
import { askDidi, generateSpeech, analyzeScheme, findSchemes } from '../services/geminiService';
import { playPCMData, ensureAudioContext } from '../services/audioUtils';
import { generateSchemeVideo } from '../services/videoService';

interface SaralHomeProps {
  user: UserProfile;
}

const SaralHome: React.FC<SaralHomeProps> = ({ user }) => {
  // Voice State (Didi)
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');
  const recognitionRef = useRef<any>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Scam Detector State
  const [isScamModalOpen, setIsScamModalOpen] = useState(false);
  const [scamQuery, setScamQuery] = useState('');
  const [scamResult, setScamResult] = useState<ScamAnalysisResult | null>(null);
  const [isScamLoading, setIsScamLoading] = useState(false);
  const [isScamListening, setIsScamListening] = useState(false);
  const scamRecognitionRef = useRef<any>(null);

  // Gold Calculator State
  const [isGoldModalOpen, setIsGoldModalOpen] = useState(false);
  const [goldAmount, setGoldAmount] = useState(135000);

  // Gullak State
  const [gullakSavings, setGullakSavings] = useState(0);
  const [isRDModalOpen, setIsRDModalOpen] = useState(false);

  // Scheme Didi State
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [schemeStep, setSchemeStep] = useState<'form' | 'results'>('form');
  const [schemeResults, setSchemeResults] = useState<SchemeResult[]>([]);
  const [isSchemeLoading, setIsSchemeLoading] = useState(false);
  const [schemeProfile, setSchemeProfile] = useState({
    age: '25',
    gender: 'Female',
    category: 'General',
    bpl: false,
    state: 'Uttar Pradesh'
  });
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState<string | null>(null);

  // --- Stree Dhan Locker State ---
  const [isLockerOpen, setIsLockerOpen] = useState(false);
  const [lockerStep, setLockerStep] = useState<'auth' | 'list' | 'add'>('auth');
  const [pin, setPin] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [lockerItems, setLockerItems] = useState<StreeDhanItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<StreeDhanItem>>({ category: 'gold' });
  const [authError, setAuthError] = useState('');
  const [formError, setFormError] = useState('');

  // --- Goal Visualizer State ---
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTab, setGoalTab] = useState<'inflation' | 'dream'>('inflation');
  const [inflationItem, setInflationItem] = useState<string>('milk');
  const [inflationYears, setInflationYears] = useState(5);
  const [dreamName, setDreamName] = useState('');
  const [dreamCost, setDreamCost] = useState('');
  const [dreamYears, setDreamYears] = useState(3);

  const inflationItems: Record<string, { name: string, price: number, icon: string }> = {
    milk: { name: '1L Milk', price: 66, icon: '🥛' },
    chai: { name: '1 Cup Chai', price: 15, icon: '☕' },
    cylinder: { name: 'Gas Cylinder', price: 1100, icon: '🔥' },
    petrol: { name: '1L Petrol', price: 100, icon: '⛽' }
  };

  // Initial Data Load
  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      stopAudio();
    };
  }, []);

  // Load Locker Data
  useEffect(() => {
    const storedPin = localStorage.getItem('streeDhanPin');
    const storedItems = localStorage.getItem('streeDhanItems');
    
    if (storedPin) setPin(storedPin);
    if (storedItems) setLockerItems(JSON.parse(storedItems));
  }, []);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // ignore if already stopped
      }
      audioSourceRef.current = null;
    }
  };

  // --- Voice Handlers (Didi) ---
  const handleStartListening = async () => {
    try {
        await ensureAudioContext();
    } catch (e) {
        console.warn("Audio context init failed", e);
    }

    stopAudio();
    setVoiceStatus('listening');
    setTranscript('');
    setVoiceResponse('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      setVoiceStatus('idle');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = user.language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleProcessQuery(text);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setVoiceStatus('idle');
      setVoiceResponse("Could not hear clearly. Please try again.");
    };

    recognition.onend = () => {
      if (voiceStatus === 'listening') {
        setVoiceStatus('idle');
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleProcessQuery = async (query: string) => {
    setVoiceStatus('processing');
    try {
      const textResponse = await askDidi(query, user.language);
      setVoiceResponse(textResponse);

      setVoiceStatus('speaking');
      const audioData = await generateSpeech(textResponse);
      
      const source = await playPCMData(audioData);
      audioSourceRef.current = source;
      
      source.onended = () => {
        setVoiceStatus('idle');
      };

    } catch (error) {
      console.error("Error in voice flow:", error);
      setVoiceResponse("Sorry, technical error. Please ask again.");
      setVoiceStatus('idle');
    }
  };

  const closeVoiceModal = () => {
    handleStopListening();
    stopAudio();
    setIsVoiceModalOpen(false);
    setVoiceStatus('idle');
    setTranscript('');
    setVoiceResponse('');
  };

  // --- Scam Detector Handlers ---
  const handleStartScamListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = user.language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsScamListening(true);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setScamQuery(text);
      setIsScamListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Scam speech error", event.error);
      setIsScamListening(false);
    };

    recognition.onend = () => {
      setIsScamListening(false);
    };

    recognition.start();
    scamRecognitionRef.current = recognition;
  };

  const handleStopScamListening = () => {
    if (scamRecognitionRef.current) {
        scamRecognitionRef.current.stop();
        setIsScamListening(false);
    }
  };

  const handleAnalyzeScam = async () => {
    if (!scamQuery.trim()) return;
    setIsScamLoading(true);
    setScamResult(null);
    try {
        const result = await analyzeScheme(scamQuery);
        setScamResult(result);
    } catch (e) {
        alert("Something went wrong. Please check internet.");
    } finally {
        setIsScamLoading(false);
    }
  };

  const closeScamModal = () => {
      setIsScamModalOpen(false);
      setScamQuery('');
      setScamResult(null);
      handleStopScamListening();
  };

  // --- Gullak Handlers ---
  const addToGullak = (amount: number) => {
      const newTotal = gullakSavings + amount;
      setGullakSavings(newTotal);
      if (newTotal >= 500 && gullakSavings < 500) {
          setIsRDModalOpen(true);
      }
  };

  const resetGullak = () => {
      setGullakSavings(0);
      setIsRDModalOpen(false);
  };

  // --- Scheme Didi Handlers ---
  const handleFindSchemes = async () => {
    setIsSchemeLoading(true);
    setSchemeResults([]);
    try {
        const results = await findSchemes(schemeProfile);
        setSchemeResults(results);
        setSchemeStep('results');
    } catch (e) {
        alert("Could not fetch schemes. Try again.");
    } finally {
        setIsSchemeLoading(false);
    }
  };

  const handleWatchGuide = async (schemeName: string, steps: string[]) => {
    try {
        if ((window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
            }
        }
        
        setIsVideoGenerating(schemeName);
        const url = await generateSchemeVideo(schemeName, steps);
        setPlayingVideo(url);
    } catch (e) {
        console.error(e);
        alert("Video generation failed or was cancelled.");
    } finally {
        setIsVideoGenerating(null);
    }
  };

  // --- Stree Dhan Locker Handlers ---
  const handleUnlockLocker = () => {
    if (inputPin === pin) {
        setLockerStep('list');
        setInputPin('');
        setAuthError('');
    } else {
        setAuthError('Incorrect PIN');
        setInputPin('');
    }
  };

  const handleSetPin = () => {
    if (inputPin.length !== 4) {
        setAuthError('PIN must be 4 digits');
        return;
    }
    localStorage.setItem('streeDhanPin', inputPin);
    setPin(inputPin);
    setLockerStep('list');
    setInputPin('');
    setAuthError('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewItem((prev) => ({ ...prev, image: reader.result as string }));
            setFormError('');
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = () => {
    if (!newItem.title || !newItem.image) {
        setFormError("Please add both a title and a photo to save.");
        return;
    }
    const item: StreeDhanItem = {
        id: Date.now().toString(),
        image: newItem.image,
        title: newItem.title,
        category: newItem.category as any || 'gold',
        date: newItem.date || new Date().toISOString().split('T')[0],
        notes: newItem.notes || ''
    };
    const updatedItems = [item, ...lockerItems];
    setLockerItems(updatedItems);
    localStorage.setItem('streeDhanItems', JSON.stringify(updatedItems));
    setNewItem({ category: 'gold' });
    setFormError('');
    setLockerStep('list');
  };

  const handleDeleteItem = (id: string) => {
    if(window.confirm("Are you sure? This cannot be undone.")) {
        const updatedItems = lockerItems.filter(i => i.id !== id);
        setLockerItems(updatedItems);
        localStorage.setItem('streeDhanItems', JSON.stringify(updatedItems));
    }
  };

  // --- Goal Visualizer Helpers ---
  const getFuturePrice = (current: number, years: number) => {
    return Math.round(current * Math.pow(1.07, years)); // 7% inflation
  };

  const calculateGoalPlan = () => {
    const cost = parseInt(dreamCost || '0');
    if(cost <= 0) return null;
    const futureCost = getFuturePrice(cost, dreamYears);
    const months = dreamYears * 12;
    const monthlySave = Math.round(futureCost / months);
    return { futureCost, monthlySave };
  };

  return (
    <div className="min-h-screen bg-india-cream text-gray-800 pb-20">
       {/* Simple Header */}
       <header className="bg-india-marigold p-6 rounded-b-[40px] shadow-pop relative z-10 border-b-4 border-black">
          <div className="flex justify-between items-center mb-4">
             <div>
                <p className="text-xs font-bold uppercase tracking-widest text-black/60">Namaste</p>
                <h1 className="text-4xl font-serif text-black leading-none">Sakhi</h1>
             </div>
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-black">
                <Sun className="text-india-marigold animate-spin-slow" />
             </div>
          </div>
          <div className="bg-white/90 p-3 rounded-xl border-2 border-black flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <p className="font-bold text-sm">Mandi: Gold is ₹6,250/gm (+₹20)</p>
          </div>
       </header>

       <div className="px-4 -mt-8 relative z-20">
          {/* Main Voice Action - Hero of Saral Mode */}
          <button 
            onClick={() => setIsVoiceModalOpen(true)}
            className="w-full bg-india-pink text-white rounded-2xl p-6 shadow-pop active:shadow-none active:translate-y-1 transition-all border-4 border-white flex flex-col items-center gap-3 hover:bg-india-pink/90"
          >
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-pulse">
                <Mic className="w-10 h-10 text-india-pink" />
             </div>
             <div className="text-center">
                <h2 className="text-2xl font-bold">Bolkar Puccho</h2>
                <p className="opacity-90 text-sm">(Tap to Ask Didi)</p>
             </div>
          </button>
       </div>

       {/* Scam Detector Button (Satark Raho) */}
       <div className="container mx-auto px-4 mt-8">
         <div className="bg-india-chili/10 border-2 border-india-chili rounded-xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-india-chili/20 transition-colors"
              onClick={() => setIsScamModalOpen(true)}>
             <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-india-chili rounded-full flex items-center justify-center border-2 border-black">
                    <AlertTriangle className="text-white w-6 h-6 animate-pulse" />
                 </div>
                 <div>
                     <h3 className="font-bold text-india-chili text-lg leading-none">Asli ya Nakli?</h3>
                     <p className="text-xs text-black/70">Check for Fraud / Scam</p>
                 </div>
             </div>
             <div className="bg-white px-3 py-1 rounded-full text-xs font-bold border border-black shadow-[2px_2px_0_0_black]">
                 Check Now
             </div>
         </div>
       </div>

       {/* Digital Gullak Tracker */}
       <div className="container mx-auto px-4 mt-8">
          <div className="bg-white rounded-2xl border-4 border-india-blue p-5 relative shadow-pop">
              <div className="absolute top-0 right-0 bg-india-blue text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                  Daily Bachat
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-india-yellow rounded-full flex items-center justify-center border-4 border-black">
                      <PiggyBank size={32} className="text-black" />
                  </div>
                  <div>
                      <h3 className="font-serif text-2xl text-black leading-none mb-1">Apna Gullak</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Track Cash at Home</p>
                  </div>
              </div>

              <div className="bg-gray-100 rounded-xl p-4 mb-4 border-2 border-dashed border-gray-300 flex justify-between items-end">
                   <div>
                       <span className="text-xs text-gray-500 font-bold uppercase">Total Saved</span>
                       <div className="text-4xl font-black text-india-blue">₹{gullakSavings}</div>
                   </div>
                   {gullakSavings >= 500 && (
                       <button onClick={() => setIsRDModalOpen(true)} className="bg-india-green text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce shadow-md">
                           Ready for RD!
                       </button>
                   )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map((amt) => (
                      <button 
                        key={amt}
                        onClick={() => addToGullak(amt)}
                        className="bg-india-cream border-2 border-black rounded-lg py-2 font-bold text-sm hover:bg-india-yellow active:scale-95 transition-all shadow-sm"
                      >
                          +₹{amt}
                      </button>
                  ))}
              </div>
          </div>
       </div>

       {/* Goal Visualizer / Sapna Planner Button */}
       <div className="container mx-auto px-4 mt-8">
           <button 
                onClick={() => setIsGoalModalOpen(true)}
                className="w-full bg-india-purple text-white p-4 rounded-xl border-4 border-black shadow-pop active:shadow-none active:translate-y-1 transition-all flex items-center justify-between px-6 group"
             >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-white text-india-purple group-hover:scale-110 transition-transform">
                        <Rocket size={24} />
                    </div>
                    <div className="text-left">
                       <h4 className="font-bold text-lg leading-tight text-india-yellow">Sapna Planner & Mehangai</h4>
                       <p className="text-xs text-white/70">Plan for Goals vs Inflation</p>
                    </div>
                </div>
                <ArrowRight size={24} className="text-white" />
           </button>
       </div>

       {/* Core Services - Big Buttons */}
       <div className="container mx-auto px-4 mt-8">
          <h3 className="font-bold text-lg mb-4 text-india-blue border-l-4 border-india-blue pl-2 uppercase">Zaroori Seva (Essentials)</h3>
          
          <div className="grid grid-cols-2 gap-4">
             <button 
                onClick={() => setIsSchemeModalOpen(true)}
                className="bg-white p-4 rounded-xl border-2 border-india-green shadow-[4px_4px_0_0_#138808] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center text-center gap-2"
             >
                <ScrollText className="w-10 h-10 text-india-green" />
                <span className="font-bold leading-tight">Sarkari Yojna</span>
                <span className="text-[10px] text-gray-500">Scheme Didi</span>
             </button>

             <button 
                onClick={() => setIsGoldModalOpen(true)}
                className="bg-white p-4 rounded-xl border-2 border-india-yellow shadow-[4px_4px_0_0_#FFCC00] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center text-center gap-2"
             >
                <Gem className="w-10 h-10 text-india-yellow" />
                <span className="font-bold leading-tight">Sona (Gold)</span>
                <span className="text-[10px] text-gray-500">Compare & Save</span>
             </button>

             <button className="bg-white p-4 rounded-xl border-2 border-india-blue shadow-[4px_4px_0_0_#1034A6] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center text-center gap-2"
             >
                <Landmark className="w-10 h-10 text-india-blue" />
                <span className="font-bold leading-tight">Bank Khaata</span>
                <span className="text-[10px] text-gray-500">Jan Dhan / Savings</span>
             </button>

             <button className="bg-white p-4 rounded-xl border-2 border-india-chili shadow-[4px_4px_0_0_#E32636] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center text-center gap-2">
                <ShieldCheck className="w-10 h-10 text-india-chili" />
                <span className="font-bold leading-tight">Suraksha</span>
                <span className="text-[10px] text-gray-500">Insurance</span>
             </button>

             {/* Stree Dhan Locker Entry */}
             <button 
                onClick={() => { setIsLockerOpen(true); setLockerStep('auth'); }}
                className="col-span-2 bg-india-purple text-white p-4 rounded-xl border-2 border-black shadow-[4px_4px_0_0_black] active:translate-y-1 active:shadow-none transition-all flex items-center justify-between px-6"
             >
                <div className="flex flex-col items-start">
                   <span className="font-bold text-xl leading-tight font-serif flex items-center gap-2"><Lock size={20} /> Stree Dhan Locker</span>
                   <span className="text-xs text-white/80 uppercase tracking-widest">Private & Secure Vault</span>
                </div>
                <div className="bg-white/20 p-2 rounded-full">
                    <KeyRound size={24} />
                </div>
             </button>
          </div>
       </div>

       <WavySeparator className="my-8 opacity-30" />

       {/* Trust Section */}
       <div className="px-4">
         <div className="bg-india-yellow/20 border-2 border-india-marigold p-4 rounded-xl flex items-center gap-4">
            <div className="bg-white p-2 rounded-full border border-black">
                <PhoneCall className="w-6 h-6 text-black" />
            </div>
            <div>
                <h4 className="font-bold text-india-blue">Need Help?</h4>
                <p className="text-sm">Call Didi Helpline: 1800-123-456</p>
            </div>
         </div>
       </div>

      {/* Voice Interface Modal */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="w-full max-w-md bg-india-cream rounded-2xl p-8 text-center relative border-4 border-india-pink shadow-pop">
              <button onClick={closeVoiceModal} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                 <X size={24} />
              </button>

              <h3 className="text-2xl font-serif text-india-blue mb-2">Didi AI</h3>
              
              <div className="flex justify-center my-8">
                 {voiceStatus === 'idle' && (
                    <button 
                      onClick={handleStartListening}
                      className="w-24 h-24 rounded-full bg-india-pink text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    >
                       <Mic size={40} />
                    </button>
                 )}

                 {voiceStatus === 'listening' && (
                    <div className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg animate-pulse ring-4 ring-red-200">
                       <Mic size={40} />
                    </div>
                 )}

                 {voiceStatus === 'processing' && (
                    <div className="w-24 h-24 rounded-full bg-india-yellow text-black flex items-center justify-center shadow-lg">
                       <Loader2 size={40} className="animate-spin" />
                    </div>
                 )}

                 {voiceStatus === 'speaking' && (
                    <button onClick={stopAudio} className="w-24 h-24 rounded-full bg-india-green text-white flex items-center justify-center shadow-lg animate-bounce">
                       <Volume2 size={40} />
                    </button>
                 )}
              </div>

              <div className="min-h-[60px]">
                {voiceStatus === 'idle' && !voiceResponse && <p className="text-gray-500">Tap the mic to ask a question.</p>}
                {voiceStatus === 'listening' && <p className="text-india-pink font-bold">Listening...</p>}
                {voiceStatus === 'processing' && <p className="text-india-yellow font-bold text-shadow-sm">Didi is thinking...</p>}
                
                {(transcript || voiceResponse) && (
                   <div className="text-left bg-white/50 p-4 rounded-lg border-2 border-black/10 mt-4">
                      {transcript && <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">You asked:</p>}
                      {transcript && <p className="font-medium mb-4">"{transcript}"</p>}
                      
                      {voiceResponse && <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Didi says:</p>}
                      {voiceResponse && <p className="font-bold text-india-blue text-lg">"{voiceResponse}"</p>}
                   </div>
                )}
              </div>

              {voiceStatus === 'speaking' && (
                 <button onClick={stopAudio} className="mt-6 flex items-center justify-center gap-2 mx-auto text-sm text-red-500 font-bold uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-full">
                    <StopCircle size={16} /> Stop Speaking
                 </button>
              )}
           </div>
        </div>
      )}

      {/* Goal Visualizer & Inflation Modal */}
      {isGoalModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="w-full max-w-lg bg-india-cream rounded-2xl p-0 relative border-[6px] border-india-purple shadow-pop overflow-hidden h-[85vh] flex flex-col">
                <div className="bg-india-purple p-4 flex justify-between items-center border-b-4 border-black shrink-0">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 font-serif">
                        <Rocket size={24} className="text-india-yellow" /> Sapna Planner
                    </h3>
                    <button onClick={() => setIsGoalModalOpen(false)} className="text-white hover:bg-white/20 rounded-full p-1">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex bg-white border-b-2 border-black">
                    <button 
                        onClick={() => setGoalTab('inflation')}
                        className={`flex-1 p-3 font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 ${goalTab === 'inflation' ? 'bg-india-yellow text-black border-b-4 border-india-purple' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <TrendingUp size={16} /> Mehangai Check
                    </button>
                    <button 
                        onClick={() => setGoalTab('dream')}
                        className={`flex-1 p-3 font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 ${goalTab === 'dream' ? 'bg-india-yellow text-black border-b-4 border-india-purple' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Rocket size={16} /> Plan a Goal
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {goalTab === 'inflation' ? (
                        <div className="space-y-6">
                            <div className="bg-india-blue/10 p-4 rounded-xl border-2 border-india-blue text-center">
                                <p className="font-bold text-india-blue text-lg mb-2">Did you know?</p>
                                <p className="text-sm">Things get expensive every year. This is called <span className="font-bold bg-india-yellow px-1">Inflation</span>.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-500 uppercase text-xs mb-3">Choose an Item to Check</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(inflationItems).map(([key, item]) => (
                                        <button 
                                            key={key}
                                            onClick={() => setInflationItem(key)}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${inflationItem === key ? 'bg-white border-india-purple shadow-md scale-105' : 'bg-gray-50 border-gray-200 opacity-80'}`}
                                        >
                                            <div className="text-2xl mb-1">{item.icon}</div>
                                            <div className="font-bold text-sm">{item.name}</div>
                                            <div className="text-xs text-gray-500">Today: ₹{item.price}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border-2 border-black shadow-sm text-center">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Year</p>
                                        <p className="text-2xl font-black">{new Date().getFullYear()}</p>
                                        <p className="text-lg font-bold text-green-600">₹{inflationItems[inflationItem].price}</p>
                                    </div>
                                    <ArrowRight size={24} className="text-gray-300" />
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Year</p>
                                        <p className="text-2xl font-black text-india-purple">{new Date().getFullYear() + inflationYears}</p>
                                        <p className="text-lg font-bold text-red-600">₹{getFuturePrice(inflationItems[inflationItem].price, inflationYears)}</p>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <input 
                                        type="range" 
                                        min="1" max="20" 
                                        value={inflationYears} 
                                        onChange={(e) => setInflationYears(parseInt(e.target.value))}
                                        className="w-full accent-india-purple h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Wait {inflationYears} Years</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                             <div className="bg-india-cream p-4 rounded-xl border-2 border-dashed border-gray-400 text-center">
                                 <h3 className="font-serif text-xl text-india-blue mb-1">What is your Sapna?</h3>
                                 <p className="text-xs text-gray-500">Plan for a Scooty, Roof Repair, or Wedding.</p>
                             </div>

                             <div>
                                 <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Goal Name</label>
                                 <input 
                                     type="text" 
                                     value={dreamName}
                                     onChange={(e) => setDreamName(e.target.value)}
                                     placeholder="e.g. Electric Scooty"
                                     className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white text-black"
                                 />
                             </div>

                             <div className="flex gap-4">
                                 <div className="flex-1">
                                     <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Cost Today (₹)</label>
                                     <input 
                                         type="number" 
                                         value={dreamCost}
                                         onChange={(e) => setDreamCost(e.target.value)}
                                         placeholder="80000"
                                         className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white text-black"
                                     />
                                 </div>
                                 <div className="flex-1">
                                     <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Years to Buy</label>
                                     <select 
                                         value={dreamYears}
                                         onChange={(e) => setDreamYears(parseInt(e.target.value))}
                                         className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white text-black"
                                     >
                                         {[1,2,3,5,7,10,15].map(y => <option key={y} value={y}>{y} Years</option>)}
                                     </select>
                                 </div>
                             </div>

                             {calculateGoalPlan() && (
                                 <div className="mt-6 animate-in slide-in-from-bottom-4">
                                     <div className="bg-india-yellow border-4 border-black p-4 rounded-xl shadow-md transform rotate-1">
                                         <h4 className="font-bold text-center text-sm uppercase tracking-widest mb-4 border-b-2 border-black pb-2">Guru-ji's Calculation</h4>
                                         
                                         <div className="flex justify-between items-center mb-2">
                                             <span className="text-sm font-bold opacity-70">Price Today:</span>
                                             <span className="font-bold">₹{parseInt(dreamCost).toLocaleString('en-IN')}</span>
                                         </div>
                                         <div className="flex justify-between items-center mb-4 text-red-600">
                                             <span className="text-sm font-bold opacity-70 flex items-center gap-1"><TrendingUp size={14}/> Inflation (7%):</span>
                                             <span className="font-bold">+ ₹{(calculateGoalPlan()!.futureCost - parseInt(dreamCost)).toLocaleString('en-IN')}</span>
                                         </div>
                                         
                                         <div className="bg-white p-3 rounded-lg border-2 border-black text-center mb-2">
                                             <p className="text-xs text-gray-500 uppercase font-bold">Real Cost in {dreamYears} Years</p>
                                             <p className="text-3xl font-black text-india-purple">₹{calculateGoalPlan()!.futureCost.toLocaleString('en-IN')}</p>
                                         </div>

                                         <div className="text-center">
                                             <p className="text-sm font-bold">To buy this, save <span className="bg-black text-white px-2 py-0.5 rounded">₹{calculateGoalPlan()!.monthlySave.toLocaleString('en-IN')}/month</span></p>
                                         </div>
                                     </div>
                                 </div>
                             )}
                        </div>
                    )}
                </div>
             </div>
          </div>
      )}

      {/* Scam Detector Modal */}
      {isScamModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-white rounded-2xl p-0 relative border-[6px] border-india-chili shadow-pop overflow-hidden">
                  <div className="bg-india-chili p-4 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <AlertTriangle size={24} /> Asli ya Nakli?
                      </h3>
                      <button onClick={closeScamModal} className="text-white hover:bg-white/20 rounded-full p-1">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-6">
                      {!scamResult ? (
                          <>
                            <p className="font-bold text-gray-700 mb-2">What is the promise?</p>
                            <p className="text-sm text-gray-500 mb-4">Example: "Double money in 3 months" or "20% monthly return"</p>
                            
                            <textarea 
                                className="w-full border-2 border-black rounded-lg p-3 text-lg font-medium bg-india-cream focus:outline-none focus:ring-4 ring-india-yellow/50 mb-4"
                                rows={3}
                                placeholder="Type here..."
                                value={scamQuery}
                                onChange={(e) => setScamQuery(e.target.value)}
                            />

                            <button 
                                onClick={isScamListening ? handleStopScamListening : handleStartScamListening}
                                className={`w-full mb-4 py-3 rounded-xl font-bold border-2 border-black border-dashed flex items-center justify-center gap-2 transition-all
                                    ${isScamListening ? 'bg-red-50 text-red-600 animate-pulse border-red-500 border-solid' : 'bg-india-cream text-gray-700 hover:bg-india-yellow/20'}`}
                            >
                                {isScamListening ? <Loader2 className="animate-spin" size={20} /> : <Mic size={20} />}
                                {isScamListening ? 'Listening...' : 'Bolkar Batayein (Speak)'}
                            </button>
                            
                            <button 
                                onClick={handleAnalyzeScam}
                                disabled={isScamLoading || !scamQuery}
                                className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-white shadow-pop active:shadow-none active:translate-y-1 transition-all border-2 border-black flex items-center justify-center gap-2
                                    ${isScamLoading || !scamQuery ? 'bg-gray-400 cursor-not-allowed' : 'bg-india-blue hover:bg-india-blue/90'}`}
                            >
                                {isScamLoading ? <Loader2 className="animate-spin" /> : <SearchCheck />}
                                {isScamLoading ? 'Checking...' : 'Check Safety'}
                            </button>
                          </>
                      ) : (
                          <div className="animate-in slide-in-from-bottom-4">
                              <div className={`p-4 rounded-xl border-4 border-black mb-4 text-center shadow-md
                                  ${scamResult.riskLevel === 'HIGH' ? 'bg-red-100 border-red-600' : 
                                    scamResult.riskLevel === 'MEDIUM' ? 'bg-yellow-100 border-yellow-600' : 
                                    'bg-green-100 border-green-600'}`}>
                                  
                                  <div className="font-black text-3xl mb-1 uppercase tracking-tight">
                                      {scamResult.riskLevel === 'HIGH' ? '🚨 DANGER / FRAUD' :
                                       scamResult.riskLevel === 'MEDIUM' ? '⚠️ CAUTION' :
                                       '✅ SAFE'}
                                  </div>
                                  <div className="font-serif text-xl font-bold">
                                      "{scamResult.verdict}"
                                  </div>
                              </div>

                              <div className="space-y-4">
                                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Why?</p>
                                      <p className="font-medium text-gray-800">{scamResult.explanation}</p>
                                  </div>

                                  <div className="bg-india-yellow/20 p-3 rounded-lg border border-india-marigold">
                                      <p className="text-xs font-bold text-india-marigold uppercase tracking-widest mb-1">Reality Check (Sarkari Rate)</p>
                                      <p className="font-medium text-gray-800 flex items-start gap-2">
                                          <Landmark size={16} className="mt-1 shrink-0 text-india-blue" />
                                          {scamResult.safeComparison}
                                      </p>
                                  </div>
                              </div>

                              <button 
                                  onClick={() => { setScamResult(null); setScamQuery(''); }}
                                  className="w-full mt-6 py-3 bg-black text-white font-bold rounded-lg"
                              >
                                  Check Another
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Gullak RD Alert Modal */}
      {isRDModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in-95 duration-200">
              <div className="w-full max-w-sm bg-india-cream rounded-2xl p-0 relative border-[6px] border-india-green shadow-[0_0_40px_rgba(19,136,8,0.5)] overflow-hidden">
                  <div className="bg-india-green p-4 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <CheckCircle2 size={24} /> Target Hit!
                      </h3>
                      <button onClick={() => setIsRDModalOpen(false)} className="text-white hover:bg-white/20 rounded-full p-1">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-8 text-center">
                      <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-india-green shadow-lg animate-bounce">
                          <Landmark size={48} className="text-india-green" />
                      </div>
                      
                      <h2 className="text-3xl font-serif text-india-blue mb-2">Shabash! 🎉</h2>
                      <p className="font-bold text-lg mb-4">You have saved <span className="text-india-green">₹{gullakSavings}</span>!</p>
                      
                      <div className="bg-white p-4 rounded-xl border-2 border-black mb-6 text-left shadow-sm">
                          <p className="text-sm font-medium text-gray-600 mb-2">Guru-ji says:</p>
                          <p className="font-serif text-lg leading-tight">
                              "Don't keep this cash at home! It can get spent or stolen. Go to the Post Office today and start an <strong>RD (Recurring Deposit)</strong>."
                          </p>
                      </div>

                      <button 
                          onClick={resetGullak}
                          className="w-full bg-india-blue text-white font-bold uppercase tracking-widest py-4 rounded-xl shadow-pop active:shadow-none active:translate-y-1 transition-all border-2 border-white"
                      >
                          I Deposited it! (Reset Gullak)
                      </button>
                      <button 
                        onClick={() => setIsRDModalOpen(false)}
                        className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-black"
                      >
                          Remind me later
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Gold to Growth Calculator Modal */}
      {isGoldModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="w-full max-w-lg bg-white rounded-2xl p-0 relative border-4 border-india-yellow shadow-pop overflow-hidden">
                <div className="bg-india-yellow p-4 flex justify-between items-center border-b-4 border-black">
                   <h3 className="text-xl font-bold text-black flex items-center gap-2">
                      <Gem size={24} /> Sona vs SGB Calculator
                   </h3>
                   <button onClick={() => setIsGoldModalOpen(false)} className="text-black hover:bg-black/10 rounded-full p-1">
                      <X size={24} />
                   </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[80vh]">
                   <p className="text-sm text-gray-600 mb-6 font-sans">
                      See how "Sarkari Gold" (SGB) grows faster than Jewellery.
                   </p>

                   {/* Input Section */}
                   <div className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-end mb-4">
                         <label className="font-bold text-lg text-gray-800">
                            Investment Amount
                         </label>
                         <span className="text-2xl font-black text-india-blue">
                            ₹{goldAmount.toLocaleString('en-IN')}
                         </span>
                      </div>
                      
                      <input 
                         type="range" 
                         min="10000" 
                         max="500000" 
                         step="5000"
                         value={goldAmount}
                         onChange={(e) => setGoldAmount(parseInt(e.target.value))}
                         className="w-full accent-india-blue h-4 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">
                         <span>₹10k</span>
                         <span>₹5 Lakh</span>
                      </div>
                   </div>

                   {/* Comparison Cards */}
                   <div className="grid grid-cols-2 gap-3 mb-6">
                      {/* Physical Gold Card */}
                      <div className="border-2 border-red-200 bg-red-50 rounded-xl p-3 relative flex flex-col">
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full border border-red-200 uppercase tracking-wide shadow-sm whitespace-nowrap">
                            JEWELLERY
                         </div>
                         
                         <div className="text-center mt-4 mb-4 pb-4 border-b border-red-200">
                            <p className="text-gray-500 text-xs uppercase tracking-wide">You Pay</p>
                            <p className="font-bold text-xl text-gray-800">₹{goldAmount.toLocaleString('en-IN')}</p>
                         </div>

                         <div className="space-y-3 text-sm flex-1">
                            <div className="flex flex-col gap-1">
                               <span className="text-red-600 font-bold text-xs">Making Charges (20%)</span>
                               <span className="text-red-600 font-bold text-lg leading-none">- ₹{(goldAmount * 0.20).toLocaleString('en-IN')}</span>
                            </div>
                            
                            <div className="pt-2">
                               <span className="text-gray-500 text-xs font-bold block">Real Gold Value</span>
                               <span className="text-gray-900 font-black text-lg">₹{(goldAmount * 0.80).toLocaleString('en-IN')}</span>
                            </div>
                            
                            <div className="pt-2 opacity-50">
                               <span className="text-gray-500 text-xs font-bold block">Yearly Income</span>
                               <span className="text-gray-800 font-bold">₹0</span>
                            </div>
                         </div>
                      </div>

                      {/* SGB Card */}
                      <div className="border-[3px] border-india-green bg-white rounded-xl p-3 relative shadow-[0_0_15px_rgba(19,136,8,0.15)] flex flex-col transform scale-105 z-10">
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-india-green text-white text-[10px] font-bold px-3 py-1 rounded-full border border-green-700 uppercase tracking-wide flex items-center gap-1 shadow-sm whitespace-nowrap">
                            <TrendingUp size={10} strokeWidth={3} /> SGB BOND
                         </div>
                         
                         <div className="text-center mt-4 mb-4 pb-4 border-b border-gray-100">
                            <p className="text-gray-500 text-xs uppercase tracking-wide">You Pay</p>
                            <p className="font-bold text-xl text-gray-800">₹{goldAmount.toLocaleString('en-IN')}</p>
                         </div>

                         <div className="space-y-3 text-sm flex-1">
                            <div className="flex flex-col gap-1">
                               <span className="text-india-green font-bold text-xs">Making Charges</span>
                               <span className="text-india-green font-bold text-lg leading-none">₹0</span>
                            </div>
                            
                            <div className="pt-2">
                               <span className="text-gray-500 text-xs font-bold block">Real Gold Value</span>
                               <span className="text-gray-900 font-black text-lg">₹{goldAmount.toLocaleString('en-IN')}</span>
                            </div>
                            
                            <div className="mt-2 bg-green-50 p-2 rounded border border-green-100">
                               <span className="text-green-700 text-xs font-bold block">Yearly Income (2.5%)</span>
                               <span className="text-green-700 font-black text-lg">+ ₹{(goldAmount * 0.025).toLocaleString('en-IN')}</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Summary Box */}
                   <div className="bg-india-blue text-white p-5 rounded-xl text-center border-4 border-black shadow-[4px_4px_0_0_black]">
                      <h4 className="font-bold uppercase tracking-widest text-[10px] text-india-blue bg-white inline-block px-2 py-0.5 rounded mb-2">Guru-ji's Verdict</h4>
                      <p className="font-serif text-lg leading-snug">
                         "With SGB, you save <span className="text-india-yellow font-bold">₹{(goldAmount * 0.20).toLocaleString('en-IN')}</span> upfront and earn <span className="text-india-yellow font-bold">₹{(goldAmount * 0.025).toLocaleString('en-IN')}</span> free money every year for household expenses!"
                      </p>
                   </div>
                </div>
             </div>
          </div>
      )}

      {/* Scheme Didi Modal */}
      {isSchemeModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-lg bg-india-cream rounded-2xl p-0 relative border-[6px] border-india-green shadow-pop overflow-hidden h-[85vh] flex flex-col">
                  <div className="bg-india-green p-4 flex justify-between items-center border-b-4 border-black shrink-0">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <UserCheck size={24} /> Scheme Didi
                      </h3>
                      <button onClick={() => { setIsSchemeModalOpen(false); setSchemeStep('form'); setPlayingVideo(null); }} className="text-white hover:bg-white/20 rounded-full p-1">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                      {schemeStep === 'form' ? (
                          <>
                              <div className="mb-6 bg-white p-4 rounded-xl border-2 border-dashed border-gray-400">
                                  <h4 className="font-bold text-lg mb-2 text-india-blue">About You</h4>
                                  <p className="text-sm text-gray-500 mb-4">Fill this to find the best Sarkari Yojna for you.</p>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Age</label>
                                          <input 
                                            type="number" 
                                            value={schemeProfile.age}
                                            onChange={(e) => setSchemeProfile({...schemeProfile, age: e.target.value})}
                                            className="w-full p-3 border-2 border-black rounded-lg font-bold"
                                          />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Caste / Category</label>
                                          <select 
                                            value={schemeProfile.category}
                                            onChange={(e) => setSchemeProfile({...schemeProfile, category: e.target.value})}
                                            className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white"
                                          >
                                              <option>General</option>
                                              <option>OBC</option>
                                              <option>SC</option>
                                              <option>ST</option>
                                          </select>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">BPL Card?</label>
                                          <select 
                                            value={schemeProfile.bpl ? 'Yes' : 'No'}
                                            onChange={(e) => setSchemeProfile({...schemeProfile, bpl: e.target.value === 'Yes'})}
                                            className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white"
                                          >
                                              <option>No</option>
                                              <option>Yes</option>
                                          </select>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">State</label>
                                          <select 
                                            value={schemeProfile.state}
                                            onChange={(e) => setSchemeProfile({...schemeProfile, state: e.target.value})}
                                            className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white"
                                          >
                                              <option>Uttar Pradesh</option>
                                              <option>Bihar</option>
                                              <option>Maharashtra</option>
                                              <option>Rajasthan</option>
                                              <option>Madhya Pradesh</option>
                                              <option>Other</option>
                                          </select>
                                      </div>
                                  </div>
                              </div>

                              <button 
                                  onClick={handleFindSchemes}
                                  disabled={isSchemeLoading}
                                  className="w-full py-4 bg-india-blue text-white font-bold text-xl uppercase rounded-xl border-2 border-black shadow-pop active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
                              >
                                  {isSchemeLoading ? <Loader2 className="animate-spin" /> : <SearchCheck />}
                                  {isSchemeLoading ? 'Finding Schemes...' : 'Find My Schemes'}
                              </button>
                          </>
                      ) : (
                          <div className="space-y-4">
                              <button onClick={() => setSchemeStep('form')} className="text-sm font-bold text-gray-500 hover:text-black mb-2 flex items-center gap-1">
                                  ← Back to Profile
                              </button>

                              {playingVideo && (
                                  <div className="bg-black p-2 rounded-xl border-4 border-india-marigold shadow-lg mb-6 sticky top-0 z-20">
                                      <div className="flex justify-between text-white text-xs mb-1 px-1">
                                          <span className="font-bold uppercase tracking-widest text-india-yellow">Now Playing</span>
                                          <button onClick={() => setPlayingVideo(null)} className="hover:text-red-500 font-bold">Close Video</button>
                                      </div>
                                      <video controls autoPlay className="w-full rounded-lg aspect-video" src={playingVideo}>
                                          Your browser does not support the video tag.
                                      </video>
                                  </div>
                              )}

                              {schemeResults.map((scheme, idx) => (
                                  <div key={idx} className="bg-white border-4 border-black p-4 rounded-xl shadow-sm relative overflow-hidden">
                                      <div className="absolute top-0 right-0 w-16 h-16 bg-india-yellow rounded-bl-full opacity-20"></div>
                                      
                                      <h3 className="text-xl font-bold font-serif text-india-blue mb-2">{scheme.name}</h3>
                                      
                                      <div className="bg-[#f0fdf4] border border-green-200 p-4 rounded-xl mb-4">
                                          <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">Benefit</p>
                                          <p className="font-bold text-gray-800 text-lg leading-tight">{scheme.benefit}</p>
                                      </div>
                                      
                                      <p className="text-sm text-gray-600 mb-4 leading-relaxed"><span className="font-bold text-gray-800">Eligibility:</span> {scheme.eligibility}</p>
                                      
                                      <div className="mb-6">
                                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Steps to Apply:</p>
                                          <ol className="list-decimal pl-5 text-sm space-y-2 text-gray-700 font-medium">
                                              {scheme.applicationSteps.map((step, i) => (
                                                  <li key={i}>{step}</li>
                                              ))}
                                          </ol>
                                      </div>

                                      <button 
                                          onClick={() => handleWatchGuide(scheme.name, scheme.applicationSteps)}
                                          disabled={isVideoGenerating === scheme.name}
                                          className={`w-full py-4 bg-india-pink text-white font-bold rounded-xl border-2 border-black shadow-[4px_4px_0_0_black] hover:shadow-[2px_2px_0_0_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2
                                              ${isVideoGenerating === scheme.name ? 'opacity-80 cursor-wait' : 'hover:bg-india-pink/90'}`}
                                      >
                                          {isVideoGenerating === scheme.name ? (
                                              <> <Loader2 className="animate-spin" size={20} /> Generating Guide... </>
                                          ) : (
                                              <> <Video size={20} /> Watch 'How-To' Guide </>
                                          )}
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Stree Dhan Locker Modal */}
      {isLockerOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-lg bg-india-cream rounded-2xl p-0 relative border-[6px] border-india-purple shadow-pop overflow-hidden h-[85vh] flex flex-col">
                  <div className="bg-india-purple p-4 flex justify-between items-center border-b-4 border-black shrink-0">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2 font-serif">
                          <Lock size={24} className="text-india-yellow" /> Stree Dhan Locker
                      </h3>
                      <button onClick={() => { setIsLockerOpen(false); setLockerStep('auth'); setInputPin(''); setAuthError(''); }} className="text-white hover:bg-white/20 rounded-full p-1">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-0 flex-1 overflow-y-auto custom-scrollbar relative">
                      {lockerStep === 'auth' && (
                          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-pattern-dots">
                              <div className="bg-white p-6 rounded-full border-4 border-black mb-6 shadow-lg">
                                 <ShieldCheck size={64} className="text-india-purple" />
                              </div>
                              <h2 className="text-2xl font-bold font-serif text-india-blue mb-2">
                                  {pin ? 'Unlock Your Safe' : 'Set Secret Password'}
                              </h2>
                              <p className="text-gray-600 mb-8 max-w-xs">
                                  {pin ? 'Enter your 4-digit PIN to access your private assets.' : 'Create a 4-digit PIN to keep your photos private from others.'}
                              </p>
                              
                              <div className="flex gap-4 mb-2">
                                  <input 
                                      type="password" 
                                      maxLength={4}
                                      value={inputPin}
                                      onChange={(e) => setInputPin(e.target.value)}
                                      className="w-48 text-center text-4xl font-bold tracking-[1em] p-3 border-4 border-black rounded-xl bg-white focus:outline-none focus:ring-4 ring-india-pink/30 text-black"
                                      placeholder="••••"
                                  />
                              </div>
                              {authError && <p className="text-red-600 font-bold mb-4 animate-pulse">{authError}</p>}

                              <button 
                                  onClick={pin ? handleUnlockLocker : handleSetPin}
                                  className="w-full max-w-xs bg-india-purple text-white font-bold text-xl py-4 rounded-xl border-2 border-black shadow-pop active:translate-y-1 active:shadow-none transition-all mt-4"
                              >
                                  {pin ? 'Unlock Locker' : 'Set PIN & Enter'}
                              </button>
                          </div>
                      )}

                      {lockerStep === 'list' && (
                          <div className="p-6 pb-24">
                              <div className="flex justify-between items-center mb-6">
                                  <h4 className="font-bold text-lg text-gray-500 uppercase tracking-widest">My Assets ({lockerItems.length})</h4>
                                  <button onClick={() => setLockerStep('add')} className="bg-india-pink text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-1 hover:bg-india-pink/90">
                                      <Plus size={16} /> Add Proof
                                  </button>
                              </div>

                              {lockerItems.length === 0 ? (
                                  <div className="text-center py-12 border-2 border-dashed border-gray-400 rounded-xl bg-white/50">
                                      <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                                      <p className="font-bold text-gray-500">Locker is Empty</p>
                                      <p className="text-sm text-gray-400 mb-6">Add photos of your jewelry, receipts, or cash.</p>
                                  </div>
                              ) : (
                                  <div className="grid grid-cols-2 gap-4">
                                      {lockerItems.map((item) => (
                                          <div key={item.id} className="bg-white p-2 rounded-xl border-2 border-gray-200 shadow-sm relative group">
                                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 border border-gray-100">
                                                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                              </div>
                                              <span className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border border-black/10 shadow-sm
                                                  ${item.category === 'gold' ? 'bg-india-yellow text-black' : 
                                                    item.category === 'cash' ? 'bg-green-100 text-green-800' : 
                                                    item.category === 'gift' ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'}`}>
                                                  {item.category}
                                              </span>
                                              <h5 className="font-bold text-sm truncate">{item.title}</h5>
                                              <p className="text-xs text-gray-500">{item.date}</p>
                                              
                                              <button 
                                                  onClick={() => handleDeleteItem(item.id)}
                                                  className="absolute top-3 right-3 bg-white text-red-500 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                              >
                                                  <Trash2 size={14} />
                                              </button>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      )}

                      {lockerStep === 'add' && (
                          <div className="p-6 bg-white min-h-full">
                              <button onClick={() => setLockerStep('list')} className="text-sm font-bold text-gray-500 hover:text-black mb-4 flex items-center gap-1">
                                  ← Back to Locker
                              </button>
                              
                              <h3 className="text-2xl font-serif text-india-blue mb-6">Add Evidence</h3>

                              <div className="space-y-4">
                                  <div className="border-4 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 relative overflow-hidden group hover:border-india-purple transition-colors cursor-pointer">
                                      <input 
                                          type="file" 
                                          accept="image/*" 
                                          onChange={handleImageUpload}
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                      />
                                      {newItem.image ? (
                                          <img src={newItem.image} alt="Preview" className="w-full h-48 object-contain mx-auto" />
                                      ) : (
                                          <>
                                              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-gray-300 mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                  <Camera size={32} className="text-gray-400 group-hover:text-india-purple" />
                                              </div>
                                              <p className="font-bold text-gray-600">Tap to Take Photo</p>
                                              <p className="text-xs text-gray-400">Receipts, Jewelry, Gifts</p>
                                          </>
                                      )}
                                  </div>

                                  <div>
                                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Item Name</label>
                                      <input 
                                          type="text" 
                                          value={newItem.title || ''}
                                          onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                                          className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white text-black"
                                          placeholder="e.g. Gold Necklace from Mom"
                                      />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                                          <select 
                                              value={newItem.category}
                                              onChange={(e) => setNewItem({...newItem, category: e.target.value as any})}
                                              className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white text-black"
                                          >
                                              <option value="gold">Gold / Jewelry</option>
                                              <option value="cash">Cash Savings</option>
                                              <option value="gift">Gift / Shagun</option>
                                              <option value="papers">Property Papers</option>
                                          </select>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Date Received</label>
                                          <input 
                                              type="date" 
                                              value={newItem.date || new Date().toISOString().split('T')[0]}
                                              onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                                              className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white text-black"
                                          />
                                      </div>
                                  </div>

                                  <div>
                                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Secret Notes (Optional)</label>
                                      <textarea 
                                          value={newItem.notes || ''}
                                          onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                                          className="w-full p-3 border-2 border-black rounded-lg font-medium h-24 resize-none bg-white text-black"
                                          placeholder="Kept in the red box under the bed..."
                                      />
                                  </div>

                                  {formError && (
                                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-200 text-sm font-bold flex items-center gap-2">
                                        <AlertTriangle size={16} />
                                        {formError}
                                    </div>
                                  )}

                                  <button 
                                      onClick={handleSaveItem}
                                      className="w-full bg-india-purple text-white font-bold text-lg py-4 rounded-xl border-2 border-black shadow-pop active:shadow-none active:translate-y-1 transition-all mt-4"
                                  >
                                      Save to Locker
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SaralHome;