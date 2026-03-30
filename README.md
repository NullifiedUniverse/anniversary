<div align="center">
<img width="1200" height="475" alt="InstaMemories Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 💖 InstaMemories: Anniversary Edition
**Transform your Instagram chat history into a beautiful, AI-powered anniversary story.**

[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.0_Flash-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
</div>

---

## ✨ Overview
InstaMemories is a premium web application designed to celebrate a couple's first year together. By analyzing Instagram chat exports, it uses the **Gemini 2.0 Flash** model to generate a romantic, data-driven narrative of your journey, complete with statistical insights, memorable highlights, and hidden gems.

## 🚀 Features
- **📖 AI-Powered Storytelling**: A 3-4 sentence deeply romantic narrative of your relationship journey.
- **📊 By The Numbers**: Statistical breakdown of total messages, most active participant, and top emojis.
- **⏰ Time of Day Analysis**: Interactive Recharts-based visualization of your chatting habits.
- **💬 Memorable Quotes**: Beautifully rendered, stagger-animated cards featuring your most significant messages.
- **☁️ Dynamic Word Cloud**: A responsive bubble chart of the words that define your conversations.
- **🏆 Relationship Superlatives**: Fun AI-generated awards like "Best Late Night Talker."
- **🔍 Explore & Search**: High-performance search through your entire chat history with full context.
- **🪄 Infinite Memories**: "Load More" capability to continuously discover new highlights, jokes, and insights.

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4 (Modern Design System)
- **Animations**: Framer Motion (motion/react)
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI Engine**: Google Gemini 2.0 Flash SDK
- **Parsing**: Custom robust HTML/JSON parsers for Instagram exports

## 📖 How to Use
1. **Export your Data**: Instagram Settings → Your Activity → Download Your Information (Choose JSON or HTML format).
2. **Install Dependencies**: `npm install`
3. **Set API Key**: Add `VITE_GEMINI_API_KEY` to your `.env` or use the Advanced Settings in the UI.
4. **Run Local**: `npm run dev`
5. **Upload**: Drag and drop your `.json` or `.html` chat files.

## 🔒 Privacy & Security
- **Local Processing**: Your chat files are parsed entirely in your browser.
- **Secure AI Analysis**: Only sampled, cleaned text snippets are sent to Gemini AI for analysis.
- **Zero Storage**: We do not store your data, API keys, or chat history on any server.

---
<div align="center">
Created with 💖 for NullifiedUniverse & Yun
</div>
