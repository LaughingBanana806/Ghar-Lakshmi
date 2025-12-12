import React from 'react';
import { TrendingUp, ShieldCheck, PieChart, Coins, ArrowRight } from 'lucide-react';
import { DecorativeCorner } from './GeometricDecorations';

const concepts = [
  {
    title: "Inflation",
    subtitle: "The Price Rise Monster",
    icon: <TrendingUp className="w-8 h-8" />,
    desc: "Why your Chai costs ₹10 today but was ₹2 yesterday.",
    bg: "bg-india-pink",
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
    title: "Emergency Fund",
    subtitle: "Rainy Day Savings",
    icon: <ShieldCheck className="w-8 h-8" />,
    desc: "Money kept under the mattress (bank) for when trouble knocks.",
    bg: "bg-india-green",
    border: "border-india-cream"
  },
  {
    title: "Dividends",
    subtitle: "Bonus Pay",
    icon: <Coins className="w-8 h-8" />,
    desc: "When the company shares its laddu with you.",
    bg: "bg-india-marigold",
    border: "border-india-blue"
  }
];

interface InfoCardsProps {
  onViewMore?: (e: React.MouseEvent) => void;
}

const InfoCards: React.FC<InfoCardsProps> = ({ onViewMore }) => {
  return (
    <section className="py-24 bg-india-purple relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
           <h2 className="text-5xl md:text-7xl font-serif text-india-yellow mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] text-stroke-sm">
             Golden Rules
           </h2>
           <div className="inline-block bg-white text-india-purple px-6 py-2 font-bold font-sans uppercase rounded-full shadow-lg transform rotate-2">
              Guaranteed Wisdom!
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {concepts.map((item, idx) => (
            <div 
              key={idx} 
              className={`group relative ${item.bg} p-2 shadow-pop hover:shadow-pop-hover hover:-translate-y-2 transition-all duration-300`}
            >
              <div className={`h-full border-4 ${item.border} p-6 flex flex-col items-center text-center relative bg-white/10 backdrop-blur-sm`}>
                <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full"></div>
                <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                <div className="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full"></div>
                <div className="absolute bottom-2 right-2 w-2 h-2 bg-white rounded-full"></div>

                <div className="w-20 h-20 bg-white rounded-full border-4 border-black flex items-center justify-center text-black mb-6 shadow-md group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-white uppercase mb-1 drop-shadow-md">
                  {item.title}
                </h3>
                <span className="text-xs font-sans font-bold text-white bg-black/20 px-2 py-1 rounded mb-4 inline-block">
                    {item.subtitle}
                </span>
                
                <p className="font-sans text-white text-sm font-medium leading-relaxed">
                  {item.desc}
                </p>

                <div className="mt-auto pt-6 w-full">
                    <div className="h-1 w-full border-t-2 border-dashed border-white/50"></div>
                    <p className="text-[10px] uppercase tracking-widest text-white mt-2 opacity-80">Ref No. 00{idx+1}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Section */}
        <div className="relative max-w-2xl mx-auto mt-12">
           <div className="border-4 border-dashed border-india-yellow/40 p-3 rounded-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
               <div className="bg-india-purple/50 backdrop-blur-md p-8 rounded-xl flex flex-col items-center justify-center gap-6 border-2 border-india-yellow text-center shadow-lg">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-3xl font-serif text-white leading-tight drop-shadow-md">
                      Thirsty for More Gyaan?
                    </h3>
                    <p className="text-india-cream font-sans opacity-80">Unlock the full treasury of financial secrets.</p>
                  </div>
                  
                  <button 
                    onClick={onViewMore}
                    className="bg-india-yellow text-black font-bold text-xl px-10 py-4 uppercase tracking-widest border-4 border-black shadow-[6px_6px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center gap-3 group relative overflow-hidden"
                  >
                    <span className="relative z-10">Explore All Concepts</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" strokeWidth={3} />
                  </button>
               </div>
           </div>
        </div>

      </div>
    </section>
  );
};

export default InfoCards;