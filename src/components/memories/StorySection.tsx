import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Sparkles, Sun, Sunset, Moon, Coffee } from 'lucide-react';
import { MemoryData } from '../../lib/gemini';

interface StorySectionProps {
  data: MemoryData;
  seeds?: any;
}

export function StorySection({ data, seeds }: StorySectionProps) {
  const formatName = (name: string) => {
    if (!name) return "Unknown";
    const lowerName = name.toLowerCase();
    if (lowerName.includes('nullifiedgalaxy')) return "Null";
    if (lowerName.includes('vanessa')) return "Yun";
    const cleanName = name.split(/_|(?=[A-Z])/)[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  const getTimeIcon = (cat: string) => {
    if (cat.includes('Morning')) return <Coffee className="text-amber-400" />;
    if (cat.includes('Daylight')) return <Sun className="text-yellow-400" />;
    if (cat.includes('Twilight')) return <Sunset className="text-orange-400" />;
    return <Moon className="text-indigo-400" />;
  };

  return (
    <motion.div 
      id="story"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: false, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 1, staggerChildren: 0.3 } }
      }}
      className="space-y-32 relative z-10 py-20"
    >
      {/* Cinematic Story Line Background */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent pointer-events-none -z-10 hidden md:block" />

      {/* Narrative Summary */}
      <motion.div 
        variants={{ 
          hidden: { opacity: 0, y: 30, scale: 0.98 }, 
          show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 20, stiffness: 100 } } 
        }}
        className="max-w-[1000px] mx-auto p-12 md:p-24 bg-white/[0.02] backdrop-blur-3xl rounded-[4rem] md:rounded-[6rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden group min-h-[400px] flex items-center justify-center transition-all duration-1000 hover:bg-white/[0.04] hover:shadow-[0_40px_120px_rgba(99,102,241,0.15)]"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5 pointer-events-none" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full"
        />
        
        <Sparkles className="absolute top-12 left-12 text-indigo-500 opacity-20" size={40} />
        
        {data.summary ? (
          <p className="text-2xl md:text-5xl text-gray-100 leading-[1.6] font-serif text-center relative z-10 drop-shadow-2xl whitespace-pre-wrap px-4">
            {data.summary}
          </p>
        ) : (
          <div className="text-center space-y-8">
             <div className="w-20 h-20 border-t-2 border-indigo-500 rounded-full animate-spin mx-auto opacity-50" />
             <p className="text-2xl text-gray-500 italic font-serif animate-pulse">Tracing the soulful patterns of our history...</p>
          </div>
        )}
        
        <Sparkles className="absolute bottom-12 right-12 text-pink-500 opacity-20" size={40} />
      </motion.div>

      {/* Time of Day Insights (Rigorous Addition) */}
      {seeds?.timeInsights?.length > 0 && (
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-black text-white tracking-tight">The Rhythm of Our Days</h3>
            <p className="text-lg text-gray-400 font-medium">How our connection evolves from dawn to dusk.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {seeds.timeInsights.map((insight: any, i: number) => (
              <motion.div 
                key={i}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="bg-white/5 p-8 rounded-[3rem] border border-white/10 flex flex-col space-y-6 group hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getTimeIcon(insight.category)}
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-white uppercase tracking-widest text-xs">{insight.category}</h4>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">{insight.description}</p>
                </div>
                {insight.sample && (
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] text-gray-500 italic line-clamp-3">"{insight.sample}"</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* The Origin */}
      <div className="max-w-4xl mx-auto relative px-4">
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="flex flex-col items-center justify-center space-y-8 mb-24"
        >
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"
            />
            <div className="relative p-6 bg-amber-500/10 rounded-[2rem] border border-amber-500/20 backdrop-blur-xl">
              <Calendar className="w-12 h-12 text-amber-400" />
            </div>
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter">The First Spark</h3>
            <p className="text-xs font-black tracking-[0.6em] text-amber-500/60 uppercase">The moment our worlds aligned</p>
          </div>
        </motion.div>
        
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 40, scale: 0.95 },
            show: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } }
          }}
          className="bg-gray-900/40 backdrop-blur-3xl rounded-[3rem] md:rounded-[5rem] p-12 md:p-24 shadow-[0_60px_150px_rgba(0,0,0,0.7)] border border-white/5 flex flex-col space-y-16 relative overflow-hidden group min-h-[350px] transition-transform duration-1000 hover:scale-[1.01]"
        >
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent rounded-bl-full opacity-40 pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
          
          <div className="text-center relative z-10">
            <time className="text-3xl md:text-4xl font-serif italic text-amber-200/90 drop-shadow-2xl">
              {data.firstMessage?.date ? new Date(data.firstMessage.date).toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'A golden day in 2025'}
            </time>
          </div>
          
          <div className="flex flex-col space-y-6 relative z-10">
            <div className="text-[10px] font-black tracking-[0.5em] text-gray-500 uppercase flex items-center space-x-4">
              <div className="h-px w-8 bg-gray-800" />
              <span>{data.firstMessage?.sender ? formatName(data.firstMessage.sender) : 'One of us'} spoke first</span>
            </div>
            <div className="relative group/msg">
              <motion.div 
                whileHover={{ x: 10 }}
                className="bg-white/[0.04] backdrop-blur-2xl text-white px-10 md:px-16 py-12 md:py-16 rounded-[2.5rem] md:rounded-[4rem] rounded-tl-xl text-3xl md:text-5xl shadow-3xl font-medium border border-white/10 italic leading-[1.3] relative z-10"
              >
                <Sparkles className="absolute -top-6 -right-6 text-amber-500/30 group-hover/msg:text-amber-500/60 transition-colors" size={48} />
                "{data.firstMessage?.text || 'Searching for our first hello...'}"
              </motion.div>
              <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full -z-10 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-1000" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
