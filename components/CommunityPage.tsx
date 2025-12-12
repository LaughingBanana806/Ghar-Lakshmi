import React, { useState, useEffect } from 'react';
import { Users, ArrowRight, X, Trash2, CheckCircle2, Crown, Calculator, RefreshCw } from 'lucide-react';
import { KittyGroup } from '../types';

const CommunityPage: React.FC = () => {
  const [isKittyModalOpen, setIsKittyModalOpen] = useState(false);
  const [kittyGroup, setKittyGroup] = useState<KittyGroup | null>(null);
  const [tempGroupName, setTempGroupName] = useState('');
  const [tempAmount, setTempAmount] = useState<string>('');
  const [tempMembers, setTempMembers] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState('');

  // Load Kitty Data
  useEffect(() => {
    const storedKitty = localStorage.getItem('kittyGroup');
    if (storedKitty) setKittyGroup(JSON.parse(storedKitty));
  }, []);

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