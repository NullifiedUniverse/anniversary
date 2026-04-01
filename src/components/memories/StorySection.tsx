import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Sparkles } from 'lucide-react';
import { MemoryData } from '../../lib/gemini';

interface StorySectionProps {
  data: MemoryData;
}

export function StorySection({ data }: StorySectionProps) {
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
      id="story"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: false, margin: "-20px" }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0, transition: { duration: 1, staggerChildren: 0.2 } }
      }}
      className="space-y-24 relative z-10"
    >
      {/* Narrative Summary */}
      <motion.div 
        variants={{ hidden: { opacity: 0, scale: 0.98 }, show: { opacity: 1, scale: 1 } }}
        className="max-w-[1000px] mx-auto p-16 md:p-24 bg-white/[0.02] backdrop-blur-3xl rounded-[5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden group min-h-[400px] flex items-center justify-center"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5 pointer-events-none" />
        <Sparkles className="absolute top-12 left-12 text-indigo-500 opacity-20" size={40} />
        
        {data.summary ? (
          <p className="text-3xl md:text-5xl text-gray-100 leading-[1.4] font-serif text-center relative z-10 drop-shadow-2xl whitespace-pre-wrap">
            {data.summary}
          </p>
        ) : (
          <div className="text-center space-y-6">
             <div className="w-16 h-16 border-t-2 border-indigo-500 rounded-full animate-spin mx-auto" />
             <p className="text-2xl text-gray-500 italic font-serif">Weaving our shared history into a narrative...</p>
          </div>
        )}
        
        <Sparkles className="absolute bottom-12 right-12 text-pink-500 opacity-20" size={40} />
      </motion.div>

      {/* The Origin */}
      <div className="max-w-4xl mx-auto relative px-4">
        <div className="flex flex-col items-center justify-center space-y-6 mb-20">
          <div className="p-5 bg-amber-500/10 rounded-full border border-amber-500/20"><Calendar className="w-10 h-10 text-amber-400" /></div>
          <h3 className="text-5xl font-black text-white tracking-tighter">The First Spark</h3>
          <p className="text-xl text-gray-400 font-bold tracking-[0.3em] uppercase">Where our journey began</p>
        </div>
        
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 40 },
            show: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
          }}
          className="bg-gray-900/40 backdrop-blur-3xl rounded-[4rem] p-12 md:p-20 shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/5 flex flex-col space-y-12 relative overflow-hidden group min-h-[300px]"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent rounded-bl-full opacity-50 pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
          
          <div className="text-center">
            <time className="text-2xl font-serif italic text-amber-400 drop-shadow-sm">
              {data.firstMessage?.date ? new Date(data.firstMessage.date).toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'A special day in 2025'}
            </time>
          </div>
          
          <div className="flex flex-col space-y-4">
            <div className="text-xs font-black tracking-[0.4em] text-gray-500 uppercase ml-6">
              {data.firstMessage?.sender ? formatName(data.firstMessage.sender) : 'One of us'} spoke first...
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500/50 to-transparent rounded-full" />
              <div className="bg-white/[0.03] backdrop-blur-md text-white px-12 py-10 rounded-[3rem] rounded-tl-xl text-3xl md:text-4xl shadow-2xl font-medium border border-white/10 italic leading-snug">
                "{data.firstMessage?.text || 'Searching for our first hello...'}"
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
