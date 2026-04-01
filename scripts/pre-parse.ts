import fs from 'fs';
import path from 'path';

interface ChatMessage {
  sender: string;
  timestamp: number;
  content: string;
}

interface SeedMemories {
  quotes: { sender: string; text: string; timestamp: number; context: string }[];
  milestones: { title: string; description: string; date: string }[];
  jokes: { joke: string; origin: string }[];
  future: { title: string; description: string }[];
  words: { word: string; count: number }[];
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
        if (sender && timestamp) {
          messages.push({ sender: String(sender), timestamp: Number(timestamp), content: String(content || "") });
        }
      }
    }
    return messages;
  } catch (e) { return []; }
}

function parseHtml(text: string): ChatMessage[] {
  const messages: ChatMessage[] = [];
  try {
    // STRATEGY: Split by message block separator
    const blocks = text.split(/<div[^>]*class="pam[^"]*">/g);
    
    for (const block of blocks) {
      if (!block.includes('_a6-o')) continue; // Skip blocks without a date
      
      const senderMatch = block.match(/<h2[^>]*>([^<]+)<\/h2>/);
      const timestampMatch = block.match(/<div[^>]*class="[^"]*_a6-o[^"]*">([^<]+)<\/div>/);
      
      // Content is usually between h2 and the date div
      const contentPartMatch = block.match(/<div[^>]*class="[^"]*_a6-p[^"]*">(.*?)<\/div>\s*<div[^>]*class="[^"]*_a6-o[^"]*">/s);
      
      if (senderMatch && timestampMatch) {
        const sender = senderMatch[1].trim();
        const timestampStr = timestampMatch[1].trim();
        const timestamp = new Date(timestampStr).getTime();
        
        let content = "";
        if (contentPartMatch) {
          content = contentPartMatch[1].replace(/<\/div>/g, '\n').replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
        }
        
        if (!isNaN(timestamp)) {
          messages.push({ sender, content, timestamp });
        }
      }
    }
    return messages;
  } catch (e) { return []; }
}

function extractSeeds(messages: ChatMessage[]): SeedMemories {
  console.log("Extracting seed memories...");
  
  const emotionalKeywords = ['love', 'miss', 'always', 'forever', 'happy', 'thank', 'beautiful', 'wonderful', 'special', 'sorry', 'promise', 'heart', 'soul', 'mwah', 'baby', 'honey'];
  const futureKeywords = ['next', 'will', 'future', 'going', 'visit', 'travel', 'house', 'wedding', 'together', 'someday', 'soon', 'tomorrow'];
  const jokeKeywords = ['lol', 'lmao', 'haha', 'remember', 'when', 'that time', 'joke', 'pff', '🤣', '😭', '💀'];

  const quotes = messages
    .filter(m => m.content.length > 30 && m.content.length < 250)
    .filter(m => emotionalKeywords.some(word => m.content.toLowerCase().includes(word)))
    .slice(-500)
    .sort(() => 0.5 - Math.random())
    .slice(0, 30)
    .map(m => ({ 
      sender: m.sender, 
      text: m.content, 
      timestamp: m.timestamp,
      context: "A soulful echo from our history."
    }));

  const dayCounts: Record<string, { count: number, sample: string }> = {};
  messages.forEach(m => {
    const date = new Date(m.timestamp).toLocaleDateString();
    if (!dayCounts[date]) dayCounts[date] = { count: 0, sample: m.content };
    dayCounts[date].count++;
    if (m.content.length > dayCounts[date].sample.length && m.content.length < 150) {
      dayCounts[date].sample = m.content;
    }
  });

  const milestones = Object.entries(dayCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15)
    .map(([date, data]) => ({
      title: `The Energy of ${date}`,
      description: `We shared ${data.count} messages.`,
      date
    }));

  const jokes = messages
    .filter(m => m.content.length < 100)
    .filter(m => jokeKeywords.some(word => m.content.toLowerCase().includes(word)))
    .slice(-2000)
    .sort(() => 0.5 - Math.random())
    .slice(0, 20)
    .map(m => ({
      joke: m.content,
      origin: `Shared on ${new Date(m.timestamp).toLocaleDateString()}`
    }));

  const future = messages
    .filter(m => futureKeywords.some(word => m.content.toLowerCase().includes(word)))
    .filter(m => m.content.length > 15 && m.content.length < 200)
    .sort(() => 0.5 - Math.random())
    .slice(0, 15)
    .map(m => ({
      title: "Shared Horizon",
      description: m.content
    }));

  const stopWords = new Set(['the', 'and', 'that', 'this', 'with', 'from', 'have', 'your', 'will', 'just', 'they', 'their', 'what', 'about', 'know', 'like', 'there', 'would', 'think', 'more', 'when', 'which', 'who', 'how', 'time', 'up', 'out', 'into', 'over', 'after', 'some', 'been', 'were', 'very', 'here', 'there', 'then', 'was', 'for', 'you', 'are', 'i\'m', 'don\'t', 'can\'t', 'it\'s']);
  const wordCounts: Record<string, number> = {};
  messages.forEach(m => {
    m.content.toLowerCase().split(/[^a-z]/).forEach(w => {
      if (w.length > 3 && !stopWords.has(w)) {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      }
    });
  });
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([word, count]) => ({ word, count }));

  return { quotes, milestones, jokes, future, words: topWords };
}

async function main() {
  const chatDataDir = path.join(process.cwd(), 'chat data');
  const allMessages: ChatMessage[] = [];

  console.log("Methodological Pre-processing started...");

  const walk = (dir: string) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else {
        const text = fs.readFileSync(fullPath, 'utf-8');
        if (file.endsWith('.json')) {
          allMessages.push(...parseJson(text));
        } else if (file.endsWith('.html')) {
          allMessages.push(...parseHtml(text));
        }
      }
    }
  };

  walk(chatDataDir);

  console.log(`Initial parse complete: ${allMessages.length} messages found.`);

  const sorted = allMessages
    .filter(msg => msg.sender && !isNaN(msg.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp);

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

  console.log(`Deduplication complete: ${uniqueMessages.length} unique messages.`);

  if (uniqueMessages.length === 0) {
    console.error("CRITICAL ERROR: No unique messages extracted.");
    return;
  }

  const seeds = extractSeeds(uniqueMessages);

  const output = {
    messages: uniqueMessages,
    seeds: seeds
  };

  const outputPath = path.join(process.cwd(), 'public', 'pre-parsed-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output));
  console.log(`✅ Methodology complete. Output saved to ${outputPath}`);
  console.log(`- Unique Messages: ${uniqueMessages.length}`);
  console.log(`- Seed Quotes: ${seeds.quotes.length}`);
  console.log(`- Seed Milestones: ${seeds.milestones.length}`);
  console.log(`- Seed Jokes: ${seeds.jokes.length}`);
  console.log(`- Top Words: ${seeds.words.length}`);
}

main();
