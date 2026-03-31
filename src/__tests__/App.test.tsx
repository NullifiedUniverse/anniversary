import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';

// Mock child components
vi.mock('../components/FileUpload', () => ({ FileUpload: ({ onFilesSelected }: any) => <button onClick={() => onFilesSelected([])}>Upload</button> }));
vi.mock('../components/Memories', () => ({ Memories: ({ data }: any) => <div>Memories Rendered</div> }));
vi.mock('../components/LoadingState', () => ({ LoadingState: ({ status, steps }: any) => <div>{status} {steps?.length}</div> }));

// Mock lib/parser
vi.mock('../lib/parser', () => ({
  parseFiles: vi.fn(),
}));

// Mock lib/gemini
vi.mock('../lib/gemini', () => ({
  generateMemories: vi.fn().mockResolvedValue({ summary: 'test' }),
}));

import { parseFiles } from '../lib/parser';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/pre-parsed-data.json') return Promise.resolve({ ok: false });
      return Promise.resolve({ ok: false });
    });
    
    const localStorageMock = (function() {
      let store: any = {};
      return {
        getItem: function(key: string) { return store[key] || null; },
        setItem: function(key: string, value: string) { store[key] = value.toString(); },
        clear: function() { store = {}; },
        removeItem: function(key: string) { delete store[key]; }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
    window.localStorage.clear();
  });

  it('renders setup screen initially', () => {
    render(<App />);
    expect(screen.getByText(/Unlock the Memory Vault/i)).toBeInTheDocument();
  });

  it('transitions to idle after entering key', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Enter Key/i);
    const submitBtn = screen.getByText(/Begin Analysis/i);

    fireEvent.change(input, { target: { value: 'test-key' } });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(await screen.findByText(/breathless moment/i)).toBeInTheDocument();
  });

  it('handles errors during file processing', async () => {
    vi.mocked(parseFiles).mockRejectedValue(new Error('Invalid files'));

    render(<App />);
    // setup
    fireEvent.change(screen.getByPlaceholderText(/Enter Key/i), { target: { value: 'test-key' } });
    fireEvent.click(screen.getByText(/Begin Analysis/i));

    const uploadBtn = await screen.findByText(/Upload/i);
    
    await act(async () => {
      fireEvent.click(uploadBtn);
    });

    const errorMsg = await screen.findByText(/Invalid files/i);
    expect(errorMsg).toBeInTheDocument();
  });
});
