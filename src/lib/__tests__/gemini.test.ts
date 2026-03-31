import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateMemories, generateMoreItems } from '../gemini';
import { ChatMessage } from '../parser';

// Mock GoogleGenAI
const mockGenerateContent = vi.fn();
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(function() {
    return {
      models: {
        generateContent: mockGenerateContent,
      },
    };
  }),
  Type: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    ARRAY: 'ARRAY',
  },
}));

describe('gemini lib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        summary: 'A beautiful story',
        highlights: [],
        memorableQuotes: [],
        insideJokes: [],
        milestones: [],
        futureAdventures: [],
        superlatives: [],
        communicationInsights: [],
        vibe: 'Romantic',
      }),
    });
  });

  it('generates a romantic prompt with Null and Yun nicknames', async () => {
    const messages: ChatMessage[] = [
      { sender: 'nullifiedgalaxy', content: 'I love you', timestamp: Date.now() },
      { sender: 'vanessa', content: 'I love you too', timestamp: Date.now() + 1000 },
    ];

    process.env.VITE_GEMINI_API_KEY = 'test-key';
    
    await generateMemories(messages, 'test-key');

    const callArgs = mockGenerateContent.mock.calls[0][0];
    const prompt = callArgs.contents[0].parts[0].text;

    expect(prompt).toContain('Null');
    expect(prompt).toContain('Yun');
    expect(prompt).toContain('sweet');
    expect(prompt).toContain('emotional');
    expect(prompt).toContain('digital love letter');
  });

  it('generates more items for a specific category', async () => {
    const messages: ChatMessage[] = [
      { sender: 'nullifiedgalaxy', content: 'Funny joke', timestamp: Date.now() },
    ];

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify([{ title: 'Joke 2', description: 'Funny' }]),
    });

    const result = await generateMoreItems(messages, 'insideJokes', [], 'test-key');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Joke 2');
    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it('handles empty messages in generateMoreItems', async () => {
    const result = await generateMoreItems([], 'insideJokes', [], 'test-key');
    expect(result).toEqual([]);
  });
});
