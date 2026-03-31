import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, TrendingUp, Star, BarChart3, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { MemoryData } from '../../lib/gemini';

interface StatsSectionProps {
  data: MemoryData;
}

function StatCard({ icon, title, value, tooltip }: { icon: React.ReactNode, title: string, value: string | number, tooltip: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" } }
      }}
      className="relative bg-white/40 backdrop-blur-2xl p-10 rounded-[3rem] shadow-sm border border-pink-100/50 flex flex-col items-center justify-center text-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-6 p-5 bg-white/60 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-sm border border-white/50">
        {icon}
      </div>
      <h4 className="text-lg text-pink-400 font-bold uppercase tracking-wider mb-2">{title}</h4>
      <p className="text-5xl font-black text-gray-800">{value}</p>

      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-72 bg-gray-800/90 backdrop-blur-md text-white text-sm font-medium p-4 rounded-2xl shadow-xl z-20 pointer-events-none"
          >
            {tooltip}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-800/90" />
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
    hour: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`,
    count: data.extendedStats.messagesByHour[i] || 0
  }));

  return (
    <motion.div 
      id="stats"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
      className="space-y-16 max-w-5xl mx-auto pt-20"
    >
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-5xl font-black text-gray-900">Our Rhythm</h2>
        <p className="text-xl text-pink-500 italic">The heartbeat of our connection, told through the rhythm of our words.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          icon={<Heart className="w-8 h-8 text-pink-500 fill-pink-500" />} 
          title="Shared Words" 
          value={data.stats.totalMessages.toLocaleString()} 
          tooltip="Every single message is a piece of our story together." 
        />
        <StatCard 
          icon={<TrendingUp className="w-8 h-8 text-purple-500" />} 
          title="Always There" 
          value={formatName(data.stats.mostActivePerson)} 
          tooltip="The one who keeps the conversation blooming." 
        />
        <StatCard 
          icon={<Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />} 
          title="Our Language" 
          value={data.stats.topEmojis.join(" ")} 
          tooltip="The little symbols that carry our biggest feelings." 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
          className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-10 shadow-sm border border-pink-100/50"
        >
          <div className="flex items-center space-x-4 mb-10">
            <BarChart3 className="w-8 h-8 text-pink-400" />
            <h3 className="text-3xl font-bold text-gray-900">Our Daily Flow</h3>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="hour" hide />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255, 133, 161, 0.1)' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 30px rgba(255, 133, 161, 0.1)', background: 'rgba(255, 255, 255, 0.9)' }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="url(#romanticGradient)" />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="romanticGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff85a1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#a185ff" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs text-pink-300 mt-6 font-bold uppercase tracking-widest px-2">
            <span>Midnight</span><span>Dawn</span><span>Noon</span><span>Dusk</span><span>Night</span>
          </div>
        </motion.div>

        <motion.div 
          variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
          className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-10 shadow-sm border border-pink-100/50 flex flex-col justify-center"
        >
          <div className="flex items-center space-x-4 mb-10">
            <Clock className="w-8 h-8 text-purple-400" />
            <h3 className="text-3xl font-bold text-gray-900">Waiting for You</h3>
          </div>
          <div className="space-y-6">
            {data.participants.map((p) => (
              <div key={p} className="flex items-center justify-between p-6 bg-white/60 rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                <span className="font-bold text-2xl text-gray-700">{formatName(p)}</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-black text-pink-500">{data.extendedStats.avgResponseTime[p] || '< 1'}</span>
                  <span className="text-pink-300 font-bold text-lg">mins</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
