import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// Copy parser logic (simplified for Node)
interface ChatMessage {
  sender: string;
  timestamp: number;
  content: string;
}

function decodeIGString(str: string): string {
  try {
    return decodeURIComponent(escape(str));
  } catch (e) {
    return str;
  }
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
  } catch (e) {
    return [];
  }
}

function parseHtml(text: string): ChatMessage[] {
  const messages: ChatMessage[] = [];
  try {
    // Regex strategy to avoid JSDOM memory overhead
    const msgRegex = /<div class="pam _3-95 _2ph- _a6-g uiBoxWhite noborder"><h2 class="_3-95 _2pim _a6-h _a6-i">([^<]+)<\/h2><div class="_3-95 _a6-p">(.*?)<\/div><div class="_3-94 _a6-o">([^<]+)<\/div><\/div>/g;
    
    let match;
    while ((match = msgRegex.exec(text)) !== null) {
      const sender = match[1].trim();
      let rawContent = match[2].trim();
      const timestampStr = match[3].trim();
      
      // Basic tag removal for content
      const content = rawContent.replace(/<[^>]*>?/gm, '').trim();
      
      const timestamp = new Date(timestampStr).getTime();
      if (!isNaN(timestamp)) {
        messages.push({ sender, content, timestamp });
      }
    }
    return messages;
  } catch (e) {
    return [];
  }
}

async function main() {
  const chatDataDir = path.join(process.cwd(), 'chat data');
  const allMessages: ChatMessage[] = [];

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
    .filter(msg => msg.content && msg.sender && !isNaN(msg.timestamp))
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

  fs.writeFileSync(path.join(process.cwd(), 'public', 'pre-parsed-data.json'), JSON.stringify(uniqueMessages));
  console.log(`Pre-parsed ${uniqueMessages.length} messages.`);
}

main();
