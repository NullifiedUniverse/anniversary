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
      viewport={{ once: true, margin: "0px" }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0, transition: { duration: 1.2, staggerChildren: 0.3 } }
      }}
      className="space-y-16 relative pt-24 pb-12"
    >
      <SectionParticles />
      <div className="text-center space-y-10 relative z-10">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }} 
          animate={{ scale: 1, rotate: 0 }} 
          transition={{ type: "spring", bounce: 0.6, duration: 2 }}
          className="inline-flex items-center justify-center p-8 bg-gradient-to-br from-pink-900/40 to-purple-900/40 rounded-[2.5rem] mb-4 shadow-[0_20px_50px_rgba(236,72,153,0.2)] border border-pink-500/20"
        >
          <Heart role="img" aria-label="Heart icon" className="w-20 h-20 text-pink-500 fill-pink-500 blur-[1px]" />
        </motion.div>
        
        <div className="space-y-4">
          <motion.p 
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            className="text-pink-500 font-black tracking-[0.5em] uppercase text-xs opacity-80"
          >
            A Cinematic Celebration of Our
          </motion.p>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
            First Year
          </h1>
        </div>

        <h2 className="text-6xl md:text-[9rem] font-black tracking-tighter text-white leading-none flex flex-wrap items-center justify-center gap-x-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-[0_10px_30px_rgba(129,140,248,0.3)]">
            {formatName(participants[0])}
          </span>
          {participants[1] && (
            <>
              <span className="text-gray-400 text-4xl md:text-6xl">&</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 drop-shadow-[0_10px_30px_rgba(244,114,182,0.3)]">
                {formatName(participants[1])}
              </span>
            </>
          )}
        </h2>
        
        <motion.div
          variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
          className="max-w-3xl mx-auto"
        >
          <p className="text-3xl md:text-4xl text-gray-400 font-serif italic tracking-wide leading-relaxed">
            "{vibe}"
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
