import { useState, useEffect } from 'react';
import { MemoryData, generateMoreItems } from '../../lib/gemini';
import { ChatMessage } from '../../lib/parser';

export function useInfiniteMemories(
  data: MemoryData,
  messages: ChatMessage[],
  customApiKey?: string,
  selectedModel?: string
) {
  const [quotes, setQuotes] = useState(data.memorableQuotes || []);
  const [insights, setInsights] = useState(data.communicationInsights || []);
  const [jokes, setJokes] = useState(data.insideJokes || []);
  const [highlights, setHighlights] = useState(data.highlights || []);
  const [milestones, setMilestones] = useState(data.milestones || []);
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

  const generateMore = async (category: keyof typeof loading) => {
    if (loading[category] || messages.length === 0) return;

    setLoading(prev => ({ ...prev, [category]: true }));
    try {
      const categoryKey = String(category);
      const categoryMap: Record<string, any> = {
        quotes: { key: 'memorableQuotes', state: quotes, setter: setQuotes },
        insights: { key: 'communicationInsights', state: insights, setter: setInsights },
        jokes: { key: 'insideJokes', state: jokes, setter: setJokes },
        highlights: { key: 'highlights', state: highlights, setter: setHighlights },
        milestones: { key: 'milestones', state: milestones, setter: setMilestones },
        futureAdventures: { key: 'futureAdventures', state: futureAdventures, setter: setFutureAdventures },
        superlatives: { key: 'superlatives', state: superlatives, setter: setSuperlatives },
      };

      const config = categoryMap[categoryKey];
      if (!config) return;

      const { key, state, setter } = config;
      const newItems = await generateMoreItems(messages, key, state, customApiKey, selectedModel);
      setter((prev: any[]) => [...prev, ...newItems]);
    } catch (error) {
      console.error(`Error generating more ${String(category)}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }));
    }
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
