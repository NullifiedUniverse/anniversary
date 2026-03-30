import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "./parser";

function getAI(apiKey?: string) {
  const key = apiKey || (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error("Gemini API Key not found. Please provide one in the settings or .env file.");
  }
  return new GoogleGenAI(key);
}

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
  highlights: {
    title: string;
    description: string;
  }[];
  memorableQuotes: {
    sender: string;
    text: string;
    context: string;
  }[];
  insideJokes: {
    joke: string;
    origin: string;
  }[];
  milestones: {
    title: string;
    description: string;
  }[];
  futureAdventures: {
    title: string;
    description: string;
  }[];
  superlatives: {
    award: string;
    winner: string;
    reason: string;
  }[];
  communicationInsights: {
    title: string;
    description: string;
  }[];
  vibe: string;
}

const isJunkMessage = (text: string) => {
  if (!text) return true;
  const t = text.toLowerCase();
  return (
    t === "liked a message" ||
    t.startsWith("reacted ") ||
    t.includes("sent an attachment") ||
    t.includes("audio call") ||
    t.includes("video call") ||
    t.includes("missed a video chat") ||
    t.includes("missed an audio call") ||
    t.includes("this message was unsent") ||
    t.includes("poll:")
  );
};

export async function generateMemories(
  rawMessages: ChatMessage[],
  customApiKey?: string,
  selectedModel: string = "gemini-2.0-flash"
): Promise<MemoryData> {
  if (rawMessages.length === 0) throw new Error("No messages found.");

  const messages = rawMessages.filter(m => !isJunkMessage(m.content));
  if (messages.length === 0) throw new Error("No meaningful messages found after filtering out system junk.");

  const totalMessages = messages.length;
  const firstMsg = messages[0];
  
  const senderCounts: Record<string, number> = {};
  const emojiCounts: Record<string, number> = {};
  const messagesByHour: Record<number, number> = {};
  for (let i = 0; i < 24; i++) messagesByHour[i] = 0;
  
  const wordCounts: Record<string, number> = {};
  const responseTimes: Record<string, { total: number; count: number }> = {};
  
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  
  const stopWords = new Set([
    "the", "and", "a", "to", "of", "in", "i", "you", "it", "that", "is", "for", "on", "we", "my", "with", "so", "this", "but", "not", "just", "like", "be", "have", "do", "are", "was", "what", "if", "me", "your", "all", "they", "as", "about", "can", "out", "up", "when", "get", "know", "how", "or", "yeah", "no", "good", "love", "would", "think", "too", "its", "it's", "im", "i'm", "dont", "don't", "that's", "thats", "u", "ur", "at", "from", "he", "she", "an", "will", "go", "got", "really", "then", "there", "them", "did", "didn't", "right", "now", "well", "one", "see", "been", "much", "some", "time", "because", "cause", "cuz", "ok", "okay", "yes", "we're", "you're", "they're", "he's", "she's", "can't", "won't", "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't", "hadn't", "doesn't", "couldn't", "shouldn't", "wouldn't", "mightn't", "mustn't", "am", "being", "has", "had", "having", "does", "doing", "until", "while", "by", "against", "between", "into", "through", "during", "before", "after", "above", "below", "off", "over", "under", "again", "further", "once", "here", "where", "why", "any", "both", "each", "few", "more", "most", "other", "such", "nor", "only", "own", "same", "than", "very", "omg", "lol", "lmao", "haha", "hahaha", "http", "https", "www", "com", "org", "net", "gonna", "wanna", "gotta", "ill", "i'll", "we'll", "you'll"
  ]);

  let prevMsg = messages[0];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1;
    if (!responseTimes[msg.sender]) responseTimes[msg.sender] = { total: 0, count: 0 };
    if (i > 0 && msg.sender !== prevMsg.sender) {
      const diffMs = msg.timestamp - prevMsg.timestamp;
      if (diffMs > 0 && diffMs < 12 * 60 * 60 * 1000) {
        responseTimes[msg.sender].total += diffMs;
        responseTimes[msg.sender].count += 1;
      }
    }
    prevMsg = msg;
    const hour = new Date(msg.timestamp).getHours();
    messagesByHour[hour]++;
    if (msg.content) {
      const emojis = msg.content.match(emojiRegex);
      if (emojis) {
        for (const e of emojis) emojiCounts[e] = (emojiCounts[e] || 0) + 1;
      }
      const cleanContent = msg.content.toLowerCase().replace(/https?:\/\/[^\s]+/g, '');
      const words = cleanContent.match(/\b[a-z']+\b/g);
      if (words) {
        for (const w of words) {
          if (!stopWords.has(w) && w.length > 2) {
            wordCounts[w] = (wordCounts[w] || 0) + 1;
          }
        }
      }
    }
  }

  const sortedSenders = Object.entries(senderCounts).sort((a, b) => b[1] - a[1]);
  const participants = sortedSenders.slice(0, 2).map(s => s[0]);
  if (participants.length === 0) throw new Error("Could not identify participants.");
  const mostActivePerson = sortedSenders[0]?.[0] || participants[0];
  const topEmojis = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
  const topWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 25).map(e => ({ word: e[0], count: e[1] }));
  const avgResponseTime: Record<string, number> = {};
  for (const p of participants) {
    const rt = responseTimes[p];
    avgResponseTime[p] = rt && rt.count > 0 ? Math.round(rt.total / rt.count / 60000) : 0;
  }

  const MAX_CHARS = 300000;
  const formatMsg = (m: ChatMessage) => `[${new Date(m.timestamp).toISOString()}] ${m.sender}: ${m.content}\n`;
  let sampledTranscript = "--- BEGINNING ---\n";
  messages.slice(0, 150).forEach(m => sampledTranscript += formatMsg(m));
  sampledTranscript += "\n--- SNIPPETS ---\n";
  const middle = messages.slice(150, -150);
  if (middle.length > 0) {
    for (let i = 0; i < 40; i++) {
      if (sampledTranscript.length > MAX_CHARS) break;
      const start = Math.floor(Math.random() * Math.max(1, middle.length - 30));
      middle.slice(start, start + 30).forEach(m => sampledTranscript += formatMsg(m));
    }
  }
  sampledTranscript += "\n--- RECENT ---\n";
  messages.slice(-150).forEach(m => sampledTranscript += formatMsg(m));

  const prompt = `Analyze the chat between ${participants.join(' and ')}. Create a romantic 1-year anniversary summary.
  Transcript: ${sampledTranscript}`;

  const ai = getAI(customApiKey);
  const result = await (ai as any).models.generateContent({
    model: selectedModel,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          highlights: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "description"] } },
          memorableQuotes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sender: { type: Type.STRING }, text: { type: Type.STRING }, context: { type: Type.STRING } }, required: ["sender", "text", "context"] } },
          insideJokes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { joke: { type: Type.STRING }, origin: { type: Type.STRING } }, required: ["joke", "origin"] } },
          milestones: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "description"] } },
          futureAdventures: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "description"] } },
          superlatives: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { award: { type: Type.STRING }, winner: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ["award", "winner", "reason"] } },
          communicationInsights: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "description"] } },
          vibe: { type: Type.STRING }
        },
        required: ["summary", "highlights", "memorableQuotes", "insideJokes", "milestones", "futureAdventures", "superlatives", "communicationInsights", "vibe"]
      }
    }
  });

  const aiData = JSON.parse(result.text);
  return {
    participants,
    firstMessage: { date: new Date(firstMsg.timestamp).toISOString(), sender: firstMsg.sender, text: firstMsg.content },
    stats: { totalMessages, mostActivePerson, topEmojis },
    extendedStats: { messagesByHour, topWords, avgResponseTime },
    ...aiData
  };
}

