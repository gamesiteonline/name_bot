import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface IntroScreenProps {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 1000); // Allow time for exit animation
    }, 3000);

    // Play sound if possible
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    audio.play().catch(e => console.log("Audio play failed:", e));

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl">Fahad</h1>
            <p className="text-2xl font-serif italic text-amber-100">Name Bot Experience</p>
          </motion.div>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-4 h-4 bg-amber-200 rounded-full shadow-lg"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
