import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { SectionParticles } from './SectionParticles';
import { formatName } from '../../lib/utils';

interface MemoriesHeaderProps {
  participants: string[];
  vibe: string;
}

export function MemoriesHeader({ participants, vibe }: MemoriesHeaderProps) {
  return (
    <motion.div 
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: false, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 2, staggerChildren: 0.4 } }
      }}
      className="space-y-12 relative pt-20 pb-20 min-h-screen flex flex-col items-center justify-center"
    >
      <SectionParticles />
      <div className="text-center space-y-10 relative z-10 w-full px-6">
        <motion.div 
          initial={{ scale: 0, rotate: -180, opacity: 0 }} 
          animate={{ scale: 1, rotate: 0, opacity: 1 }} 
          transition={{ type: "spring", bounce: 0.6, duration: 2.5 }}
          className="inline-flex items-center justify-center p-8 bg-gradient-to-br from-pink-900/40 to-purple-900/40 rounded-[2.5rem] mb-6 shadow-[0_30px_80px_rgba(236,72,153,0.3)] border border-pink-500/20 group hover:scale-110 transition-transform duration-1000"
        >
          <Heart role="img" aria-label="Heart icon" className="w-20 h-20 text-pink-500 fill-pink-500 blur-[0.5px] transition-all duration-700 group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(236,72,153,1)]" />
        </motion.div>
        
        <div className="space-y-6">
          <motion.p 
            variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
            className="text-pink-500 font-black tracking-[0.7em] uppercase text-[10px] md:text-xs opacity-80"
          >
            A Cinematic Celebration of Our
          </motion.p>
          <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] drop-shadow-2xl">
            First Year
          </h1>
        </div>

        <h2 className="text-5xl md:text-[9rem] font-black tracking-tighter text-white leading-none flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <motion.span 
            variants={{ hidden: { opacity: 0, x: -50 }, show: { opacity: 1, x: 0 } }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-400 drop-shadow-[0_15px_40px_rgba(129,140,248,0.4)]"
          >
            {formatName(participants[0])}
          </motion.span>
          {participants[1] && (
            <>
              <motion.span 
                variants={{ hidden: { opacity: 0, scale: 0 }, show: { opacity: 1, scale: 1 } }}
                className="text-gray-400 text-4xl md:text-7xl font-light italic"
              >&</motion.span>
              <motion.span 
                variants={{ hidden: { opacity: 0, x: 50 }, show: { opacity: 1, x: 0 } }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 drop-shadow-[0_15px_40px_rgba(244,114,182,0.4)]"
              >
                {formatName(participants[1])}
              </motion.span>
            </>
          )}
        </h2>
        
        <motion.div
          variants={{ hidden: { opacity: 0, scale: 0.98, y: 20 }, show: { opacity: 1, scale: 1, y: 0 } }}
          className="max-w-4xl mx-auto pt-10"
        >
          <p className="text-2xl md:text-5xl text-gray-300 font-serif italic tracking-wide leading-relaxed drop-shadow-2xl">
            "{vibe || 'A beautiful journey together'}"
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
