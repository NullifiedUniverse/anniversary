# Tech Stack - InstaMemories

## 🎨 Frontend
- **Framework:** [React 19](https://react.dev/) with [Vite 6](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict typing)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion (motion)](https://www.framer.com/motion/)
- **Visualizations:** [Recharts](https://recharts.org/)

## 🧠 AI & Logic
- **Model:** [Google Gemini API](https://deepmind.google/technologies/gemini/) (using `@google/genai`)
- **Parsing:** Custom client-side HTML/JSON parsers for Instagram chat data.
- **State Management:** React 19 concurrent features and local state.

## 🏗️ Architecture
- **Client-Side Processing (Zero-Knowledge):** All data parsing and analysis are handled locally in the browser to ensure maximum privacy.
- **Secure AI Sampling:** Minimal snippets of chat data are sent to the Gemini API for narrative generation, with no persistence or long-term storage of sensitive data.
- **Performance:** Optimized for large chat datasets using efficient parsing and lazy loading of components.

## 🛠️ Developer Tools
- **Build System:** Vite 6
- **Version Control:** Git
- **Style Guides:** (To be selected in the next step)
