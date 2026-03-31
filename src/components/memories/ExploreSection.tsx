import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, User, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../../lib/parser';

interface ExploreSectionProps {
  messages: ChatMessage[];
  participants: string[];
}

export function ExploreSection({ messages, participants }: ExploreSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSender, setSelectedSender] = useState<string>('all');

  const filteredMessages = useMemo(() => {
    if (!searchTerm && selectedSender === 'all') return [];
    
    return messages
      .filter(m => {
        const matchesSearch = !searchTerm || m.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSender = selectedSender === 'all' || m.sender === selectedSender;
        return matchesSearch && matchesSender;
      })
      .slice(-100); // Only show last 100 matches for performance
  }, [messages, searchTerm, selectedSender]);

  const formatName = (name: string) => {
    if (!name) return "Unknown";
    const lowerName = name.toLowerCase();
    if (lowerName.includes('nullifiedgalaxy')) return "Null";
    if (lowerName.includes('vanessa')) return "Yun";
    const cleanName = name.split(/_|(?=[A-Z])/)[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  return (
    <motion.div 
      id="explore"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "0px" }}
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
      className="max-w-5xl mx-auto space-y-16 py-20"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-gray-900/40 rounded-full mb-4 shadow-sm border border-indigo-900/20">
          <Search className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-5xl font-black text-gray-100">Explore Memories</h2>
        <p className="text-xl text-indigo-400 italic">Search through our history to find specific moments.</p>
      </div>

      <div className="bg-gray-900/40 backdrop-blur-3xl p-8 rounded-[3rem] shadow-xl border border-gray-800 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search for words or phrases..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-gray-950/50 border border-gray-800 rounded-2xl text-gray-100 placeholder-gray-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
            />
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setSelectedSender('all')}
              className={`flex-1 px-4 py-4 rounded-2xl font-bold transition-all border ${
                selectedSender === 'all' 
                  ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/20' 
                  : 'bg-gray-950/50 text-gray-400 border-gray-800 hover:bg-gray-800'
              }`}
            >
              All
            </button>
            {participants.map(p => (
              <button 
                key={p}
                onClick={() => setSelectedSender(p)}
                className={`flex-1 px-4 py-4 rounded-2xl font-bold transition-all border ${
                  selectedSender === p 
                    ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/20' 
                    : 'bg-gray-950/50 text-gray-400 border-gray-800 hover:bg-gray-800'
                }`}
              >
                {formatName(p)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
          <AnimatePresence mode="popLayout">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg, i) => (
                <motion.div 
                  key={`${msg.timestamp}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="p-6 bg-gray-950/30 border border-gray-800/50 rounded-2xl flex flex-col space-y-2 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                    <span className="text-indigo-400 flex items-center space-x-1">
                      <User size={12} />
                      <span>{formatName(msg.sender)}</span>
                    </span>
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{new Date(msg.timestamp).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <p className="text-gray-300 font-medium leading-relaxed">{msg.content}</p>
                </motion.div>
              ))
            ) : searchTerm || selectedSender !== 'all' ? (
              <div className="py-20 text-center text-gray-600 font-medium">
                No messages found matching your search.
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <MessageCircle className="w-12 h-12 text-gray-800 mx-auto" />
                <p className="text-gray-600 font-medium">Type something above to search our memories.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
