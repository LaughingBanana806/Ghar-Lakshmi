import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, PieChart, Coins, Calculator, Zap, LineChart, Landmark, Briefcase, Scale, Gem, Umbrella, Sparkles, X, Video, Loader2, Clapperboard, Search } from 'lucide-react';
import { ExplanationResult } from '../types';
import { DecorativeCorner, LotusIcon, Sunburst } from './GeometricDecorations';
import { generateConceptVideo } from '../services/videoService';

const conceptCategories = [
  {
    title: "Investing Basics",
    subtitle: "Nivesh ki ABC",
    concepts: [
      {
        title: "SIP",
        subtitle: "Small Drops, Big Ocean",
        icon: <Calculator className="w-8 h-8" />,
        desc: "Invest small amounts regularly. Consistency is king! Discipline creates wealth.",
        bg: "bg-india-purple",
        border: "border-india-green"
      },
      {
        title: "Compound Interest",
        subtitle: "The 8th Wonder",
        icon: <Zap className="w-8 h-8" />,
        desc: "Money making more money. The magic of time that Einstein praised.",
        bg: "bg-india-chili",
        border: "border-india-yellow"
      },
      {
        title: "Diversification",
        subtitle: "Not All Eggs in One Basket",
        icon: <PieChart className="w-8 h-8" />,
        desc: "Like a Thali meal - a little bit of everything is best for health.",
        bg: "bg-india-blue",
        border: "border-india-marigold"
      },
      {
        title: "Dividends",
        subtitle: "Bonus Pay",
        icon: <Coins className="w-8 h-8" />,
        desc: "When the company shares its laddu with you.",
        bg: "bg-india-marigold",
        border: "border-india-blue"
      },
    ]
  },
  {
    title: "Market Concepts",
    subtitle: "Bazaar ki Baatein",
    concepts: [
       {
        title: "Bull & Bear",
        subtitle: "Tezi vs Mandi",
        icon: <LineChart className="w-8 h-8" />,
        desc: "Bull runs up (profit), Bear swipes down (loss). Know your jungle.",
        bg: "bg-india-blue",
        border: "border-india-pink"
      },
      {
        title: "IPO",
        subtitle: "First Show Ticket",
        icon: <Briefcase className="w-8 h-8" />,
        desc: "Buying shares when a company first enters the market. High risk, high drama.",
        bg: "bg-india-pink",
        border: "border-white"
      },
    ]
  },
  {
    title: "Savings & Safety",
    subtitle: "Bachat aur Suraksha",
    concepts: [
      {
        title: "Emergency Fund",
        subtitle: "Rainy Day Savings",
        icon: <ShieldCheck className="w-8 h-8" />,
        desc: "Money kept under the mattress (bank) for when trouble knocks.",
        bg: "bg-india-green",
        border: "border-india-cream"
      },
      {
        title: "Fixed Deposit",
        subtitle: "Safe & Sound",
        icon: <Landmark className="w-8 h-8" />,
        desc: "Low risk, steady return. The classic Indian choice for peace of mind.",
        bg: "bg-india-green",
        border: "border-india-marigold"
      },
      {
        title: "Insurance",
        subtitle: "Safety Chhatri",
        icon: <Umbrella className="w-8 h-8" />,
        desc: "Protection for life and health. Essential umbrella for rainy days.",
        bg: "bg-india-blue",
        border: "border-india-green"
      },
      {
        title: "Gold",
        subtitle: "Sona Kitna Sona Hai",
        icon: <Gem className="w-8 h-8" />,
        desc: "The evergreen hedge against bad times. A tradition that pays off.",
        bg: "bg-india-yellow",
        border: "border-black"
      },
    ]
  },
  {
    title: "Essential Concepts",
    subtitle: "Zaroori Gyaan",
    concepts: [
      {
        title: "Inflation",
        subtitle: "The Price Rise Monster",
        icon: <TrendingUp className="w-8 h-8" />,
        desc: "Why your Chai costs ₹10 today but was ₹2 yesterday.",
        bg: "bg-india-pink",
        border: "border-india-yellow"
      },
      {
        title: "Credit Score",
        subtitle: "Reputation Meter",
        icon: <Scale className="w-8 h-8" />,
        desc: "Keep it high to get loans easily. Don't be a Defaulter!",
        bg: "bg-india-marigold",
        border: "border-india-purple"
      }
    ]
  }
];

