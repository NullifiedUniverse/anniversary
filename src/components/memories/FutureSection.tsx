import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Compass, Trophy, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface FutureSectionProps {
  adventures: { title: string; description: string }[];
  superlatives: { title: string; winner: string; reason: string }[];
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
    const lowerName = name.toLowerCase();
    if (lowerName.includes('nullifiedgalaxy')) return "Null";
    if (lowerName.includes('vanessa')) return "Yun";
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
      className="max-w-5xl mx-auto space-y-32 py-20"
    >
      {/* Superlatives / Awards */}
      <section>
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-gray-900/40 rounded-full mb-4 shadow-sm border border-yellow-900/20">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-5xl font-black text-gray-100">Our Superlatives</h2>
          <p className="text-xl text-yellow-400 italic">Celebrating the little things that make us 'us'.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {superlatives.map((s, i) => (
            <motion.div 
              key={i}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gray-900/40 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-xl border border-gray-800 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <h4 className="text-xl font-bold text-yellow-500 uppercase tracking-widest mb-4">{s.title}</h4>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-yellow-900/30 rounded-full flex items-center justify-center font-black text-yellow-400">
                  🏆
                </div>
                <span className="text-3xl font-black text-gray-100">{formatName(s.winner)}</span>
              </div>
              <p className="text-lg text-gray-400 leading-relaxed font-medium italic">"{s.reason}"</p>
            </motion.div>
          ))}
        </div>
        <div ref={superlativesRef} className="flex justify-center py-12">
          {loadingSuperlatives && <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />}
        </div>
      </section>

      {/* Future Adventures */}
      <section>
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-gray-900/40 rounded-full mb-4 shadow-sm border border-pink-900/20">
            <Compass className="w-8 h-8 text-pink-400" />
          </div>
          <h2 className="text-5xl font-black text-gray-100">Our Future</h2>
          <p className="text-xl text-pink-400 italic">The chapters we haven't written yet.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {adventures.map((a, i) => (
            <motion.div 
              key={i}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
              className="bg-gray-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-xl border border-pink-900/10 flex flex-col text-center"
            >
              <div className="text-4xl mb-6">✨</div>
              <h4 className="text-2xl font-black text-gray-100 mb-4">{a.title}</h4>
              <p className="text-gray-400 font-medium">{a.description}</p>
            </motion.div>
          ))}
        </div>
        <div ref={adventuresRef} className="flex justify-center py-12">
          {loadingAdventures && <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />}
        </div>
      </section>
    </motion.div>
  );
}
