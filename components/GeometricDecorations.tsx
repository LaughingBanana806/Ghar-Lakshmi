import React from 'react';

export const LotusIcon: React.FC<{ className?: string; color?: string }> = ({ className = "", color = "text-india-pink" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`${color} ${className}`} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 9L12 11.5L9.5 9L12 2Z" />
    <path d="M12 11.5L16 9.5L18 14L12 15V11.5Z" />
    <path d="M12 11.5L8 9.5L6 14L12 15V11.5Z" />
    <path d="M12 15L17 14L19 18L12 19V15Z" />
    <path d="M12 15L7 14L5 18L12 19V15Z" />
    <path d="M12 19L15 22H9L12 19Z" />
  </svg>
);

export const Sunburst: React.FC<{ className?: string; color?: string }> = ({ className = "", color = "bg-india-yellow" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className={`w-full h-full rounded-full ${color} opacity-20 animate-spin-slow`}></div>
    {[...Array(12)].map((_, i) => (
      <div 
        key={i}
        className={`absolute w-1 h-full ${color}`}
        style={{ transform: `rotate(${i * 30}deg)` }}
      />
    ))}
  </div>
);

export const DecorativeCorner: React.FC<{ className?: string; color?: string }> = ({ className = "", color = "border-india-marigold" }) => (
  <div className={`w-8 h-8 border-4 ${color} ${className}`} />
);

export const WavySeparator: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`h-4 w-full ${className}`} style={{
    backgroundImage: "radial-gradient(circle, #FF007F 2px, transparent 2.5px)",
    backgroundSize: "10px 10px"
  }} />
);

export const ScallopBorder: React.FC<{ position?: 'top' | 'bottom', color?: string }> = ({ position = 'bottom', color = 'text-india-cream' }) => (
  <div className={`w-full h-4 overflow-hidden absolute ${position === 'bottom' ? '-bottom-1' : '-top-1'} left-0 w-full leading-none ${color}`}>
     <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 120">
         <path d={position === 'bottom' ? "M0,0V46.29c47,0,47,69.58,97,69.58,54.17,0,54.17-69.58,102.58-69.58S248,115.87,302.17,115.87c48.42,0,48.42-69.58,102.58-69.58S448,115.87,502.17,115.87c48.42,0,48.42-69.58,102.58-69.58S648,115.87,702.17,115.87c48.42,0,48.42-69.58,102.58-69.58S848,115.87,902.17,115.87c48.42,0,48.42-69.58,102.58-69.58S1048,115.87,1102.17,115.87c48.42,0,48.42-69.58,102.58-69.58V0Z" : "M0,0V46.29c47,0,47,69.58,97,69.58,54.17,0,54.17-69.58,102.58-69.58S248,115.87,302.17,115.87c48.42,0,48.42-69.58,102.58-69.58S448,115.87,502.17,115.87c48.42,0,48.42-69.58,102.58-69.58S648,115.87,702.17,115.87c48.42,0,48.42-69.58,102.58-69.58S848,115.87,902.17,115.87c48.42,0,48.42-69.58,102.58-69.58S1048,115.87,1102.17,115.87c48.42,0,48.42-69.58,102.58-69.58V0Z"} fill="currentColor" transform={position === 'top' ? "rotate(180 600 60)" : ""}></path>
     </svg>
  </div>
);