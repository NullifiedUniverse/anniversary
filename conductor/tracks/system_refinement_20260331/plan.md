# Implementation Plan: System Refinement: UI Polish, Pipeline Robustness, and Quality Engineering

## Phase 1: UI Diagnostics & Aesthetic Polish
- [x] Task: Audit UI for Text Visibility and Contrast
    - [ ] Inspect all sections (`Story`, `Stats`, `Quotes`, etc.) for text rendering issues.
    - [ ] Verify visibility in dark mode across different screen sizes.
- [~] Task: Fix Display Bugs and Layout Cut-offs
    - [ ] Write Tests: Contrast and visibility checks for small text and ampersands.
    - [ ] Implement: Update `text-gray-600` and `opacity-50` usage in `QuotesSection` and `StatsSection`.
    - [ ] Implement: Refine tab bar `max-width` and centering for large screens.
    - [ ] Implement: Add `min-h` and aspect ratio stability to Recharts containers.
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
