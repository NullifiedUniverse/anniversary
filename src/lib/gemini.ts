import { ChatMessage } from "./parser";

const logger = {
  info: (msg: string, data?: any) => {
    console.log(`[AI Pipeline] ℹ️ ${msg}`, data || '');
  },
  error: (msg: string, err?: any) => {
    console.error(`[AI Pipeline] ❌ ${msg}`, err || '');
  },
  success: (msg: string) => {
    console.log(`[AI Pipeline] ✅ ${msg}`);
  }
};

export interface MemoryData {
  participants: string[];
  summary: string;
  firstMessage: {
    date: string;
    sender: string;
    text: string;
  };
  stats: {
    totalMessages: number;
    mostActivePerson: string;
    topEmojis: string[];
  };
  extendedStats: {
    messagesByHour: Record<number, number>;
    topWords: { word: string; count: number }[];
    avgResponseTime: Record<string, number>;
  };
  highlights: { title: string; description: string }[];
  memorableQuotes: { sender: string; text: string; context: string }[];
  insideJokes: { joke: string; origin: string }[];
  milestones: { title: string; description: string; date: string }[];
  futureAdventures: { title: string; description: string }[];
  superlatives: { title: string; winner: string; reason: string }[];
  communicationInsights: { title: string; description: string }[];
  vibe: string;
}

const PROXY_URL = '/api/analyze';

function cleanJson(text: string): string {
  let clean = text.trim();
  if (clean.includes('```')) {
    const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) clean = match[1];
  }
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    clean = clean.substring(start, end + 1);
  }
  if (clean.startsWith('[') && clean.endsWith(']')) return clean;
  const listStart = clean.indexOf('[');
  const listEnd = clean.lastIndexOf(']');
  if (listStart !== -1 && listEnd !== -1 && (start === -1 || listStart < start)) {
    return clean.substring(listStart, listEnd + 1);
  }
  return clean;
}

// INTELLIGENT SAMPLER: Picks random windows from the entire history
function sampleMessages(messages: ChatMessage[], totalTarget: number = 800, windowSize: number = 100): ChatMessage[] {
  if (messages.length <= totalTarget) return messages;

  const result: ChatMessage[] = [];
  const numWindows = Math.floor(totalTarget / windowSize);
  
  // Always include the very beginning
  result.push(...messages.slice(0, windowSize));

  // Pick random windows from the middle
  for (let i = 0; i < numWindows - 2; i++) {
    const start = Math.floor(Math.random() * (messages.length - windowSize * 2)) + windowSize;
    result.push(...messages.slice(start, start + windowSize));
  }

  // Always include the very end
  result.push(...messages.slice(-windowSize));

  // Sort by timestamp to maintain relative flow
  return result.sort((a, b) => a.timestamp - b.timestamp);
}

const DEFAULT_MEMORY_DATA: Partial<MemoryData> = {
  summary: "Our journey together, captured in words and shared moments.",
  vibe: "Beautifully Connected",
  highlights: [],
  memorableQuotes: [],
  insideJokes: [],
  milestones: [],
  futureAdventures: [],
  superlatives: [],
  communicationInsights: []
};

