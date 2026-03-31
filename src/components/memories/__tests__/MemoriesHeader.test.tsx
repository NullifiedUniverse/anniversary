import { render, screen } from '@testing-library/react';
import { MemoriesHeader } from '../MemoriesHeader';
import { describe, it, expect } from 'vitest';

describe('MemoriesHeader', () => {
  it('renders participant names Null and Yun', () => {
    render(<MemoriesHeader participants={['NullifiedGalaxy', 'vanessa']} vibe="Our first year together" />);
    
    // According to the new requirements, we want it to specifically recognize Null and Yun
    expect(screen.getByText(/Null/)).toBeInTheDocument();
    expect(screen.getByText(/Yun/)).toBeInTheDocument();
  });

  it('renders "1st Anniversary" text', () => {
    render(<MemoriesHeader participants={['NullifiedGalaxy', 'vanessa']} vibe="Our first year together" />);
    
    expect(screen.getByText(/1st Anniversary/i)).toBeInTheDocument();
  });

  it('renders a heart icon', () => {
    render(<MemoriesHeader participants={['NullifiedGalaxy', 'vanessa']} vibe="Our first year together" />);
    
    // Heart icon is from lucide-react, we can check for its presence via aria-label if we add it,
    // or just check if it's rendered by its SVG properties if possible, or just a heart-related class.
    // Let's assume we'll add a more specific test or just check if the heart container exists.
    const heartContainer = screen.getByRole('img', { name: /heart icon/i });
    expect(heartContainer).toBeInTheDocument();
  });

  it('handles unknown participant names', () => {
    // @ts-ignore - testing runtime behavior for missing name
    render(<MemoriesHeader participants={[null]} vibe="Our journey" />);
    expect(screen.getByText(/Unknown/)).toBeInTheDocument();
  });
});
