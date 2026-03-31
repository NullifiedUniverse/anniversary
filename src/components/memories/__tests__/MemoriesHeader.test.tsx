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

  it('renders "First Year" text', () => {
    render(<MemoriesHeader participants={['NullifiedGalaxy', 'vanessa']} vibe="Our first year together" />);
    
    // It appears multiple times now (h1 and vibe)
    expect(screen.getAllByText(/First Year/i).length).toBeGreaterThan(0);
  });

  it('renders a heart icon', () => {
    render(<MemoriesHeader participants={['NullifiedGalaxy', 'vanessa']} vibe="Our first year together" />);
    
    const heartContainer = screen.getByRole('img', { name: /heart icon/i });
    expect(heartContainer).toBeInTheDocument();
  });

  it('handles unknown participant names', () => {
    // @ts-ignore - testing runtime behavior for missing name
    render(<MemoriesHeader participants={[null]} vibe="Our journey" />);
    expect(screen.getByText(/Unknown/)).toBeInTheDocument();
  });
});