const allConcepts = conceptCategories.flatMap(category => category.concepts);

const staticExplanations: Record<string, ExplanationResult> = {
  "Inflation": {
    concept: "Inflation",
    simpleDefinition: "The silent killer of wealth. It is the rate at which prices rise, making your money worth less over time.",
    analogy: "Imagine a greedy mouse in your rice sack. You stored 10kg, but the mouse eats a little every day. After a year, the sack is lighter. The mouse is Inflation!",
    keyTakeaway: "Invest in assets that grow faster than the mouse eats! FDs might not be enough."
  },
  "Diversification": {
    concept: "Diversification",
    simpleDefinition: "Spreading your investments across different assets to reduce risk.",
    analogy: "Don't carry all your eggs in one basket. If you trip, everything breaks! Put some in a bag, some in a box, some in the fridge. That is diversification.",
    keyTakeaway: "Mix Stocks, Gold, and FDs for a healthy financial thali."
  },
  "Emergency Fund": {
    concept: "Emergency Fund",
    simpleDefinition: "Savings set aside specifically for unexpected financial shocks.",
    analogy: "Like a spare tyre in your car. You hope you never use it, but when you get a puncture on a lonely highway, it saves your life.",
    keyTakeaway: "Keep 6 months of expenses in a liquid fund. Peace of mind guaranteed."
  },
  "Dividends": {
    concept: "Dividends",
    simpleDefinition: "A portion of company profits distributed to shareholders.",
    analogy: "You bought a cow (stock). It gives milk (dividends). You keep the cow, and you drink the milk too!",
    keyTakeaway: "Look for companies that share their laddus with you regularly."
  },
  "SIP": {
    concept: "SIP (Systematic Investment Plan)",
    simpleDefinition: "Investing a fixed amount regularly in a mutual fund.",
    analogy: "Like watering a plant drop by drop. One bucket floods it, but daily drops make it a mighty tree over time.",
    keyTakeaway: "Consistency beats intensity. Small regular investments create big wealth."
  },
  "Compound Interest": {
    concept: "Compound Interest",
    simpleDefinition: "Interest calculated on the initial principal and also on the accumulated interest.",
    analogy: "Your money has babies, and those babies have babies! Soon you have a giant joint family of wealth.",
    keyTakeaway: "Start early! Time is the magic ingredient."
  },
  "Bull & Bear": {
    concept: "Bull & Bear Markets",
    simpleDefinition: "Terms used to describe market trends. Bull = Rising, Bear = Falling.",
    analogy: "Bull throws the market up with its horns. Bear swipes the market down with its paws. It's the jungle dance!",
    keyTakeaway: "Don't fear the Bear; buy when it swipes down. Ride the Bull when it charges."
  },
  "Fixed Deposit": {
    concept: "Fixed Deposit",
    simpleDefinition: "A low-risk investment where you deposit money for a fixed period at a fixed rate.",
    analogy: "Like putting money in Grandma's iron trunk. Safe, secure, no drama, but moves slowly like a tortoise.",
    keyTakeaway: "Good for safety, but often loses the race against Inflation."
  },
  "IPO": {
    concept: "IPO (Initial Public Offering)",
    simpleDefinition: "When a private company offers shares to the public for the first time.",
    analogy: "First Day, First Show of a new movie! Everyone wants a ticket. Might be a blockbuster, might be a flop.",
    keyTakeaway: "Read the reviews (prospectus) before joining the queue!"
  },
  "Credit Score": {
    concept: "Credit Score",
    simpleDefinition: "A number that depicts a consumer's creditworthiness.",
    analogy: "Your financial report card. If you failed previous exams (missed payments), the Principal (Bank) won't give you admission (Loan).",
    keyTakeaway: "Pay bills on time. A high score opens VIP doors."
  },
  "Gold": {
    concept: "Gold",
    simpleDefinition: "A precious metal used as an investment and hedge against economic downturns.",
    analogy: "The family heirloom. When paper money burns or markets crash, Gold shines. It is the ultimate crisis friend.",
    keyTakeaway: "Allocate 5-10% for safety. It's insurance, not just jewelry."
  },
  "Insurance": {
    concept: "Insurance",
    simpleDefinition: "A contract providing financial protection against specified losses.",
    analogy: "Like wearing a helmet. It doesn't stop the accident, but it saves your head when you fall.",
    keyTakeaway: "Don't drive the vehicle of life without a helmet. Term & Health insurance are mandatory."
  }
};

