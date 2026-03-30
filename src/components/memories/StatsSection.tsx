import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, TrendingUp, Star, BarChart3, Clock } from 'lucide-react';
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
      className="relative bg-white/60 backdrop-blur-3xl p-10 rounded-[3rem] shadow-xl border border-white/80 flex flex-col items-center justify-center text-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-6 p-5 bg-white/80 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-sm border border-white/50">
        {icon}
      </div>
      <h4 className="text-lg text-gray-500 font-bold uppercase tracking-wider mb-2">{title}</h4>
      <p className="text-5xl font-black text-gray-900">{value}</p>

      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-72 bg-gray-900 text-white text-sm font-medium p-4 rounded-2xl shadow-2xl z-20 pointer-events-none"
          >
            {tooltip}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function StatsSection({ data }: StatsSectionProps) {
  const formatName = (name: string) => {
    if (!name) return "Unknown";
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
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black text-gray-900 mb-4">By The Numbers</h2>
        <p className="text-xl text-gray-500">A statistical look at your conversations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          icon={<MessageCircle className="w-8 h-8 text-blue-500" />} 
          title="Total Messages" 
          value={data.stats.totalMessages.toLocaleString()} 
          tooltip="The total number of messages you've sent to each other." 
        />
        <StatCard 
          icon={<TrendingUp className="w-8 h-8 text-green-500" />} 
          title="Most Chatty" 
          value={formatName(data.stats.mostActivePerson)} 
          tooltip="The person who sent the most messages overall." 
        />
        <StatCard 
          icon={<Star className="w-8 h-8 text-yellow-500" />} 
          title="Top Emojis" 
          value={data.stats.topEmojis.join(" ")} 
          tooltip="The emojis you both use the most frequently." 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
          className="bg-white/60 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl border border-white/80"
        >
          <div className="flex items-center space-x-4 mb-10">
            <BarChart3 className="w-8 h-8 text-orange-500" />
            <h3 className="text-3xl font-bold text-gray-900">Time of Day</h3>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="hour" hide />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#f472b6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-4 font-bold uppercase tracking-wider">
            <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span>
          </div>
        </motion.div>

        <motion.div 
          variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
          className="bg-white/60 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl border border-white/80 flex flex-col justify-center"
        >
          <div className="flex items-center space-x-4 mb-10">
            <Clock className="w-8 h-8 text-indigo-500" />
            <h3 className="text-3xl font-bold text-gray-900">Avg Response Time</h3>
          </div>
          <div className="space-y-6">
            {data.participants.map((p) => (
              <div key={p} className="flex items-center justify-between p-6 bg-white/80 rounded-3xl border border-white/50 shadow-sm">
                <span className="font-bold text-2xl text-gray-800">{formatName(p)}</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-black text-indigo-600">{data.extendedStats.avgResponseTime[p] || '< 1'}</span>
                  <span className="text-gray-500 font-bold text-lg">mins</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
