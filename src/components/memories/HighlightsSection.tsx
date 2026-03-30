import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface HighlightsSectionProps {
  highlights: { title: string; description: string }[];
  milestones: { title: string; description: string }[];
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
    <motion.div 
      id="highlights"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }}
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.2 } } }}
      className="max-w-5xl mx-auto space-y-32 pt-20"
    >
      {/* Highlights */}
      <section>
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-4">Highlights</h2>
          <p className="text-xl text-gray-500">The best moments of the year.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {highlights.map((highlight, index) => (
            <motion.div 
              key={index} 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -8, scale: 1.02 }}
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
        <div ref={highlightsRef} className="flex justify-center py-12">
          {loadingHighlights && <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />}
        </div>
      </section>

      {/* Milestones */}
      <section>
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">Milestones</h3>
          <p className="text-xl text-gray-500">The big moments you've shared.</p>
        </div>
        <div className="space-y-8">
          {milestones.map((milestone, index) => (
            <motion.div 
              key={index}
              variants={{ hidden: { opacity: 0, x: index % 2 === 0 ? -50 : 50 }, show: { opacity: 1, x: 0 } }}
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
        <div ref={milestonesRef} className="flex justify-center py-12">
          {loadingMilestones && <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />}
        </div>
      </section>
    </motion.div>
  );
}
