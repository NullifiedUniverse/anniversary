export interface ChatMessage {
  sender: string;
  timestamp: number;
  content: string;
}

export async function parseFiles(files: File[]): Promise<ChatMessage[]> {
  let allMessages: ChatMessage[] = [];

  for (const file of files) {
    const text = await file.text();
    if (file.name.endsWith('.json')) {
      allMessages = allMessages.concat(parseJson(text));
    } else if (file.name.endsWith('.html')) {
      allMessages = allMessages.concat(parseHtml(text));
    }
  }

  // Sort by timestamp ascending
  return allMessages.sort((a, b) => a.timestamp - b.timestamp);
}

function parseJson(text: string): ChatMessage[] {
  try {
    const data = JSON.parse(text);
    const messages: ChatMessage[] = [];

    // Instagram JSON format usually has a "messages" array
    if (data.messages && Array.isArray(data.messages)) {
      for (const msg of data.messages) {
        if (msg.content && msg.sender_name && msg.timestamp_ms) {
          messages.push({
            sender: msg.sender_name,
            timestamp: msg.timestamp_ms,
            content: msg.content,
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
    
    // Instagram HTML exports typically have messages in divs with specific classes.
    // We'll try a generic approach: look for elements that might be messages.
    // Often, they are structured as: Sender Name -> Message Content -> Timestamp
    
    // A common pattern in IG HTML exports:
    // <div class="pam _3-95 _2pi0 _2lej uiBoxWhite noborder">
    //   <div class="_3-96 _2pio _2lek _2lel">Sender Name</div>
    //   <div class="_3-96 _2let"><div><div></div><div>Message Content</div></div></div>
    //   <div class="_3-94 _2lem">Timestamp</div>
    // </div>
    
    // Let's try to find blocks that look like messages
    const possibleMessageBlocks = doc.querySelectorAll('.pam, .uiBoxWhite, .message');
    
    if (possibleMessageBlocks.length > 0) {
      possibleMessageBlocks.forEach(block => {
        const divs = block.querySelectorAll('div');
        if (divs.length >= 3) {
           // Very rough heuristic
           const sender = divs[0]?.textContent?.trim();
           const content = divs[1]?.textContent?.trim();
           const timeStr = divs[divs.length - 1]?.textContent?.trim();
           
           if (sender && content && timeStr) {
             const timestamp = new Date(timeStr).getTime();
             if (!isNaN(timestamp)) {
               messages.push({ sender, content, timestamp });
             }
           }
        }
      });
    } else {
      // Fallback: just extract all text if we can't find specific blocks, 
      // though this won't give us structured messages easily.
      // We'll skip fallback for now to avoid garbage data, or we could try another heuristic.
      const allDivs = doc.querySelectorAll('div');
      let currentSender = '';
      let currentContent = '';
      
      for (let i = 0; i < allDivs.length; i++) {
        const text = allDivs[i].textContent?.trim();
        if (!text) continue;
        
        // If it looks like a date
        const date = new Date(text);
        if (!isNaN(date.getTime()) && text.length > 10) {
           if (currentSender && currentContent) {
             messages.push({
               sender: currentSender,
               content: currentContent,
               timestamp: date.getTime()
             });
             currentSender = '';
             currentContent = '';
           }
        } else if (!currentSender) {
          currentSender = text;
        } else {
          currentContent += text + ' ';
        }
      }
    }
    
    return messages;
  } catch (e) {
    console.error("Failed to parse HTML", e);
    return [];
  }
}
