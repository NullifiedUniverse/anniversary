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
  sentimentBursts: { title: string; description: string; date: string }[];
  timeInsights: { category: string; description: string; sample: string }[];
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
    const blocks = text.split(/<div[^>]*class="pam[^"]*">/g);
    for (const block of blocks) {
      if (!block.includes('_a6-o')) continue;
      const senderMatch = block.match(/<h2[^>]*>([^<]+)<\/h2>/);
      const timestampMatch = block.match(/<div[^>]*class="[^"]*_a6-o[^"]*">([^<]+)<\/div>/);
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
  console.log("Extracting massive seed memories rigorously...");
  
  const emotionalKeywords = ['love', 'miss', 'always', 'forever', 'happy', 'thank', 'beautiful', 'wonderful', 'special', 'sorry', 'promise', 'heart', 'soul', 'mwah', 'baby', 'honey', 'soulmate', 'mine', 'precious', 'darling'];
  const futureKeywords = ['next', 'will', 'future', 'going', 'visit', 'travel', 'house', 'wedding', 'together', 'someday', 'soon', 'tomorrow', 'eventually', 'plan', 'trip'];
  const jokeKeywords = ['lol', 'lmao', 'haha', 'remember', 'when', 'that time', 'joke', 'pff', '🤣', '😭', '💀', 'stoppp', 'nahhh', 'brooo'];

  // 1. Massive Quotes (150 seeds)
  const quotes = messages
    .filter(m => m.content.length > 30 && m.content.length < 300)
    .filter(m => emotionalKeywords.some(word => m.content.toLowerCase().includes(word)))
    .sort((a, b) => b.content.length - a.content.length)
    .slice(0, 300)
    .sort(() => 0.5 - Math.random())
    .slice(0, 150)
    .map(m => ({ 
      sender: m.sender, 
      text: m.content, 
      timestamp: m.timestamp,
      context: "A profound echo of our shared history."
    }));

  // 2. Comprehensive Milestones (50 seeds)
  const dayCounts: Record<string, { count: number, sample: string }> = {};
  messages.forEach(m => {
    const date = new Date(m.timestamp).toLocaleDateString();
    if (!dayCounts[date]) dayCounts[date] = { count: 0, sample: m.content };
    dayCounts[date].count++;
    if (m.content.length > dayCounts[date].sample.length && m.content.length < 200) {
      dayCounts[date].sample = m.content;
    }
  });

  const milestones = Object.entries(dayCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 50)
    .map(([date, data]) => ({
      title: `The Peak of ${date}`,
      description: `A day of immense connection with ${data.count} shared messages. Highlight: "${data.sample.slice(0, 80)}..."`,
      date
    }));

  // 3. Rigorous Jokes (50 seeds)
  const jokes = messages
    .filter(m => m.content.length < 150)
    .filter(m => jokeKeywords.some(word => m.content.toLowerCase().includes(word)))
    .sort(() => 0.5 - Math.random())
    .slice(0, 50)
    .map(m => ({
      joke: m.content,
      origin: `A shared smile from ${new Date(m.timestamp).toLocaleDateString()}`
    }));

  // 4. Future Dreams (30 seeds)
  const future = messages
    .filter(m => futureKeywords.some(word => m.content.toLowerCase().includes(word)))
    .filter(m => m.content.length > 20 && m.content.length < 250)
    .sort(() => 0.5 - Math.random())
    .slice(0, 30)
    .map(m => ({
      title: "Vision of Us",
      description: m.content
    }));

  // 5. Sentiment Bursts
  const sentimentBursts: SeedMemories['sentimentBursts'] = [];
  const windowSize = 10;
  for (let i = 0; i < messages.length - windowSize; i += 5) {
    const window = messages.slice(i, i + windowSize);
    const emotionalCount = window.filter(m => emotionalKeywords.some(k => m.content.toLowerCase().includes(k))).length;
    if (emotionalCount >= 4) {
      sentimentBursts.push({
        title: "Emotional Synchrony",
        description: `A moment of deep resonance detected on ${new Date(window[0].timestamp).toLocaleDateString()}.`,
        date: new Date(window[0].timestamp).toLocaleDateString()
      });
      if (sentimentBursts.length >= 20) break;
    }
  }

  // 6. Time-of-Day Insights
  const timeInsights: SeedMemories['timeInsights'] = [
    { category: "Morning Glow", description: "The first thoughts of the day, woven into greetings and early smiles.", sample: "" },
    { category: "Daylight Connection", description: "The steady rhythm of our lives, keeping each other close through the noise.", sample: "" },
    { category: "Twilight Whispers", description: "As the sun sets, our conversations turn inward, sharing the weight of the day.", sample: "" },
    { category: "Midnight Secrets", description: "The hours where the world sleeps and only we exist in our digital sanctuary.", sample: "" }
  ];

  messages.forEach(m => {
    const hour = new Date(m.timestamp).getHours();
    let idx = -1;
    if (hour >= 5 && hour < 11) idx = 0;
    else if (hour >= 11 && hour < 17) idx = 1;
    else if (hour >= 17 && hour < 22) idx = 2;
    else if (hour >= 22 || hour < 5) idx = 3;
    
    if (idx !== -1 && m.content.length > 40 && m.content.length < 150 && !timeInsights[idx].sample) {
      timeInsights[idx].sample = m.content;
    }
  });

  // 7. Refined Top Words (200 seeds)
  const stopWords = new Set(['the', 'and', 'that', 'this', 'with', 'from', 'have', 'your', 'will', 'just', 'they', 'their', 'what', 'about', 'know', 'like', 'there', 'would', 'think', 'more', 'when', 'which', 'who', 'how', 'time', 'up', 'out', 'into', 'over', 'after', 'some', 'been', 'were', 'very', 'here', 'there', 'then', 'was', 'for', 'you', 'are', 'i\'m', 'don\'t', 'can\'t', 'it\'s', 'that\'s', 'well', 'all', 'out', 'more']);
  const wordCounts: Record<string, number> = {};
  messages.slice(-10000).forEach(m => {
    m.content.toLowerCase().split(/[^a-z]/).forEach(w => {
      if (w.length > 3 && !stopWords.has(w)) {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      }
    });
  });
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 200)
    .map(([word, count]) => ({ word, count }));

  return { quotes, milestones, jokes, future, words: topWords, sentimentBursts, timeInsights };
}

async function main() {
  const chatDataDir = path.join(process.cwd(), 'chat data');
  const allMessages: ChatMessage[] = [];

  console.log("Methodological Rigorous Pre-processing started...");

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
  console.log(`- Sentiment Bursts: ${seeds.sentimentBursts.length}`);
  console.log(`- Top Words: ${seeds.words.length}`);
}

main();
