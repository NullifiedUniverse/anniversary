import { ChatMessage } from "./parser";

const logger = {
  info: (msg: string, data?: any) => console.log(`[Gemini Pipeline] ℹ️ ${msg}`, data || ''),
  error: (msg: string, err?: any) => console.error(`[Gemini Pipeline] ❌ ${msg}`, err || ''),
  success: (msg: string) => console.log(`[Gemini Pipeline] ✅ ${msg}`)
};

export interface MemoryData {
  participants: string[];
  summary: string;
  firstMessage: { date: string; sender: string; text: string; };
  stats: { totalMessages: number; mostActivePerson: string; topEmojis: string[]; };
  extendedStats: { messagesByHour: Record<number, number>; topWords: { word: string; count: number }[]; avgResponseTime: Record<string, number>; };
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

export async function generateMemories(
  messages: ChatMessage[], 
  apiKey: string, 
  modelName: string = 'gemini-2.0-flash'
): Promise<MemoryData> {
  if (messages.length === 0) throw new Error("No messages to analyze");

  logger.info(`Starting analysis: ${messages.length} messages using ${modelName}`);

  const participants = Array.from(new Set(messages.map(m => m.sender)));
  
  // sampling
  const sampledMessages: ChatMessage[] = [];
  if (messages.length <= 500) {
    sampledMessages.push(...messages);
  } else {
    sampledMessages.push(...messages.slice(0, 100));
    const step = Math.floor((messages.length - 200) / 300);
    for (let i = 0; i < 300; i++) {
      sampledMessages.push(messages[100 + i * step]);
    }
    sampledMessages.push(...messages.slice(-100));
  }

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

  const prompt = `You are a romantic storyteller. Analyze this chat history for ${p1} and ${p2}'s anniversary. Create a romantic summary. Use their names. Transcript:\n${sampledTranscript}`;

  try {
    logger.info("Awaiting response from Integrated REST Proxy...");
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, modelName, apiKey: apiKey.trim() })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Integrated Proxy Error");
    }

    const aiData = await response.json();
    logger.success("Success.");

    // Stats
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
      ...aiData,
      participants,
      firstMessage: {
        date: new Date(messages[0].timestamp).toISOString(),
        sender: messages[0].sender,
        text: messages[0].content
      },
      stats: { totalMessages: messages.length, mostActivePerson, topEmojis: [] },
      extendedStats: { messagesByHour, topWords, avgResponseTime: {} }
    };
  } catch (e) {
    logger.error("Integrated Analysis Failure", e);
    throw e;
  }
}

export async function generateMoreItems(
  messages: ChatMessage[],
  category: string,
  existingItems: any[],
  apiKey: string,
  modelName: string = 'gemini-2.0-flash'
) {
  if (messages.length === 0) return [];
  try {
    const sampledTranscript = messages.slice(-200).map(m => `[${m.sender}]: ${m.content}`).join('\n');
    const prompt = `Generate 5 more unique ${category} for this couple. Do not repeat: ${JSON.stringify(existingItems)}\n\nMessages:\n${sampledTranscript}`;
    
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, modelName, apiKey: apiKey.trim() })
    });

    if (!response.ok) throw new Error("Integrated Proxy Error");
    return await response.json();
  } catch (e) {
    logger.error(`Failed to generate more ${category}`, e);
    return [];
  }
}
