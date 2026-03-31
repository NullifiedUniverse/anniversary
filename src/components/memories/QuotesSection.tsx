import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Quote, TrendingUp, Loader2, Heart } from 'lucide-react';
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

  useEffect(() => { if (quotesInView) onLoadMoreQuotes(); }, [quotesInView]);
  useEffect(() => { if (insightsInView) onLoadMoreInsights(); }, [insightsInView]);
  useEffect(() => { if (jokesInView) onLoadMoreJokes(); }, [jokesInView]);

  const formatName = (name: string) => {
    if (!name) return "Unknown";
    const lowerName = name.toLowerCase();
    if (lowerName.includes('nullifiedgalaxy')) return "Null";
    if (lowerName.includes('vanessa')) return "Yun";
    const cleanName = name.split(/_|(?=[A-Z])/)[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  return (
    <div id="moments" className="max-w-[1400px] mx-auto space-y-64 px-4 pb-20">
      {/* Cinematic Quotes */}
      <section>
        <div className="text-center mb-32 space-y-6">
          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} className="inline-flex items-center justify-center p-5 bg-indigo-500/10 rounded-3xl mb-6 border border-indigo-500/20 shadow-2xl">
            <Quote className="w-10 h-10 text-indigo-400" />
          </motion.div>
          <h2 className="text-7xl font-black text-white tracking-tighter">Our Echoes</h2>
          <p className="text-2xl text-indigo-400 font-medium italic">Words that whisper through time.</p>
        </div>
        
        <div className="space-y-32">
          {quotes.map((quote, index) => {
            const isP1 = quote.sender === participants[0];
            const words = quote.text.split(' ');
            
            return (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 60 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className={`flex flex-col ${isP1 ? 'items-start' : 'items-end'} w-full relative`}
              >
                <div className={`max-w-[90%] lg:max-w-[70%] p-16 md:p-24 rounded-[5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative overflow-hidden transition-all duration-700 hover:scale-[1.02] border border-white/5 ${
                  isP1 
                    ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900/80 rounded-tl-xl' 
                    : 'bg-gradient-to-bl from-pink-950/80 to-slate-900/80 rounded-tr-xl'
                }`}>
                  <div className="absolute top-0 left-0 w-full h-full bg-white/[0.02] pointer-events-none" />
                  <Quote className={`absolute top-12 ${isP1 ? 'left-12' : 'right-12'} w-24 h-24 text-white/5 ${isP1 ? 'rotate-180' : ''}`} />
                  
                  <p className="text-3xl md:text-5xl lg:text-6xl font-serif italic leading-tight text-white relative z-10 drop-shadow-2xl">
                    {quote.text}
                  </p>
                  
                  <div className={`mt-16 flex items-center space-x-6 ${isP1 ? 'justify-start' : 'justify-end'} relative z-10`}>
                    <div className="h-px w-16 bg-white/20" />
                    <span className="text-2xl font-black text-gray-400 tracking-[0.2em] uppercase">
                      {formatName(quote.sender)}
                    </span>
                  </div>
                  
                  <div className="mt-4 text-xs font-black uppercase tracking-[0.4em] text-gray-600 opacity-50">
                    {quote.context}
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          <div ref={quotesRef} className="flex justify-center py-24">
            {loadingQuotes && <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />}
          </div>
        </div>
      </section>

      {/* Connection Insights */}
      <section>
        <div className="text-center mb-32 space-y-6">
          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} className="inline-flex items-center justify-center p-5 bg-amber-500/10 rounded-3xl mb-6 border border-amber-500/20 shadow-2xl">
            <TrendingUp className="w-10 h-10 text-amber-400" />
          </motion.div>
          <h2 className="text-7xl font-black text-white tracking-tighter">Our Pulse</h2>
          <p className="text-2xl text-amber-400 font-medium italic">How our frequencies align.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {insights.map((insight, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-3xl p-16 rounded-[4rem] border border-white/10 group transition-all duration-700"
            >
              <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <TrendingUp className="w-8 h-8 text-amber-400 group-hover:text-white" />
              </div>
              <h4 className="text-4xl font-black text-white mb-6 group-hover:text-amber-300 transition-colors tracking-tight">{insight.title}</h4>
              <p className="text-xl text-gray-400 leading-relaxed font-medium">{insight.description}</p>
            </motion.div>
          ))}
        </div>
        <div ref={insightsRef} className="flex justify-center py-24">
          {loadingInsights && <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />}
        </div>
      </section>

      {/* Shared Smiles */}
      <section>
        <div className="text-center mb-32 space-y-6">
          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} className="inline-flex items-center justify-center p-5 bg-pink-500/10 rounded-3xl mb-6 border border-pink-500/20 shadow-2xl">
            <span className="text-5xl">🤭</span>
          </motion.div>
          <h2 className="text-7xl font-black text-white tracking-tighter">Hidden Languages</h2>
          <p className="text-2xl text-pink-400 font-medium italic">The jokes only we know the punchlines to.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jokes.map((joke, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              className="bg-white/5 backdrop-blur-2xl p-12 rounded-[3rem] border border-white/5 shadow-2xl group transition-all duration-500"
            >
              <div className="text-5xl mb-8 group-hover:scale-125 transition-transform duration-500">🤭</div>
              <h4 className="text-3xl font-black text-white mb-6 group-hover:text-pink-300 transition-colors leading-snug italic">"{joke.joke}"</h4>
              <div className="h-px w-12 bg-white/10 mb-6" />
              <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">Origin: {joke.origin}</p>
            </motion.div>
          ))}
        </div>
        <div ref={jokesRef} className="flex justify-center py-24">
          {loadingJokes && <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />}
        </div>
      </section>
    </div>
  );
}
