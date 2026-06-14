import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface IntroScreenProps {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShow(false), 500);
          setTimeout(onComplete, 1200);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Play sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    audio.play().catch(e => console.log("Audio play failed:", e));

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white overflow-hidden"
        >
          {/* Background FX */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <motion.div 
              animate={{ 
                background: [
                  'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0"
            />
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 text-center"
          >
            <motion.h1 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl font-black tracking-tighter mb-2 italic bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500"
            >
              FAHAD
            </motion.h1>
            <div className="h-1 w-full bg-blue-500 mb-8 shadow-[0_0_15px_rgba(59,130,246,1)]"></div>
            
            <div className="w-80 h-2 bg-gray-800 rounded-full overflow-hidden mb-4 border border-white/10">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex justify-between font-mono text-xs tracking-widest opacity-50 uppercase">
              <span>Loading Assets...</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </motion.div>

          {/* Decorative corners */}
          <div className="absolute top-10 left-10 w-20 h-20 border-t-4 border-l-4 border-white/20"></div>
          <div className="absolute top-10 right-10 w-20 h-20 border-t-4 border-r-4 border-white/20"></div>
          <div className="absolute bottom-10 left-10 w-20 h-20 border-b-4 border-l-4 border-white/20"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 border-b-4 border-r-4 border-white/20"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
