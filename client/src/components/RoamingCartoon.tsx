import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function RoamingCartoon() {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const move = () => {
      // Move to a new random position every few seconds
      const newX = Math.random() * (window.innerWidth - 200);
      const newY = Math.random() * (window.innerHeight - 200);
      setPosition({ x: newX, y: newY });
    };

    const interval = setInterval(move, 6000);
    move();

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      animate={{ 
        x: position.x, 
        y: position.y,
      }}
      transition={{ 
        duration: 6, 
        ease: "easeInOut",
      }}
      className="fixed z-40 pointer-events-none select-none w-48 h-48"
      style={{ left: 0, top: 0 }}
    >
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 2, -2, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4,
          ease: "easeInOut"
        }}
        className="relative w-full h-full"
      >
        {/* Glow effect behind robot */}
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
        
        <img
          src="/assets/robot_mascot.png"
          alt="Robot Mascot"
          className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(59,130,246,0.4)]"
        />
      </motion.div>
    </motion.div>
  );
}
