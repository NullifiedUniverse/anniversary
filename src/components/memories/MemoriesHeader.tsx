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
      viewport={{ once: false, margin: "-20px" }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0, transition: { duration: 1.2, staggerChildren: 0.3 } }
      }}
      className="space-y-8 relative pt-12 pb-12 min-h-[600px] flex flex-col items-center justify-center"
    >
      <SectionParticles />
      <div className="text-center space-y-8 relative z-10 w-full px-4">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }} 
          animate={{ scale: 1, rotate: 0 }} 
          transition={{ type: "spring", bounce: 0.6, duration: 2 }}
          className="inline-flex items-center justify-center p-6 bg-gradient-to-br from-pink-900/40 to-purple-900/40 rounded-[2rem] mb-4 shadow-[0_20px_50px_rgba(236,72,153,0.2)] border border-pink-500/20"
        >
          <Heart role="img" aria-label="Heart icon" className="w-16 h-16 text-pink-500 fill-pink-500 blur-[1px]" />
        </motion.div>
        
        <div className="space-y-4">
          <motion.p 
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            className="text-pink-500 font-black tracking-[0.5em] uppercase text-[10px] opacity-80"
          >
            A Cinematic Celebration of Our
          </motion.p>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
            First Year
          </h1>
        </div>

        <h2 className="text-5xl md:text-[8rem] font-black tracking-tighter text-white leading-none flex flex-wrap items-center justify-center gap-x-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-[0_10px_30px_rgba(129,140,248,0.3)]">
            {formatName(participants[0])}
          </span>
          {participants[1] && (
            <>
              <span className="text-gray-400 text-3xl md:text-5xl">&</span>
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
          <p className="text-2xl md:text-4xl text-gray-300 font-serif italic tracking-wide leading-relaxed drop-shadow-lg">
            "{vibe || 'A beautiful journey together'}"
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
