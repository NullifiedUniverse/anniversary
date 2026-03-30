import React from 'react';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';
import { MemoryData } from '../../lib/gemini';

interface StorySectionProps {
  data: MemoryData;
}

export function StorySection({ data }: StorySectionProps) {
  const formatName = (name: string) => {
    if (!name) return "Unknown";
    const cleanName = name.split(/_|(?=[A-Z])/)[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  return (
    <motion.div 
      id="story"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.2 } }
      }}
      className="space-y-32 relative z-10"
    >
      {/* Summary */}
      <motion.div 
        variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
        className="max-w-4xl mx-auto p-8 md:p-12 bg-white/60 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/80"
      >
        <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed font-serif text-center">
          {data.summary}
        </p>
      </motion.div>

      {/* How it Started */}
      <div className="max-w-4xl mx-auto relative">
        <div className="flex items-center justify-center space-x-4 mb-12">
          <Calendar className="w-10 h-10 text-purple-500" />
          <h3 className="text-4xl font-bold text-gray-900">How It Started</h3>
        </div>
        
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 30 },
            show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
          }}
          className="bg-white/60 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/80 flex flex-col space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-200/50 to-transparent rounded-bl-full opacity-50 pointer-events-none" />
          
          <div className="text-center text-lg font-bold tracking-widest text-gray-500 uppercase mb-4">
            {new Date(data.firstMessage.date).toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          
          <div className="self-start max-w-[85%]">
            <div className="text-sm text-gray-500 mb-2 ml-4 font-bold uppercase tracking-wider">
              {formatName(data.firstMessage.sender)}
            </div>
            <div className="bg-white/90 backdrop-blur-md text-gray-800 px-8 py-6 rounded-3xl rounded-tl-sm text-xl md:text-2xl shadow-sm font-medium border border-white/50">
              {data.firstMessage.text}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
