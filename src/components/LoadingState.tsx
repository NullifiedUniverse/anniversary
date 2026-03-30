import React from 'react';
import { motion } from 'motion/react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  status: string;
}

export function LoadingState({ status }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-24 h-24 mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <div className="relative bg-white p-4 rounded-full shadow-xl flex items-center justify-center w-full h-full">
          <Sparkles className="w-10 h-10 text-pink-500" />
        </div>
      </motion.div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Creating Magic</h2>
      <div className="flex items-center space-x-2 text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <p>{status}</p>
      </div>
    </div>
  );
}
