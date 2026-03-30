import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { ChatMessage } from '../../lib/parser';

interface ExploreSectionProps {
  messages: ChatMessage[];
  participants: string[];
}

export function ExploreSection({ messages, participants }: ExploreSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const formatName = (name: string) => {
    if (!name) return "Unknown";
    const cleanName = name.split(/_|(?=[A-Z])/)[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  const results = useMemo(() => {
    if (!searchTerm || searchTerm.length < 3) return [];
    const lowerTerm = searchTerm.toLowerCase();
    const indices = [];
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].content?.toLowerCase().includes(lowerTerm)) {
        indices.push(i);
        if (indices.length >= 30) break; 
      }
    }
    return indices;
  }, [searchTerm, messages]);

  return (
    <motion.div 
      id="explore"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }}
      variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
      className="max-w-4xl mx-auto pt-20"
    >
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black text-gray-900 mb-4">Search & Explore</h2>
        <p className="text-xl text-gray-500">Find specific memories, jokes, or moments.</p>
      </div>

      <div className="bg-white/60 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/80 overflow-hidden p-8 md:p-12">
        <div className="relative mb-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for a memory, word, or phrase..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-white/80 border-2 border-white/60 rounded-3xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-xl font-medium placeholder:text-gray-400 shadow-inner"
          />
        </div>

        <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
          {searchTerm.length >= 3 && results.length === 0 && (
            <div className="text-center text-gray-500 py-12 text-lg font-medium">
              No messages found matching "{searchTerm}"
            </div>
          )}
          {searchTerm.length < 3 && (
            <div className="text-center text-gray-400 py-12 text-lg">
              Type at least 3 characters to start searching.
            </div>
          )}
          
          {results.map((index) => {
            const msg = messages[index];
            const context = messages.slice(Math.max(0, index - 2), Math.min(messages.length, index + 3));

            return (
              <div key={index} className="bg-white/80 p-8 rounded-[2rem] border border-white/60 space-y-4 shadow-sm">
                <div className="text-xs text-gray-400 font-bold tracking-widest uppercase text-center mb-4">
                  {new Date(msg.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
                
                {context.map((m, i) => {
                  const isMatch = m === msg;
                  const isP1 = m.sender === participants[0];
                  
                  return (
                    <div key={i} className={`flex flex-col ${isP1 ? 'items-start' : 'items-end'} ${!isMatch ? 'opacity-50 scale-95' : ''}`}>
                      <div className="text-[10px] text-gray-500 mb-0.5 ml-2 font-bold uppercase tracking-wider">
                        {formatName(m.sender)}
                      </div>
                      <div className={`px-5 py-2.5 rounded-2xl text-base max-w-[85%] font-medium shadow-sm border border-white/50 ${
                        isMatch 
                          ? (isP1 ? 'bg-teal-100 text-teal-900 border-teal-200' : 'bg-blue-100 text-blue-900 border-blue-200')
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {isMatch ? (
                          m.content?.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, j) => 
                            part.toLowerCase() === searchTerm.toLowerCase() ? 
                              <span key={j} className="bg-yellow-300 font-black rounded px-0.5">{part}</span> : part
                          )
                        ) : m.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
