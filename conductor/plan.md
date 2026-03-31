# Implementation Plan: Anniversary UI Polish & API Robustness

## Objective
Fix visual bugs (tab bar scaling, missing elements), Recharts dimension warnings, and implement robust API handling to prevent 429 errors and resolve initialization bugs.

## Key Files & Context
- `src/components/Memories.tsx`: Navigation bar and section layout.
- `src/components/memories/StatsSection.tsx`: Recharts visualizations.
- `src/components/memories/useInfiniteMemories.ts`: AI request orchestration.
- `src/lib/gemini.ts`: AI analysis pipeline and proxy calls.
- `vite.config.ts`: Integrated Gemini proxy.

## Implementation Steps

### Phase 1: API Robustness & Rate Limiting
- [ ] **Task: Implement Sequential AI Request Queue**
    - [ ] Update `src/components/memories/useInfiniteMemories.ts` to use a singleton-style lock or queue for `generateMore` calls.
    - [ ] Ensure only one "generate more" request is active at any time.
    - [ ] Add a 1.5s delay between sequential requests to stay within rate limits.
- [ ] **Task: Improve Proxy Error Handling**
    - [ ] Update `vite.config.ts` to better parse and return specific error messages from the Google API (e.g., distinguishing between 429 and 400).
- [ ] **Task: Rigorous Key Sanitization**
    - [ ] Ensure `customApiKey` is `.trim()`ed in `App.tsx` and `gemini.ts` before every use.

### Phase 2: Visual Polish & Scaling
- [ ] **Task: Fix Tab Bar Scaling**
    - [ ] Update `src/components/Memories.tsx` to use `max-w-[calc(100vw-2rem)]` for the floating nav.
    - [ ] Improve mobile horizontal scrolling styling for the tabs.
- [ ] **Task: Fix Recharts Dimension Warnings**
    - [ ] In `StatsSection.tsx`, wrap `ResponsiveContainer` in a div with a stable, non-zero height that exists even before animation completes.
    - [ ] Add `debounce={50}` to `ResponsiveContainer` to help with resizing during animations.
- [ ] **Task: Audit Visibility in Dark Mode**
    - [ ] Scan components for hardcoded light-mode colors (e.g., `text-gray-900`, `bg-white`) and replace with themed or dark-mode alternatives.

### Phase 3: Verification
- [ ] **Task: Verify Fixes**
    - [ ] Confirm no 429 errors occur when scrolling through all sections.
    - [ ] Confirm tab bar looks good on both mobile and desktop.
    - [ ] Confirm Recharts warnings are gone from the console.
    - [ ] Confirm all text is legible in the new romantic dark mode.

## Verification & Testing
- Manual verification of scrolling behavior with large datasets.
- Inspection of browser console for Recharts and API errors.
- Responsive design testing via browser dev tools.
