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
    ? 'from-slate-950 via-blue-950 to-black text-white' 
    : gender === 'female'
    ? 'from-pink-600 via-rose-500 to-pink-700 text-white'
    : 'from-slate-900 via-slate-800 to-black text-white';

  const cardClasses = gender === 'male'
    ? 'bg-slate-900/90 border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.3)]'
    : gender === 'female'
    ? 'bg-pink-400/20 backdrop-blur-xl border-white/40 shadow-[0_0_50px_rgba(244,114,182,0.4)]'
    : 'bg-black/60 backdrop-blur-2xl border-white/10 shadow-2xl';

  return (
    <div className={`min-h-screen transition-all duration-1000 flex flex-col items-center justify-center p-4 bg-gradient-to-br ${themeClasses} overflow-hidden font-sans`}>
      
      {/* Dynamic 3D Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.img 
          src="/assets/game_items.png" 
          className="absolute top-10 left-10 w-32 opacity-20"
          animate={{ y: [0, 20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.img 
          src="/assets/game_items.png" 
          className="absolute bottom-10 right-10 w-40 opacity-20 rotate-180"
          animate={{ y: [0, -30, 0], rotate: [180, 170, 180] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl text-center mb-10 z-10"
      >
        <div className="relative inline-block">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="relative bg-white/5 backdrop-blur-md px-16 py-6 rounded-full border-2 border-white/20"
          >
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
              FAHAD
            </h1>
            <div className="absolute -top-2 -right-2 bg-blue-500 text-[10px] font-bold px-2 py-1 rounded-sm">V2.0</div>
          </motion.div>
        </div>
      </motion.div>

      <div className="w-full max-w-xl z-10">
        <AnimatePresence mode="wait">
          {step === 'gender' && (
            <motion.div
              key="gender"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className={`${cardClasses} rounded-[3rem] p-8 border-2`}
            >
              <h2 className="text-3xl font-black mb-8 text-center uppercase tracking-tighter">Choose Class</h2>
              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => handleGenderSelect('male')}
                  className="group relative h-56 bg-gradient-to-br from-blue-600 to-blue-900 rounded-[2rem] shadow-xl hover:scale-105 transition-all border-4 border-blue-400/30 overflow-hidden"
                >
                  <motion.img src="/assets/robot_male.webp" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative h-full flex flex-col items-center justify-end pb-6">
                    <Shield className="w-10 h-10 mb-2 text-blue-200" />
                    <span className="text-xl font-black uppercase italic">Commander</span>
                  </div>
                </button>

                <button
                  onClick={() => handleGenderSelect('female')}
                  className="group relative h-56 bg-gradient-to-br from-pink-500 to-rose-700 rounded-[2rem] shadow-xl hover:scale-105 transition-all border-4 border-pink-300/30 overflow-hidden"
                >
                  <motion.img src="/assets/heart.png" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 object-contain opacity-40 group-hover:scale-110 transition-transform" />
                  <div className="relative h-full flex flex-col items-center justify-end pb-6">
                    <Heart className="w-10 h-10 mb-2 text-pink-100" />
                    <span className="text-xl font-black uppercase italic">Valkyrie</span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'search' && (
            <motion.div
              key="search"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className={`${cardClasses} rounded-[3rem] p-10 border-2`}
            >
              <div className="flex items-center justify-center gap-3 mb-8">
                <Target className="text-blue-400 animate-spin" />
                <h2 className="text-3xl font-black uppercase italic">Scan Target</h2>
              </div>
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-pink-500 rounded-2xl blur opacity-25 group-focus-within:opacity-75 transition duration-1000"></div>
                  <input
                    type="text"
                    placeholder="ENTER CODE NAME..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="relative w-full h-20 px-8 text-2xl font-black bg-black rounded-xl border-2 border-white/10 focus:outline-none focus:border-white/40 transition-all uppercase placeholder:opacity-20"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="flex-1 h-20 bg-white text-black font-black text-xl rounded-xl hover:bg-gray-200 active:scale-95 disabled:opacity-50 transition-all uppercase italic flex items-center justify-center gap-2"
                  >
                    {isSearching ? <Loader2 className="animate-spin" /> : <><Zap className="w-6 h-6" /> Initialize</>}
                  </button>
                  <button
                    onClick={handleReset}
                    className="h-20 px-8 bg-white/5 text-white font-black rounded-xl hover:bg-white/10 transition-all uppercase"
                  >
                    Back
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`${cardClasses} rounded-[3rem] p-8 border-2`}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black uppercase italic">Results Decrypted</h2>
                <div className="h-1 w-20 bg-blue-500 mx-auto mt-2"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {results.map((name, idx) => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={idx}
                    onClick={() => handleSelectName(name)}
                    className="h-14 bg-white/5 hover:bg-white/10 border-2 border-white/5 rounded-lg font-bold text-sm transition-all uppercase tracking-wider"
                  >
                    {name}
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setStep('search')}
                className="w-full h-14 bg-white/5 text-white font-black rounded-lg hover:bg-white/10 transition-all uppercase text-sm border border-white/10"
              >
                New Scan
              </button>
            </motion.div>
          )}

          {step === 'reveal' && selectedName && (
            <motion.div
              key="reveal"
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              className={`${cardClasses} rounded-[4rem] p-12 border-4 text-center relative`}
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
              />
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border-2 border-white/20 rotate-45">
                  <Sparkles className="w-10 h-10 text-yellow-400 -rotate-45" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.5em] opacity-40 mb-4">Identification Complete</p>
                <h3 className="text-6xl md:text-8xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-12">
                  {selectedName}
                </h3>

                <div className="space-y-4">
                  <button
                    onClick={handleCopyName}
                    className="w-full h-20 bg-white text-black font-black text-2xl rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 italic"
                  >
                    {copied ? <Check /> : <Copy />}
                    {copied ? 'CAPTURED' : 'CLAIM NAME'}
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full h-16 bg-transparent border-2 border-white/10 text-white font-black rounded-2xl hover:bg-white/5 transition-all uppercase tracking-widest text-sm"
                  >
                    Restart Mission
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
        animate={{ opacity: 0.3 }}
        className="mt-10 font-black tracking-[1em] text-[10px] uppercase"
      >
        Developed by Fahad
      </motion.div>
    </div>
  );
}
