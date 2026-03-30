import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Quote, TrendingUp, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface QuotesSectionProps {
  participants: string[];
  quotes: { sender: string; text: string; context: string }[];
  insights: { title: string; description: string }[];
  jokes: { joke: string; origin: string }[];
  loadingQuotes: boolean;
  loadingInsights: boolean;
  loadingJokes: boolean;
  onLoadMoreQuotes: () => void;
  onLoadMoreInsights: () => void;
  onLoadMoreJokes: () => void;
}

export function QuotesSection({
  participants,
  quotes,
  insights,
  jokes,
  loadingQuotes,
  loadingInsights,
  loadingJokes,
  onLoadMoreQuotes,
  onLoadMoreInsights,
  onLoadMoreJokes
}: QuotesSectionProps) {
  const { ref: quotesRef, inView: quotesInView } = useInView({ threshold: 0.1 });
  const { ref: insightsRef, inView: insightsInView } = useInView({ threshold: 0.1 });
  const { ref: jokesRef, inView: jokesInView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (quotesInView) onLoadMoreQuotes();
  }, [quotesInView]);

  useEffect(() => {
    if (insightsInView) onLoadMoreInsights();
  }, [insightsInView]);

  useEffect(() => {
    if (jokesInView) onLoadMoreJokes();
  }, [jokesInView]);

  const formatName = (name: string) => {
    if (!name) return "Unknown";
    const cleanName = name.split(/_|(?=[A-Z])/)[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  return (
    <motion.div 
      id="highlights" // Re-using ID for nav, but should probably be unified
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }}
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
      className="max-w-5xl mx-auto space-y-32 pt-20"
    >
      {/* Memorable Quotes */}
      <section>
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-4">Memorable Quotes</h2>
          <p className="text-xl text-gray-500">Words that stuck with you.</p>
        </div>
        <div className="space-y-16">
          {quotes.map((quote, index) => {
            const isP1 = quote.sender === participants[0];
            const words = quote.text.split(' ');
            
            return (
              <motion.div 
                key={index} 
                initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
                className={`flex flex-col ${isP1 ? 'items-start' : 'items-end'} w-full group`}
              >
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} 
                  className="text-sm text-gray-500 mb-3 px-5 py-1.5 font-bold uppercase tracking-widest bg-white/60 backdrop-blur-md rounded-full border border-white/80 shadow-sm inline-block"
                >
                  {quote.context}
                </motion.div>
                <div className={`max-w-[95%] md:max-w-[80%] p-8 md:p-12 rounded-[3rem] shadow-2xl relative transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_10px_50px_rgba(168,85,247,0.3)] cursor-default ${
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
          
          <div ref={quotesRef} className="flex justify-center py-12">
            {loadingQuotes && <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />}
          </div>
        </div>
      </section>

      {/* Communication Insights */}
      <section>
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-4">Communication Insights</h2>
          <p className="text-xl text-gray-500">How you connect on a deeper level.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {insights.map((insight, index) => (
            <motion.div 
              key={index} 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -8, scale: 1.02 }}
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
        <div ref={insightsRef} className="flex justify-center py-12">
          {loadingInsights && <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />}
        </div>
      </section>

      {/* Inside Jokes */}
      <section>
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-4">Inside Jokes</h2>
          <p className="text-xl text-gray-500">Things only the two of you understand.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {jokes.map((joke, index) => (
            <motion.div 
              key={index}
              variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/60 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-xl border border-white/80 group transition-all"
            >
              <div className="text-4xl mb-6">🤭</div>
              <h4 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-purple-500 transition-colors">"{joke.joke}"</h4>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">Origin: {joke.origin}</p>
            </motion.div>
          ))}
        </div>
        <div ref={jokesRef} className="flex justify-center py-12">
          {loadingJokes && <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />}
        </div>
      </section>
    </motion.div>
  );
}
