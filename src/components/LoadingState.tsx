import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, MessageCircle, Star } from 'lucide-react';

interface LoadingStateProps {
  status: string;
}

const loadingFacts = [
  "Finding your first message ever...",
  "Counting all those late night chats...",
  "Analyzing your top inside jokes...",
  "Mapping your favorite emojis...",
  "Extracting your most romantic quotes...",
  "Calculating who replies faster...",
  "Preparing your relationship superlatives...",
  "Synthesizing your 1-year journey..."
];

export function LoadingState({ status }: LoadingStateProps) {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % loadingFacts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-xl mx-auto">
      <div className="relative w-40 h-40 mb-12">
        {/* Animated Background Orbs */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [-10, 10, -10],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-4 -left-4 w-24 h-24 bg-purple-400/20 blur-2xl rounded-full"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            x: [10, -10, 10],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-4 -right-4 w-24 h-24 bg-pink-400/20 blur-2xl rounded-full"
        />
        
        {/* Central Icon Animation */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white flex items-center justify-center w-full h-full"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 border-2 border-dashed border-pink-200 rounded-full"
            />
            <Sparkles className="w-16 h-16 text-transparent bg-clip-text bg-gradient-to-tr from-purple-500 to-pink-500 fill-pink-500/20" />
            
            {/* Floating Mini Icons */}
            <motion.div
              animate={{ y: [-20, -30, -20], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              className="absolute -top-10 -right-4"
            >
              <Heart size={20} className="text-pink-400 fill-pink-400" />
            </motion.div>
            <motion.div
              animate={{ x: [20, 30, 20], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute top-4 -right-12"
            >
              <MessageCircle size={18} className="text-blue-400 fill-blue-400" />
            </motion.div>
            <motion.div
              animate={{ x: [-20, -30, -20], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute top-4 -left-12"
            >
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Creating Magic</h2>
      <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs mb-8">{status}</p>
      
      <div className="bg-white/40 backdrop-blur-md px-8 py-4 rounded-full border border-white/60 shadow-sm min-h-[56px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={factIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-gray-700 font-medium italic"
          >
            {loadingFacts[factIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

