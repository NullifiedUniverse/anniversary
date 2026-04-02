import { ChatMessage, SeedMemories } from "./parser";

const logger = {
  info: () => {},
  error: (msg: string, err?: any) => {
    console.error(`[AI Pipeline] ❌ ${msg}`, err || '');
  },
  success: () => {}
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

function sampleMessages(messages: ChatMessage[], totalTarget: number = 800, windowSize: number = 100): ChatMessage[] {
  if (messages.length <= totalTarget) return messages;
  const result: ChatMessage[] = [];
  const numWindows = Math.floor(totalTarget / windowSize);
  result.push(...messages.slice(0, windowSize));
  for (let i = 0; i < numWindows - 2; i++) {
    const start = Math.floor(Math.random() * (messages.length - windowSize * 2)) + windowSize;
    result.push(...messages.slice(start, start + windowSize));
  }
  result.push(...messages.slice(-windowSize));
  return result.sort((a, b) => a.timestamp - b.timestamp);
}

const DEFAULT_MEMORY_DATA: Partial<MemoryData> = {
  summary: "Our journey together, captured in words and shared moments. A beautiful first year of growth and love.",
  vibe: "Beautifully Connected",
  highlights: [
    { title: "Digital Connection", description: "Every message sent was a step closer to the beautiful bond we share today." }
  ],
  memorableQuotes: [],
  insideJokes: [],
  milestones: [],
  futureAdventures: [
    { title: "New Horizons", description: "Continuing to write our story, one shared moment at a time." }
  ],
  superlatives: [
    { title: "Soul Mates", winner: "Both", reason: "For building a digital sanctuary of love and understanding." }
  ],
  communicationInsights: [
    { title: "Rhythmic Flow", description: "Our conversations have a unique, beautiful cadence that belongs only to us." }
  ]
};

export async function generateMemories(
  messages: ChatMessage[], 
  apiKey: string, 
  modelName: string = 'gemini-2.0-flash',
  ollamaEndpoint?: string,
  seeds?: SeedMemories | null
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

  const prompt = `CONTEXT: Emotional 1st anniversary scrapbook for ${p1} and ${p2}.
  
  TASK: Analyze the provided transcript segment and INITIAL DISCOVERIES.
  Extract a deep narrative and specific shared memories.
  
  ${seeds ? `INITIAL DISCOVERIES: ${JSON.stringify(seeds)}` : ''}

  OUTPUT: Response with a SINGLE JSON OBJECT. POETIC AND DETAILED.
  
  Structure:
  {
    "summary": "Poetic 3-paragraph summary...",
    "vibe": "3-word description...",
    "highlights": [{"title": "...", "description": "..."}],
    "memorableQuotes": [{"sender": "...", "text": "...", "context": "..."}],
    "insideJokes": [{"joke": "...", "origin": "..."}],
    "milestones": [{"title": "...", "description": "...", "date": "..."}],
    "futureAdventures": [{"title": "...", "description": "..."}],
    "superlatives": [{"title": "...", "winner": "...", "reason": "..."}],
    "communicationInsights": [{"title": "...", "description": "..."}],
    "topEmojis": ["❤️", "..."]
  }

  Transcript:\n${sampledTranscript}`;

  try {
    let aiData: any;
    if (modelName.startsWith('ollama:')) {
      const actualModel = modelName.slice(7);
      const endpoint = (ollamaEndpoint || 'http://localhost:11434').replace(/\/$/, '');
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: actualModel, prompt: prompt + "\n\nRETURN ONLY RAW JSON.", stream: false, format: 'json' })
      });
      if (!response.ok) throw new Error("Ollama Failure");
      const raw = await response.json();
      aiData = JSON.parse(cleanJson(raw.response));
    } else {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelName, apiKey: apiKey.trim() })
      });
      if (!response.ok) throw new Error("Integrated Proxy Error");
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

    const topWords = seeds?.words || [];

    // MERGE AI DATA WITH LOCAL SEEDS TO PREVENT BLANKS
    const finalData = {
      ...DEFAULT_MEMORY_DATA,
      ...aiData,
      memorableQuotes: (aiData.memorableQuotes?.length > 0) ? aiData.memorableQuotes : (seeds?.quotes || []),
      milestones: (aiData.milestones?.length > 0) ? aiData.milestones : (seeds?.milestones || []),
      insideJokes: (aiData.insideJokes?.length > 0) ? aiData.insideJokes : (seeds?.jokes || []),
      futureAdventures: (aiData.futureAdventures?.length > 0) ? aiData.futureAdventures : (seeds?.future || []),
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

    return finalData;
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

    const prompt = `TASK: Find 5 NEW unique shared ${category} from this random segments. 
    EXISTING (DO NOT REPEAT): ${JSON.stringify(existingItems.map(i => i.title || i.text || i.joke).slice(-15))}
    OUTPUT: JSON list of 5 objects matching: ${itemSchema}
    Transcript:\n${sampledTranscript}`;
    
    let result: any;
    if (modelName.startsWith('ollama:')) {
      const actualModel = modelName.slice(7);
      const endpoint = (ollamaEndpoint || 'http://localhost:11434').replace(/\/$/, '');
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: actualModel, prompt: prompt + "\n\nRETURN ONLY RAW JSON LIST.", stream: false, format: 'json' })
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
  } catch (e) { return []; }
}
