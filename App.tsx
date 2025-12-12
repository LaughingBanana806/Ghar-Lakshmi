import React, { useState } from 'react';
import GyaanPage from './components/GyaanPage';
import { ScallopBorder } from './components/GeometricDecorations';
import Onboarding from './components/Onboarding';
import SaralHome from './components/SaralHome';
import SmartHome from './components/SmartHome';
import CommunityPage from './components/CommunityPage';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'gyaan' | 'community'>('home');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const navigateTo = (view: 'home' | 'gyaan' | 'community') => (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  // If no user profile, show Onboarding
  if (!userProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const isSaral = userProfile.mode === 'saral';

  return (
    <div className={`min-h-screen bg-vintage-paper text-gray-900 font-sans selection:bg-india-pink selection:text-white overflow-x-hidden ${isSaral ? 'text-lg' : ''}`}>
      {/* Header - Adapts based on Mode */}
      <header className="fixed top-0 w-full z-50 bg-india-yellow border-b-4 border-black shadow-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={navigateTo('home')}>
             <div className="w-10 h-10 bg-india-pink rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">₹</span>
             </div>
            <span className="text-3xl font-serif text-india-blue drop-shadow-sm tracking-tight">
                Paisa<span className="text-india-chili">Pop</span>
            </span>
          </div>

          {/* Navigation - Simplified for Saral, Detailed for Smart */}
          {isSaral ? (
             <nav className="flex gap-4 font-bold text-black">
                <button onClick={navigateTo('home')} className={`p-2 rounded-lg ${currentView === 'home' ? 'bg-white border-2 border-black' : ''}`}>
                   🏠 Ghar
                </button>
                <button onClick={navigateTo('community')} className={`p-2 rounded-lg ${currentView === 'community' ? 'bg-white border-2 border-black' : ''}`}>
                   🤝 Samuh
                </button>
                <button onClick={navigateTo('gyaan')} className={`p-2 rounded-lg ${currentView === 'gyaan' ? 'bg-white border-2 border-black' : ''}`}>
                   💡 Gyaan
                </button>
             </nav>
          ) : (
             <>
                <nav className="hidden md:flex gap-6 font-sans font-bold uppercase text-sm tracking-wider text-black">
                    <a href="#" onClick={navigateTo('home')} className={`hover:text-india-pink hover:underline decoration-2 underline-offset-4 ${currentView === 'home' ? 'text-india-pink underline' : ''}`}>Dashboard</a>
                    <a href="#" onClick={navigateTo('gyaan')} className={`hover:text-india-blue hover:underline decoration-2 underline-offset-4 ${currentView === 'gyaan' ? 'text-india-blue underline' : ''}`}>Knowledge Hub</a>
                    <a href="#" className="hover:text-india-green hover:underline decoration-2 underline-offset-4">Portfolio</a>
                </nav>
                <div className="flex gap-2">
                    <div className="text-right hidden md:block leading-none">
                       <div className="text-[10px] font-bold uppercase tracking-widest text-india-blue">Mode</div>
                       <div className="font-serif text-india-pink">Smart</div>
                    </div>
                    <button className="bg-india-chili text-white px-6 py-2 font-bold uppercase text-sm rounded-full border-2 border-black hover:bg-white hover:text-india-chili transition-colors shadow-[2px_2px_0_0_black]">
                        Upgrade
                    </button>
                </div>
             </>
          )}
        </div>
        <ScallopBorder position="bottom" color="text-india-yellow" />
      </header>

      <main className="pt-20">
        {currentView === 'home' ? (
          // Fork logic for Home View
          isSaral ? (
            <SaralHome user={userProfile} />
          ) : (
            <SmartHome user={userProfile} onNavigateToGyaan={navigateTo('gyaan')} />
          )
        ) : currentView === 'community' ? (
          <CommunityPage />
        ) : (
          <GyaanPage />
        )}
      </main>

      {/* Footer - Simplified for Saral */}
      <footer className="bg-black text-india-cream py-16 border-t-8 border-india-pink relative clip-scallop-top">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
          <div>
             <h4 className="text-3xl font-serif text-india-yellow mb-2">PaisaPop</h4>
             <p className="font-sans text-sm opacity-60 max-w-xs">
                {isSaral ? 'Made with ❤️ for India.' : 'Empowering women with financial freedom.'}
             </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 font-sans font-bold uppercase text-sm tracking-wider">
             <a href="#" className="hover:text-india-pink transition-colors">Privacy</a>
             <a href="#" className="hover:text-india-blue transition-colors">Help</a>
          </div>
        </div>
        <div className="text-center mt-12 text-xs opacity-30 font-sans">
            © 2024 PaisaPop Financial Services.
        </div>
      </footer>
    </div>
  );
};

export default App;