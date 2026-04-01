# Implementation Plan: System Refinement: UI Polish, Pipeline Robustness, and Quality Engineering

## Phase 1: UI Diagnostics & Aesthetic Polish [checkpoint: 196da53]
- [x] Task: Audit UI for Text Visibility and Contrast
    - [x] Inspect all sections (`Story`, `Stats`, `Quotes`, etc.) for text rendering issues.
    - [x] Verify visibility in dark mode across different screen sizes.
- [x] Task: Fix Display Bugs and Layout Cut-offs (196da53)
    - [x] Write Tests: Contrast and visibility checks for small text and ampersands.
    - [x] Implement: Update `text-gray-600` and `opacity-50` usage in `QuotesSection` and `StatsSection`.
    - [x] Implement: Refine tab bar `max-width` and centering for large screens.
    - [x] Implement: Add `min-h` and aspect ratio stability to Recharts containers.
    - [x] Implement: Initial Model Switcher UI (196da53)
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md) (196da53)

## Phase 2: Pipeline Hardening
- [ ] Task: Optimize Parsing logic for Large Datasets
    - [ ] Write Tests: Performance and edge-case tests for `parser.ts`.
    - [ ] Implement: Refine parsing strategy to be more memory-efficient and resilient.
- [ ] Task: Enhance AI Error Handling and Reporting
    - [ ] Write Tests: Error state triggers in `gemini.ts`.
    - [ ] Implement: Provide granular feedback to users when AI processing fails.
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Quality Engineering & Refactoring
- [ ] Task: Refactor App State Management
    - [ ] Write Tests: State transition tests for the main application.
    - [ ] Implement: Clean up `App.tsx` logic to reduce complexity and improve testability.
- [ ] Task: Reach 80%+ Code Coverage
    - [ ] Implement: Add missing tests for all utility functions and components.
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Multi-Model Support & Ollama Integration
- [ ] Task: Implement Local Ollama Connector
    - [ ] Write Tests: API wrapper for Ollama REST endpoints.
    - [ ] Implement: `src/lib/ollama.ts` for local model inference.
- [ ] Task: Add Model Switcher UI
    - [ ] Implement: Selection UI in `App.tsx` setup and retry screens.
    - [ ] Implement: Persistence of model choice in state.
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Cinematic Perfection & Massive Data Rigor [checkpoint: 36dfe42]
- [x] Task: Rigorous Pre-processing Expansion (36dfe42)
    - [x] Implement: Expand `scripts/pre-parse.ts` to extract 100+ quotes and 50+ milestones.
    - [x] Implement: Add local "Sentiment Bursts" detection (high density of emotional keywords).
    - [x] Implement: Add "Time-of-Day" narrative seeds (e.g., "The Twilight Hours").
- [x] Task: Premium Visual Storytelling (36dfe42)
    - [x] Implement: Add a glowing "Story Line" connector that traces the scroll path.
    - [x] Implement: Add Parallax depth effects to section backgrounds.
    - [x] Implement: Poetic "Chapter Transitions" with unique typography.
- [x] Task: Model-Specific Prompt Tuning (36dfe42)
    - [x] Implement: Rigid JSON-only formatting for local Ollama models.
    - [x] Implement: "Proactive" infinite loading (buffer next batch before trigger).
- [x] Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md) (36dfe42)
