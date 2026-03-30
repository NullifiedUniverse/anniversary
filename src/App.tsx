import React, { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { Memories } from './components/Memories';
import { LoadingState } from './components/LoadingState';
import { parseFiles, ChatMessage } from './lib/parser';
import { generateMemories, MemoryData } from './lib/gemini';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { Instagram, Sparkles, Heart } from 'lucide-react';

type AppState = 'idle' | 'parsing' | 'generating' | 'success' | 'error';

const Particles = () => {
  const particles = useMemo(() => Array.from({ length: 40 }).map(() => ({
    width: Math.random() * 6 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 15 + 15,
    delay: Math.random() * 5,
    yOffset: -100 - Math.random() * 200,
    xOffset: (Math.random() - 0.5) * 100
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-pink-300/40 blur-[1px]"
          style={{
            width: p.width,
            height: p.width,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, p.yOffset],
            x: [0, p.xOffset],
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0.5]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [memories, setMemories] = useState<MemoryData | null>(null);
  const [rawMessages, setRawMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [customApiKey, setCustomApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ['#FDFBF7', '#FDF2F8', '#EEF2FF']
  );

  const handleFilesSelected = async (files: File[]) => {
    try {
      setError(null);
      setAppState('parsing');
      
      const messages = await parseFiles(files);
      
      if (messages.length === 0) {
        throw new Error("Could not find any messages in the provided files. Please ensure they are valid Instagram export files.");
      }

      setRawMessages(messages);
      setAppState('generating');
      
      const memoryData = await generateMemories(messages, customApiKey, selectedModel);
      
      setMemories(memoryData);
      setAppState('success');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setAppState('error');
    }
  };

  const reset = () => {
    setAppState('idle');
    setMemories(null);
    setRawMessages([]);
    setError(null);
  };

  return (
    <motion.div 
      style={{ backgroundColor: bgColor }} 
      className="min-h-screen text-gray-900 font-sans selection:bg-pink-200 overflow-x-hidden relative"
    >
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 origin-left z-50" 
        style={{ scaleX }} 
      />

      {/* Parallax Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div style={{ y: y1 }} className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-300/20 blur-[160px]"></motion.div>
        <motion.div style={{ y: y2 }} className="absolute top-[20%] -right-[10%] w-[60%] h-[80%] rounded-full bg-pink-300/20 blur-[160px]"></motion.div>
        <motion.div style={{ y: y3 }} className="absolute -bottom-[20%] left-[10%] w-[70%] h-[60%] rounded-full bg-orange-200/30 blur-[160px]"></motion.div>
      </div>
      <Particles />

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-16 px-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={reset}
          >
            <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-2.5 rounded-2xl text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <Instagram size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-gray-900 leading-none">InstaMemories</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-pink-500 mt-0.5">Anniversary Edition</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center space-x-2 text-gray-500 font-medium bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm"
          >
            <Sparkles size={16} className="text-yellow-500" />
            <span className="text-sm">Powered by Gemini AI</span>
          </motion.div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {appState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-full"
              >
                <div className="text-center mb-16 max-w-4xl mx-auto">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className="inline-flex items-center space-x-2 bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-sm font-bold mb-8 shadow-sm"
                  >
                    <Heart size={14} className="fill-pink-600" />
                    <span>Celebrate Your First Year Together</span>
                  </motion.div>
                  
                  <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 text-gray-900 leading-[1.1]">
                    Relive your <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
                      favorite moments
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
                    Turn your Instagram chat history into a beautiful, AI-powered anniversary story.
                    Discover your stats, highlights, and hidden memories.
                  </p>
                </div>

                <FileUpload onFilesSelected={handleFilesSelected} />
                
                <div className="mt-12 text-center">
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)} 
                    className="text-sm text-gray-500 font-bold hover:text-purple-600 transition-all flex items-center justify-center mx-auto space-x-2 bg-white/40 hover:bg-white/80 px-4 py-2 rounded-full border border-white/40"
                  >
                    <span>{showAdvanced ? 'Hide Settings' : 'Advanced Settings'}</span>
                    <motion.span animate={{ rotate: showAdvanced ? 180 : 0 }}>↓</motion.span>
                  </button>
                  
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, y: 10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: 10 }}
                        className="mt-6 max-w-md mx-auto space-y-5 text-left bg-white/80 p-8 rounded-[2.5rem] border border-white shadow-2xl backdrop-blur-xl overflow-hidden"
                      >
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Gemini API Key (Optional)</label>
                          <input 
                            type="password" 
                            value={customApiKey} 
                            onChange={e => setCustomApiKey(e.target.value)} 
                            placeholder="AIzaSy..."
                            className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none bg-white/50 transition-all font-medium"
                          />
                          <p className="text-[10px] text-gray-400 mt-2 ml-1 leading-relaxed">
                            Your key is used only in this session and never stored on any server.
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">AI Model Strategy</label>
                          <select 
                            value={selectedModel} 
                            onChange={e => setSelectedModel(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none bg-white/50 transition-all font-bold text-gray-700"
                          >
                            <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
                            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Analysis)</option>
                            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {(appState === 'parsing' || appState === 'generating') && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <LoadingState 
                  status={appState === 'parsing' ? "Reading your chat history..." : "AI is analyzing your journey..."} 
                />
              </motion.div>
            )}

            {appState === 'success' && memories && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="w-full"
              >
                <Memories data={memories} messages={rawMessages} customApiKey={customApiKey} selectedModel={selectedModel} />
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mt-20 text-center pb-24"
                >
                  <button 
                    onClick={reset}
                    className="px-10 py-4 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-800 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-white transition-all transform hover:-translate-y-1"
                  >
                    Analyze Another Story
                  </button>
                </motion.div>
              </motion.div>
            )}

            {appState === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50/80 backdrop-blur-md border border-red-100 text-red-600 p-10 rounded-[2.5rem] max-w-lg mx-auto text-center shadow-2xl"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-2xl font-black mb-3 text-red-900">Something went wrong</h3>
                <p className="font-medium text-red-700/80 leading-relaxed">{error}</p>
                <button 
                  onClick={reset}
                  className="mt-8 px-8 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}

