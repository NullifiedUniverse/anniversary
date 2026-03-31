import { renderHook, act } from '@testing-library/react';
import { useInfiniteMemories } from '../useInfiniteMemories';
import { describe, it, expect, vi } from 'vitest';
import { MemoryData } from '../../../lib/gemini';

// Mock generateMoreItems
vi.mock('../../../lib/gemini', async () => {
  const original = await vi.importActual('../../../lib/gemini');
  return {
    ...original,
    generateMoreItems: vi.fn().mockResolvedValue([{ title: 'New Item', description: 'New' }]),
  };
});

import { generateMoreItems } from '../../../lib/gemini';

const mockData: MemoryData = {
  participants: ['Null', 'Yun'],
  summary: 'Summary',
  firstMessage: { date: '2025-03-31', sender: 'Null', text: 'Hi' },
  stats: { totalMessages: 100, mostActivePerson: 'Null', topEmojis: [] },
  extendedStats: { messagesByHour: {}, topWords: [], avgResponseTime: {} },
  highlights: [{ title: 'H1', description: 'D1' }],
  memorableQuotes: [],
  insideJokes: [],
  milestones: [],
  futureAdventures: [],
  superlatives: [],
  communicationInsights: [],
  vibe: 'Romantic',
};

describe('useInfiniteMemories', () => {
  it('initializes state correctly', () => {
    const { result } = renderHook(() => useInfiniteMemories(mockData, []));
    expect(result.current.highlights).toHaveLength(1);
    expect(result.current.quotes).toHaveLength(0);
  });

  it('generates more items for a category', async () => {
    const { result } = renderHook(() => useInfiniteMemories(mockData, [{ sender: 'Null', content: 'Hi', timestamp: 123 }]));
    
    await act(async () => {
      await result.current.generateMore('highlights');
    });

    expect(result.current.highlights).toHaveLength(2);
    expect(generateMoreItems).toHaveBeenCalled();
  });

  it('handles unknown category', async () => {
    const { result } = renderHook(() => useInfiniteMemories(mockData, [{ sender: 'Null', content: 'Hi', timestamp: 123 }]));
    
    await act(async () => {
      // @ts-ignore
      await result.current.generateMore('invalid');
    });

    expect(result.current.loading.highlights).toBe(false);
  });
});
