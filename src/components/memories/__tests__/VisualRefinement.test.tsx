import { render, screen } from '@testing-library/react';
import { MemoriesHeader } from '../MemoriesHeader';
import { describe, it, expect } from 'vitest';

describe('VisualRefinement', () => {
  it('MemoriesHeader uses correct contrast for the "&" symbol', () => {
    render(<MemoriesHeader participants={['NullifiedGalaxy', 'vanessa']} vibe="Our journey" />);
    const ampersand = screen.getByText('&');
    // We want to ensure it's not text-gray-800 which is too dark for dark mode
    expect(ampersand).not.toHaveClass('text-gray-800');
    expect(ampersand).toHaveClass('text-gray-400'); // Proposed improvement
  });

  it('MemoriesHeader uses correct contrast for the vibe text', () => {
    render(<MemoriesHeader participants={['NullifiedGalaxy', 'vanessa']} vibe="Our journey" />);
    const vibeText = screen.getByText(/"Our journey"/i);
    // text-gray-500 might be too dark, text-gray-300 is the chosen cinematic color
    expect(vibeText).not.toHaveClass('text-gray-500');
    expect(vibeText).toHaveClass('text-gray-300');
  });
});
