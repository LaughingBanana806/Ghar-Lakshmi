import React from 'react';
import { LotusIcon, DecorativeCorner } from './GeometricDecorations';

const ExplainerTool: React.FC = () => {
  // Static content to replace the dynamic API call
  const result = {
    concept: "Compound Interest",
    simpleDefinition: "Interest on interest. It's like your money having babies, and then those babies having babies!",
    analogy: "Imagine planting a mango tree. First year, you get 10 mangoes. Instead of eating them, you plant their seeds. A few years later, you have an orchard! That is the magic of compounding.",
    keyTakeaway: "Start early! Time is the hero in this movie, not just the money."
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-12 px-4">
      {/* Container - Vintage Frame Look */}
      <div className="bg-india-cream border-[16px] border-double border-india-chili shadow-pop p-8 md:p-12 relative clip-ticket">
        {/* Corner Decorations */}
        <DecorativeCorner className="absolute top-4 left-4 border-india-blue" />
        <DecorativeCorner className="absolute top-4 right-4 border-india-blue border-l-0 border-t-0 border-r-4 border-t-4 rotate-90" />
        <DecorativeCorner className="absolute bottom-4 left-4 border-india-blue border-l-0 border-b-0 border-r-4 border-b-4 -rotate-90" />
        <DecorativeCorner className="absolute bottom-4 right-4 border-india-blue border-r-0 border-b-0 border-l-4 border-b-4 rotate-180" />

        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
             <LotusIcon className="w-12 h-12 text-india-pink" />
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-india-purple mb-2">
             Guru-ji's Spotlight
          </h2>
          <p className="text-xl font-sans font-bold text-india-green bg-india-green/10 inline-block px-4 py-1 rounded-full">
            Today's Financial Wisdom
          </p>
        </div>

        {/* Static Content Display */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Result Card - Matchbox Style */}
            <div className="bg-india-yellow border-8 border-black p-2 shadow-[10px_10px_0_0_#E11D74] transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white border-4 border-black p-6 md:p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-4 border-dashed border-gray-300 pb-6 mb-6">
                        <div>
                            <span className="bg-india-pink text-white text-xs font-bold px-2 py-1 uppercase tracking-widest rounded-sm">Concept of the Day</span>
                            <h3 className="text-4xl md:text-5xl font-serif text-india-chili mt-2 leading-none">{result.concept}</h3>
                        </div>
                        <div className="w-16 h-16 bg-india-green rounded-full flex items-center justify-center text-white font-serif text-2xl border-4 border-black shadow-sm">
                            ₹
                        </div>
                    </div>

                    {/* Definition */}
                    <div className="mb-8">
                         <h4 className="font-sans font-bold text-india-blue uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-india-blue rounded-full"></span> 
                            Seedha-Saadha Meaning
                         </h4>
                         <p className="text-xl font-medium leading-relaxed font-sans">{result.simpleDefinition}</p>
                    </div>

                    {/* Analogy */}
                    <div className="bg-india-cream p-6 rounded-xl border-2 border-india-marigold mb-8 relative overflow-hidden">
                         <div className="absolute -right-4 -top-4 text-india-marigold opacity-20">
                            <LotusIcon className="w-24 h-24" />
                         </div>
                         <h4 className="font-sans font-bold text-india-chili uppercase tracking-wider mb-2">Desi Style Example</h4>
                         <p className="text-lg italic font-serif text-gray-800 relative z-10">"{result.analogy}"</p>
                    </div>

                    {/* Takeaway */}
                    <div className="bg-india-blue text-white p-6 text-center border-4 border-double border-white shadow-md transform -rotate-1">
                        <h4 className="font-bold text-sm uppercase opacity-75 mb-1">Guru Mantra</h4>
                        <p className="text-2xl font-serif">"{result.keyTakeaway}"</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainerTool;