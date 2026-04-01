import { useState, useEffect, useRef } from 'react';
import { MemoryData, generateMoreItems } from '../../lib/gemini';
import { ChatMessage } from '../../lib/parser';

export function useInfiniteMemories(
  data: MemoryData,
  messages: ChatMessage[],
  customApiKey?: string,
  selectedModel?: string,
  ollamaEndpoint?: string,
  seeds?: any
) {
  // Initialize with seeds if provided, otherwise fallback to initial AI data
  const [quotes, setQuotes] = useState(seeds?.quotes?.length > 0 ? seeds.quotes : (data.memorableQuotes || []));
  const [insights, setInsights] = useState(data.communicationInsights || []);
  const [jokes, setJokes] = useState(data.insideJokes || []);
  const [highlights, setHighlights] = useState(data.highlights || []);
  const [milestones, setMilestones] = useState(seeds?.milestones?.length > 0 ? seeds.milestones : (data.milestones || []));
  const [futureAdventures, setFutureAdventures] = useState(data.futureAdventures || []);
  const [superlatives, setSuperlatives] = useState(data.superlatives || []);

  const [loading, setLoading] = useState<Record<string, boolean>>({
    quotes: false,
    insights: false,
    jokes: false,
    highlights: false,
    milestones: false,
    futureAdventures: false,
    superlatives: false,
  });

  const queue = useRef<string[]>([]);
  const isProcessing = useRef(false);
  const lastRequestTime = useRef(0);

  const processQueue = async () => {
    if (isProcessing.current || queue.current.length === 0) return;

    isProcessing.current = true;
    
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime.current;
    if (timeSinceLast < 1500) {
      await new Promise(r => setTimeout(r, 1500 - timeSinceLast));
    }

    const category = queue.current.shift() as keyof typeof loading;
    if (!category) {
      isProcessing.current = false;
      return;
    }

    setLoading(prev => ({ ...prev, [category]: true }));
    
    try {
      const categoryMap: Record<string, any> = {
        quotes: { key: 'memorableQuotes', state: quotes, setter: setQuotes },
        insights: { key: 'communicationInsights', state: insights, setter: setInsights },
        jokes: { key: 'insideJokes', state: jokes, setter: setJokes },
        highlights: { key: 'highlights', state: highlights, setter: setHighlights },
        milestones: { key: 'milestones', state: milestones, setter: setMilestones },
        futureAdventures: { key: 'futureAdventures', state: futureAdventures, setter: setFutureAdventures },
        superlatives: { key: 'superlatives', state: superlatives, setter: setSuperlatives },
      };

      const config = categoryMap[category as string];
      if (config) {
        const { key, state, setter } = config;
        const newItems = await generateMoreItems(
          messages, 
          key, 
          state, 
          customApiKey || '', 
          selectedModel || 'gemini-2.0-flash', 
          ollamaEndpoint
        );
        if (Array.isArray(newItems) && newItems.length > 0) {
          setter((prev: any[]) => [...prev, ...newItems]);
        }
      }
    } catch (error) {
      console.error(`Error generating more ${String(category)}:`, error);
    } finally {
      lastRequestTime.current = Date.now();
      setLoading(prev => ({ ...prev, [category]: false }));
      isProcessing.current = false;
      setTimeout(processQueue, 100);
    }
  };

  const generateMore = (category: keyof typeof loading) => {
    if (loading[category] || queue.current.includes(String(category)) || messages.length === 0) return;
    queue.current.push(String(category));
    processQueue();
  };

  return {
    quotes,
    insights,
    jokes,
    highlights,
    milestones,
    futureAdventures,
    superlatives,
    loading,
    generateMore,
  };
}
