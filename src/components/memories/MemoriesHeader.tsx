import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { SectionParticles } from './SectionParticles';

interface MemoriesHeaderProps {
  participants: string[];
  vibe: string;
}

export function MemoriesHeader({ participants, vibe }: MemoriesHeaderProps) {
  const formatName = (name: string) => {
    if (!name) return "Unknown";
    const lowerName = name.toLowerCase();
    if (lowerName.includes('nullifiedgalaxy')) return "Null";
    if (lowerName.includes('vanessa')) return "Yun";
    const cleanName = name.split(/_|(?=[A-Z])/)[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  return (
    <motion.div 
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.2 } }
      }}
      className="space-y-12 relative pt-12 pb-8"
    >
      <SectionParticles />
      <div className="text-center space-y-6 relative z-10">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }} 
          animate={{ scale: 1, rotate: 0 }} 
          transition={{ type: "spring", bounce: 0.6, duration: 1.5 }}
          className="inline-flex items-center justify-center p-6 bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-full mb-2 shadow-sm border border-pink-500/20"
        >
          <Heart role="img" aria-label="Heart icon" className="w-16 h-16 text-pink-500 fill-pink-500" />
        </motion.div>
        
        <div className="space-y-2">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-pink-400 font-bold tracking-widest uppercase text-sm"
          >
            Celebrating Our
          </motion.p>
          <h1 className="text-4xl md:text-6xl font-black text-gray-100 tracking-tight">
            1st Anniversary
          </h1>
        </div>

        <h2 className="text-5xl md:text-7xl font-black tracking-tight text-gray-100 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {formatName(participants[0])}
          </span>
          {participants[1] && (
            <>
              <span className="text-gray-700 mx-6">&</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-300">
                {formatName(participants[1])}
              </span>
            </>
          )}
        </h2>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-2xl md:text-3xl text-gray-400 font-medium italic tracking-wide max-w-2xl mx-auto">
            "{vibe}"
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
