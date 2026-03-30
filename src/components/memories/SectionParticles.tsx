import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export const SectionParticles = () => {
  const emojis = ['💖', '🤍', '✨', '💕', '🌸'];
  const particles = useMemo(() => Array.from({ length: 40 }).map(() => ({
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    size: Math.random() * 1.5 + 0.8,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 25 + 20,
    delay: Math.random() * 10,
    yOffset: (Math.random() - 0.5) * 200,
    xOffset: (Math.random() - 0.5) * 200,
    opacityMax: Math.random() * 0.5 + 0.3,
    rotation: Math.random() * 360
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute flex items-center justify-center drop-shadow-sm"
          style={{
            fontSize: `${p.size}rem`,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, p.yOffset, 0],
            x: [0, p.xOffset, 0],
            opacity: [0, p.opacityMax, 0],
            rotate: [p.rotation, p.rotation + 90, p.rotation],
            scale: [0.8, 1.1, 0.8]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
};
