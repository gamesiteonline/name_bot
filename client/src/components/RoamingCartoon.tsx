import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function RoamingCartoon() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = () => {
      setPosition({
        x: Math.random() * (window.innerWidth - 150),
        y: Math.random() * (window.innerHeight - 150),
      });
    };

    const interval = setInterval(move, 5000);
    move();

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      animate={{ x: position.x, y: position.y }}
      transition={{ duration: 5, ease: "easeInOut" }}
      className="fixed z-40 pointer-events-none select-none w-32 h-32"
      style={{ left: 0, top: 0 }}
    >
      <motion.img
        src="/assets/robot.webp"
        alt="Robot Mascot"
        className="w-full h-full object-contain drop-shadow-2xl"
        animate={{ 
          rotate: [0, 5, -5, 0],
          y: [0, -10, 0]
        }}
        transition={{ repeat: Infinity, duration: 3 }}
      />
    </motion.div>
  );
}
