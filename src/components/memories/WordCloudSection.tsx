import React;
import { motion } from 'motion/react';
import { Cloud } from 'lucide-react';
import { MemoryData } from '../../lib/gemini';

interface WordCloudSectionProps {
  data: MemoryData;
}

export function WordCloudSection({ data }: WordCloudSectionProps) {
  const topWords = data.extendedStats.topWords.slice(0, 30);
  
  // Create a randomized but deterministic distribution for the cloud
  const cloudWords = topWords.map((item, i) => {
    const angle = (i / topWords.length) * Math.PI * 2;
    const distance = 50 + Math.random() * 150;
    return {
      ...item,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotation: (Math.random() - 0.5) * 30,
      scale: 0.5 + (item.count / topWords[0].count) * 1.5,
      opacity: 0.4 + (item.count / topWords[0].count) * 0.6,
      color: i % 3 === 0 ? 'text-pink-400' : i % 3 === 1 ? 'text-purple-400' : 'text-indigo-400'
    };
  });

  return (
    <motion.div 
      id="words"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: false, margin: "-20px" }}
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
      }}
      className="space-y-16 py-20"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-gray-900/40 rounded-full mb-4 shadow-sm border border-pink-900/20">
          <Cloud className="w-8 h-8 text-pink-400" />
        </div>
        <h2 className="text-5xl font-black text-gray-100">Our Language</h2>
        <p className="text-xl text-pink-400 italic">The words we weave into the fabric of our days.</p>
      </div>

      <div className="relative h-[500px] flex items-center justify-center overflow-hidden bg-gray-900/20 rounded-[4rem] border border-gray-800/50 backdrop-blur-sm">
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
                transition: { type: "spring", stiffness: 50, damping: 15 } 
              }
            }}
            whileHover={{ scale: word.scale * 1.2, opacity: 1, zIndex: 10, transition: { duration: 0.2 } }}
            className={`absolute cursor-default font-black tracking-tight ${word.color} select-none`}
            style={{ fontSize: '1.5rem' }}
          >
            {word.word}
          </motion.div>
        ))}
        
        {/* Center element */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="z-0 opacity-10 text-[12rem] font-black text-pink-500 pointer-events-none select-none"
        >
          💖
        </motion.div>
      </div>
    </motion.div>
  );
}
