import React from 'react';
import { motion } from 'motion/react';
import { MemoryData } from '../../lib/gemini';

interface WordCloudSectionProps {
  data: MemoryData;
}

interface WordBubbleProps {
  item: { word: string, count: number };
  maxCount: number;
  colorClass: string;
  index: number;
  key?: any;
}

function WordBubble({ item, maxCount, colorClass, index }: WordBubbleProps) {
  const baseScale = 1 + (item.count / maxCount) * 1.5;
  const dynamicMargin = `${baseScale * 0.75 + 0.5}rem`;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      whileInView={{ opacity: 1, scale: baseScale, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        opacity: { duration: 0.6, delay: index * 0.05 },
        scale: { duration: 0.8, delay: index * 0.05, type: "spring", stiffness: 100, damping: 12 },
        y: { duration: 0.6, delay: index * 0.05, type: "spring" }
      }}
      className="relative flex items-center justify-center"
      style={{ zIndex: 10, margin: dynamicMargin }}
      whileHover={{ zIndex: 40 }}
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 + Math.random() * 2, ease: "easeInOut" }}
        whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}
        className={`relative px-6 py-3 rounded-full shadow-lg border backdrop-blur-2xl cursor-pointer flex items-center justify-center group ${colorClass}`}
      >
        <span className="font-black text-xl md:text-2xl">{item.word}</span>
        
        {/* Tooltip */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl pointer-events-none transform scale-75 group-hover:scale-100 whitespace-nowrap">
          {item.count} times
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function WordCloudSection({ data }: WordCloudSectionProps) {
  const topWords = data.extendedStats.topWords;
  const maxCount = topWords[0]?.count || 1;

  const colors = [
    'bg-pink-100/90 text-pink-700 border-pink-200', 
    'bg-purple-100/90 text-purple-700 border-purple-200', 
    'bg-orange-100/90 text-orange-700 border-orange-200', 
    'bg-blue-100/90 text-blue-700 border-blue-200', 
    'bg-teal-100/90 text-teal-700 border-teal-200'
  ];

  return (
    <motion.div 
      id="words"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }}
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
      className="max-w-6xl mx-auto text-center pt-20"
    >
      <div className="mb-16">
        <h2 className="text-5xl font-black text-gray-900 mb-4">Your Words</h2>
        <p className="text-xl text-gray-500">The words that define your conversations.</p>
      </div>
      
      <div className="min-h-[600px] flex flex-wrap justify-center items-center content-center relative overflow-visible px-4">
        {topWords.map((item, i) => (
          <WordBubble 
            key={item.word} 
            item={item} 
            maxCount={maxCount} 
            colorClass={colors[i % colors.length]} 
            index={i} 
          />
        ))}
      </div>
    </motion.div>
  );
}