export async function generateMoreItems(
  rawMessages: ChatMessage[],
  category: string,
  existingItems: any[],
  customApiKey?: string,
  selectedModel: string = "gemini-1.5-flash"
): Promise<any[]> {
  const messages = rawMessages.filter(m => !isJunkMessage(m.content));
  if (messages.length === 0) return [];
  const participants = Array.from(new Set(messages.map(m => m.sender)));
  const transcript = messages.slice(-500).map(m => `[${new Date(m.timestamp).toISOString()}] ${m.sender}: ${m.content}`).join('\n');
  const prompt = `Generate 5 more unique "${category}" items for ${participants.join(' and ')}. 
  Avoid: ${JSON.stringify(existingItems)}. Transcript: ${transcript}`;

  const ai = getAI(customApiKey);
  
  let schema: any = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "description"] } };
  if (category === 'memorableQuotes') schema.items.properties = { sender: { type: Type.STRING }, text: { type: Type.STRING }, context: { type: Type.STRING } };
  if (category === 'insideJokes') schema.items.properties = { joke: { type: Type.STRING }, origin: { type: Type.STRING } };
  if (category === 'superlatives') schema.items.properties = { award: { type: Type.STRING }, winner: { type: Type.STRING }, reason: { type: Type.STRING } };

  const response = await (ai as any).models.generateContent({
    model: selectedModel,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json", responseSchema: schema }
  });

  return JSON.parse(response.text);
}
