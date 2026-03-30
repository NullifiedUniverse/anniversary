import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface FutureSectionProps {
  adventures: { title: string; description: string }[];
  superlatives: { award: string; winner: string; reason: string }[];
  loadingAdventures: boolean;
  loadingSuperlatives: boolean;
  onLoadMoreAdventures: () => void;
  onLoadMoreSuperlatives: () => void;
}

export function FutureSection({
  adventures,
  superlatives,
  loadingAdventures,
  loadingSuperlatives,
  onLoadMoreAdventures,
  onLoadMoreSuperlatives
}: FutureSectionProps) {
  const { ref: adventuresRef, inView: adventuresInView } = useInView({ threshold: 0.1 });
  const { ref: superlativesRef, inView: superlativesInView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (adventuresInView) onLoadMoreAdventures();
  }, [adventuresInView]);

  useEffect(() => {
    if (superlativesInView) onLoadMoreSuperlatives();
  }, [superlativesInView]);

  const formatName = (name: string) => {
    if (!name) return "Unknown";
    const cleanName = name.split(/_|(?=[A-Z])/)[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  return (
    <motion.div 
      id="future"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }}
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
      className="max-w-5xl mx-auto space-y-32 pt-20"
    >
      {/* Superlatives */}
      <section>
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-4">Superlatives</h2>
          <p className="text-xl text-gray-500">The official awards of your relationship.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {superlatives.map((award, index) => (
            <motion.div 
              key={index} 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-yellow-100 to-orange-100 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-xl border border-white/80 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 text-6xl opacity-20">🏆</div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-md text-3xl">
                🏅
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-wide text-orange-600">{award.award}</h4>
              <div className="text-2xl font-black text-gray-900 mb-4">{formatName(award.winner)}</div>
              <p className="text-md text-gray-700 font-medium">{award.reason}</p>
            </motion.div>
          ))}
        </div>
        <div ref={superlativesRef} className="flex justify-center py-12">
          {loadingSuperlatives && <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />}
        </div>
      </section>

      {/* Future Adventures */}
      <section>
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-4">Future Adventures</h2>
          <p className="text-xl text-gray-500">Things you've dreamed of doing together.</p>
        </div>
        <div className="space-y-8">
          {adventures.map((adv, index) => (
            <motion.div 
              key={index} 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
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
        <div ref={adventuresRef} className="flex justify-center py-12">
          {loadingAdventures && <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />}
        </div>
      </section>
    </motion.div>
  );
}
