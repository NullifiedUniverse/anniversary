import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryData } from '../lib/gemini';

// Mock child components to simplify testing
vi.mock('../memories/MemoriesHeader', () => ({ MemoriesHeader: () => <div data-testid="memories-header" /> }));
vi.mock('../memories/StorySection', () => ({ StorySection: () => <div data-testid="story-section" /> }));
vi.mock('../memories/StatsSection', () => ({ StatsSection: () => <div data-testid="stats-section" /> }));
vi.mock('../memories/WordCloudSection', () => ({ WordCloudSection: () => <div data-testid="word-cloud-section" /> }));
vi.mock('../memories/HighlightsSection', () => ({ HighlightsSection: () => <div data-testid="highlights-section" /> }));
vi.mock('../memories/QuotesSection', () => ({ QuotesSection: () => <div data-testid="quotes-section" /> }));
vi.mock('../memories/FutureSection', () => ({ FutureSection: () => <div data-testid="future-section" /> }));
vi.mock('../memories/ExploreSection', () => ({ ExploreSection: () => <div data-testid="explore-section" /> }));

import { Memories } from '../Memories';

const mockData: MemoryData = {
  participants: ['Null', 'Yun'],
  summary: 'Summary',
  firstMessage: { date: '2025-03-31', sender: 'Null', text: 'Hi' },
  stats: { totalMessages: 100, mostActivePerson: 'Null', topEmojis: [] },
  extendedStats: { messagesByHour: {}, topWords: [], avgResponseTime: {} },
  highlights: [],
  memorableQuotes: [],
  insideJokes: [],
  milestones: [],
  futureAdventures: [],
  superlatives: [],
  communicationInsights: [],
  vibe: 'Romantic',
};

describe('Memories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.scrollTo
    window.scrollTo = vi.fn();
  });

  it('renders with personalized romantic navigation labels', () => {
    render(<Memories data={mockData} messages={[]} />);
    
    expect(screen.getByText(/Our Story/i)).toBeInTheDocument();
    expect(screen.getByText(/Our Rhythm/i)).toBeInTheDocument();
    expect(screen.getByText(/Our Language/i)).toBeInTheDocument();
    expect(screen.getByText(/Our Moments/i)).toBeInTheDocument();
    expect(screen.getByText(/Our Future/i)).toBeInTheDocument();
  });

  it('scrolls to section on nav click', () => {
    render(<Memories data={mockData} messages={[]} />);
    
    const navButton = screen.getByText(/Our Rhythm/i);
    fireEvent.click(navButton);
    
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it('renders all sections', () => {
    render(<Memories data={mockData} messages={[]} />);
    expect(screen.getByTestId('story-section')).toBeInTheDocument();
    expect(screen.getByTestId('stats-section')).toBeInTheDocument();
    expect(screen.getByTestId('word-cloud-section')).toBeInTheDocument();
    expect(screen.getByTestId('highlights-section')).toBeInTheDocument();
    expect(screen.getByTestId('future-section')).toBeInTheDocument();
    expect(screen.getByTestId('explore-section')).toBeInTheDocument();
  });

  it('handles scroll events', () => {
    render(<Memories data={mockData} messages={[]} />);
    fireEvent.scroll(window);
  });

  it('renders celebratory footer', () => {
    render(<Memories data={mockData} messages={[]} />);
    expect(screen.getByText(/Happy Anniversary!/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Big heart icon/i)).toBeInTheDocument();
  });
});
