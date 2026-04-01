# 🏗️ InstaMemories Architecture

This document provides a deep dive into the technical architecture of InstaMemories, explaining how we transform raw chat data into a cinematic digital scrapbook using AI.

---

## 🚀 High-Level System Flow

The following diagram illustrates the journey of your data, from the moment you upload it to the final AI-generated narrative. Everything (except the AI inference itself) happens **locally in your browser**.

```mermaid
flowchart TD
    %% Nodes
    User([👤 User])
    FileUpload[📂 FileUpload.tsx]
    Parser[⚙️ parser.ts]
    App[🧠 App.tsx]
    AIProxy[🌐 AI Proxy]
    Gemini[✨ Gemini / Ollama]
    Memories[🎨 Memories UI]

    %% Connections
    User -- "Uploads JSON/HTML" --> FileUpload
    FileUpload -- "Raw Files" --> Parser
    Parser -- "Deduplicated Seeds" --> App
    App -- "Contextual Prompt" --> AIProxy
    AIProxy -- "Filtered Request" --> Gemini
    Gemini -- "Narrative JSON" --> AIProxy
    AIProxy -- "Sanitized Story" --> App
    App -- "Memory Object" --> Memories
    Memories -- "Scroll-driven Story" --> User

    %% Styling
    style User fill:#f9f,stroke:#333,stroke-width:2px
    style Gemini fill:#4285F4,stroke:#fff,stroke-width:2px,color:#fff
    style AIProxy fill:#1e1b4b,stroke:#indigo-500,stroke-width:2px,color:#fff
```

### 🔗 Key Source Files
*   [**Frontend State:** `src/App.tsx`](./src/App.tsx) — The central brain of the application.
*   [**Data Parsing:** `src/lib/parser.ts`](./src/lib/parser.ts) — Handles logic for Instagram JSON/HTML.
*   [**AI Integration:** `src/lib/gemini.ts`](./src/lib/gemini.ts) — Formats prompts for various models.
*   [**UI Components:** `src/components/`](./src/components/) — Reusable UI elements and sections.

---

## 🧩 Component Architecture

InstaMemories is built with a modular, atomic design pattern. Each section of the final scrapbook is an independent, highly-optimized React component.

```mermaid
graph TD
    subgraph "Core Layout"
        App[App.tsx]
    end

    subgraph "Setup & Loading"
        App --> FileUpload[FileUpload.tsx]
        App --> LoadingState[LoadingState.tsx]
    end

    subgraph "The Scrapbook (Memories.tsx)"
        App --> Memories[Memories.tsx]
        
        Memories --> Header[MemoriesHeader.tsx]
        Memories --> Story[StorySection.tsx]
        Memories --> Stats[StatsSection.tsx]
        Memories --> Quotes[QuotesSection.tsx]
        Memories --> Words[WordCloudSection.tsx]
        Memories --> Future[FutureSection.tsx]
    end

    subgraph "Visual Effects"
        Header & Story & Stats --> Particles[SectionParticles.tsx]
    end

    %% Links (Note: GitHub restricts these, but they work in Mermaid Live Editor)
    click App "./src/App.tsx" "Open App.tsx"
    click Memories "./src/components/Memories.tsx" "Open Memories.tsx"
```

---

## 🛠️ Data Processing Pipeline

We take privacy seriously. Our multi-stage pipeline ensures that only the most relevant, "cleaned" data is used for AI analysis.

<details>
<summary><b>View Detailed Processing Pipeline</b></summary>

```mermaid
stateDiagram-v2
    [*] --> RawData: User Upload
    
    state "Local Processing (Client-Side)" as Local {
        RawData --> JSONParsing: .json files
        RawData --> HTMLParsing: .html files
        
        JSONParsing --> Deduplication
        HTMLParsing --> Deduplication
        
        Deduplication --> SeedExtraction: Time-based sorting
        
        state SeedExtraction {
            [*] --> FilterKeywords: Love, Future, Joke
            FilterKeywords --> SampleSelection: Random sampling
            SampleSelection --> ContextPrep: Format for AI
        }
    }
    
    ContextPrep --> AIInference: Secure API Call
    AIInference --> JSONValidation: Check AI structure
    JSONValidation --> FinalRender: Interactive UI
    FinalRender --> [*]
```
</details>

---

## 🛡️ Privacy & Security (AI Proxy)

To protect your API keys and maintain a safe environment for your personal memories, we use an **Integrated AI Proxy** built into the Vite dev server (`vite.config.ts`).

1.  **Direct Communication:** The browser sends a request to a local `/api/analyze` endpoint.
2.  **Safety Filtering:** The proxy applies strict safety settings to prevent Gemini from blocking your romantic memories (e.g., "Love" is not a violation!).
3.  **No Persistence:** No data is stored on any server. The proxy is a simple pass-through to the Google/Ollama endpoints.

---

<div align="center">
[View this architecture in the Mermaid Live Editor](https://mermaid.live/)
</div>
