import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "./parser";

function getAI(apiKey?: string) {
  return new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY });
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

// Helper to filter out Instagram system junk
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
  selectedModel: string = "gemini-3.1-pro-preview"
): Promise<MemoryData> {
  if (rawMessages.length === 0) throw new Error("No messages found.");

  // 1. Clean the data first
  const messages = rawMessages.filter(m => !isJunkMessage(m.content));
  if (messages.length === 0) throw new Error("No meaningful messages found after filtering out system junk.");

  // ============================================================================
  // 1. LOCAL STATS PROCESSING (100% Accurate, 0 Tokens)
  // ============================================================================
  const totalMessages = messages.length;
  const firstMsg = messages[0];
  
  const senderCounts: Record<string, number> = {};
  const emojiCounts: Record<string, number> = {};
  const messagesByHour: Record<number, number> = {};
  for (let i = 0; i < 24; i++) messagesByHour[i] = 0;
  
  const wordCounts: Record<string, number> = {};
  const responseTimes: Record<string, { total: number; count: number }> = {};
  
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  
  // Enhanced stop words list
  const stopWords = new Set([
    "the", "and", "a", "to", "of", "in", "i", "you", "it", "that", "is", "for", "on", "we", "my", "with", "so", "this", "but", "not", "just", "like", "be", "have", "do", "are", "was", "what", "if", "me", "your", "all", "they", "as", "about", "can", "out", "up", "when", "get", "know", "how", "or", "yeah", "no", "good", "love", "would", "think", "too", "its", "it's", "im", "i'm", "dont", "don't", "that's", "thats", "u", "ur", "at", "from", "he", "she", "an", "will", "go", "got", "really", "then", "there", "them", "did", "didn't", "right", "now", "well", "one", "see", "been", "much", "some", "time", "because", "cause", "cuz", "ok", "okay", "yes", "we're", "you're", "they're", "he's", "she's", "can't", "won't", "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't", "hadn't", "doesn't", "couldn't", "shouldn't", "wouldn't", "mightn't", "mustn't", "am", "being", "has", "had", "having", "does", "doing", "until", "while", "by", "against", "between", "into", "through", "during", "before", "after", "above", "below", "off", "over", "under", "again", "further", "once", "here", "where", "why", "any", "both", "each", "few", "more", "most", "other", "such", "nor", "only", "own", "same", "than", "very", "omg", "lol", "lmao", "haha", "hahaha", "http", "https", "www", "com", "org", "net", "gonna", "wanna", "gotta", "ill", "i'll", "we'll", "you'll"
  ]);

  let prevMsg = messages[0];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    // Count senders
    senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1;
    
    // Initialize response times
    if (!responseTimes[msg.sender]) responseTimes[msg.sender] = { total: 0, count: 0 };

    // Calculate response time (if sender changed and within 12 hours)
    if (i > 0 && msg.sender !== prevMsg.sender) {
      const diffMs = msg.timestamp - prevMsg.timestamp;
      if (diffMs > 0 && diffMs < 12 * 60 * 60 * 1000) {
        responseTimes[msg.sender].total += diffMs;
        responseTimes[msg.sender].count += 1;
      }
    }
    prevMsg = msg;

    // Time of Day
    const hour = new Date(msg.timestamp).getHours();
    messagesByHour[hour]++;

    // Emojis & Words
    if (msg.content) {
      const emojis = msg.content.match(emojiRegex);
      if (emojis) {
        for (const e of emojis) emojiCounts[e] = (emojiCounts[e] || 0) + 1;
      }

      // Remove URLs before extracting words
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
  let participants = sortedSenders.slice(0, 2).map(s => s[0]);
  
  // Fallback if participants are not found correctly
  if (participants.length === 0) {
    participants = ["yun_the_pineapple_", "Nullifiedgalaxy"];
  } else if (participants.length === 1) {
    participants.push(participants[0] === "yun_the_pineapple_" ? "Nullifiedgalaxy" : "yun_the_pineapple_");
  }

  const mostActivePerson = sortedSenders[0]?.[0] || participants[0];

  const topEmojis = Object.entries(emojiCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);

  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(e => ({ word: e[0], count: e[1] }));

  const avgResponseTime: Record<string, number> = {};
  for (const p of participants) {
    const rt = responseTimes[p];
    avgResponseTime[p] = rt && rt.count > 0 ? Math.round(rt.total / rt.count / 60000) : 0; // in minutes
  }

  // ============================================================================
  // 2. INTELLIGENT CHUNKING & COMPRESSION FOR AI
  // ============================================================================
  const MAX_CHARS = 300000;
  const formatMsg = (m: ChatMessage) => `[${new Date(m.timestamp).toISOString()}] ${m.sender}: ${m.content}\n`;
  
  let sampledTranscript = "--- BEGINNING OF CHAT (How it started) ---\n";
  const firstBatch = messages.slice(0, 150);
  firstBatch.forEach(m => sampledTranscript += formatMsg(m));
  
  sampledTranscript += "\n--- RANDOM EXCERPTS FROM THE YEAR (The Vibe) ---\n";
  const middleMessages = messages.slice(150, -150);
  if (middleMessages.length > 0) {
    const chunkSize = 30;
    const numChunks = 40;
    for (let i = 0; i < numChunks; i++) {
      if (sampledTranscript.length > MAX_CHARS) break;
      const startIdx = Math.floor(Math.random() * Math.max(1, middleMessages.length - chunkSize));
      const chunk = middleMessages.slice(startIdx, startIdx + chunkSize);
      sampledTranscript += `\n... [Time jump to ${new Date(chunk[0].timestamp).toLocaleDateString()}] ...\n`;
      chunk.forEach(m => sampledTranscript += formatMsg(m));
    }
  }

  sampledTranscript += "\n--- MOST RECENT MESSAGES (How it's going) ---\n";
  const lastBatch = messages.slice(-150);
  lastBatch.forEach(m => sampledTranscript += formatMsg(m));

  // ============================================================================
  // 3. AI GENERATION
  // ============================================================================
  const prompt = `
Analyze the following sampled Instagram chat history between a couple (Null/Nullifiedgalaxy and Yun/yun_the_pineapple_) and generate a romantic "1-Year Anniversary Memories" summary.
The chat history is heavily compressed: it shows the very beginning, random snippets from throughout the year, and the most recent messages.

Return the result as a JSON object matching the schema. Be incredibly sweet, romantic, and thoughtful! This is a gift for a 1-year anniversary.
Pick 3-4 beautiful highlights based on the snippets, extract 3-5 specific, memorable, sweet, or funny exact quotes from the chat, and describe their vibe.
Also, identify 2-3 inside jokes, 2-3 milestones they reached or talked about, 2-3 future adventures they planned or dreamed of, and 2-3 fun superlatives (e.g., "Most likely to fall asleep first").
Finally, generate 2-3 deep "communication insights" analyzing their emotional arc, how they support each other, or their unique communication styles.

Sampled Chat History:
${sampledTranscript}
`;

  const ai = getAI(customApiKey);
  const response = await ai.models.generateContent({
    model: selectedModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A deeply romantic, sweet summary of their 1-year journey based on the chat snippets."
          },
          highlights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "e.g., The First 'I Love You', Funniest Inside Joke" },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            }
          },
          memorableQuotes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sender: { type: Type.STRING },
                text: { type: Type.STRING, description: "The exact quote from the chat" },
                context: { type: Type.STRING, description: "A 2-4 word context (e.g., 'Late night thoughts', 'Being silly')" }
              },
              required: ["sender", "text", "context"]
            },
            description: "3 to 5 specific, exact sweet or funny messages sent between them."
          },
          insideJokes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                joke: { type: Type.STRING, description: "The joke or funny phrase" },
                origin: { type: Type.STRING, description: "How it started or what it means" }
              },
              required: ["joke", "origin"]
            }
          },
          milestones: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "e.g., First Trip Together, Meeting the Parents" },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            }
          },
          futureAdventures: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "e.g., Trip to Japan, Adopting a Dog" },
                description: { type: Type.STRING, description: "Why they want to do it or what they said about it" }
              },
              required: ["title", "description"]
            }
          },
          superlatives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                award: { type: Type.STRING, description: "e.g., Best at sending memes, Most likely to fall asleep first" },
                winner: { type: Type.STRING, description: "The name of the person who won" },
                reason: { type: Type.STRING, description: "Why they won it based on the chat" }
              },
              required: ["award", "winner", "reason"]
            }
          },
          communicationInsights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "e.g., The Midnight Philosophers, Unwavering Support" },
                description: { type: Type.STRING, description: "A deep analysis of their communication style or emotional arc" }
              },
              required: ["title", "description"]
            }
          },
          vibe: {
            type: Type.STRING,
            description: "A 1-3 word romantic description of their vibe (e.g., Soulmates, Playful & Deep)."
          }
        },
        required: ["summary", "highlights", "memorableQuotes", "insideJokes", "milestones", "futureAdventures", "superlatives", "communicationInsights", "vibe"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  const aiData = JSON.parse(text);

  // ============================================================================
  // 4. MERGE LOCAL STATS WITH AI INSIGHTS
  // ============================================================================
  return {
    participants,
    firstMessage: {
      date: new Date(firstMsg.timestamp).toISOString(),
      sender: firstMsg.sender,
      text: firstMsg.content
    },
    stats: {
      totalMessages,
      mostActivePerson,
      topEmojis
    },
    extendedStats: {
      messagesByHour,
      topWords,
      avgResponseTime
    },
    summary: aiData.summary,
    highlights: aiData.highlights,
    memorableQuotes: aiData.memorableQuotes,
    insideJokes: aiData.insideJokes,
    milestones: aiData.milestones,
    futureAdventures: aiData.futureAdventures,
    superlatives: aiData.superlatives,
    communicationInsights: aiData.communicationInsights,
    vibe: aiData.vibe
  };
}

