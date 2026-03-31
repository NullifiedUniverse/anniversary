import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryData } from '../lib/gemini';
import { ChatMessage } from '../lib/parser';
import { Heart, BookOpen, BarChart3, Cloud, Star, Search, ChevronDown } from 'lucide-react';

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
    { id: 'story', label: 'Our Story', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'stats', label: 'Our Rhythm', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'words', label: 'Our Language', icon: <Cloud className="w-4 h-4" /> },
    { id: 'highlights', label: 'Our Moments', icon: <Star className="w-4 h-4" /> },
    { id: 'future', label: 'Our Future', icon: <Heart className="w-4 h-4" /> },
    { id: 'explore', label: 'Explore', icon: <Search className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
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
        top: ref.current.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="w-full relative">
      
      {/* Premium Floating Navigation */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 30, delay: 1 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-4xl flex justify-center pointer-events-none"
      >
        <div className="bg-black/40 backdrop-blur-3xl border border-white/10 p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-1 pointer-events-auto overflow-x-auto no-scrollbar max-w-full">
          {tabs.map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`relative group flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-500 ${
                  isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navGlow"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600/80 to-pink-600/80 rounded-full -z-10 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {tab.icon}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden xl:inline-block">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Page Content */}
      <div className="flex flex-col space-y-32 py-24">
        
        <motion.div ref={sectionRefs.story} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
          <MemoriesHeader participants={data.participants} vibe={data.vibe} />
          <div className="mt-24">
            <StorySection data={data} />
          </div>
        </motion.div>

        <motion.div ref={sectionRefs.stats} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
          <StatsSection data={data} />
        </motion.div>

        <motion.div ref={sectionRefs.words} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
          <WordCloudSection data={data} />
        </motion.div>

        <motion.div ref={sectionRefs.highlights} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants} className="space-y-32">
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
        </motion.div>

        <motion.div ref={sectionRefs.future} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
          <FutureSection 
            adventures={futureAdventures}
            superlatives={superlatives}
            loadingAdventures={loading.futureAdventures}
            loadingSuperlatives={loading.superlatives}
            onLoadMoreAdventures={() => generateMore('futureAdventures')}
            onLoadMoreSuperlatives={() => generateMore('superlatives')}
          />
        </motion.div>

        <motion.div ref={sectionRefs.explore} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
          <ExploreSection messages={messages} participants={data.participants} />
        </motion.div>

        {/* Cinematic Footer */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }}
          className="max-w-5xl mx-auto pt-64 pb-32 text-center relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-pink-500/50 to-transparent" />
          
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="inline-block mb-12"
          >
            <Heart aria-label="Big heart icon" className="w-32 h-32 text-pink-500 fill-pink-500 blur-[2px]" />
          </motion.div>
          
          <h2 className="text-8xl md:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 mb-8 leading-none">
            Forever<br/>Begins.
          </h2>
          <p className="text-2xl md:text-3xl text-gray-500 font-medium tracking-[0.2em] uppercase max-w-2xl mx-auto">
            Happy Anniversary, Null & Yun.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
