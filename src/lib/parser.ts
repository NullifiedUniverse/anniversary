export interface ChatMessage {
  sender: string;
  timestamp: number;
  content: string;
}

export interface SeedMemories {
  quotes: { sender: string; text: string; timestamp: number; context: string }[];
  milestones: { title: string; description: string; date: string }[];
  jokes: { joke: string; origin: string }[];
  future: { title: string; description: string }[];
  words: { word: string; count: number }[];
}

export async function parseFiles(files: File[]): Promise<{ messages: ChatMessage[], seeds: SeedMemories }> {
  let allMessages: ChatMessage[] = [];

  for (const file of files) {
    try {
      const text = await file.text();
      if (file.name.endsWith('.json')) {
        allMessages = allMessages.concat(parseJson(text));
      } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        allMessages = allMessages.concat(parseHtml(text));
      }
    } catch (err) {
      console.error(`Failed to read file: ${file.name}`, err);
    }
  }

  // Sort by timestamp ascending
  const sorted = allMessages
    .filter(msg => msg.content && msg.sender && !isNaN(msg.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp);

  // Deduplicate
  const seen = new Set<string>();
  const uniqueMessages: ChatMessage[] = [];

  for (const msg of sorted) {
    const secondTs = Math.floor(msg.timestamp / 1000) * 1000;
    const key = `${msg.sender}-${secondTs}-${msg.content}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMessages.push(msg);
    }
  }

  // SEED EXTRACTION
  const seeds = extractSeeds(uniqueMessages);

  return { messages: uniqueMessages, seeds };
}

function extractSeeds(messages: ChatMessage[]): SeedMemories {
  const emotionalKeywords = ['love', 'miss', 'always', 'forever', 'happy', 'thank', 'beautiful', 'wonderful', 'special', 'sorry', 'promise'];
  const futureKeywords = ['next', 'will', 'future', 'going', 'visit', 'travel', 'house', 'wedding', 'together'];
  const jokeKeywords = ['lol', 'lmao', 'haha', 'remember', 'when', 'that time', 'joke'];

  // 1. Quotes
  const quotes = messages
    .filter(m => m.content.length > 40 && m.content.length < 200)
    .filter(m => emotionalKeywords.some(word => m.content.toLowerCase().includes(word)))
    .slice(-100)
    .sort(() => 0.5 - Math.random())
    .slice(0, 8)
    .map(m => ({ 
      sender: m.sender, 
      text: m.content, 
      timestamp: m.timestamp,
      context: "A heartfelt message from our history."
    }));

  // 2. Milestones (Peak Activity)
  const dayCounts: Record<string, { count: number, sample: string }> = {};
  messages.forEach(m => {
    const date = new Date(m.timestamp).toLocaleDateString();
    if (!dayCounts[date]) dayCounts[date] = { count: 0, sample: m.content };
    dayCounts[date].count++;
    if (m.content.length > dayCounts[date].sample.length) dayCounts[date].sample = m.content;
  });

  const milestones = Object.entries(dayCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([date, data]) => ({
      title: `The Peak of ${date}`,
      description: `We shared ${data.count} messages on this special day.`,
      date
    }));

  // 3. Inside Jokes
  const jokes = messages
    .filter(m => m.content.length < 100)
    .filter(m => jokeKeywords.some(word => m.content.toLowerCase().includes(word)))
    .slice(-100)
    .sort(() => 0.5 - Math.random())
    .slice(0, 6)
    .map(m => ({
      joke: m.content,
      origin: `Shared on ${new Date(m.timestamp).toLocaleDateString()}`
    }));

  // 4. Future
  const future = messages
    .filter(m => futureKeywords.some(word => m.content.toLowerCase().includes(word)))
    .slice(-100)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4)
    .map(m => ({
      title: "A Shared Dream",
      description: m.content
    }));

  // 5. Words
  const stopWords = new Set(['the', 'and', 'that', 'this', 'with', 'from', 'have', 'your', 'will', 'just', 'they', 'their', 'what', 'about', 'know', 'like', 'there', 'would', 'think', 'more', 'when', 'which', 'who', 'how', 'time', 'up', 'out', 'into', 'over', 'after']);
  const wordCounts: Record<string, number> = {};
  messages.slice(-5000).forEach(m => {
    m.content.split(/\s+/).forEach(word => {
      const w = word.toLowerCase().replace(/[^\w]/g, '');
      if (w.length > 3 && !stopWords.has(w)) {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      }
    });
  });
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word, count]) => ({ word, count }));

  return {
    quotes,
    milestones,
    jokes,
    future,
    words: topWords
  };
}

function decodeIGString(str: string): string {
  try { return decodeURIComponent(escape(str)); } catch (e) { return str; }
}

function parseJson(text: string): ChatMessage[] {
  try {
    const data = JSON.parse(text);
    const messages: ChatMessage[] = [];
    const findMessages = (obj: any): any[] | null => {
      if (obj && Array.isArray(obj.messages)) return obj.messages;
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          const res = findMessages(obj[key]);
          if (res) return res;
        }
      }
      return null;
    };
    const rawMessages = findMessages(data);
    if (rawMessages) {
      for (const msg of rawMessages) {
        const sender = decodeIGString(msg.sender_name || msg.sender || "");
        const content = decodeIGString(msg.content || msg.text || msg.share?.link || msg.media?.uri || "");
        const timestamp = msg.timestamp_ms || msg.timestamp || (msg.created_at ? new Date(msg.created_at).getTime() : null);
        if (sender && content && timestamp) {
          messages.push({ sender: String(sender), timestamp: Number(timestamp), content: String(content) });
        }
      }
    }
    return messages;
  } catch (e) { return []; }
}

function parseHtml(text: string): ChatMessage[] {
  const messages: ChatMessage[] = [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const messageBlocks = doc.querySelectorAll('.pam, ._3-95, ._2pi0, .uiBoxWhite');
    if (messageBlocks.length > 0) {
      messageBlocks.forEach(block => {
        const sender = block.querySelector('h2, ._3-96, ._2pio, ._2lek, ._2lel')?.textContent?.trim();
        const content = block.querySelector('._3-95._a6-p, ._3-96._2let, ._2let, div > div > div:nth-child(2)')?.textContent?.trim();
        const timestampStr = block.querySelector('._3-94, ._2lem, ._a3sc')?.textContent?.trim();
        if (sender && content && timestampStr) {
          const timestamp = new Date(timestampStr).getTime();
          if (!isNaN(timestamp)) messages.push({ sender, content, timestamp });
        }
      });
    }
    return messages;
  } catch (e) { return []; }
}
