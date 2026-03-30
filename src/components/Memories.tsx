import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MemoryData } from '../lib/gemini';
import { ChatMessage } from '../lib/parser';
import { Heart, BookOpen, BarChart3, Cloud, Star, Search } from 'lucide-react';

import { useInfiniteMemories } from './memories/useInfiniteMemories';
import { MemoriesHeader } from './memories/MemoriesHeader';
import { StorySection } from './memories/StorySection';
import { StatsSection } from './memories/StatsSection';
import { WordCloudSection } from './memories/WordCloudSection';
import { HighlightsSection } from './memories/HighlightsSection';
import { QuotesSection } from './memories/QuotesSection';
import { FutureSection } from './memories/FutureSection';
import { ExploreSection } from './memories/ExploreSection';

interface MemoriesProps {
  data: MemoryData;
  messages: ChatMessage[];
  customApiKey?: string;
  selectedModel?: string;
}

export function Memories({ data, messages, customApiKey, selectedModel }: MemoriesProps) {
  const [activeSection, setActiveSection] = useState<string>('story');
  
  const {
    quotes,
    insights,
    jokes,
    highlights,
    milestones,
    futureAdventures,
    superlatives,
    loading,
    generateMore
  } = useInfiniteMemories(data, messages, customApiKey, selectedModel);

  const sectionRefs = {
    story: useRef<HTMLDivElement>(null),
    stats: useRef<HTMLDivElement>(null),
    words: useRef<HTMLDivElement>(null),
    highlights: useRef<HTMLDivElement>(null),
    future: useRef<HTMLDivElement>(null),
    explore: useRef<HTMLDivElement>(null),
  };

  const tabs = [
    { id: 'story', label: 'Our Story', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'stats', label: 'By The Numbers', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'words', label: 'Your Words', icon: <Cloud className="w-5 h-5" /> },
    { id: 'highlights', label: 'Highlights', icon: <Star className="w-5 h-5" /> },
    { id: 'future', label: 'Future & Awards', icon: <Heart className="w-5 h-5" /> },
    { id: 'explore', label: 'Explore', icon: <Search className="w-5 h-5" /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      let currentSection = 'story';

      for (const [id, ref] of Object.entries(sectionRefs)) {
        if (ref.current && ref.current.offsetTop <= scrollPosition) {
          currentSection = id;
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const ref = sectionRefs[id as keyof typeof sectionRefs];
    if (ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-32 relative">
      
      {/* Floating Navigation Bar */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", delay: 0.5 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl flex justify-center px-4 pointer-events-none"
      >
        <div className="flex items-center justify-center gap-3 overflow-x-auto custom-scrollbar pb-4 pt-4 px-4 pointer-events-auto">
          {tabs.map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`relative flex items-center space-x-2 px-5 py-3.5 rounded-full text-sm font-bold transition-all duration-500 whitespace-nowrap shadow-xl border backdrop-blur-xl ${
                  isActive 
                    ? 'text-white border-transparent scale-110 shadow-pink-500/40 z-20' 
                    : 'bg-white/60 text-gray-500 border-white/50 hover:bg-white/90 hover:text-gray-900 hover:scale-105 hover:shadow-purple-500/20 z-10'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10 hidden md:inline-block tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Page Content Area */}
      <div className="flex flex-col space-y-32 py-12 px-4 md:px-12">
        
        <div ref={sectionRefs.story}>
          <MemoriesHeader participants={data.participants} vibe={data.vibe} />
          <StorySection data={data} />
        </div>

        <div ref={sectionRefs.stats}>
          <StatsSection data={data} />
        </div>

        <div ref={sectionRefs.words}>
          <WordCloudSection data={data} />
        </div>

        <div ref={sectionRefs.highlights}>
          <HighlightsSection 
            highlights={highlights}
            milestones={milestones}
            loadingHighlights={loading.highlights}
            loadingMilestones={loading.milestones}
            onLoadMoreHighlights={() => generateMore('highlights')}
            onLoadMoreMilestones={() => generateMore('milestones')}
          />
          <QuotesSection 
            participants={data.participants}
            quotes={quotes}
            insights={insights}
            jokes={jokes}
            loadingQuotes={loading.quotes}
            loadingInsights={loading.insights}
            loadingJokes={loading.jokes}
            onLoadMoreQuotes={() => generateMore('quotes')}
            onLoadMoreInsights={() => generateMore('insights')}
            onLoadMoreJokes={() => generateMore('jokes')}
          />
        </div>

        <div ref={sectionRefs.future}>
          <FutureSection 
            adventures={futureAdventures}
            superlatives={superlatives}
            loadingAdventures={loading.futureAdventures}
            loadingSuperlatives={loading.superlatives}
            onLoadMoreAdventures={() => generateMore('futureAdventures')}
            onLoadMoreSuperlatives={() => generateMore('superlatives')}
          />
        </div>

        <div ref={sectionRefs.explore}>
          <ExploreSection messages={messages} participants={data.participants} />
        </div>

        {/* CELEBRATION FOOTER */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto pt-32 pb-16 text-center"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="inline-block mb-8"
          >
            <Heart className="w-24 h-24 text-pink-500 fill-pink-500" />
          </motion.div>
          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-6">
            Happy Anniversary!
          </h2>
          <p className="text-2xl text-gray-600 font-medium max-w-2xl mx-auto">
            Here's to many more messages, memories, and moments together.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
