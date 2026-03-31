import { render, screen, fireEvent } from '@testing-library/react';
import { StatsSection } from '../StatsSection';
import { describe, it, expect, vi } from 'vitest';
import { MemoryData } from '../../../lib/gemini';

// Mock Recharts because it uses ResizeObserver and other DOM APIs that jsdom might not fully support
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
  stats: {
    totalMessages: 1000,
    mostActivePerson: 'nullifiedgalaxy',
    topEmojis: ['❤️', '✨'],
  },
  extendedStats: {
    messagesByHour: { 0: 10, 12: 50 },
    topWords: [{ word: 'love', count: 100 }],
    avgResponseTime: { 'nullifiedgalaxy': 5, 'vanessa': 2 },
  },
  highlights: [],
  memorableQuotes: [],
  insideJokes: [],
  milestones: [],
  futureAdventures: [],
  superlatives: [],
  communicationInsights: [],
  vibe: 'Romantic',
};

describe('StatsSection', () => {
  it('renders with the title "Our Rhythm"', () => {
    render(<StatsSection data={mockData} />);
    expect(screen.getByText(/Our Rhythm/i)).toBeInTheDocument();
  });

  it('renders personalized names Null and Yun', () => {
    render(<StatsSection data={mockData} />);
    expect(screen.getAllByText(/Null/)).toHaveLength(2); // One in "Always There", one in "Waiting for You"
    expect(screen.getByText(/Yun/)).toBeInTheDocument();
  });

  it('renders romantic stats descriptions', () => {
    render(<StatsSection data={mockData} />);
    expect(screen.getByText(/The heartbeat of our connection/i)).toBeInTheDocument();
  });

  it('handles unknown participant names', () => {
    const dataWithUnknown = { ...mockData, participants: [null as any] };
    render(<StatsSection data={dataWithUnknown} />);
    expect(screen.getByText(/Unknown/)).toBeInTheDocument();
  });

  it('shows tooltip on hover', () => {
    render(<StatsSection data={mockData} />);
    // Find the wrapper div for StatCard - it has the p-10 class
    const cardTitle = screen.getByText(/Shared Words/i);
    const card = cardTitle.parentElement;
    if (!card) throw new Error('Card not found');
    
    fireEvent.mouseEnter(card);
    expect(screen.getByText(/Every single message is a piece of our story together/i)).toBeInTheDocument();
  });
});
