# Implementation Plan: System Refinement: UI Polish, Pipeline Robustness, and Quality Engineering

## Phase 1: UI Diagnostics & Aesthetic Polish
- [x] Task: Audit UI for Text Visibility and Contrast
    - [ ] Inspect all sections (`Story`, `Stats`, `Quotes`, etc.) for text rendering issues.
    - [ ] Verify visibility in dark mode across different screen sizes.
- [x] Task: Fix Display Bugs and Layout Cut-offs (dd8660a)
    - [x] Write Tests: Contrast and visibility checks for small text and ampersands.
    - [x] Implement: Update `text-gray-600` and `opacity-50` usage in `QuotesSection` and `StatsSection`.
    - [x] Implement: Refine tab bar `max-width` and centering for large screens.
    - [x] Implement: Add `min-h` and aspect ratio stability to Recharts containers.
- [x] Task: Implement Initial Model Switcher UI (154c848)
    - [x] Implement: Basic model selection in `App.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

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
