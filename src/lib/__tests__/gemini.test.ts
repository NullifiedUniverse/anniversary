import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateMemories, generateMoreItems } from '../gemini';
import { ChatMessage } from '../parser';

describe('gemini lib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/analyze') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            summary: 'A beautiful story',
            vibe: 'Romantic',
            highlights: [],
            memorableQuotes: [],
            insideJokes: [],
            milestones: [],
            futureAdventures: [],
            superlatives: [],
            communicationInsights: [],
          }),
        });
      }
      return Promise.resolve({ 
        ok: false,
        json: () => Promise.resolve({ error: 'Not Found' })
      });
    });
  });

  it('calls the integrated proxy with a romantic prompt', async () => {
    const messages: ChatMessage[] = [
      { sender: 'nullifiedgalaxy', content: 'I love you', timestamp: Date.now() },
      { sender: 'vanessa', content: 'I love you too', timestamp: Date.now() + 1000 },
    ];

    const result = await generateMemories(messages, 'test-key');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/analyze',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('romantic'),
      })
    );
    expect(result.summary).toBeDefined();
  });

  it('generates more items via integrated proxy', async () => {
    const messages: ChatMessage[] = [
      { sender: 'nullifiedgalaxy', content: 'Funny joke', timestamp: Date.now() },
    ];

    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ title: 'Joke 2', description: 'Funny' }])
    });

    const result = await generateMoreItems(messages, 'insideJokes', [], 'test-key');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Joke 2');
  });
});