export async function generateMoreItems(
  rawMessages: ChatMessage[],
  category: 'memorableQuotes' | 'insideJokes' | 'communicationInsights' | 'highlights' | 'milestones' | 'futureAdventures' | 'superlatives',
  existingItems: any[],
  customApiKey?: string,
  selectedModel: string = "gemini-3.1-flash-preview"
): Promise<any[]> {
  const messages = rawMessages.filter(m => !isJunkMessage(m.content));
  if (messages.length === 0) return [];

  const participants = Array.from(new Set(messages.map(m => m.sender)));

  // Sample the transcript (random 2000 messages to get new context)
  const sampleSize = Math.min(2000, messages.length);
  const sampledMessages = [];
  const step = Math.max(1, Math.floor(messages.length / sampleSize));
  
  // Add some randomness to the start index to get different chunks each time
  const randomOffset = Math.floor(Math.random() * step);
  for (let i = randomOffset; i < messages.length; i += step) {
    sampledMessages.push(messages[i]);
    if (sampledMessages.length >= sampleSize) break;
  }

  const transcript = sampledMessages
    .map(m => `[${new Date(m.timestamp).toISOString()}] ${m.sender}: ${m.content}`)
    .join('\n');

  let prompt = `Analyze this chat transcript between ${participants.join(' and ')}.\n\n`;
  prompt += `I need you to generate 5 MORE unique items for the category: "${category}".\n`;
  prompt += `Here are the items that have ALREADY been generated (DO NOT REPEAT THESE):\n`;
  prompt += JSON.stringify(existingItems, null, 2) + `\n\n`;
  
  let schemaType;
  if (category === 'memorableQuotes') {
    prompt += `Generate 5 new memorable, funny, or romantic quotes from the chat.`;
    schemaType = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sender: { type: Type.STRING },
          text: { type: Type.STRING },
          context: { type: Type.STRING }
        },
        required: ["sender", "text", "context"]
      }
    };
  } else if (category === 'insideJokes') {
    prompt += `Generate 5 new inside jokes or recurring funny themes from the chat.`;
    schemaType = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          joke: { type: Type.STRING },
          origin: { type: Type.STRING }
        },
        required: ["joke", "origin"]
      }
    };
  } else if (category === 'communicationInsights') {
    prompt += `Generate 5 new deep communication insights (e.g., emotional arc, support, unique styles).`;
    schemaType = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["title", "description"]
      }
    };
  } else if (category === 'highlights') {
    prompt += `Generate 5 new beautiful highlights or core memories from the chat.`;
    schemaType = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["title", "description"]
      }
    };
  } else if (category === 'milestones') {
    prompt += `Generate 5 new milestones they reached or talked about.`;
    schemaType = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["title", "description"]
      }
    };
  } else if (category === 'futureAdventures') {
    prompt += `Generate 5 new future adventures they planned or dreamed of.`;
    schemaType = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["title", "description"]
      }
    };
  } else if (category === 'superlatives') {
    prompt += `Generate 5 new fun superlatives (e.g., "Most likely to fall asleep first").`;
    schemaType = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          award: { type: Type.STRING },
          winner: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["award", "winner", "reason"]
      }
    };
  }

  prompt += `\n\nTranscript:\n${transcript}`;

  const ai = getAI(customApiKey);
  const response = await ai.models.generateContent({
    model: selectedModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schemaType,
      temperature: 0.9, // Higher temp for more variety
    }
  });

  const text = response.text;
  if (!text) return [];

  return JSON.parse(text);
}
