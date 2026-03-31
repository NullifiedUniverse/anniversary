export interface ChatMessage {
  sender: string;
  timestamp: number;
  content: string;
}

export async function parseFiles(files: File[]): Promise<ChatMessage[]> {
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
    // Round timestamp to nearest second to handle minor variations between exports
    const secondTs = Math.floor(msg.timestamp / 1000) * 1000;
    const key = `${msg.sender}-${secondTs}-${msg.content}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMessages.push(msg);
    }
  }

  return uniqueMessages;
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

    // Instagram JSON format usually has a "messages" array
    // It can be top-level or nested under some keys
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
        // Handle different possible key names (IG changes them occasionally)
        const sender = decodeIGString(msg.sender_name || msg.sender || "");
        const content = decodeIGString(msg.content || msg.text || msg.share?.link || msg.media?.uri || "");
        const timestamp = msg.timestamp_ms || msg.timestamp || (msg.created_at ? new Date(msg.created_at).getTime() : null);

        if (sender && content && timestamp) {
          messages.push({
            sender: String(sender),
            timestamp: Number(timestamp),
            content: String(content),
          });
        }
      }
    }
    return messages;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return [];
  }
}

function parseHtml(text: string): ChatMessage[] {
  const messages: ChatMessage[] = [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    
    // Strategy 1: Look for modern IG HTML export structure (divs with specific classes)
    const messageBlocks = doc.querySelectorAll('.pam, ._3-95, ._2pi0, .uiBoxWhite');
    
    if (messageBlocks.length > 0) {
      messageBlocks.forEach(block => {
        // Try to find sender, content, and timestamp within the block
        const sender = block.querySelector('h2, ._3-96, ._2pio, ._2lek, ._2lel')?.textContent?.trim();
        const content = block.querySelector('._3-95._a6-p, ._3-96._2let, ._2let, div > div > div:nth-child(2)')?.textContent?.trim();
        const timestampStr = block.querySelector('._3-94, ._2lem, ._a3sc')?.textContent?.trim();
        
        if (sender && content && timestampStr) {
          const timestamp = new Date(timestampStr).getTime();
          if (!isNaN(timestamp)) {
            messages.push({ sender, content, timestamp });
          }
        }
      });
    }

    // Strategy 2: If Strategy 1 failed or missed messages, try a more generic approach
    if (messages.length === 0) {
      // Look for message containers that usually have a sender name in bold or specific heading
      const allDivs = Array.from(doc.querySelectorAll('div'));
      
      for (let i = 0; i < allDivs.length; i++) {
        const div = allDivs[i];
        // Common pattern: Sender name is often in a div followed by content and then a date
        if (div.children.length === 0 && div.textContent?.trim()) {
          const text = div.textContent.trim();
          // Heuristic: If it's a short string (likely a name) and the next sibling is longer
          if (text.length > 0 && text.length < 50) {
            const nextDiv = div.nextElementSibling;
            const dateDiv = nextDiv?.nextElementSibling;
            
            if (nextDiv && dateDiv) {
              const content = nextDiv.textContent?.trim();
              const dateStr = dateDiv.textContent?.trim();
              const timestamp = dateStr ? new Date(dateStr).getTime() : NaN;
              
              if (content && !isNaN(timestamp)) {
                messages.push({ sender: text, content, timestamp });
                i += 2; // Skip the next two divs since we used them
              }
            }
          }
        }
      }
    }
    
    return messages;
  } catch (e) {
    console.error("Failed to parse HTML", e);
    return [];
  }
}

