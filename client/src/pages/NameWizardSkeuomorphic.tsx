import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, Check, AlertCircle, MessageCircle, Sparkles, Shield, Heart, Zap, Target } from 'lucide-react';
import { toast } from 'sonner';
import { searchNames } from '@/lib/nameSearch';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'gender' | 'search' | 'results' | 'reveal';
type Gender = 'male' | 'female';

export default function NameWizardSkeuomorphic() {
  const [step, setStep] = useState<Step>('gender');
  const [gender, setGender] = useState<Gender | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isFuzzy, setIsFuzzy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleGenderSelect = (g: Gender) => {
    setGender(g);
    setStep('search');
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.play().catch(() => {});
  };

  const handleSearch = async () => {
    if (!gender || !searchQuery.trim()) {
      toast.error('INPUT REQUIRED');
      return;
    }
    setIsSearching(true);
    try {
      const data = await searchNames(searchQuery, gender);
      setResults(data.results);
      setIsFuzzy(data.isFuzzy);
      setStep('results');
    } catch (error) {
      toast.error('SYSTEM ERROR');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectName = (name: string) => {
    setSelectedName(name);
    setStep('reveal');
  };

  const handleCopyName = async () => {
    if (!selectedName) return;
    try {
      await navigator.clipboard.writeText(selectedName);
      setCopied(true);
      toast.success('NAME CAPTURED');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('CAPTURE FAILED');
    }
  };

  const handleReset = () => {
    setStep('gender');
    setGender(null);
    setSearchQuery('');
    setResults([]);
  };

  const themeClasses = gender === 'male' 
    ? 'from-slate-950 via-blue-950 to-black' 
    : gender === 'female'
    ? 'from-pink-900 via-rose-800 to-pink-950'
    : 'from-slate-950 via-slate-900 to-black';

  const cardClasses = gender === 'male'
    ? 'bg-slate-900/40 backdrop-blur-3xl border-blue-500/30 shadow-[0_0_80px_rgba(59,130,246,0.15)]'
    : gender === 'female'
    ? 'bg-pink-900/40 backdrop-blur-3xl border-pink-400/30 shadow-[0_0_80px_rgba(244,114,182,0.15)]'
    : 'bg-white/5 backdrop-blur-3xl border-white/10 shadow-2xl';

  return (
    <div className={`min-h-screen transition-all duration-1000 flex flex-col items-center justify-center p-4 bg-gradient-to-br ${themeClasses} overflow-hidden text-white font-sans`}>
      
      {/* Premium Background Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <img src="/assets/tech_bg.png" className="w-full h-full object-cover opacity-30 mix-blend-overlay" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60"></div>
      </div>

      {/* Floating Physical Assets */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.img 
          src="/assets/star_emblem.png" 
          className="absolute top-[15%] left-[10%] w-40 h-40 opacity-40 blur-[1px]"
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img 
          src="/assets/robot_mascot.png" 
          className="absolute bottom-[15%] right-[10%] w-48 h-48 opacity-40 blur-[1px]"
          animate={{ 
            y: [0, -40, 0],
            rotate: [0, -15, 15, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header Section */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl text-center mb-12 z-10"
      >
        <div className="relative inline-block">
          <motion.div 
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="relative bg-white/5 backdrop-blur-xl px-20 py-8 rounded-[3rem] border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]"
          >
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
              FAHAD
            </h1>
            <p className="text-sm font-bold tracking-[0.8em] text-blue-400/80 mt-2 uppercase">System Elite v2</p>
          </motion.div>
        </div>
      </motion.div>

      <div className="w-full max-w-xl z-10">
        <AnimatePresence mode="wait">
          {step === 'gender' && (
            <motion.div
              key="gender"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              className={`${cardClasses} rounded-[4rem] p-10 border`}
            >
              <h2 className="text-3xl font-black mb-10 text-center uppercase tracking-widest italic">Initialize Class</h2>
              <div className="grid grid-cols-2 gap-8">
                <button
                  onClick={() => handleGenderSelect('male')}
                  className="group relative h-64 bg-gradient-to-br from-blue-600/20 to-blue-900/40 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border border-blue-500/30 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
                  <div className="relative h-full flex flex-col items-center justify-center p-6">
                    <Shield className="w-16 h-16 mb-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-2xl font-black uppercase italic tracking-tighter">Commander</span>
                    <span className="text-[10px] opacity-40 mt-2 uppercase tracking-widest">Strength • Logic</span>
                  </div>
                </button>

                <button
                  onClick={() => handleGenderSelect('female')}
                  className="group relative h-64 bg-gradient-to-br from-pink-600/20 to-rose-900/40 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border border-pink-500/30 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
                  <div className="relative h-full flex flex-col items-center justify-center p-6">
                    <Heart className="w-16 h-16 mb-4 text-pink-400 group-hover:scale-110 transition-transform" />
                    <span className="text-2xl font-black uppercase italic tracking-tighter">Valkyrie</span>
                    <span className="text-[10px] opacity-40 mt-2 uppercase tracking-widest">Agility • Mystic</span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'search' && (
            <motion.div
              key="search"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className={`${cardClasses} rounded-[4rem] p-12 border`}
            >
              <div className="flex items-center justify-center gap-4 mb-10">
                <Target className="text-blue-400 w-8 h-8 animate-pulse" />
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Neural Scan</h2>
              </div>
              <div className="space-y-8">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-pink-500 rounded-[2rem] blur opacity-20 group-focus-within:opacity-60 transition duration-500"></div>
                  <input
                    type="text"
                    placeholder="INPUT CODE NAME..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="relative w-full h-24 px-10 text-3xl font-black bg-black/40 rounded-[2rem] border border-white/10 focus:outline-none focus:border-white/30 transition-all uppercase placeholder:opacity-10 tracking-widest"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="flex-1 h-20 bg-white text-black font-black text-2xl rounded-[1.5rem] hover:bg-blue-50 active:scale-95 disabled:opacity-50 transition-all uppercase italic flex items-center justify-center gap-3"
                  >
                    {isSearching ? <Loader2 className="animate-spin" /> : <><Zap className="w-6 h-6" /> Execute</>}
                  </button>
                  <button
                    onClick={handleReset}
                    className="h-20 px-10 bg-white/5 text-white font-black rounded-[1.5rem] hover:bg-white/10 transition-all uppercase border border-white/10"
                  >
                    Abort
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${cardClasses} rounded-[4rem] p-10 border`}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Decrypted Data</h2>
                <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-4"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto mb-8 pr-2 custom-scrollbar">
                {results.map((name, idx) => (
                  <motion.button
                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.97 }}
                    key={idx}
                    onClick={() => handleSelectName(name)}
                    className="h-16 bg-white/5 border border-white/5 rounded-2xl font-black text-lg transition-all uppercase tracking-tighter italic"
                  >
                    {name}
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setStep('search')}
                className="w-full h-16 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase text-sm border border-white/10 tracking-[0.3em]"
              >
                New Scan
              </button>
            </motion.div>
          )}

          {step === 'reveal' && selectedName && (
            <motion.div
              key="reveal"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              className={`${cardClasses} rounded-[5rem] p-16 border-2 text-center relative overflow-hidden`}
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"
              />
              
              <div className="relative z-10">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-white/10 shadow-2xl"
                >
                  <Sparkles className="w-12 h-12 text-yellow-400" />
                </motion.div>
                <p className="text-xs font-black uppercase tracking-[0.8em] opacity-30 mb-6">Entity Identified</p>
                <h3 className="text-7xl md:text-9xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-600 mb-16 drop-shadow-2xl">
                  {selectedName}
                </h3>

                <div className="space-y-6">
                  <button
                    onClick={handleCopyName}
                    className="w-full h-24 bg-white text-black font-black text-3xl rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.2)] flex items-center justify-center gap-4 italic"
                  >
                    {copied ? <Check className="w-8 h-8" /> : <Copy className="w-8 h-8" />}
                    {copied ? 'CAPTURED' : 'CLAIM'}
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full h-16 bg-transparent border border-white/10 text-white font-black rounded-[1.5rem] hover:bg-white/5 transition-all uppercase tracking-[0.5em] text-[10px]"
                  >
                    Reset System
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        className="mt-12 font-black tracking-[1.5em] text-[9px] uppercase z-10"
      >
        Core Protocol by Fahad
      </motion.div>
    </div>
  );
}
