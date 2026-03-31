import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, TrendingUp, Star, BarChart3, Clock, Zap } from 'lucide-react';
import { XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MemoryData } from '../../lib/gemini';

interface StatsSectionProps {
  data: MemoryData;
}

function StatCard({ icon, title, value, tooltip, delay = 0 }: { icon: React.ReactNode, title: string, value: string | number, tooltip: string, delay?: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className="relative bg-white/[0.03] backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 flex flex-col items-center justify-center text-center group hover:bg-white/[0.08] transition-all duration-700 shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-8 p-6 bg-white/5 rounded-[2rem] group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-xl border border-white/5">
        {icon}
      </div>
      <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em] mb-4">{title}</h4>
      <p className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">{value}</p>

      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 bg-white text-black text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl shadow-[0_20px_50px_rgba(255,255,255,0.2)] z-20 pointer-events-none"
          >
            {tooltip}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function StatsSection({ data }: StatsSectionProps) {
  const formatName = (name: string) => {
    if (!name) return "Unknown";
    const lowerName = name.toLowerCase();
    if (lowerName.includes('nullifiedgalaxy')) return "Null";
    if (lowerName.includes('vanessa')) return "Yun";
    const cleanName = name.split(/_|(?=[A-Z])/)[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  const chartData = Array.from({ length: 24 }).map((_, i) => ({
    hour: i,
    label: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`,
    count: data.extendedStats.messagesByHour[i] || 0
  }));

  return (
    <div id="stats" className="space-y-48 max-w-[1400px] mx-auto pt-20 px-4">
      <div className="text-center space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="inline-flex items-center space-x-3 bg-indigo-500/10 text-indigo-400 px-6 py-2.5 rounded-full text-[10px] font-black border border-indigo-500/20 uppercase tracking-[0.3em]">
          <Zap size={14} className="fill-indigo-400" />
          <span>The Frequency of Us</span>
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-none"
        >
          Our Rhythm
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl text-gray-500 font-medium italic tracking-wide max-w-3xl mx-auto"
        >
          Mapping the heartbeat of every late-night talk and early-morning smile.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <StatCard icon={<Heart className="w-10 h-10 text-pink-500 fill-pink-500" />} title="Shared Words" value={data.stats.totalMessages.toLocaleString()} tooltip="Each message a heartbeat in our digital home." delay={0.1} />
        <StatCard icon={<TrendingUp className="w-10 h-10 text-indigo-400" />} title="Primary Energy" value={formatName(data.stats.mostActivePerson)} tooltip="The one who keeps our world spinning." delay={0.2} />
        <StatCard icon={<Star className="w-10 h-10 text-amber-400 fill-amber-400" />} title="Our Cipher" value={data.stats.topEmojis.slice(0, 3).join(" ") || "❤️✨"} tooltip="The symbols that speak for our souls." delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-stretch">
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="lg:col-span-3 bg-white/[0.02] backdrop-blur-3xl rounded-[5rem] p-16 border border-white/10 shadow-2xl relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center space-x-6 mb-20 relative z-10">
            <div className="p-5 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20"><BarChart3 className="w-10 h-10 text-indigo-400" /></div>
            <div className="flex flex-col">
              <h3 className="text-4xl font-black text-white tracking-tight">The Daily Flow</h3>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/60 mt-1">Our shared timeline</span>
            </div>
          </div>
          
          <div className="h-[450px] w-full relative z-10 px-4 min-h-[450px]">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" hide />
                <RechartsTooltip 
                  cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '8 8' }}
                  contentStyle={{ borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.9)', color: '#fff', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                />
                <Area type="monotone" dataKey="count" stroke="#818cf8" strokeWidth={6} fillOpacity={1} fill="url(#areaGradient)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-between text-[10px] text-gray-600 mt-16 font-black uppercase tracking-[0.5em] relative z-10 px-8">
            <span>Midnight</span><span>Dawn</span><span>Noon</span><span>Dusk</span><span>Night</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="lg:col-span-2 bg-white/[0.02] backdrop-blur-3xl rounded-[5rem] p-16 border border-white/10 shadow-2xl flex flex-col"
        >
          <div className="flex items-center space-x-6 mb-20">
            <div className="p-5 bg-pink-500/10 rounded-[2rem] border border-pink-500/20"><Clock className="w-10 h-10 text-pink-400" /></div>
            <div className="flex flex-col">
              <h3 className="text-4xl font-black text-white tracking-tight">Response Echo</h3>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500/60 mt-1">The wait for you</span>
            </div>
          </div>
          
          <div className="flex-grow flex flex-col justify-center space-y-12">
            {data.participants.map((p, i) => (
              <div key={p} className="flex items-center justify-between p-12 bg-white/[0.03] rounded-[4rem] border border-white/5 hover:bg-white/10 transition-all duration-700 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-500/50 to-transparent" />
                <span className="font-black text-4xl text-gray-400 group-hover:text-white transition-colors duration-500 tracking-tighter">{formatName(p)}</span>
                <div className="flex items-baseline space-x-4">
                  <span className="text-7xl font-black text-pink-500 drop-shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-transform duration-700 group-hover:scale-110">{data.extendedStats.avgResponseTime[p] || '< 1'}</span>
                  <span className="text-gray-600 font-black text-xs uppercase tracking-widest">min</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
