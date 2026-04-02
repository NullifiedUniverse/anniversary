# Plan: Interactive Architecture Graphs

This plan outlines the creation of interactive architecture documentation for InstaMemories using Mermaid.js and rich Markdown.

## Objective
Provide a clear, visual, and navigatable overview of the project's architecture directly on GitHub.

## Proposed Diagrams (Mermaid.js)

1.  **High-Level System Flow (Flowchart):**
    -   Visualizes the journey from data upload to AI-generated narrative.
    -   Key nodes: User, FileUpload (React), Parser (Lib), AI Proxy (Vite/Server), Gemini/Ollama (External), Memories (UI).
    -   *Interactivity:* Links from nodes to corresponding source files.

2.  **Component Architecture (Class/Block Diagram):**
    -   Shows the relationship between React components.
    -   `App.tsx` -> `FileUpload`, `LoadingState`, `Memories`.
    -   `Memories` -> `StatsSection`, `StorySection`, `QuotesSection`, etc.

3.  **Data Processing Pipeline (State/Sequence Diagram):**
    -   Details the stages: Raw Files -> JSON/HTML Parsing -> Deduplication -> Seed Extraction -> AI Context Prep -> Final Narrative.

## Implementation Steps

### 1. Create `ARCHITECTURE.md`
-   This file will host the detailed diagrams.
-   Each diagram will be accompanied by a legend and standard Markdown links to key files (since Mermaid links are restricted on GitHub).
-   Include "Rich Display" elements like:
    -   Collapsible sections for detailed sub-system explanations.
    -   Emoji-coded legends.
    -   Direct links to the Mermaid Live Editor for full interactivity.

### 2. Update `README.md`
-   Add a "🏗️ Architecture" section.
-   Include a simplified version of the High-Level System Flow.
-   Provide a prominent link to `ARCHITECTURE.md` for the "Deep Dive".

## Verification & Testing
-   Render the Markdown locally (e.g., using VS Code's preview) to ensure Mermaid syntax is correct.
-   Verify all links (relative paths) point to the correct source files.
-   Check GitHub's web interface after pushing to ensure the diagrams render as expected.

## Rollback Plan
-   The changes are purely documentation-based and can be reverted by deleting `ARCHITECTURE.md` and rolling back `README.md`.