export async function generateMemories(
  messages: ChatMessage[], 
  apiKey: string, 
  modelName: string = 'gemini-2.0-flash',
  ollamaEndpoint?: string
): Promise<MemoryData> {
  if (messages.length === 0) throw new Error("No messages to analyze");

  logger.info(`Starting deep analysis: ${messages.length} messages using ${modelName}`);

  const participants = Array.from(new Set(messages.map(m => m.sender)));
  
  const sampledMessages = sampleMessages(messages, 1000, 150);
  const sampledTranscript = sampledMessages
    .filter(Boolean)
    .map(m => `[${new Date(m.timestamp).toLocaleDateString()}] ${m.sender}: ${m.content}`)
    .join('\n');

  const formatName = (p: string) => {
    const lp = p.toLowerCase();
    if (lp.includes('nullifiedgalaxy')) return 'Null';
    if (lp.includes('vanessa')) return 'Yun';
    return p;
  };

  const p1 = formatName(participants[0]);
  const p2 = formatName(participants[1] || '');

  const prompt = `CONTEXT: You are a professional romantic storyteller creating an emotional 1st anniversary scrapbook for ${p1} and ${p2}.
  
  TASK: Analyze the provided transcript. The transcript contains random windows of their history.
  Extract a deep narrative and specific shared memories.
  
  OUTPUT INSTRUCTIONS:
  - Respond with a SINGLE JSON OBJECT only.
  - "summary": A long, poetic 3-paragraph summary of their year (approx 200 words).
  - "vibe": A catchy 3-word aesthetic description.
  - "highlights": 5 key shared moments.
  - "memorableQuotes": 5 verbatim quotes with context.
  - "insideJokes": 5 jokes they share.
  - "milestones": 5 key dates or phases.
  - "futureAdventures": 5 future plans.
  - "superlatives": 5 awards.
  - "communicationInsights": 5 observations.
  - "topEmojis": The top 5 emojis.

  Structure:
  {
    "summary": "...",
    "vibe": "...",
    "highlights": [{"title": "...", "description": "..."}],
    "memorableQuotes": [{"sender": "${participants[0]} or ${participants[1]}", "text": "...", "context": "..."}],
    "insideJokes": [{"joke": "...", "origin": "..."}],
    "milestones": [{"title": "...", "description": "...", "date": "..."}],
    "futureAdventures": [{"title": "...", "description": "..."}],
    "superlatives": [{"title": "...", "winner": "...", "reason": "..."}],
    "communicationInsights": [{"title": "...", "description": "..."}],
    "topEmojis": ["❤️", "...", "..."]
  }

  Transcript:\n${sampledTranscript}`;

  try {
    let aiData: any;

    if (modelName.startsWith('ollama:')) {
      const actualModel = modelName.slice(7);
      const endpoint = (ollamaEndpoint || 'http://localhost:11434').replace(/\/$/, '');
      logger.info(`Calling Ollama directly at ${endpoint}...`);
      
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: actualModel,
          prompt: prompt + "\n\nRETURN ONLY RAW JSON. NO MARKDOWN.",
          stream: false,
          format: 'json'
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ollama Direct Error: ${errText}`);
      }

      const raw = await response.json();
      aiData = JSON.parse(cleanJson(raw.response));
    } else {
      logger.info("Awaiting response from Integrated AI Proxy...");
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelName, apiKey: apiKey.trim() })
      });

      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 422) {
          throw new Error("This part of your story is too soulful for the current AI settings. Please try another model!");
        }
        throw new Error(errData.error || "Integrated Proxy Error");
      }

      aiData = await response.json();
    }

    logger.success("AI Generation Complete.");

    const senderCounts: Record<string, number> = {};
    messages.forEach(m => { senderCounts[m.sender] = (senderCounts[m.sender] || 0) + 1; });
    const mostActivePerson = Object.entries(senderCounts).sort((a, b) => b[1] - a[1])[0][0];

    const messagesByHour: Record<number, number> = {};
    messages.forEach(m => {
      const hour = new Date(m.timestamp).getHours();
      messagesByHour[hour] = (messagesByHour[hour] || 0) + 1;
    });

    const wordCounts: Record<string, number> = {};
    messages.slice(-2000).forEach(m => {
      m.content.split(/\s+/).forEach(word => {
        const w = word.toLowerCase().replace(/[^\w]/g, '');
        if (w.length > 3) wordCounts[w] = (wordCounts[w] || 0) + 1;
      });
    });
    const topWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 50).map(([word, count]) => ({ word, count }));

    return {
      ...DEFAULT_MEMORY_DATA,
      ...aiData,
      participants,
      firstMessage: {
        date: new Date(messages[0].timestamp).toISOString(),
        sender: messages[0].sender,
        text: messages[0].content
      },
      stats: {
        totalMessages: messages.length,
        mostActivePerson,
        topEmojis: aiData.topEmojis || ["❤️", "✨", "😊", "😂", "🥰"]
      },
      extendedStats: {
        messagesByHour,
        topWords,
        avgResponseTime: {}
      }
    };
  } catch (e) {
    logger.error("Analysis Pipeline Failure", e);
    throw e;
  }
}

export async function generateMoreItems(
  messages: ChatMessage[],
  category: string,
  existingItems: any[],
  apiKey: string,
  modelName: string = 'gemini-2.0-flash',
  ollamaEndpoint?: string
) {
  if (messages.length === 0) return [];

  try {
    // Pick a completely different random window for every infinite scroll call
    const sampledMessages = sampleMessages(messages, 600, 200);
    const sampledTranscript = sampledMessages.map(m => `[${m.sender}]: ${m.content}`).join('\n');
    
    let itemSchema = "";
    if (category === 'memorableQuotes') itemSchema = `{"sender": "...", "text": "...", "context": "..."}`;
    else if (category === 'highlights') itemSchema = `{"title": "...", "description": "..."}`;
    else if (category === 'insideJokes') itemSchema = `{"joke": "...", "origin": "..."}`;
    else if (category === 'milestones') itemSchema = `{"title": "...", "description": "...", "date": "..."}`;
    else if (category === 'futureAdventures') itemSchema = `{"title": "...", "description": "..."}`;
    else if (category === 'superlatives') itemSchema = `{"title": "...", "winner": "...", "reason": "..."}`;
    else if (category === 'communicationInsights') itemSchema = `{"title": "...", "description": "..."}`;

    const prompt = `TASK: Find 5 NEW unique shared ${category} from this random history segment. 
    
    EXISTING (DO NOT REPEAT): ${JSON.stringify(existingItems.map(i => i.title || i.text || i.joke).slice(-10))}
    
    OUTPUT: A JSON list of 5 objects matching this schema: ${itemSchema}
    
    Transcript:\n${sampledTranscript}`;
    
    let result: any;

    if (modelName.startsWith('ollama:')) {
      const actualModel = modelName.slice(7);
      const endpoint = (ollamaEndpoint || 'http://localhost:11434').replace(/\/$/, '');
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: actualModel,
          prompt: prompt + "\n\nRETURN ONLY RAW JSON LIST. NO MARKDOWN.",
          stream: false,
          format: 'json'
        })
      });
      if (!response.ok) return [];
      const raw = await response.json();
      result = JSON.parse(cleanJson(raw.response));
    } else {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelName, apiKey: apiKey.trim() })
      });

      if (!response.ok) return [];
      result = await response.json();
    }

    return Array.isArray(result) ? result : [];
  } catch (e) {
    logger.error(`Failed to generate more ${category}`, e);
    return [];
  }
}