const ConceptCard = ({ item, idx, onExplain }: any) => (
  <div 
    className={`group relative ${item.bg} p-2 shadow-pop hover:shadow-pop-hover hover:-translate-y-1 transition-all duration-300 opacity-0 animate-pop-in`}
    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'forwards' }}
    onClick={() => onExplain(item.title)}
  >
    <DecorativeCorner className="absolute -top-2 -left-2 w-6 h-6 z-20 border-white" />
    <DecorativeCorner className="absolute -bottom-2 -right-2 w-6 h-6 z-20 border-white rotate-180" />

    <div className={`h-full border-4 ${item.border} p-6 flex flex-col items-center text-center relative bg-white/10 backdrop-blur-sm cursor-pointer`}>
      <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full"></div>
      <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
      <div className="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full"></div>
      <div className="absolute bottom-2 right-2 w-2 h-2 bg-white rounded-full"></div>

      <div className="w-20 h-20 bg-white rounded-full border-4 border-black flex items-center justify-center text-black mb-4 shadow-md group-hover:rotate-12 transition-transform duration-300">
        {item.icon}
      </div>
      
      <h3 className="text-2xl font-serif font-bold text-white uppercase mb-1 drop-shadow-md leading-none">
        {item.title}
      </h3>
      <span className="text-xs font-sans font-bold text-black bg-white/80 px-2 py-1 rounded mb-4 inline-block mt-2 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">
          {item.subtitle}
      </span>
      
      <p className="font-sans text-white text-sm font-medium leading-relaxed drop-shadow-sm mb-4">
        {item.desc}
      </p>

      <div className="mt-auto w-full">
          <button
              onClick={(e) => {
                  e.stopPropagation();
                  onExplain(item.title);
              }}
              className="w-full bg-black text-india-yellow font-bold uppercase text-xs px-4 py-3 rounded shadow-[4px_4px_0_0_rgba(255,255,255,0.4)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 border-2 border-india-yellow group-hover:bg-white group-hover:text-black group-hover:border-black"
          >
              <Sparkles size={14} className="animate-pulse" />
              Samjhao Guru-ji!
          </button>
          
          <div className="flex justify-between items-end opacity-60 mt-4">
              <span className="text-[10px] uppercase tracking-widest text-white">Series A</span>
              <span className="text-[10px] uppercase tracking-widest text-white">#{idx+1 < 10 ? `0${idx+1}` : idx+1}</span>
          </div>
      </div>
    </div>
  </div>
);


