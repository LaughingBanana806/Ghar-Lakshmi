import React from 'react';
import { LotusIcon, Sunburst, ScallopBorder } from './GeometricDecorations';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col justify-center overflow-hidden bg-india-cream border-b-8 border-double border-india-pink">
       {/* Background Patterns */}
       <div className="absolute inset-0 z-0 bg-pattern-dots opacity-20 text-india-marigold"></div>
       <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(45deg,transparent_45%,#FF9933_45%,#FF9933_55%,transparent_55%)] opacity-10"></div>
       
       <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
        
        {/* Left Side: Text */}
        <div className="flex-1 text-center md:text-left pt-12 md:pt-0">
          <div className="inline-block bg-india-chili text-white px-6 py-2 rounded-full font-sans font-bold uppercase tracking-widest mb-6 shadow-pop transform -rotate-3 border-2 border-white">
            ★ Shubh Aarambh for Your Wallet ★
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif text-india-blue leading-[1.1] drop-shadow-lg mb-6 relative">
            Master the <br/>
            <span className="text-india-pink relative inline-block">
              <span className="relative z-10">Market</span>
              <svg className="absolute -bottom-2 w-full h-4 text-india-yellow z-0" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          
          <p className="text-2xl font-sans font-medium text-gray-800 mb-8 max-w-lg bg-india-yellow/20 p-4 border-l-8 border-india-green rounded-r-xl backdrop-blur-sm">
            Don't let finance be a puzzle! Learn money matters with <span className="font-bold text-india-chili">masala</span> and clarity.
          </p>

          <div className="flex justify-center md:justify-start gap-4">
             <button className="bg-india-green text-white font-bold text-xl px-8 py-4 rounded-full border-4 border-white shadow-pop hover:shadow-pop-hover hover:translate-y-1 transition-all uppercase tracking-wide">
               Start Journey
             </button>
          </div>
        </div>

        {/* Right Side: Visual Mashup */}
        <div className="flex-1 w-full flex justify-center items-center relative h-[500px]">
           <Sunburst className="absolute w-[600px] h-[600px] text-india-marigold animate-spin-[20s]" />
           
           <div className="relative z-10 w-80 h-96 bg-india-pink border-[12px] border-india-yellow rounded-tl-[50px] rounded-br-[50px] shadow-pop flex flex-col items-center justify-center p-8 rotate-3 transform hover:rotate-0 transition-transform duration-500">
              <div className="absolute -top-6 -right-6 bg-india-blue text-white w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg border-4 border-white animate-bounce">
                New!
              </div>
              
              <LotusIcon className="w-24 h-24 text-white mb-4 animate-pulse" />
              
              <h2 className="text-4xl font-serif text-center text-india-yellow mb-2 text-stroke-sm stroke-black drop-shadow-md">
                DHAN LAXMI
              </h2>
              <div className="w-full h-1 bg-white mb-2"></div>
              <p className="text-center text-white font-sans text-lg leading-tight">
                Grow your wealth like a Banyan Tree!
              </p>
              
              {/* Decorative Corners */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-white"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-white"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-white"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-white"></div>
           </div>
        </div>
      </div>
      
      <ScallopBorder position="bottom" color="text-india-blue" />
    </section>
  );
};

export default Hero;