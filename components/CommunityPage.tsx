import React, { useState, useEffect } from 'react';
import { Users, ArrowRight, X, Trash2, CheckCircle2, Crown, Calculator, RefreshCw, Briefcase, TrendingUp, Flame, MessageSquare, IndianRupee, Trophy, AlertCircle, Loader2, Send, Eye, ThumbsUp, ThumbsDown, User, Globe } from 'lucide-react';
import { KittyGroup, UserProfile } from '../types';
import { roastPortfolio, checkSalary } from '../services/geminiService';

interface CommunityPageProps {
    user?: UserProfile | null;
}

// Mock Data for Community Feed
const MOCK_POSTS = [
  {
    id: '1',
    type: 'salary',
    title: 'Product Designer, 4 YOE, Mumbai',
    details: 'Current: 15 LPA. Offer: 18 LPA. Is this low?',
    timestamp: '2h ago',
    reviews: [
        { id: 'r1', author: 'Design Lead (Anon)', text: 'Market is hot for UX. You can push for 22 LPA easily.', sentiment: 'positive' },
        { id: 'r2', author: 'Startup Founder', text: '18 is fair for mid-level unless you have a top tier portfolio.', sentiment: 'neutral' }
    ]
  },
  {
    id: '2',
    type: 'roast',
    title: '24M, Aggressive Growth',
    details: '50% Small Cap MF, 30% Crypto, 20% Cash. No FD.',
    timestamp: '4h ago',
    reviews: [
        { id: 'r3', author: 'Risk Manager', text: 'One crash and you are eating Maggi for a month. Add some Gold.', sentiment: 'negative' },
        { id: 'r4', author: 'Crypto Believer', text: 'WAGMI! Keep holding.', sentiment: 'positive' }
    ]
  }
];

const ALIASES = ["Market Wolf", "SIP Sage", "D-Street Dude", "Lazy Investor", "Tax Ninja", "Frugal Fox"];

const CommunityPage: React.FC<CommunityPageProps> = ({ user }) => {
  const isSaral = user?.mode === 'saral';

  // --- Saral State (Kitty Party) ---
  const [isKittyModalOpen, setIsKittyModalOpen] = useState(false);
  const [kittyGroup, setKittyGroup] = useState<KittyGroup | null>(null);
  const [tempGroupName, setTempGroupName] = useState('');
  const [tempAmount, setTempAmount] = useState<string>('');
  const [tempMembers, setTempMembers] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState('');

  // --- Smart State (Roast & Salary) ---
  const [smartTab, setSmartTab] = useState<'roast' | 'salary'>('roast');
  
  // Roast State
  const [portfolio, setPortfolio] = useState({ age: 28, stocks: 30, fd: 40, gold: 20, crypto: 10 });
  const [roastResult, setRoastResult] = useState<{score: number, roast: string, fix: string} | null>(null);
  const [isRoasting, setIsRoasting] = useState(false);

  // Salary State
  const [salaryForm, setSalaryForm] = useState({ role: 'Product Manager', exp: 4, location: 'Bangalore', ctc: 12 });
  const [salaryResult, setSalaryResult] = useState<{marketRange: string, verdict: string, script: string} | null>(null);
  const [isCheckingSalary, setIsCheckingSalary] = useState(false);

  // Boardroom Feed State
  const [boardroomPosts, setBoardroomPosts] = useState(MOCK_POSTS);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [peerComment, setPeerComment] = useState('');
  const [hasPostedToCommunity, setHasPostedToCommunity] = useState(false);

  // Load Kitty Data (Saral Only)
  useEffect(() => {
    if (isSaral) {
        const storedKitty = localStorage.getItem('kittyGroup');
        if (storedKitty) setKittyGroup(JSON.parse(storedKitty));
    }
  }, [isSaral]);

  // --- Saral Handlers ---
  const handleAddTempMember = () => {
    if(newMemberName.trim()) {
        setTempMembers([...tempMembers, newMemberName.trim()]);
        setNewMemberName('');
    }
  };

  const handleCreateGroup = () => {
    if (!tempGroupName || !tempAmount || tempMembers.length === 0) {
        alert("Please fill in all details and add at least one member.");
        return;
    }
    const newGroup: KittyGroup = {
        name: tempGroupName,
        amount: parseInt(tempAmount),
        members: tempMembers.map(name => ({
            id: Date.now().toString() + Math.random().toString(),
            name,
            hasPaid: false
        })),
    };
    setKittyGroup(newGroup);
    localStorage.setItem('kittyGroup', JSON.stringify(newGroup));
  };

  const handleTogglePayment = (memberId: string) => {
    if(!kittyGroup) return;
    const updatedMembers = kittyGroup.members.map(m => 
        m.id === memberId ? { ...m, hasPaid: !m.hasPaid } : m
    );
    const updatedGroup = { ...kittyGroup, members: updatedMembers };
    setKittyGroup(updatedGroup);
    localStorage.setItem('kittyGroup', JSON.stringify(updatedGroup));
  };

  const handleSetWinner = (memberId: string) => {
      if(!kittyGroup) return;
      const updatedGroup = { ...kittyGroup, currentWinnerId: memberId };
      setKittyGroup(updatedGroup);
      localStorage.setItem('kittyGroup', JSON.stringify(updatedGroup));
  };

  const handleUpdateBid = (amount: string) => {
      if(!kittyGroup) return;
      const updatedGroup = { ...kittyGroup, winningBid: parseInt(amount) || 0 };
      setKittyGroup(updatedGroup);
      localStorage.setItem('kittyGroup', JSON.stringify(updatedGroup));
  };

  const handleResetMonth = () => {
      if(!kittyGroup) return;
      if(!window.confirm("Start new month? This clears current payments.")) return;
      const updatedMembers = kittyGroup.members.map(m => ({ ...m, hasPaid: false }));
      const updatedGroup = { 
          ...kittyGroup, 
          members: updatedMembers, 
          currentWinnerId: undefined, 
          winningBid: undefined 
      };
      setKittyGroup(updatedGroup);
      localStorage.setItem('kittyGroup', JSON.stringify(updatedGroup));
  };

  const handleDeleteGroup = () => {
      if(window.confirm("Delete this group and all data?")) {
          setKittyGroup(null);
          localStorage.removeItem('kittyGroup');
          setTempGroupName('');
          setTempAmount('');
          setTempMembers([]);
      }
  };

  // --- Smart Handlers ---
  const handleRoast = async () => {
      setIsRoasting(true);
      setRoastResult(null);
      setHasPostedToCommunity(false);
      try {
          const result = await roastPortfolio({ 
              age: portfolio.age, 
              allocation: { Stocks: portfolio.stocks, FD: portfolio.fd, Gold: portfolio.gold, Crypto: portfolio.crypto } 
          });
          setRoastResult(result);
      } catch (e) {
          alert("Roast machine broken.");
      } finally {
          setIsRoasting(false);
      }
  };

  const handleSalaryCheck = async () => {
      setIsCheckingSalary(true);
      setSalaryResult(null);
      setHasPostedToCommunity(false);
      try {
          const result = await checkSalary(salaryForm);
          setSalaryResult(result);
      } catch (e) {
          alert("Could not fetch salary data.");
      } finally {
          setIsCheckingSalary(false);
      }
  };

  const handlePostToBoardroom = () => {
      if(hasPostedToCommunity) return;
      
      const newPost = {
          id: Date.now().toString(),
          type: smartTab,
          title: smartTab === 'salary' 
            ? `${salaryForm.role}, ${salaryForm.exp} YOE, ${salaryForm.location}`
            : `${portfolio.age}Y Old, ${portfolio.stocks}% Equity`,
          details: smartTab === 'salary'
            ? `Current CTC: ${salaryForm.ctc} LPA. AI Verdict: ${salaryResult?.verdict}`
            : `Allocation: Stocks ${portfolio.stocks}%, FD ${portfolio.fd}%, Gold ${portfolio.gold}%, Crypto ${portfolio.crypto}%. AI Score: ${roastResult?.score}/10`,
          timestamp: 'Just now',
          reviews: []
      };

      setBoardroomPosts([newPost, ...boardroomPosts]);
      setHasPostedToCommunity(true);
      alert("Posted anonymously! Wait for peers to destroy... err, review you.");
  };

  const handleAddReview = () => {
      if(!peerComment.trim() || !selectedPost) return;
      
      const randomAlias = ALIASES[Math.floor(Math.random() * ALIASES.length)];
      
      const newReview = {
          id: Date.now().toString(),
          author: randomAlias,
          text: peerComment,
          sentiment: 'neutral'
      };

      const updatedPosts = boardroomPosts.map(post => 
          post.id === selectedPost.id 
          ? { ...post, reviews: [...post.reviews, newReview] }
          : post
      );

      setBoardroomPosts(updatedPosts);
      // Update selected post view as well
      setSelectedPost({ ...selectedPost, reviews: [...selectedPost.reviews, newReview] });
      setPeerComment('');
  };

  // --- Render for Smart User (Urban) ---
  if (!isSaral) {
      return (
          <div className="min-h-screen bg-vintage-paper pb-20 pt-8">
              <div className="container mx-auto px-4">
                  <div className="text-center mb-10">
                      <h1 className="text-5xl font-serif text-india-blue text-stroke-sm mb-2">The Boardroom</h1>
                      <p className="font-sans text-gray-600 uppercase tracking-widest text-sm font-bold">Anonymous Benchmarking & Social Proof</p>
                  </div>

                  <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Tool Area */}
                    <div className="lg:col-span-2 bg-india-cream border-[8px] border-double border-black shadow-pop p-2 h-fit">
                        {/* Tabs */}
                        <div className="flex border-b-4 border-black bg-white">
                            <button 
                                onClick={() => setSmartTab('roast')}
                                className={`flex-1 py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${smartTab === 'roast' ? 'bg-india-chili text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Flame size={20} /> Portfolio Roast
                            </button>
                            <button 
                                onClick={() => setSmartTab('salary')}
                                className={`flex-1 py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${smartTab === 'salary' ? 'bg-india-green text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Briefcase size={20} /> Salary Poker
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8">
                            {smartTab === 'roast' ? (
                                <div className="space-y-6">
                                    {/* Roast Input */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Your Age</label>
                                                <input type="number" value={portfolio.age} onChange={e => setPortfolio({...portfolio, age: parseInt(e.target.value)})} className="w-full p-2 border-2 border-black rounded" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase mb-1">Stocks %</label>
                                                    <input type="number" value={portfolio.stocks} onChange={e => setPortfolio({...portfolio, stocks: parseInt(e.target.value)})} className="w-full p-2 border-2 border-black rounded" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase mb-1">FD / Debt %</label>
                                                    <input type="number" value={portfolio.fd} onChange={e => setPortfolio({...portfolio, fd: parseInt(e.target.value)})} className="w-full p-2 border-2 border-black rounded" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase mb-1">Gold %</label>
                                                    <input type="number" value={portfolio.gold} onChange={e => setPortfolio({...portfolio, gold: parseInt(e.target.value)})} className="w-full p-2 border-2 border-black rounded" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase mb-1">Crypto %</label>
                                                    <input type="number" value={portfolio.crypto} onChange={e => setPortfolio({...portfolio, crypto: parseInt(e.target.value)})} className="w-full p-2 border-2 border-black rounded" />
                                                </div>
                                            </div>
                                            <button 
                                                onClick={handleRoast}
                                                disabled={isRoasting}
                                                className="w-full bg-black text-white py-3 font-bold uppercase tracking-widest hover:bg-india-chili transition-colors flex justify-center gap-2 mt-4 shadow-[4px_4px_0_0_#E32636]"
                                            >
                                                {isRoasting ? <Loader2 className="animate-spin" /> : <><Flame size={18} /> Roast Me (AI)</>}
                                            </button>
                                        </div>

                                        {/* Roast Result */}
                                        <div className="flex items-center justify-center min-h-[200px]">
                                            {!roastResult && !isRoasting && (
                                                <div className="text-center opacity-40">
                                                    <Trophy size={64} className="mx-auto mb-4" />
                                                    <p className="font-serif text-xl">Waiting for portfolio...</p>
                                                </div>
                                            )}
                                            
                                            {roastResult && (
                                                <div className="w-full space-y-4 animate-in zoom-in-95">
                                                    <div className="bg-white border-4 border-black p-4 shadow-pop rotate-1">
                                                        <div className="flex justify-between items-center border-b-2 border-dashed border-gray-300 pb-2 mb-2">
                                                            <span className="font-bold uppercase text-xs tracking-widest text-gray-500">AI Verdict</span>
                                                            <div className="bg-india-pink text-white px-3 py-1 font-black text-lg rounded-full transform -rotate-3">
                                                                {roastResult.score}/10
                                                            </div>
                                                        </div>
                                                        <p className="font-serif text-lg text-india-blue mb-2 leading-relaxed">
                                                            "{roastResult.roast}"
                                                        </p>
                                                    </div>
                                                    
                                                    {!hasPostedToCommunity ? (
                                                        <button 
                                                            onClick={handlePostToBoardroom}
                                                            className="w-full py-2 bg-india-blue text-white font-bold uppercase text-sm border-2 border-black hover:bg-white hover:text-india-blue transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Globe size={16} /> Ask Community (Anon)
                                                        </button>
                                                    ) : (
                                                        <div className="text-center text-xs font-bold text-green-600 bg-green-50 p-2 border border-green-200 rounded">
                                                            ✓ Posted to Boardroom Feed
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Salary Input */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Job Role</label>
                                                <input type="text" value={salaryForm.role} onChange={e => setSalaryForm({...salaryForm, role: e.target.value})} className="w-full p-2 border-2 border-black rounded" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase mb-1">Experience (Yrs)</label>
                                                    <input type="number" value={salaryForm.exp} onChange={e => setSalaryForm({...salaryForm, exp: parseFloat(e.target.value)})} className="w-full p-2 border-2 border-black rounded" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase mb-1">Current CTC (LPA)</label>
                                                    <input type="number" value={salaryForm.ctc} onChange={e => setSalaryForm({...salaryForm, ctc: parseFloat(e.target.value)})} className="w-full p-2 border-2 border-black rounded" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Location</label>
                                                <input type="text" value={salaryForm.location} onChange={e => setSalaryForm({...salaryForm, location: e.target.value})} className="w-full p-2 border-2 border-black rounded" />
                                            </div>
                                            <button 
                                                onClick={handleSalaryCheck}
                                                disabled={isCheckingSalary}
                                                className="w-full bg-black text-white py-3 font-bold uppercase tracking-widest hover:bg-india-green transition-colors flex justify-center gap-2 mt-4 shadow-[4px_4px_0_0_#138808]"
                                            >
                                                {isCheckingSalary ? <Loader2 className="animate-spin" /> : <><IndianRupee size={18} /> Check Market Rate (AI)</>}
                                            </button>
                                        </div>

                                        {/* Salary Result */}
                                        <div className="flex items-center justify-center min-h-[200px]">
                                            {!salaryResult && !isCheckingSalary && (
                                                <div className="text-center opacity-40">
                                                    <Briefcase size={64} className="mx-auto mb-4" />
                                                    <p className="font-serif text-xl">Enter details...</p>
                                                </div>
                                            )}

                                            {salaryResult && (
                                                <div className="w-full space-y-4 animate-in slide-in-from-right-4">
                                                    <div className="bg-white border-4 border-black p-4 shadow-pop">
                                                        <p className="text-xs uppercase font-bold text-gray-500 mb-1">Market Standard</p>
                                                        <h3 className="text-3xl font-black text-india-blue mb-2">{salaryResult.marketRange} <span className="text-sm font-medium text-black">LPA</span></h3>
                                                        <div className={`inline-block px-3 py-1 rounded text-white font-bold uppercase text-xs ${salaryResult.verdict === 'Underpaid' ? 'bg-red-500' : 'bg-green-500'}`}>
                                                            Verdict: {salaryResult.verdict}
                                                        </div>
                                                    </div>

                                                    {!hasPostedToCommunity ? (
                                                        <button 
                                                            onClick={handlePostToBoardroom}
                                                            className="w-full py-2 bg-india-blue text-white font-bold uppercase text-sm border-2 border-black hover:bg-white hover:text-india-blue transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Globe size={16} /> Validate with Peers
                                                        </button>
                                                    ) : (
                                                        <div className="text-center text-xs font-bold text-green-600 bg-green-50 p-2 border border-green-200 rounded">
                                                            ✓ Posted to Boardroom Feed
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Community Feed / Discussion Area */}
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,0.2)] h-[600px] flex flex-col">
                        <div className="bg-india-yellow p-4 border-b-4 border-black flex justify-between items-center">
                            <h3 className="font-serif text-xl flex items-center gap-2">
                                <Users size={24} /> Boardroom Pulse
                            </h3>
                            <div className="flex gap-1">
                                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-bold uppercase">Live</span>
                            </div>
                        </div>

                        {!selectedPost ? (
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 custom-scrollbar">
                                {boardroomPosts.map(post => (
                                    <div 
                                        key={post.id} 
                                        onClick={() => setSelectedPost(post)}
                                        className="bg-white p-4 border-2 border-black rounded-lg hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white ${post.type === 'salary' ? 'bg-india-green' : 'bg-india-chili'}`}>
                                                {post.type}
                                            </span>
                                            <span className="text-xs text-gray-400">{post.timestamp}</span>
                                        </div>
                                        <h4 className="font-bold text-india-blue mb-1 group-hover:underline">{post.title}</h4>
                                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{post.details}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                                            <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.reviews.length} Reviews</span>
                                            <span className="flex items-center gap-1 text-india-pink opacity-0 group-hover:opacity-100 transition-opacity">Review Now <ArrowRight size={12}/></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col h-full">
                                {/* Post Detail Header */}
                                <div className="bg-white p-4 border-b-2 border-black">
                                    <button onClick={() => setSelectedPost(null)} className="text-xs font-bold uppercase text-gray-500 hover:text-black mb-2 flex items-center gap-1">
                                        ← Back to Feed
                                    </button>
                                    <h3 className="font-bold text-lg leading-tight mb-2">{selectedPost.title}</h3>
                                    <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded border border-gray-300">
                                        {selectedPost.details}
                                    </p>
                                </div>

                                {/* Comments List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                    {selectedPost.reviews.length === 0 ? (
                                        <p className="text-center text-gray-400 text-sm italic mt-10">Be the first to review...</p>
                                    ) : (
                                        selectedPost.reviews.map((review: any) => (
                                            <div key={review.id} className="flex gap-3 animate-in slide-in-from-bottom-2">
                                                <div className="w-8 h-8 bg-india-blue rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-black shrink-0">
                                                    {review.author[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-xs uppercase text-gray-600">{review.author}</span>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-gray-300 text-sm shadow-sm">
                                                        {review.text}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add Comment */}
                                <div className="p-3 bg-white border-t-2 border-black">
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={peerComment}
                                            onChange={(e) => setPeerComment(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddReview()}
                                            placeholder="Review anonymously..."
                                            className="flex-1 p-2 border-2 border-gray-300 rounded focus:border-black outline-none text-sm"
                                        />
                                        <button 
                                            onClick={handleAddReview}
                                            disabled={!peerComment.trim()}
                                            className="bg-india-pink text-white p-2 rounded border-2 border-black hover:bg-india-blue disabled:opacity-50"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- Render for Saral User (Rural) ---
  return (
    <div className="min-h-screen bg-india-cream text-gray-800 pb-20 pt-8">
       <div className="container mx-auto px-4">
           {/* Page Title */}
           <div className="text-center mb-8">
               <div className="inline-block bg-india-pink text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest border-2 border-black shadow-pop mb-4">
                  Samuh & Sahayog
               </div>
               <h1 className="text-3xl md:text-4xl font-serif text-india-blue">Community Tools</h1>
           </div>

           {/* Tool Card */}
           <div className="max-w-xl mx-auto">
               <button 
                    onClick={() => setIsKittyModalOpen(true)}
                    className="w-full bg-white p-6 rounded-2xl border-4 border-india-pink shadow-[6px_6px_0_0_#FF007F] active:translate-y-1 active:shadow-none transition-all flex items-center justify-between group hover:bg-pink-50"
                 >
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-india-pink/10 rounded-full flex items-center justify-center border-2 border-india-pink group-hover:bg-india-pink group-hover:text-white transition-colors">
                            <Users size={32} />
                        </div>
                        <div className="text-left">
                           <h4 className="font-bold text-xl text-india-blue leading-tight mb-1">Kitty Party / BC Manager</h4>
                           <p className="text-sm text-gray-500 font-medium">Manage Group Payments & Hisaab</p>
                        </div>
                    </div>
                    <div className="bg-india-pink text-white p-2 rounded-full">
                        <ArrowRight size={24} />
                    </div>
                 </button>
           </div>
       </div>

      {/* Kitty Party Manager Modal */}
      {isKittyModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-lg bg-india-cream rounded-2xl p-0 relative border-[6px] border-india-pink shadow-pop overflow-hidden h-[85vh] flex flex-col">
                  <div className="bg-india-pink p-4 flex justify-between items-center border-b-4 border-black shrink-0">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2 font-serif">
                          <Users size={24} className="text-white" /> Kitty Manager
                      </h3>
                      <button onClick={() => setIsKittyModalOpen(false)} className="text-white hover:bg-white/20 rounded-full p-1">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="p-0 flex-1 overflow-y-auto custom-scrollbar relative">
                      {!kittyGroup ? (
                          <div className="p-6">
                              <div className="text-center mb-8">
                                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-black mx-auto mb-4 shadow-lg">
                                      <Users size={40} className="text-india-pink" />
                                  </div>
                                  <h2 className="text-2xl font-bold font-serif text-india-blue">Start New Group</h2>
                                  <p className="text-gray-600 text-sm">Create a digital register for your BC / Committee.</p>
                              </div>

                              <div className="space-y-4">
                                  <div>
                                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Group Name</label>
                                      <input 
                                          type="text" 
                                          value={tempGroupName}
                                          onChange={(e) => setTempGroupName(e.target.value)}
                                          className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white text-black"
                                          placeholder="e.g. Mahila Mandal 2024"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Monthly Amount (Per Person)</label>
                                      <input 
                                          type="number" 
                                          value={tempAmount}
                                          onChange={(e) => setTempAmount(e.target.value)}
                                          className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white text-black"
                                          placeholder="e.g. 2000"
                                      />
                                  </div>

                                  <div>
                                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Add Members ({tempMembers.length})</label>
                                      <div className="flex gap-2 mb-3">
                                          <input 
                                              type="text" 
                                              value={newMemberName}
                                              onChange={(e) => setNewMemberName(e.target.value)}
                                              onKeyDown={(e) => e.key === 'Enter' && handleAddTempMember()}
                                              className="flex-1 p-3 border-2 border-black rounded-lg font-medium bg-white text-black"
                                              placeholder="Member Name"
                                          />
                                          <button 
                                              onClick={handleAddTempMember}
                                              className="bg-black text-white px-4 rounded-lg font-bold"
                                          >
                                              Add
                                          </button>
                                      </div>
                                      
                                      <div className="flex flex-wrap gap-2">
                                          {tempMembers.map((m, i) => (
                                              <span key={i} className="bg-white border border-gray-300 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                                  {m} <button onClick={() => setTempMembers(tempMembers.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700">×</button>
                                              </span>
                                          ))}
                                          {tempMembers.length === 0 && <span className="text-gray-400 text-sm italic">No members added yet.</span>}
                                      </div>
                                  </div>

                                  <button 
                                      onClick={handleCreateGroup}
                                      className="w-full bg-india-pink text-white font-bold text-lg py-4 rounded-xl border-2 border-black shadow-pop active:shadow-none active:translate-y-1 transition-all mt-4"
                                  >
                                      Create Register
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <div className="p-6 pb-24">
                              {/* Dashboard Header */}
                              <div className="bg-white p-4 rounded-xl border-2 border-india-blue shadow-sm mb-6">
                                  <div className="flex justify-between items-start mb-2">
                                      <h3 className="font-bold text-xl text-india-blue">{kittyGroup.name}</h3>
                                      <button onClick={handleDeleteGroup} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                  </div>
                                  <div className="flex justify-between items-end">
                                      <div>
                                          <p className="text-xs text-gray-500 uppercase font-bold">Total Pot Value</p>
                                          <p className="text-3xl font-black text-india-pink">₹{kittyGroup.amount * kittyGroup.members.length}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-xs text-gray-500 uppercase font-bold">Collected</p>
                                          <p className="text-xl font-bold text-green-600">
                                              ₹{kittyGroup.members.filter(m => m.hasPaid).length * kittyGroup.amount}
                                          </p>
                                      </div>
                                  </div>
                                  {/* Progress Bar */}
                                  <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
                                      <div 
                                          className="bg-green-500 h-full transition-all duration-500" 
                                          style={{ width: `${(kittyGroup.members.filter(m => m.hasPaid).length / kittyGroup.members.length) * 100}%` }}
                                      ></div>
                                  </div>
                              </div>

                              {/* Member List */}
                              <div className="mb-6">
                                  <h4 className="font-bold text-gray-600 mb-3 flex items-center gap-2">
                                      <Users size={16} /> Members & Payment
                                  </h4>
                                  <div className="space-y-2">
                                      {kittyGroup.members.map((member) => (
                                          <div key={member.id} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${member.hasPaid ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                                              <div className="flex items-center gap-3">
                                                  <button 
                                                      onClick={() => handleTogglePayment(member.id)}
                                                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${member.hasPaid ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-200'}`}
                                                  >
                                                      <CheckCircle2 size={16} />
                                                  </button>
                                                  <span className={`font-bold ${member.hasPaid ? 'text-gray-800' : 'text-gray-500'}`}>{member.name}</span>
                                              </div>
                                              
                                              {/* Winner Selection */}
                                              <button 
                                                  onClick={() => handleSetWinner(member.id)}
                                                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase border flex items-center gap-1 ${kittyGroup.currentWinnerId === member.id ? 'bg-india-yellow text-black border-black shadow-sm' : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-100'}`}
                                              >
                                                  <Crown size={12} /> {kittyGroup.currentWinnerId === member.id ? 'Winner' : 'Select'}
                                              </button>
                                          </div>
                                      ))}
                                  </div>
                              </div>

                              {/* Auction Calculator */}
                              <div className="bg-india-yellow/10 border-2 border-india-yellow rounded-xl p-4 mb-20">
                                  <h4 className="font-bold text-india-blue mb-3 flex items-center gap-2">
                                      <Calculator size={16} /> Interest Calculator (Optional)
                                  </h4>
                                  <div className="flex gap-4 items-center mb-4">
                                      <div className="flex-1">
                                          <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Winning Bid (Boli)</label>
                                          <input 
                                              type="number" 
                                              value={kittyGroup.winningBid || ''}
                                              onChange={(e) => handleUpdateBid(e.target.value)}
                                              className="w-full p-2 border-2 border-black rounded font-bold bg-white text-black"
                                              placeholder="₹ 0"
                                          />
                                      </div>
                                      {kittyGroup.winningBid && kittyGroup.winningBid > 0 && (
                                          <div className="flex-1">
                                               <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Profit / Member</label>
                                               <div className="text-xl font-black text-green-600">
                                                   ₹{Math.round(kittyGroup.winningBid / kittyGroup.members.length)}
                                               </div>
                                          </div>
                                      )}
                                  </div>
                                  
                                  {kittyGroup.winningBid && kittyGroup.winningBid > 0 && (
                                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                                          <div className="flex justify-between mb-1">
                                              <span className="text-gray-500">Total Pot:</span>
                                              <span className="font-bold">₹{kittyGroup.amount * kittyGroup.members.length}</span>
                                          </div>
                                          <div className="flex justify-between mb-1 text-red-500">
                                              <span>Less Bid:</span>
                                              <span className="font-bold">- ₹{kittyGroup.winningBid}</span>
                                          </div>
                                          <div className="border-t border-dashed border-gray-300 my-2 pt-1 flex justify-between text-lg">
                                              <span className="font-bold text-india-blue">Winner Takes Home:</span>
                                              <span className="font-black text-india-blue">₹{(kittyGroup.amount * kittyGroup.members.length) - kittyGroup.winningBid}</span>
                                          </div>
                                      </div>
                                  )}
                              </div>

                              {/* Floating Footer Action */}
                              <div className="absolute bottom-6 left-0 right-0 px-6 text-center">
                                  <button 
                                      onClick={handleResetMonth}
                                      className="w-full bg-black text-white font-bold text-lg py-3 rounded-xl border-2 border-gray-600 shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                                  >
                                      <RefreshCw size={20} /> Start New Month
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

export default CommunityPage;