const GyaanPage: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Video Generation State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  
  const handleExplain = (conceptTitle: string) => {
    setSelectedConcept(conceptTitle);
    
    const result = staticExplanations[conceptTitle] || {
        concept: conceptTitle,
        simpleDefinition: "Concept details coming soon!",
        analogy: "Guru-ji is meditating on this topic.",
        keyTakeaway: "Stay tuned for wisdom."
    };
    
    setExplanation(result);
  };

  const closeExplain = () => {
    setSelectedConcept(null);
    setExplanation(null);
    setVideoUrl(null);
    setIsVideoLoading(false);
  };

  const handleGenerateVideo = async () => {
    if (!explanation) return;
    
    try {
        if ((window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
            }
        }

        setIsVideoLoading(true);
        const url = await generateConceptVideo(explanation.concept, explanation.analogy);
        setVideoUrl(url);
    } catch (error) {
        console.error("Video generation failed:", error);
        alert("Oops! Guru-ji's camera jammed. Please ensure you have selected a valid API key and try again.");
    } finally {
        setIsVideoLoading(false);
    }
  };

  const isSearching = searchQuery.trim() !== '';
  
  const searchFilteredConcepts = isSearching ? allConcepts.filter(concept =>
    concept.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concept.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concept.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  let conceptIndex = 0;

  return (
    <div className="min-h-screen pt-0 pb-24 relative overflow-hidden bg-vintage-paper">
      <div className="fixed inset-0 pointer-events-none z-0">
        <Sunburst className="absolute top-0 left-0 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 text-india-marigold opacity-10" />
        <div className="absolute right-0 top-1/4 w-32 h-full bg-pattern-checkers opacity-5"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-8">
        
        <div className="text-center mb-8 relative">
           <div className="absolute top-1/2 left-0 w-full h-1 bg-india-black opacity-20 -z-10"></div>
           <div className="inline-block bg-india-yellow px-8 py-4 border-4 border-black shadow-pop rotate-1">
             <div className="flex items-center justify-center gap-3 mb-2">
                <LotusIcon className="w-8 h-8 text-india-pink animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-widest text-black">Knowledge Warehouse</span>
                <LotusIcon className="w-8 h-8 text-india-pink animate-pulse" />
             </div>
             <h1 className="text-5xl md:text-7xl font-serif text-india-blue text-stroke-sm drop-shadow-md">
                Gyaan Bhandar
             </h1>
           </div>
        </div>

        <div className="mb-12 max-w-2xl mx-auto">
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search concepts like 'SIP', 'Tax', 'Gold'..."
                    className="w-full text-lg font-sans p-4 pl-12 border-4 border-black rounded-full shadow-[4px_4px_0_0_black] focus:outline-none focus:ring-4 focus:ring-india-pink transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
        </div>

        {/* Content: Conditional rendering for search vs categorized view */}
        {isSearching ? (
          <>
            {searchFilteredConcepts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {searchFilteredConcepts.map((item, idx) => (
                  <ConceptCard key={item.title} item={item} idx={idx} onExplain={handleExplain} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 animate-in fade-in">
                  <div className="inline-block bg-white p-8 rounded-xl border-4 border-dashed border-india-chili rotate-[-2deg] shadow-lg">
                      <h3 className="text-3xl font-serif text-india-chili mb-2">Aiyyo!</h3>
                      <p className="font-sans text-gray-700">No wisdom found for "{searchQuery}".<br/>Try another word!</p>
                  </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-16">
            {conceptCategories.map((category) => (
              <section key={category.title}>
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-serif text-india-purple mb-1 drop-shadow-sm">{category.title}</h2>
                  <p className="font-sans font-bold text-india-green bg-india-green/10 inline-block px-3 py-1 rounded-full text-sm">{category.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {category.concepts.map((item) => {
                    const card = <ConceptCard key={item.title} item={item} idx={conceptIndex} onExplain={handleExplain} />;
                    conceptIndex++;
                    return card;
                  })}
                </div>
              </section>
            ))}
          </div>
        )}


        {/* Modal Overlay */}
        {selectedConcept && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeExplain}>
                <div className="relative w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={closeExplain}
                        className="absolute -top-4 -right-4 z-10 bg-white text-black p-2 rounded-full border-4 border-black shadow-pop hover:scale-110 transition-transform"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>

                    {explanation ? (
                        <div className="bg-india-yellow border-8 border-black p-2 shadow-[10px_10px_0_0_#E11D74] animate-in zoom-in-95 duration-300">
                            <div className="bg-white border-4 border-black p-6 md:p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                <div className="flex justify-between items-start pb-4 mb-4">
                                    <div>
                                        <span className="bg-india-pink text-white text-xs font-bold px-2 py-1 uppercase tracking-widest rounded-sm">Concept</span>
                                        <h3 className="text-3xl md:text-5xl font-serif text-india-chili mt-2 leading-none">{explanation.concept}</h3>
                                    </div>
                                    <div className="hidden md:flex w-14 h-14 bg-india-green rounded-full items-center justify-center text-white font-serif text-2xl border-2 border-black shadow-sm">
                                        ₹
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <h4 className="font-sans font-bold text-india-blue uppercase tracking-wider mb-2 flex items-center gap-2 text-sm">
                                        <span className="w-2 h-2 bg-india-blue rounded-full"></span> 
                                        Seedha-Saadha Meaning
                                    </h4>
                                    <p className="text-lg font-medium leading-relaxed font-sans text-gray-800">{explanation.simpleDefinition}</p>
                                </div>
                                <div className="bg-india-cream p-5 rounded-xl border-2 border-india-marigold mb-6 relative overflow-hidden">
                                    <div className="absolute -right-2 -top-2 text-india-marigold opacity-20">
                                        <LotusIcon className="w-20 h-20" />
                                    </div>
                                    <h4 className="font-sans font-bold text-india-chili uppercase tracking-wider mb-2 text-sm">Desi Style Example</h4>
                                    <p className="text-xl italic font-serif text-gray-900 relative z-10 leading-relaxed">"{explanation.analogy}"</p>
                                </div>
                                <div className="bg-india-blue text-white p-5 text-center border-4 border-double border-white shadow-md transform -rotate-1">
                                    <h4 className="font-bold text-xs uppercase opacity-75 mb-2">Guru Mantra</h4>
                                    <p className="text-xl md:text-2xl font-serif">"{explanation.keyTakeaway}"</p>
                                </div>
                                <div className="mt-8 pt-6 border-t-4 border-dashed border-gray-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Clapperboard className="w-6 h-6 text-india-purple" />
                                        <h4 className="font-sans font-bold text-india-purple uppercase tracking-wider">Guru-ji's Cinema</h4>
                                    </div>
                                    {!videoUrl && !isVideoLoading && (
                                        <div className="bg-india-cream p-6 rounded-xl border-2 border-india-purple text-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
                                            <p className="font-serif text-lg mb-4 text-gray-700 relative z-10">See this concept come to life in a magical video!</p>
                                            <button 
                                                onClick={handleGenerateVideo}
                                                className="bg-india-purple text-white font-bold uppercase px-6 py-3 rounded shadow-pop hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 mx-auto border-2 border-white relative z-10"
                                            >
                                                <Video size={18} />
                                                Generate Video Explanation
                                            </button>
                                            <p className="text-[10px] mt-3 text-gray-500 font-sans uppercase tracking-widest relative z-10">
                                                Powered by Veo • Requires API Key
                                            </p>
                                        </div>
                                    )}
                                    {isVideoLoading && (
                                        <div className="bg-india-cream p-8 rounded-xl border-2 border-india-purple text-center flex flex-col items-center justify-center min-h-[200px]">
                                            <Loader2 className="w-10 h-10 text-india-pink animate-spin mb-4" />
                                            <p className="font-serif text-xl text-india-chili animate-pulse">Lights, Camera, Action...</p>
                                            <p className="font-sans text-sm text-gray-600 mt-2">Generating your financial blockbuster. This may take a minute.</p>
                                        </div>
                                    )}
                                    {videoUrl && (
                                        <div className="bg-black p-2 rounded-xl border-4 border-india-marigold shadow-pop">
                                            <video 
                                                controls 
                                                autoPlay 
                                                className="w-full rounded-lg aspect-video"
                                                src={videoUrl}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                            <div className="mt-2 text-right">
                                                 <a href={videoUrl} download="guru-ji-wisdom.mp4" className="text-white text-xs underline hover:text-india-yellow">Download Video</a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 text-center border-4 border-red-500 rounded-lg shadow-pop transform rotate-2">
                            <h3 className="text-2xl font-bold text-red-600 mb-2">Aiyyo!</h3>
                            <p className="font-sans">Content not found.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="mt-16 text-center">
            <p className="font-serif text-2xl text-india-chili bg-india-cream inline-block px-6 py-2 border-2 border-dashed border-india-chili rotate-[-1deg]">
                ★ More Wisdom Added Every Full Moon! ★
            </p>
        </div>
      </div>
    </div>
  );
};

export default GyaanPage;