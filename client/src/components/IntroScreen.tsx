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

    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    audio.play().catch(() => {});

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
          {/* Premium Tech Background */}
          <div className="absolute inset-0">
            <img src="/assets/tech_bg.png" className="w-full h-full object-cover opacity-40" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 text-center flex flex-col items-center"
          >
            {/* 3D Star Emblem */}
            <motion.img 
              src="/assets/star_emblem.png" 
              className="w-48 h-48 mb-8 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              animate={{ 
                rotateY: [0, 360],
                y: [0, -10, 0]
              }}
              transition={{ 
                rotateY: { duration: 10, repeat: Infinity, ease: "linear" },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            />

            <motion.h1 
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl font-black tracking-tighter mb-2 italic bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500"
            >
              FAHAD
            </motion.h1>
            
            <div className="w-80 h-1.5 bg-white/10 rounded-full overflow-hidden mb-4 border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex justify-between w-80 font-mono text-[10px] tracking-widest opacity-40 uppercase">
              <span>Initializing System</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </motion.div>

          {/* HUD Elements */}
          <div className="absolute top-10 left-10 w-32 h-32 border-t-2 border-l-2 border-blue-500/30 rounded-tl-3xl"></div>
          <div className="absolute top-10 right-10 w-32 h-32 border-t-2 border-r-2 border-blue-500/30 rounded-tr-3xl"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 border-b-2 border-l-2 border-blue-500/30 rounded-bl-3xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 border-b-2 border-r-2 border-blue-500/30 rounded-br-3xl"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
