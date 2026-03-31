import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { Memories } from './components/Memories';
import { LoadingState, LoadingStep } from './components/LoadingState';
import { parseFiles, ChatMessage } from './lib/parser';
import { generateMemories, MemoryData } from './lib/gemini';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { Instagram, Sparkles, Heart, Key, CheckCircle2, AlertCircle } from 'lucide-react';

type AppStatus = 'setup' | 'idle' | 'analyzing' | 'success' | 'error';

interface AppState {
  status: AppStatus;
  memories: MemoryData | null;
  rawMessages: ChatMessage[];
  error: string | null;
  customApiKey: string;
  selectedModel: string;
  steps: LoadingStep[];
}

const INITIAL_STEPS: LoadingStep[] = [
  { id: 'load', label: 'Awakening the memory vault', status: 'pending' },
  { id: 'parse', label: 'Tracing your shared history', status: 'pending' },
  { id: 'sample', label: 'Weaving the threads of your story', status: 'pending' },
  { id: 'ai', label: 'Gemini AI reliving the magic', status: 'pending' },
  { id: 'render', label: 'Painting your digital journey', status: 'pending' },
];

const Particles = () => {
  const particles = useMemo(() => Array.from({ length: 50 }).map(() => ({
    width: Math.random() * 4 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 20 + 20,
    delay: Math.random() * 10,
    yOffset: -200 - Math.random() * 300,
    xOffset: (Math.random() - 0.5) * 200
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-pink-500/10 blur-[2px]"
          style={{ width: p.width, height: p.width, left: `${p.left}%`, top: `${p.top}%` }}
          animate={{ y: [0, p.yOffset], x: [0, p.xOffset], opacity: [0, 0.3, 0], scale: [0, 1.5, 0.5] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<AppState>({
    status: 'setup',
    memories: null,
    rawMessages: [],
    error: null,
    customApiKey: localStorage.getItem('insta_memories_key') || '',
    selectedModel: 'gemini-flash-latest',
    steps: INITIAL_STEPS,
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const bgColor = useTransform(scrollYProgress, [0, 0.5, 1], ['#020617', '#0f172a', '#1e1b4b']);

  const updateStep = (id: string, status: LoadingStep['status']) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === id ? { ...s, status } : s)
    }));
  };

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = state.customApiKey.trim();
    if (trimmedKey) {
      localStorage.setItem('insta_memories_key', trimmedKey);
      setState(prev => ({ ...prev, status: 'idle', customApiKey: trimmedKey }));
    }
  };

  const runAnalysis = async (messages: ChatMessage[], apiKey: string, modelName: string) => {
    try {
      console.log(`[App] 🚀 Commencing Analysis...`);
      setState(prev => ({ ...prev, status: 'analyzing', rawMessages: messages }));
      
      updateStep('load', 'complete');
      updateStep('parse', 'loading');
      await new Promise(r => setTimeout(r, 1000));
      updateStep('parse', 'complete');
      
      updateStep('sample', 'loading');
      await new Promise(r => setTimeout(r, 800));
      updateStep('sample', 'complete');
      
      updateStep('ai', 'loading');
      const memoryData = await generateMemories(messages, apiKey, modelName);
      
      updateStep('ai', 'complete');
      updateStep('render', 'loading');
      await new Promise(r => setTimeout(r, 1200));
      updateStep('render', 'complete');
      
      setState(prev => ({ ...prev, memories: memoryData, status: 'success' }));
    } catch (err) {
      console.error("[App] ❌ Analysis Failure:", err);
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : "The story encountered a chapter it couldn't read.", 
        status: 'error' 
      }));
    }
  };

  useEffect(() => {
    if (state.status === 'idle') {
      const loadPreParsed = async () => {
        try {
          const response = await fetch('/pre-parsed-data.json');
          if (response.ok) {
            const messages = await response.json();
            if (messages?.length > 0) {
              await runAnalysis(messages, state.customApiKey, state.selectedModel);
            }
          }
        } catch (e) {
          console.log("Auto-load skipped.");
        }
      };
      loadPreParsed();
    }
  }, [state.status === 'idle']);

  const handleFilesSelected = async (files: File[]) => {
    try {
      setState(prev => ({ ...prev, error: null, status: 'analyzing', steps: INITIAL_STEPS }));
      const messages = await parseFiles(files);
      if (messages.length === 0) throw new Error("No memories were found in those files.");
      runAnalysis(messages, state.customApiKey, state.selectedModel);
    } catch (err) {
      setState(prev => ({ ...prev, error: err instanceof Error ? err.message : "The messages couldn't be traced.", status: 'error' }));
    }
  };

  const reset = () => {
    setState(prev => ({
      ...prev,
      status: 'idle',
      memories: null,
      rawMessages: [],
      error: null,
      steps: INITIAL_STEPS,
    }));
  };

  return (
    <motion.div style={{ backgroundColor: bgColor }} className="min-h-screen text-gray-100 font-sans selection:bg-pink-500/30 overflow-x-hidden relative">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-amber-500 origin-left z-50" style={{ scaleX }} />
      <Particles />

      <div className="relative z-10 max-w-[1600px] mx-auto px-8 md:px-16 py-12 min-h-screen flex flex-col">
        {/* Navigation */}
        <header className="flex items-center justify-between mb-24">
          <div className="flex items-center space-x-4 cursor-pointer group" onClick={reset}>
            <div className="bg-gradient-to-tr from-indigo-600 to-pink-600 p-3 rounded-2xl text-white shadow-2xl group-hover:scale-110 transition-transform duration-500">
              <Instagram size={32} />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter leading-none">InstaMemories</span>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-pink-500 mt-1 opacity-80 italic">A Love Story in Data</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6 text-gray-400 font-bold bg-white/5 backdrop-blur-3xl px-8 py-3 rounded-full border border-white/10 shadow-2xl">
            <div className="flex items-center space-x-2">
              <Sparkles size={18} className="text-amber-400 animate-pulse" />
              <span className="text-sm tracking-widest uppercase">Cinematic Analysis Active</span>
            </div>
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {state.status === 'setup' && (
              <motion.div key="setup" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-gray-900/40 backdrop-blur-3xl p-16 rounded-[4rem] border border-white/5 shadow-[0_32px_128px_rgba(0,0,0,0.4)] text-center space-y-12">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-2xl transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <Key size={48} />
                  </div>
                  <Heart className="absolute -top-4 -right-4 text-pink-500 fill-pink-500 animate-bounce" size={24} />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-5xl font-black tracking-tight leading-tight text-white">Open the Vault</h2>
                  <p className="text-xl text-gray-400 font-medium max-w-md mx-auto leading-relaxed">Provide your Gemini API Key to relive your shared history.</p>
                </div>
                
                <form onSubmit={handleKeySubmit} className="space-y-8 max-w-md mx-auto">
                  <input 
                    type="password" 
                    placeholder="ENTER KEY" 
                    value={state.customApiKey}
                    onChange={e => setState(prev => ({ ...prev, customApiKey: e.target.value }))}
                    className="w-full px-8 py-6 bg-black/40 border border-white/10 rounded-3xl text-gray-100 placeholder-gray-700 focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-black tracking-[0.5em] text-center"
                  />
                  <button type="submit" className="group relative w-full py-6 bg-white text-black rounded-3xl font-black text-xl overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-[0.98]">
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      <span>Begin the Journey</span>
                      <Heart size={20} className="fill-black" />
                    </span>
                  </button>
                </form>
                
                <p className="text-sm text-gray-500 font-medium italic opacity-60">Private. Secure. For your eyes only.</p>
              </motion.div>
            )}

            {state.status === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} className="w-full text-center space-y-24">
                <div className="space-y-10">
                  <div className="inline-flex items-center space-x-3 bg-green-500/10 text-green-400 px-6 py-2.5 rounded-full text-xs font-black border border-green-500/20 uppercase tracking-[0.2em]">
                    <CheckCircle2 size={14} />
                    <span>Memory Vault Authenticated</span>
                  </div>
                  <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.9] text-white">
                    Relive every<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300">
                      soulful moment
                    </span>
                  </h1>
                  <p className="text-2xl md:text-3xl text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed italic">
                    Transforming 370,000+ messages into your first year together.
                  </p>
                </div>
                
                <FileUpload onFilesSelected={handleFilesSelected} />
                
                <div className="flex flex-col items-center space-y-6 pt-12">
                  <button onClick={() => setState(prev => ({ ...prev, status: 'setup' }))} className="text-[10px] text-gray-500 font-black hover:text-pink-400 transition-colors uppercase tracking-[0.4em]">
                    Manage Access Key
                  </button>
                  <div className="flex items-center space-x-4">
                    {[
                      { id: 'gemini-flash-latest', label: 'Flash' },
                      { id: 'gemini-flash-lite-latest', label: 'Lite' },
                      { id: 'gemini-pro-latest', label: 'Pro' }
                    ].map(model => (
                      <button 
                        key={model.id}
                        onClick={() => setState(prev => ({ ...prev, selectedModel: model.id }))}
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                          state.selectedModel === model.id 
                            ? 'bg-white text-black border-white' 
                            : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'
                        }`}
                      >
                        {model.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {state.status === 'analyzing' && (
              <motion.div key="loading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <LoadingState status="The Magic is Unfolding" steps={state.steps} />
              </motion.div>
            )}

            {state.status === 'success' && state.memories && (
              <motion.div key="success" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <Memories data={state.memories} messages={state.rawMessages} customApiKey={state.customApiKey} selectedModel={state.selectedModel} />
                <div className="mt-32 text-center pb-32">
                  <button onClick={reset} className="px-12 py-5 bg-white/5 backdrop-blur-3xl border border-white/10 text-white rounded-full font-black text-lg shadow-2xl hover:bg-white hover:text-black transition-all transform hover:-translate-y-2">Analyze Another Journey</button>
                </div>
              </motion.div>
            )}

            {state.status === 'error' && (
              <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-red-950/20 backdrop-blur-3xl border border-red-500/20 p-16 rounded-[4rem] text-center space-y-10 shadow-[0_0_100px_rgba(239,68,68,0.1)]">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse">
                  <AlertCircle size={48} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Chapter Interrupted</h3>
                  <p className="text-lg text-red-200/60 font-medium leading-relaxed max-w-md mx-auto">{state.error}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-md mx-auto">
                  {['Verify API Key', 'Connection Check', 'Try Again', 'Switch Model'].map((tip, i) => (
                    <div key={i} className="flex items-center space-x-3 bg-red-500/5 px-4 py-3 rounded-2xl border border-red-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-400">{tip}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col space-y-4 pt-6 max-w-xs mx-auto">
                  <button onClick={reset} className="w-full py-5 bg-red-600 text-white rounded-3xl font-black text-lg hover:bg-red-500 transition-all shadow-2xl shadow-red-600/20 uppercase tracking-widest">Retry Story</button>
                  <button onClick={() => setState(prev => ({ ...prev, status: 'setup' }))} className="text-xs text-gray-500 font-bold hover:text-white transition-colors uppercase tracking-[0.3em]">Reset Access</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}
