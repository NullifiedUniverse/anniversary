import React, { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { Memories } from './components/Memories';
import { LoadingState } from './components/LoadingState';
import { parseFiles, ChatMessage } from './lib/parser';
import { generateMemories, MemoryData } from './lib/gemini';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { Instagram } from 'lucide-react';

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
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-preview');
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
    <motion.div style={{ backgroundColor: bgColor }} className="min-h-screen text-gray-900 font-sans selection:bg-pink-200 overflow-hidden relative">
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 origin-left z-50" 
        style={{ scaleX }} 
      />

      {/* Parallax Background decorative elements & Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div style={{ y: y1 }} className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-300/30 blur-[160px]"></motion.div>
        <motion.div style={{ y: y2 }} className="absolute top-[20%] -right-[10%] w-[60%] h-[80%] rounded-full bg-pink-300/30 blur-[160px]"></motion.div>
        <motion.div style={{ y: y3 }} className="absolute -bottom-[20%] left-[10%] w-[70%] h-[60%] rounded-full bg-orange-200/40 blur-[160px]"></motion.div>
      </div>
      <Particles />

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={reset}
          >
            <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-2 rounded-xl text-white shadow-md group-hover:shadow-lg transition-all">
              <Instagram size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-800">InstaMemories</span>
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
                <div className="text-center mb-12">
                  <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900">
                    Relive your <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
                      favorite conversations
                    </span>
                  </h1>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Upload your Instagram chat exports and let AI generate a beautiful summary of your relationship, complete with stats, highlights, and the very first message.
                  </p>
                </div>
                <FileUpload onFilesSelected={handleFilesSelected} />
                
                <div className="mt-8 text-center">
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)} 
                    className="text-sm text-purple-600 font-medium hover:underline transition-all"
                  >
                    {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                  </button>
                  
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 max-w-md mx-auto space-y-4 text-left bg-white/50 p-6 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md overflow-hidden"
                      >
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Custom Gemini API Key (Optional)</label>
                          <input 
                            type="password" 
                            value={customApiKey} 
                            onChange={e => setCustomApiKey(e.target.value)} 
                            placeholder="AIzaSy..."
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none bg-white/80"
                          />
                          <p className="text-xs text-gray-500 mt-1">Leave blank to use the default system key.</p>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Model</label>
                          <select 
                            value={selectedModel} 
                            onChange={e => setSelectedModel(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none bg-white/80"
                          >
                            <option value="gemini-3.1-flash-preview">Gemini 3.1 Flash (Fast & Default)</option>
                            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Advanced Reasoning)</option>
                            <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite (Fastest)</option>
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
                  status={appState === 'parsing' ? "Reading your chat files..." : "Analyzing messages and finding highlights..."} 
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
                  className="mt-20 text-center pb-12"
                >
                  <button 
                    onClick={reset}
                    className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-full font-medium shadow-sm hover:shadow-md hover:bg-gray-50 transition-all transform hover:-translate-y-1"
                  >
                    Analyze Another Chat
                  </button>
                </motion.div>
              </motion.div>
            )}

            {appState === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl max-w-lg mx-auto text-center shadow-sm"
              >
                <h3 className="text-lg font-bold mb-2">Oops! Something went wrong</h3>
                <p>{error}</p>
                <button 
                  onClick={reset}
                  className="mt-6 px-6 py-2 bg-red-100 text-red-700 rounded-full font-medium hover:bg-red-200 transition-colors"
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
