import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock child components
vi.mock('../components/FileUpload', () => ({ FileUpload: ({ onFilesSelected }: any) => <button onClick={() => onFilesSelected([])}>Upload</button> }));
vi.mock('../components/Memories', () => ({ Memories: ({ data }: any) => <div>Memories Rendered</div> }));
vi.mock('../components/LoadingState', () => ({ LoadingState: ({ status }: any) => <div>{status}</div> }));

// Mock lib/parser
vi.mock('../lib/parser', () => ({
  parseFiles: vi.fn(),
}));

// Mock lib/gemini
vi.mock('../lib/gemini', () => ({
  generateMemories: vi.fn(),
}));

import { parseFiles } from '../lib/parser';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders idle state initially', () => {
    render(<App />);
    expect(screen.getByText(/Relive your/i)).toBeInTheDocument();
  });

  it('shows advanced settings when clicked', () => {
    render(<App />);
    const advancedBtn = screen.getByText(/Advanced Settings/i);
    fireEvent.click(advancedBtn);
    expect(screen.getByText(/Gemini API Key/i)).toBeInTheDocument();
  });

  it('handles errors during file processing', async () => {
    vi.mocked(parseFiles).mockRejectedValue(new Error('Invalid files'));

    render(<App />);
    const uploadBtn = screen.getByText(/Upload/i);
    fireEvent.click(uploadBtn);

    expect(await screen.findByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Invalid files/i)).toBeInTheDocument();
  });
});
