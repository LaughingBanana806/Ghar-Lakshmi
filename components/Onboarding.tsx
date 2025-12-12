import React, { useState } from 'react';
import { Sunburst, LotusIcon, DecorativeCorner } from './GeometricDecorations';
import { ArrowRight, Languages, MapPin, Briefcase } from 'lucide-react';
import { UserProfile, UserMode } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  ];

  const handleLanguageSelect = (lang: string) => {
    setProfile({ ...profile, language: lang });
    setStep(2);
  };

  const handleLocationSelect = (loc: 'city' | 'town' | 'village') => {
    setProfile({ ...profile, location: loc });
    setStep(3);
  };

  const handleOccupationSelect = (occ: UserProfile['occupation']) => {
    const finalProfile = { ...profile, occupation: occ } as UserProfile;
    
    // Logic to determine mode
    let mode: UserMode = 'smart';
    if (finalProfile.location === 'village' || finalProfile.occupation === 'daily_wage' || finalProfile.occupation === 'homemaker') {
      mode = 'saral';
    } else {
      mode = 'smart';
    }

    finalProfile.mode = mode;
    onComplete(finalProfile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-india-cream flex items-center justify-center p-4">
      {/* Background Decor */}
      <Sunburst className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] text-india-yellow opacity-20" />
      
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white border-[8px] border-double border-india-pink p-8 shadow-pop relative">
          <DecorativeCorner className="absolute top-2 left-2 border-india-blue" />
          <DecorativeCorner className="absolute bottom-2 right-2 border-india-blue rotate-180" />

          {step === 1 && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-center mb-6">
                 <div className="w-20 h-20 bg-india-yellow rounded-full flex items-center justify-center border-4 border-black">
                    <Languages className="w-10 h-10 text-black" />
                 </div>
              </div>
              <h2 className="text-4xl font-serif text-india-blue mb-2">Namaste!</h2>
              <p className="font-sans text-gray-600 mb-8">Select your language / अपनी भाषा चुनें</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className="p-4 border-2 border-india-marigold rounded-lg hover:bg-india-marigold hover:text-white transition-colors text-center shadow-sm"
                  >
                    <div className="text-lg font-bold">{lang.native}</div>
                    <div className="text-xs opacity-70 uppercase">{lang.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-center mb-6">
                 <div className="w-20 h-20 bg-india-green rounded-full flex items-center justify-center border-4 border-black">
                    <MapPin className="w-10 h-10 text-white" />
                 </div>
              </div>
              <h2 className="text-3xl font-serif text-india-blue mb-6">Where is your home?</h2>
              
              <div className="flex flex-col gap-4">
                <button onClick={() => handleLocationSelect('city')} className="flex items-center p-4 border-2 border-gray-200 hover:border-india-blue hover:bg-india-blue/5 rounded-xl transition-all group">
                   <span className="text-4xl mr-4 group-hover:scale-110 transition-transform">🏙️</span>
                   <div className="text-left">
                     <div className="font-bold text-lg text-india-blue">Big City (Shehar)</div>
                     <div className="text-sm text-gray-500">Fast life, traffic, Metro</div>
                   </div>
                   <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100" />
                </button>
                <button onClick={() => handleLocationSelect('town')} className="flex items-center p-4 border-2 border-gray-200 hover:border-india-green hover:bg-india-green/5 rounded-xl transition-all group">
                   <span className="text-4xl mr-4 group-hover:scale-110 transition-transform">🏘️</span>
                   <div className="text-left">
                     <div className="font-bold text-lg text-india-green">Town (Kasba)</div>
                     <div className="text-sm text-gray-500">Developing area, Markets</div>
                   </div>
                   <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100" />
                </button>
                <button onClick={() => handleLocationSelect('village')} className="flex items-center p-4 border-2 border-gray-200 hover:border-india-pink hover:bg-india-pink/5 rounded-xl transition-all group">
                   <span className="text-4xl mr-4 group-hover:scale-110 transition-transform">🚜</span>
                   <div className="text-left">
                     <div className="font-bold text-lg text-india-pink">Village (Gaon)</div>
                     <div className="text-sm text-gray-500">Fresh air, Farming, Community</div>
                   </div>
                   <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-center mb-6">
                 <div className="w-20 h-20 bg-india-chili rounded-full flex items-center justify-center border-4 border-black">
                    <Briefcase className="w-10 h-10 text-white" />
                 </div>
              </div>
              <h2 className="text-3xl font-serif text-india-blue mb-6">What do you do?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => handleOccupationSelect('salary')} className="p-4 border-2 border-gray-200 hover:border-black hover:bg-india-yellow rounded-xl transition-all shadow-sm">
                   <div className="text-3xl mb-2">💼</div>
                   <div className="font-bold">Salaried Job</div>
                </button>
                <button onClick={() => handleOccupationSelect('daily_wage')} className="p-4 border-2 border-gray-200 hover:border-black hover:bg-india-yellow rounded-xl transition-all shadow-sm">
                   <div className="text-3xl mb-2">🛠️</div>
                   <div className="font-bold">Daily Wage / Labor</div>
                </button>
                <button onClick={() => handleOccupationSelect('business')} className="p-4 border-2 border-gray-200 hover:border-black hover:bg-india-yellow rounded-xl transition-all shadow-sm">
                   <div className="text-3xl mb-2">🏪</div>
                   <div className="font-bold">Small Business / Shop</div>
                </button>
                <button onClick={() => handleOccupationSelect('homemaker')} className="p-4 border-2 border-gray-200 hover:border-black hover:bg-india-yellow rounded-xl transition-all shadow-sm">
                   <div className="text-3xl mb-2">🏠</div>
                   <div className="font-bold">Home Maker</div>
                </button>
              </div>
            </div>
          )}

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-8">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-india-pink' : 'bg-gray-200'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-india-pink' : 'bg-gray-200'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-india-pink' : 'bg-gray-200'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;