import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Milestone, Loader2, Sparkles } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface HighlightsSectionProps {
  highlights: { title: string; description: string }[];
  milestones: { title: string; description: string; date: string }[];
  loadingHighlights: boolean;
  loadingMilestones: boolean;
  onLoadMoreHighlights: () => void;
  onLoadMoreMilestones: () => void;
}

export function HighlightsSection({
  highlights,
  milestones,
  loadingHighlights,
  loadingMilestones,
  onLoadMoreHighlights,
  onLoadMoreMilestones
}: HighlightsSectionProps) {
  const { ref: highlightsRef, inView: highlightsInView } = useInView({ threshold: 0.1 });
  const { ref: milestonesRef, inView: milestonesInView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (highlightsInView) onLoadMoreHighlights();
  }, [highlightsInView]);

  useEffect(() => {
    if (milestonesInView) onLoadMoreMilestones();
  }, [milestonesInView]);

  return (
    <div id="highlights" className="max-w-[1400px] mx-auto space-y-32 px-4">
      {/* Milestones - Cinematic Timeline */}
      <section>
        <div className="text-center mb-32 space-y-6">
          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ margin: "-20px" }} className="inline-flex items-center justify-center p-5 bg-purple-500/10 rounded-3xl mb-6 border border-purple-500/20 shadow-2xl">
            <Milestone className="w-10 h-10 text-purple-400" />
          </motion.div>
          <h2 className="text-7xl font-black text-white tracking-tighter">Our Milestones</h2>
          <p className="text-2xl text-purple-400 font-medium italic">The stars that guide our story.</p>
        </div>
        
        <div className="relative space-y-24 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
          {milestones.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-20px" }}
              transition={{ duration: 0.8 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-800 bg-gray-900 text-purple-400 shadow-2xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-all duration-500 group-hover:scale-125 group-hover:bg-purple-600 group-hover:text-white">
                <Sparkles size={18} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-4rem)] p-12 rounded-[4rem] bg-white/5 border border-white/10 shadow-2xl backdrop-blur-3xl transition-all duration-500 group-hover:bg-white/10 group-hover:border-purple-500/30">
                <time className="font-black text-xs uppercase tracking-[0.3em] text-purple-500 mb-4 block">{m.date}</time>
                <h4 className="text-3xl font-black text-white mb-4 group-hover:text-purple-300 transition-colors">{m.title}</h4>
                <p className="text-lg text-gray-400 font-medium leading-relaxed">{m.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div ref={milestonesRef} className="flex justify-center py-24">
          {loadingMilestones && <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />}
        </div>
      </section>

      {/* Highlights - Premium Masonry-like Grid */}
      <section>
        <div className="text-center mb-32 space-y-6">
          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ margin: "-20px" }} className="inline-flex items-center justify-center p-5 bg-pink-500/10 rounded-3xl mb-6 border border-pink-500/20 shadow-2xl">
            <Star className="w-10 h-10 text-pink-400" />
          </motion.div>
          <h2 className="text-7xl font-black text-white tracking-tighter">Brightest Moments</h2>
          <p className="text-2xl text-pink-400 font-medium italic">Unforgettable frames from our year together.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {highlights.map((h, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, margin: "-20px" }}
              whileHover={{ y: -12, scale: 1.02 }}
              transition={{ duration: 0.6 }}
              className="bg-white/5 backdrop-blur-3xl p-16 rounded-[5rem] shadow-2xl border border-white/10 group transition-all duration-700 hover:bg-white/[0.08] hover:border-pink-500/30"
            >
              <div className="w-16 h-16 bg-pink-500/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500">
                <Star className="w-8 h-8 text-pink-400 group-hover:text-white" />
              </div>
              <h4 className="text-4xl font-black text-white mb-6 group-hover:text-pink-300 transition-colors tracking-tight">{h.title}</h4>
              <p className="text-xl text-gray-400 leading-relaxed font-medium">{h.description}</p>
            </motion.div>
          ))}
        </div>
        <div ref={highlightsRef} className="flex justify-center py-24">
          {loadingHighlights && <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />}
        </div>
      </section>
    </div>
  );
}
