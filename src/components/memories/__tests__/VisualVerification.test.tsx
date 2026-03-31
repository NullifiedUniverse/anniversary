import { render, screen } from '@testing-library/react';
import { MemoriesHeader } from '../MemoriesHeader';
import { QuotesSection } from '../QuotesSection';
import { StatsSection } from '../StatsSection';
import { describe, it, expect, vi } from 'vitest';
import { MemoryData } from '../../../lib/gemini';

// Mock Recharts
vi.mock('recharts', async () => {
  const original = await vi.importActual('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  };
});

const mockData: MemoryData = {
  participants: ['nullifiedgalaxy', 'vanessa'],
  summary: 'Summary',
  firstMessage: { date: '2025-03-31', sender: 'nullifiedgalaxy', text: 'Hi' },
  stats: { totalMessages: 1000, mostActivePerson: 'nullifiedgalaxy', topEmojis: ['❤️'] },
  extendedStats: { messagesByHour: {}, topWords: [], avgResponseTime: {} },
  highlights: [], memorableQuotes: [{ sender: 'nullifiedgalaxy', text: 'Love', context: 'Context' }],
  insideJokes: [], milestones: [], futureAdventures: [], superlatives: [], communicationInsights: [],
  vibe: 'Romantic',
};

describe('Visual Verification', () => {
  it('MemoriesHeader ampersand is not too dark', () => {
    render(<MemoriesHeader participants={['NullifiedGalaxy', 'vanessa']} vibe="Our first year" />);
    const ampersand = screen.getByText('&');
    // text-gray-400 is better for dark mode
    expect(ampersand).not.toHaveClass('text-gray-800');
  });

  it('QuotesSection context text is readable', () => {
    render(
      <QuotesSection 
        participants={['Null', 'Yun']}
        quotes={[{ sender: 'Null', text: 'Hi', context: 'Test Context' }]}
        insights={[]}
        jokes={[]}
        loadingQuotes={false}
        loadingInsights={false}
        loadingJokes={false}
        onLoadMoreQuotes={() => {}}
        onLoadMoreInsights={() => {}}
        onLoadMoreJokes={() => {}}
      />
    );
    const context = screen.getByText(/Test Context/i);
    // text-gray-600 + opacity-50 is too dark for dark mode
    expect(context).not.toHaveClass('text-gray-600');
    expect(context).not.toHaveClass('opacity-50');
  });

  it('StatsSection labels are not too dark', () => {
    render(<StatsSection data={mockData} />);
    const labels = screen.getAllByText(/Shared Words|Primary Energy|Our Cipher/i);
    labels.forEach(label => {
      expect(label).not.toHaveClass('text-gray-500');
    });
  });
});
