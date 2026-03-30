import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { SectionParticles } from './SectionParticles';

interface MemoriesHeaderProps {
  participants: string[];
  vibe: string;
}

export function MemoriesHeader({ participants, vibe }: MemoriesHeaderProps) {
  const formatName = (name: string) => {
    // Basic formatting: remove common suffixes and handle known ones
    // But mostly just capitalize or take the first part
    if (!name) return "Unknown";
    
    // Custom logic for known users can be added here if needed, 
    // but let's be more generic.
    const cleanName = name.split(/_|(?=[A-Z])/)[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  return (
    <motion.div 
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.2 } }
      }}
      className="space-y-24 relative pt-12"
    >
      <SectionParticles />
      <div className="text-center space-y-8 relative z-10">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }} 
          animate={{ scale: 1, rotate: 0 }} 
          transition={{ type: "spring", bounce: 0.6, duration: 1.5 }}
          className="inline-flex items-center justify-center p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-4 shadow-inner"
        >
          <Heart className="w-16 h-16 text-pink-500 fill-pink-500" />
        </motion.div>
        
        <h2 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
            {formatName(participants[0])}
          </span>
          {participants[1] && (
            <>
              <span className="text-gray-300 mx-6">&</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
                {formatName(participants[1])}
              </span>
            </>
          )}
        </h2>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-3xl text-gray-500 font-medium italic tracking-wide">
            "{vibe}"
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
