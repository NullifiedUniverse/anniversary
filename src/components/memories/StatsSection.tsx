import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, TrendingUp, Star, BarChart3, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, AreaChart, Area, YAxis } from 'recharts';
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
      className="relative bg-white/5 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 flex flex-col items-center justify-center text-center group hover:bg-white/[0.08] transition-colors duration-500 shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-8 p-6 bg-white/5 rounded-full group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shadow-xl">
        {icon}
      </div>
      <h4 className="text-xs text-gray-500 font-black uppercase tracking-[0.3em] mb-4">{title}</h4>
      <p className="text-6xl font-black text-white tracking-tighter">{value}</p>

      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 bg-white text-black text-xs font-bold p-5 rounded-3xl shadow-[0_20px_50px_rgba(255,255,255,0.2)] z-20 pointer-events-none"
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
    <div id="stats" className="space-y-32 max-w-[1400px] mx-auto pt-20 px-4">
      <div className="text-center space-y-6">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-7xl font-black text-white tracking-tighter"
        >
          Our Rhythm
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl text-gray-500 font-medium italic tracking-wide"
        >
          The heartbeat of our connection, mapped through time.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <StatCard icon={<Heart className="w-10 h-10 text-pink-500 fill-pink-500" />} title="Total Words" value={data.stats.totalMessages.toLocaleString()} tooltip="Every message is a page in our book." delay={0.1} />
        <StatCard icon={<TrendingUp className="w-10 h-10 text-indigo-400" />} title="Energy Maker" value={formatName(data.stats.mostActivePerson)} tooltip="The one who lights up the screen." delay={0.2} />
        <StatCard icon={<Star className="w-10 h-10 text-amber-400 fill-amber-400" />} title="Our Code" value={data.stats.topEmojis.slice(0, 3).join(" ") || "❤️✨"} tooltip="The symbols that say everything." delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Main large chart */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 bg-white/5 backdrop-blur-3xl rounded-[4rem] p-16 border border-white/10 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center space-x-6 mb-16 relative z-10">
            <div className="p-4 bg-indigo-500/10 rounded-3xl"><BarChart3 className="w-10 h-10 text-indigo-400" /></div>
            <h3 className="text-4xl font-black text-white tracking-tight">The Daily Flow</h3>
          </div>
          
          <div className="h-[400px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" hide />
                <RechartsTooltip 
                  cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: '32px', border: 'none', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '20px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#areaGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-between text-[10px] text-gray-600 mt-12 font-black uppercase tracking-[0.4em] relative z-10 px-4">
            <span>Midnight</span><span>Morning</span><span>Afternoon</span><span>Evening</span><span>Night</span>
          </div>
        </motion.div>

        {/* Side stats */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white/5 backdrop-blur-3xl rounded-[4rem] p-16 border border-white/10 shadow-2xl flex flex-col justify-center"
        >
          <div className="flex items-center space-x-6 mb-16">
            <div className="p-4 bg-pink-500/10 rounded-3xl"><Clock className="w-10 h-10 text-pink-400" /></div>
            <h3 className="text-4xl font-black text-white tracking-tight">Response Echo</h3>
          </div>
          
          <div className="space-y-10">
            {data.participants.map((p, i) => (
              <div key={p} className="flex items-center justify-between p-10 bg-white/5 rounded-[3rem] border border-white/5 hover:bg-white/10 transition-all duration-500 group">
                <span className="font-black text-3xl text-gray-300 group-hover:text-white transition-colors">{formatName(p)}</span>
                <div className="flex items-baseline space-x-3">
                  <span className="text-6xl font-black text-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]">{data.extendedStats.avgResponseTime[p] || '< 1'}</span>
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
