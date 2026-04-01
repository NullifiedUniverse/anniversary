import { describe, it, expect } from 'vitest';
import { parseFiles } from '../parser';

describe('parser lib', () => {
  it('decodes weird IG JSON encoding correctly', async () => {
    const jsonContent = JSON.stringify({
      messages: [
        {
          sender_name: "NullifiedGalaxy",
          content: "I love you \u00f0\u009f\u00a4\u008d",
          timestamp_ms: 1648728000000
        }
      ]
    });

    const file = new File([jsonContent], 'messages.json', { type: 'application/json' });
    const { messages } = await parseFiles([file]);

    expect(messages).toHaveLength(1);
    expect(messages[0].content).toContain('🤍'); // \u00f0\u009f\u00a4\u008d is White Heart emoji
  });

  it('handles HTML files', async () => {
    const htmlContent = `
      <div class="_3-95">
        <div class="_3-96">NullifiedGalaxy</div>
        <div class="_3-96 _2let">Hello Yun!</div>
        <div class="_3-94">Mar 31, 2025, 12:00 PM</div>
      </div>
    `;
    const file = new File([htmlContent], 'messages.html', { type: 'text/html' });
    const { messages } = await parseFiles([file]);

    expect(messages).toHaveLength(1);
    expect(messages[0].sender).toBe('NullifiedGalaxy');
    expect(messages[0].content).toBe('Hello Yun!');
  });

  it('handles nested messages in JSON', async () => {
    const jsonContent = JSON.stringify({
      data: {
        chat: {
          messages: [
            { sender_name: "A", content: "B", timestamp_ms: 123 }
          ]
        }
      }
    });
    const file = new File([jsonContent], 'nested.json', { type: 'application/json' });
    const { messages } = await parseFiles([file]);
    expect(messages).toHaveLength(1);
  });

  it('handles HTML Strategy 2 (older Instagram format)', async () => {
    const htmlContent = `
      <div class="pam _3-95">
        <div class="_3-96">Sender Name</div>
        <div class="_2let">Message Content</div>
        <div class="_3-94">Mar 31, 2025, 12:00 PM</div>
      </div>
    `;
    const file = new File([htmlContent], 'strategy2.html', { type: 'text/html' });
    const { messages } = await parseFiles([file]);
    expect(messages.length).toBeGreaterThan(0);
  });

  it('handles invalid JSON', async () => {
    const file = new File(['invalid'], 'invalid.json', { type: 'application/json' });
    const { messages } = await parseFiles([file]);
    expect(messages).toHaveLength(0);
  });
});
