import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { MemoryData, generateMoreItems } from '../lib/gemini';
import { ChatMessage } from '../lib/parser';
import { Heart, MessageCircle, TrendingUp, Star, Calendar, Quote, Clock, Cloud, BarChart3, Search, BookOpen, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

interface MemoriesProps {
  data: MemoryData;
  messages: ChatMessage[];
  customApiKey?: string;
  selectedModel?: string;
}

const SectionParticles = () => {
  const emojis = ['💖', '🤍', '✨', '💕', '🌸'];
  const particles = useMemo(() => Array.from({ length: 40 }).map(() => ({
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    size: Math.random() * 1.5 + 0.8,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 25 + 20,
    delay: Math.random() * 10,
    yOffset: (Math.random() - 0.5) * 200,
    xOffset: (Math.random() - 0.5) * 200,
    opacityMax: Math.random() * 0.5 + 0.3,
    rotation: Math.random() * 360
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute flex items-center justify-center drop-shadow-sm"
          style={{
            fontSize: `${p.size}rem`,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, p.yOffset, 0],
            x: [0, p.xOffset, 0],
            opacity: [0, p.opacityMax, 0],
            rotate: [p.rotation, p.rotation + 90, p.rotation],
            scale: [0.8, 1.1, 0.8]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export function Memories({ data, messages, customApiKey, selectedModel }: MemoriesProps) {
  const [activeSection, setActiveSection] = useState<string>('story');
  
  const [quotes, setQuotes] = useState(data.memorableQuotes || []);
  const [insights, setInsights] = useState(data.communicationInsights || []);
  const [jokes, setJokes] = useState(data.insideJokes || []);
  const [highlights, setHighlights] = useState(data.highlights || []);
  const [milestones, setMilestones] = useState(data.milestones || []);
  const [futureAdventures, setFutureAdventures] = useState(data.futureAdventures || []);
  const [superlatives, setSuperlatives] = useState(data.superlatives || []);
  
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingJokes, setLoadingJokes] = useState(false);
  const [loadingHighlights, setLoadingHighlights] = useState(false);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [loadingFutureAdventures, setLoadingFutureAdventures] = useState(false);
  const [loadingSuperlatives, setLoadingSuperlatives] = useState(false);

  const { ref: quotesRef, inView: quotesInView } = useInView({ threshold: 0.5 });
  const { ref: insightsRef, inView: insightsInView } = useInView({ threshold: 0.5 });
  const { ref: jokesRef, inView: jokesInView } = useInView({ threshold: 0.5 });
  const { ref: highlightsRef, inView: highlightsInView } = useInView({ threshold: 0.5 });
  const { ref: milestonesRef, inView: milestonesInView } = useInView({ threshold: 0.5 });
  const { ref: futureAdventuresRef, inView: futureAdventuresInView } = useInView({ threshold: 0.5 });
  const { ref: superlativesRef, inView: superlativesInView } = useInView({ threshold: 0.5 });

  useEffect(() => {
    if (quotesInView && !loadingQuotes && messages.length > 0) {
      setLoadingQuotes(true);
      generateMoreItems(messages, 'memorableQuotes', quotes, customApiKey, selectedModel)
        .then(newQuotes => setQuotes(prev => [...prev, ...newQuotes]))
        .catch(console.error)
        .finally(() => setLoadingQuotes(false));
    }
  }, [quotesInView, loadingQuotes, messages, quotes, customApiKey, selectedModel]);

  useEffect(() => {
    if (insightsInView && !loadingInsights && messages.length > 0) {
      setLoadingInsights(true);
      generateMoreItems(messages, 'communicationInsights', insights, customApiKey, selectedModel)
        .then(newInsights => setInsights(prev => [...prev, ...newInsights]))
        .catch(console.error)
        .finally(() => setLoadingInsights(false));
    }
  }, [insightsInView, loadingInsights, messages, insights, customApiKey, selectedModel]);

  useEffect(() => {
    if (jokesInView && !loadingJokes && messages.length > 0) {
      setLoadingJokes(true);
      generateMoreItems(messages, 'insideJokes', jokes, customApiKey, selectedModel)
        .then(newJokes => setJokes(prev => [...prev, ...newJokes]))
        .catch(console.error)
        .finally(() => setLoadingJokes(false));
    }
  }, [jokesInView, loadingJokes, messages, jokes, customApiKey, selectedModel]);

  useEffect(() => {
    if (highlightsInView && !loadingHighlights && messages.length > 0) {
      setLoadingHighlights(true);
      generateMoreItems(messages, 'highlights', highlights, customApiKey, selectedModel)
        .then(newItems => setHighlights(prev => [...prev, ...newItems]))
        .catch(console.error)
        .finally(() => setLoadingHighlights(false));
    }
  }, [highlightsInView, loadingHighlights, messages, highlights, customApiKey, selectedModel]);

  useEffect(() => {
    if (milestonesInView && !loadingMilestones && messages.length > 0) {
      setLoadingMilestones(true);
      generateMoreItems(messages, 'milestones', milestones, customApiKey, selectedModel)
        .then(newItems => setMilestones(prev => [...prev, ...newItems]))
        .catch(console.error)
        .finally(() => setLoadingMilestones(false));
    }
  }, [milestonesInView, loadingMilestones, messages, milestones, customApiKey, selectedModel]);

  useEffect(() => {
    if (futureAdventuresInView && !loadingFutureAdventures && messages.length > 0) {
      setLoadingFutureAdventures(true);
      generateMoreItems(messages, 'futureAdventures', futureAdventures, customApiKey, selectedModel)
        .then(newItems => setFutureAdventures(prev => [...prev, ...newItems]))
        .catch(console.error)
        .finally(() => setLoadingFutureAdventures(false));
    }
  }, [futureAdventuresInView, loadingFutureAdventures, messages, futureAdventures, customApiKey, selectedModel]);

  useEffect(() => {
    if (superlativesInView && !loadingSuperlatives && messages.length > 0) {
      setLoadingSuperlatives(true);
      generateMoreItems(messages, 'superlatives', superlatives, customApiKey, selectedModel)
        .then(newItems => setSuperlatives(prev => [...prev, ...newItems]))
        .catch(console.error)
        .finally(() => setLoadingSuperlatives(false));
    }
  }, [superlativesInView, loadingSuperlatives, messages, superlatives, customApiKey, selectedModel]);

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

  const pageVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.2 } }
  };

  const formatName = (name: string) => {
    if (name.toLowerCase() === "yun_the_pineapple_") return "Yun";
    if (name.toLowerCase() === "nullifiedgalaxy") return "Null";
    return name;
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
        
        {/* SECTION 1: THE STORY */}
        <motion.div ref={sectionRefs.story} id="story" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={pageVariants} className="space-y-24 relative">
          <SectionParticles />
          <div className="text-center space-y-8 relative z-10">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.6, duration: 1.5 }}
              className="inline-flex items-center justify-center p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-4 shadow-inner"
            >
              <Heart className="w-16 h-16 text-pink-500 fill-pink-500" />
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">{formatName(data.participants[0])}</span>
              {data.participants[1] && (
                <>
                  <span className="text-gray-300 mx-6">&</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">{formatName(data.participants[1])}</span>
                </>
              )}
            </h2>
            <p className="text-3xl text-gray-500 font-medium italic tracking-wide">"{data.vibe}"</p>
            
            <motion.div variants={pageVariants} className="max-w-4xl mx-auto mt-12 p-8 md:p-12 bg-white/60 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/80">
              <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed font-serif text-center">{data.summary}</p>
            </motion.div>
          </div>

          <motion.div variants={pageVariants} className="max-w-4xl mx-auto relative z-10">
            <div className="flex items-center justify-center space-x-4 mb-12">
              <Calendar className="w-10 h-10 text-purple-500" />
              <h3 className="text-4xl font-bold text-gray-900">How It Started</h3>
            </div>
            <motion.div 
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.4 } }
              }}
              className="bg-white/60 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/80 flex flex-col space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-200/50 to-transparent rounded-bl-full opacity-50 pointer-events-none" />
              
              <motion.div 
                variants={{ 
                  hidden: { opacity: 0, scale: 0.8 }, 
                  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } } 
                }} 
                className="text-center text-lg font-bold tracking-widest text-gray-500 uppercase mb-4"
              >
                {new Date(data.firstMessage.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </motion.div>
              
              <motion.div 
                variants={{ 
                  hidden: { opacity: 0, y: 40 }, 
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20 } } 
                }} 
                className="self-start max-w-[85%]"
              >
                <div className="text-sm text-gray-500 mb-2 ml-4 font-bold uppercase tracking-wider">{formatName(data.firstMessage.sender)}</div>
                <div className="bg-white/90 backdrop-blur-md text-gray-800 px-8 py-6 rounded-3xl rounded-tl-sm text-xl md:text-2xl shadow-sm font-medium border border-white/50">
                  {data.firstMessage.text}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* MILESTONES */}
          {milestones && milestones.length > 0 && (
            <motion.div variants={pageVariants} className="max-w-5xl mx-auto relative z-10 pt-16">
              <div className="text-center mb-16">
                <h3 className="text-4xl font-bold text-gray-900 mb-4">Milestones</h3>
                <p className="text-xl text-gray-500">The big moments you've shared.</p>
              </div>
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <motion.div 
                    key={index}
                    variants={{ hidden: { opacity: 0, x: index % 2 === 0 ? -50 : 50 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }}
                    className="bg-white/60 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-white/80 flex flex-col md:flex-row gap-6 items-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg text-white font-black text-2xl">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-gray-900 mb-2">{milestone.title}</h4>
                      <p className="text-lg text-gray-600 font-medium">{milestone.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div ref={milestonesRef} className="flex justify-center py-8">
                {loadingMilestones && <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* SECTION 2: STATS */}
        <motion.div ref={sectionRefs.stats} id="stats" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={pageVariants} className="space-y-16 max-w-5xl mx-auto pt-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">By The Numbers</h2>
            <p className="text-xl text-gray-500">A statistical look at your conversations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard icon={<MessageCircle className="w-8 h-8 text-blue-500" />} title="Total Messages" value={data.stats.totalMessages.toLocaleString()} tooltip="The total number of messages you've sent to each other." />
            <StatCard icon={<TrendingUp className="w-8 h-8 text-green-500" />} title="Most Chatty" value={formatName(data.stats.mostActivePerson)} tooltip="The person who sent the most messages overall." />
            <StatCard icon={<Star className="w-8 h-8 text-yellow-500" />} title="Top Emojis" value={data.stats.topEmojis.join(" ")} tooltip="The emojis you both use the most frequently." />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={pageVariants} className="bg-white/60 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl border border-white/80">
              <div className="flex items-center space-x-4 mb-10">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <h3 className="text-3xl font-bold text-gray-900">Time of Day</h3>
              </div>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Array.from({ length: 24 }).map((_, i) => ({
                    hour: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`,
                    count: data.extendedStats.messagesByHour[i] || 0
                  }))}>
                    <XAxis dataKey="hour" hide />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {Array.from({ length: 24 }).map((_, index) => (
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

            <motion.div variants={pageVariants} className="bg-white/60 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl border border-white/80 flex flex-col justify-center">
              <div className="flex items-center space-x-4 mb-10">
                <Clock className="w-8 h-8 text-indigo-500" />
                <h3 className="text-3xl font-bold text-gray-900">Avg Response Time</h3>
              </div>
              <div className="space-y-6">
                {data.participants.map((p) => (
                  <div key={p} className="flex items-center justify-between p-6 bg-white/80 rounded-3xl border border-white/50 shadow-sm">
                    <span className="font-bold text-2xl text-gray-800">{p}</span>
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

        {/* SECTION 3: WORDS */}
        <motion.div ref={sectionRefs.words} id="words" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={pageVariants} className="max-w-6xl mx-auto text-center pt-20">
          <div className="mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">Your Words</h2>
            <p className="text-xl text-gray-500">The words that define your conversations.</p>
          </div>
          
          <div className="min-h-[600px] flex flex-wrap justify-center items-center content-center relative overflow-visible px-4">
            {data.extendedStats.topWords.map((item, i) => {
              const maxCount = data.extendedStats.topWords[0]?.count || 1;
              const colors = [
                'bg-pink-100/90 text-pink-700 border-pink-200', 
                'bg-purple-100/90 text-purple-700 border-purple-200', 
                'bg-orange-100/90 text-orange-700 border-orange-200', 
                'bg-blue-100/90 text-blue-700 border-blue-200', 
                'bg-teal-100/90 text-teal-700 border-teal-200'
              ];
              const colorClass = colors[i % colors.length];
              
              return (
                <WordBubble key={item.word} item={item} maxCount={maxCount} colorClass={colorClass} index={i} />
              );
            })}
          </div>
        </motion.div>

        {/* SECTION 4: HIGHLIGHTS & QUOTES */}
        <motion.div ref={sectionRefs.highlights} id="highlights" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={pageVariants} className="max-w-5xl mx-auto space-y-32 pt-20">
          
          {highlights && highlights.length > 0 && (
            <div>
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black text-gray-900 mb-4">Highlights</h2>
                <p className="text-xl text-gray-500">The best moments of the year.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {highlights.map((highlight, index) => (
                  <motion.div 
                    key={index} variants={pageVariants} whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white/60 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-xl border border-white/80 group transition-all"
                  >
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-pink-500 transition-colors">{highlight.title}</h4>
                    <p className="text-lg text-gray-600 leading-relaxed font-medium">{highlight.description}</p>
                  </motion.div>
                ))}
              </div>
              <div ref={highlightsRef} className="flex justify-center py-8">
                {loadingHighlights && <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />}
              </div>
            </div>
          )}

          <div>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-gray-900 mb-4">Memorable Quotes</h2>
              <p className="text-xl text-gray-500">Words that stuck with you.</p>
            </div>
            <div className="space-y-16">
              {quotes.map((quote, index) => {
                const isP1 = quote.sender === data.participants[0];
                const words = quote.text.split(' ');
                
                return (
                  <motion.div 
                    key={index} 
                    initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
                    className={`flex flex-col ${isP1 ? 'items-start' : 'items-end'} w-full group`}
                  >
                    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="text-sm text-gray-500 mb-3 px-5 py-1.5 font-bold uppercase tracking-widest bg-white/60 backdrop-blur-md rounded-full border border-white/80 shadow-sm inline-block">
                      {quote.context}
                    </motion.div>
                    <div className={`max-w-[95%] md:max-w-[80%] p-8 md:p-12 rounded-[3rem] shadow-2xl relative transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_10px_50px_rgba(168,85,247,0.6)] cursor-default ${
                      isP1 
                        ? 'bg-gradient-to-br from-purple-600/90 to-indigo-600/90 backdrop-blur-xl text-white rounded-tl-xl border border-purple-400/30' 
                        : 'bg-gradient-to-bl from-pink-500/90 to-orange-500/90 backdrop-blur-xl text-white rounded-tr-xl border border-pink-400/30'
                    }`}>
                      <motion.div 
                        animate={{ y: [-3, 3, -3], rotate: [-3, 3, -3] }} 
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                        className="absolute top-6 left-6 md:top-8 md:left-8 opacity-20"
                      >
                        <Quote className="w-12 h-12 md:w-16 md:h-16 text-white rotate-180" />
                      </motion.div>
                      
                      <p className="text-2xl md:text-3xl lg:text-4xl font-serif italic leading-relaxed md:leading-snug relative z-10 pl-10 md:pl-16 pr-4 py-4 flex flex-wrap gap-[0.25em] drop-shadow-sm">
                        {words.map((word, i) => (
                          <motion.span 
                            key={i} 
                            variants={{ hidden: { opacity: 0, y: 15, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: "easeOut" } } }}
                          >
                            {word}
                          </motion.span>
                        ))}
                      </p>
                      <motion.div 
                        variants={{ hidden: { opacity: 0, x: 50 }, show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50, damping: 12, delay: words.length * 0.04 + 0.3 } } }} 
                        className="mt-8 text-right flex items-center justify-end space-x-3"
                      >
                        <div className="h-[2px] w-8 md:w-12 bg-white/50 rounded-full" />
                        <span className="text-xl md:text-2xl font-black text-white/90 tracking-wide">
                          {formatName(quote.sender)}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
              
              <div ref={quotesRef} className="flex justify-center py-8">
                {loadingQuotes && <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />}
              </div>
            </div>
          </div>

          {/* COMMUNICATION INSIGHTS */}
          {data.communicationInsights && data.communicationInsights.length > 0 && (
            <div>
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black text-gray-900 mb-4">Communication Insights</h2>
                <p className="text-xl text-gray-500">How you connect on a deeper level.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {insights.map((insight, index) => (
                  <motion.div 
                    key={index} variants={pageVariants} whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white/60 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-xl border border-white/80 group transition-all"
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-indigo-500 transition-colors">{insight.title}</h4>
                    <p className="text-lg text-gray-600 leading-relaxed font-medium">{insight.description}</p>
                  </motion.div>
                ))}
              </div>
              <div ref={insightsRef} className="flex justify-center py-8">
                {loadingInsights && <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />}
              </div>
            </div>
          )}

          {/* INSIDE JOKES */}
          {data.insideJokes && data.insideJokes.length > 0 && (
            <div>
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black text-gray-900 mb-4">Inside Jokes</h2>
                <p className="text-xl text-gray-500">Things only the two of you understand.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {jokes.map((joke, index) => (
                  <motion.div 
                    key={index} variants={pageVariants} whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white/60 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-xl border border-white/80 group transition-all"
                  >
                    <div className="text-4xl mb-6">🤭</div>
                    <h4 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-purple-500 transition-colors">"{joke.joke}"</h4>
                    <p className="text-lg text-gray-600 leading-relaxed font-medium">Origin: {joke.origin}</p>
                  </motion.div>
                ))}
              </div>
              <div ref={jokesRef} className="flex justify-center py-8">
                {loadingJokes && <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />}
              </div>
            </div>
          )}

        </motion.div>

        {/* SECTION 4.5: FUTURE & AWARDS */}
        <motion.div ref={sectionRefs.future} id="future" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={pageVariants} className="max-w-5xl mx-auto space-y-32 pt-20">
          
          {/* SUPERLATIVES */}
          {superlatives && superlatives.length > 0 && (
            <div>
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black text-gray-900 mb-4">Superlatives</h2>
                <p className="text-xl text-gray-500">The official awards of your relationship.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {superlatives.map((award, index) => (
                  <motion.div 
                    key={index} variants={pageVariants} whileHover={{ y: -8 }}
                    className="bg-gradient-to-br from-yellow-100 to-orange-100 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-xl border border-white/80 flex flex-col items-center text-center relative overflow-hidden"
                  >
                    <div className="absolute -top-4 -right-4 text-6xl opacity-20">🏆</div>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-md text-3xl">
                      🏅
                    </div>
                    <h4 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-wide text-orange-600">{award.award}</h4>
                    <div className="text-2xl font-black text-gray-900 mb-4">{award.winner}</div>
                    <p className="text-md text-gray-700 font-medium">{award.reason}</p>
                  </motion.div>
                ))}
              </div>
              <div ref={superlativesRef} className="flex justify-center py-8">
                {loadingSuperlatives && <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />}
              </div>
            </div>
          )}

          {/* FUTURE ADVENTURES */}
          {futureAdventures && futureAdventures.length > 0 && (
            <div>
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black text-gray-900 mb-4">Future Adventures</h2>
                <p className="text-xl text-gray-500">Things you've dreamed of doing together.</p>
              </div>
              <div className="space-y-8">
                {futureAdventures.map((adv, index) => (
                  <motion.div 
                    key={index} variants={pageVariants}
                    className="bg-white/60 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-white/80 flex flex-col md:flex-row gap-6 items-center group"
                  >
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6 md:mb-0 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">✨</span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">{adv.title}</h4>
                      <p className="text-lg text-gray-600 leading-relaxed font-medium">{adv.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div ref={futureAdventuresRef} className="flex justify-center py-8">
                {loadingFutureAdventures && <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />}
              </div>
            </div>
          )}

        </motion.div>

        {/* SECTION 5: EXPLORE */}
        <motion.div ref={sectionRefs.explore} id="explore" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={pageVariants} className="max-w-4xl mx-auto pt-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">Search & Explore</h2>
            <p className="text-xl text-gray-500">Find specific memories, jokes, or moments.</p>
          </div>
          <SearchExplore messages={messages} participants={data.participants} />
        </motion.div>

        {/* SECTION 6: CELEBRATION FOOTER */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={pageVariants} className="max-w-4xl mx-auto pt-32 pb-16 text-center">
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

// --- Subcomponents ---

interface WordBubbleProps {
  key?: string | number;
  item: { word: string, count: number };
  maxCount: number;
  colorClass: string;
  index: number;
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

function SearchExplore({ messages, participants }: { messages: ChatMessage[], participants: string[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const formatName = (name: string) => {
    if (name.toLowerCase() === "yun_the_pineapple_") return "Yun";
    if (name.toLowerCase() === "nullifiedgalaxy") return "Null";
    return name;
  };

  const results = useMemo(() => {
    if (!searchTerm || searchTerm.length < 3) return [];
    const lowerTerm = searchTerm.toLowerCase();
    const indices = [];
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].content?.toLowerCase().includes(lowerTerm)) {
        indices.push(i);
        if (indices.length >= 30) break; // limit to 30 results for performance
      }
    }
    return indices;
  }, [searchTerm, messages]);

  return (
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
          <div className="text-center text-gray-500 py-12 text-lg font-medium">No messages found matching "{searchTerm}"</div>
        )}
        {searchTerm.length < 3 && (
           <div className="text-center text-gray-400 py-12 text-lg">Type at least 3 characters to start searching.</div>
        )}
        
        {results.map((index) => {
          const msg = messages[index];
          const prevMsg1 = index > 1 ? messages[index - 2] : null;
          const prevMsg2 = index > 0 ? messages[index - 1] : null;
          const nextMsg1 = index < messages.length - 1 ? messages[index + 1] : null;
          const nextMsg2 = index < messages.length - 2 ? messages[index + 2] : null;

          return (
            <div key={index} className="bg-white/80 p-8 rounded-[2rem] border border-white/60 space-y-6 shadow-sm">
              <div className="text-sm text-gray-400 font-bold tracking-widest uppercase text-center mb-4">
                {new Date(msg.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              
              {/* Context Before */}
              {prevMsg1 && (
                <div className={`flex flex-col ${prevMsg1.sender === participants[0] ? 'items-start' : 'items-end'} opacity-40`}>
                  <div className="text-xs text-gray-500 mb-1 ml-4 font-bold uppercase tracking-wider">{formatName(prevMsg1.sender)}</div>
                  <div className="bg-gray-200/80 text-gray-700 px-6 py-3 rounded-3xl text-sm max-w-[85%] font-medium">
                    {prevMsg1.content}
                  </div>
                </div>
              )}
              {prevMsg2 && (
                <div className={`flex flex-col ${prevMsg2.sender === participants[0] ? 'items-start' : 'items-end'} opacity-60`}>
                  <div className="text-xs text-gray-500 mb-1 ml-4 font-bold uppercase tracking-wider">{formatName(prevMsg2.sender)}</div>
                  <div className="bg-gray-200/80 text-gray-700 px-6 py-3 rounded-3xl text-base max-w-[85%] font-medium">
                    {prevMsg2.content}
                  </div>
                </div>
              )}

              {/* The Match */}
              <div className={`flex flex-col ${msg.sender === participants[0] ? 'items-start' : 'items-end'}`}>
                <div className="text-sm text-gray-700 font-black mb-1 ml-4 uppercase tracking-wider">{formatName(msg.sender)}</div>
                <div className={`px-8 py-5 rounded-3xl text-xl shadow-md max-w-[90%] font-medium ${
                  msg.sender === participants[0] ? 'bg-teal-100/90 text-teal-900' : 'bg-blue-100/90 text-blue-900'
                }`}>
                  {/* Highlight matching text */}
                  {msg.content?.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                    part.toLowerCase() === searchTerm.toLowerCase() ? 
                      <span key={i} className="bg-yellow-300 font-black rounded px-1">{part}</span> : part
                  )}
                </div>
              </div>

              {/* Context After */}
              {nextMsg1 && (
                <div className={`flex flex-col ${nextMsg1.sender === participants[0] ? 'items-start' : 'items-end'} opacity-60`}>
                  <div className="text-xs text-gray-500 mb-1 ml-4 font-bold uppercase tracking-wider">{formatName(nextMsg1.sender)}</div>
                  <div className="bg-gray-200/80 text-gray-700 px-6 py-3 rounded-3xl text-base max-w-[85%] font-medium">
                    {nextMsg1.content}
                  </div>
                </div>
              )}
              {nextMsg2 && (
                <div className={`flex flex-col ${nextMsg2.sender === participants[0] ? 'items-start' : 'items-end'} opacity-40`}>
                  <div className="text-xs text-gray-500 mb-1 ml-4 font-bold uppercase tracking-wider">{formatName(nextMsg2.sender)}</div>
                  <div className="bg-gray-200/80 text-gray-700 px-6 py-3 rounded-3xl text-sm max-w-[85%] font-medium">
                    {nextMsg2.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
