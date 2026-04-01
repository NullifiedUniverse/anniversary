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
  // Use sets to track seen content and prevent duplicates
  const seenContent = useRef<Set<string>>(new Set());

  const [quotes, setQuotes] = useState(() => {
    const initial = data.memorableQuotes || seeds?.quotes || [];
    initial.forEach((q: any) => seenContent.current.add(q.text));
    return initial;
  });

  const [insights, setInsights] = useState(data.communicationInsights || []);
  
  const [jokes, setJokes] = useState(() => {
    const initial = data.insideJokes || seeds?.jokes || [];
    initial.forEach((j: any) => seenContent.current.add(j.joke));
    return initial;
  });

  const [highlights, setHighlights] = useState(() => {
    const initial = data.highlights || [];
    initial.forEach((h: any) => seenContent.current.add(h.title));
    return initial;
  });

  const [milestones, setMilestones] = useState(() => {
    const initial = data.milestones || seeds?.milestones || [];
    initial.forEach((m: any) => seenContent.current.add(m.title));
    return initial;
  });

  const [futureAdventures, setFutureAdventures] = useState(() => {
    const initial = data.futureAdventures || seeds?.future || [];
    initial.forEach((f: any) => seenContent.current.add(f.title));
    return initial;
  });

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
        quotes: { key: 'memorableQuotes', state: quotes, setter: setQuotes, contentKey: 'text' },
        insights: { key: 'communicationInsights', state: insights, setter: setInsights, contentKey: 'title' },
        jokes: { key: 'insideJokes', state: jokes, setter: setJokes, contentKey: 'joke' },
        highlights: { key: 'highlights', state: highlights, setter: setHighlights, contentKey: 'title' },
        milestones: { key: 'milestones', state: milestones, setter: setMilestones, contentKey: 'title' },
        futureAdventures: { key: 'futureAdventures', state: futureAdventures, setter: setFutureAdventures, contentKey: 'title' },
        superlatives: { key: 'superlatives', state: superlatives, setter: setSuperlatives, contentKey: 'title' },
      };

      const config = categoryMap[category as string];
      if (config) {
        const { key, state, setter, contentKey } = config;
        const newItems = await generateMoreItems(
          messages, 
          key, 
          state, 
          customApiKey || '', 
          selectedModel || 'gemini-2.0-flash', 
          ollamaEndpoint
        );
        
        if (Array.isArray(newItems) && newItems.length > 0) {
          // Filter out duplicates rigorously
          const uniqueNewItems = newItems.filter(item => {
            const val = item[contentKey];
            if (seenContent.current.has(val)) return false;
            seenContent.current.add(val);
            return true;
          });
          
          if (uniqueNewItems.length > 0) {
            setter((prev: any[]) => [...prev, ...uniqueNewItems]);
          }
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
