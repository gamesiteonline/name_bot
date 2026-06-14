import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function RoamingCartoon() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = () => {
      setPosition({
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * (window.innerHeight - 100),
      });
    };

    const interval = setInterval(move, 4000);
    move();

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      animate={{ x: position.x, y: position.y }}
      transition={{ duration: 4, ease: "easeInOut" }}
      className="fixed z-40 pointer-events-none select-none text-6xl"
      style={{ left: 0, top: 0 }}
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 0.9, 1]
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        🤖
      </motion.div>
    </motion.div>
  );
}
