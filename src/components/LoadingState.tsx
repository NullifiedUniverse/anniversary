import React from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';

export type StepStatus = 'pending' | 'loading' | 'complete' | 'error';

export interface LoadingStep {
  id: string;
  label: string;
  status: StepStatus;
}

interface LoadingStateProps {
  status: string;
  steps?: LoadingStep[];
}

export function LoadingState({ status, steps }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-12 max-w-2xl mx-auto">
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative z-10"
        >
          <Heart className="w-20 h-20 text-pink-500 fill-pink-500" />
        </motion.div>
        
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full"
        />
        
        <motion.div
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
          className="absolute -top-4 -right-4 text-yellow-400"
        >
          <Sparkles size={24} />
        </motion.div>
      </div>

      <div className="space-y-6 w-full">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-100 tracking-tight">{status}</h2>
          <div className="flex items-center justify-center space-x-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                className="w-2 h-2 bg-pink-500 rounded-full"
              />
            ))}
          </div>
        </div>

        {steps && (
          <div className="grid grid-cols-1 gap-3 text-left">
            {steps.map((step, i) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  step.status === 'complete' ? 'bg-green-900/20 border-green-500/30 text-green-400' :
                  step.status === 'loading' ? 'bg-pink-900/20 border-pink-500/30 text-pink-300 animate-pulse' :
                  'bg-gray-900/40 border-gray-800 text-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    step.status === 'complete' ? 'bg-green-500' :
                    step.status === 'loading' ? 'bg-pink-500' :
                    'bg-gray-700'
                  }`} />
                  <span className="text-sm font-bold tracking-wide uppercase">{step.label}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  {step.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <p className="text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
        We're gathering your most precious moments and weaving them into your story.
      </p>
    </div>
  );
}
