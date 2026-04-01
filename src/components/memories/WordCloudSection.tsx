import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Cloud } from 'lucide-react';
import { MemoryData } from '../../lib/gemini';

interface WordCloudSectionProps {
  data: MemoryData;
}

export function WordCloudSection({ data }: WordCloudSectionProps) {
  // Rigorous deterministic layout
  const cloudWords = useMemo(() => {
    const topWords = data.extendedStats.topWords.slice(0, 40);
    if (topWords.length === 0) return [];

    const maxCount = topWords[0].count;
    
    return topWords.map((item, i) => {
      // Use a spiral-like deterministic distribution
      const angle = 0.5 * i;
      const radius = 20 + i * 10;
      
      return {
        ...item,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        rotation: (i % 2 === 0 ? 1 : -1) * (i * 5 % 25),
        scale: 0.6 + (item.count / maxCount) * 1.4,
        opacity: 0.5 + (item.count / maxCount) * 0.5,
        color: i % 4 === 0 ? 'text-pink-400' : i % 4 === 1 ? 'text-purple-400' : i % 4 === 2 ? 'text-indigo-400' : 'text-rose-400'
      };
    });
  }, [data.extendedStats.topWords]);

  return (
    <motion.div 
      id="words"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: false, margin: "-20px" }}
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.02 } }
      }}
      className="space-y-16 py-20"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-gray-900/40 rounded-full mb-4 shadow-sm border border-pink-900/20">
          <Cloud className="w-8 h-8 text-pink-400" />
        </div>
        <h2 className="text-5xl font-black text-gray-100">Our Lexicon</h2>
        <p className="text-xl text-pink-400 italic">The frequency of our shared language.</p>
      </div>

      <div className="relative h-[600px] w-full flex items-center justify-center overflow-hidden bg-white/[0.01] rounded-[5rem] border border-white/5 backdrop-blur-3xl shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.05)_0%,transparent_70%)]" />
        
        {cloudWords.map((word, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, scale: 0, x: 0, y: 0 },
              show: { 
                opacity: word.opacity, 
                scale: word.scale, 
                x: word.x, 
                y: word.y,
                rotate: word.rotation,
                transition: { type: "spring", stiffness: 40, damping: 20, delay: i * 0.01 } 
              }
            }}
            whileHover={{ 
              scale: word.scale * 1.2, 
              opacity: 1, 
              zIndex: 50,
              filter: "drop-shadow(0 0 10px currentColor)",
              transition: { duration: 0.2 } 
            }}
            className={`absolute cursor-default font-black tracking-tight ${word.color} select-none drop-shadow-sm`}
            style={{ fontSize: '1.2rem' }}
          >
            {word.word}
          </motion.div>
        ))}
        
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="z-0 text-[15rem] font-black text-white pointer-events-none select-none blur-sm"
        >
          ❤️
        </motion.div>
      </div>
    </motion.div>
  );
}
