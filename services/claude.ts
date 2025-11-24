import Anthropic from '@anthropic-ai/sdk';
import { APP_CONFIG } from './config';

let claudeClient: Anthropic | null = null;

/**
 * Get or create Claude client
 */
const getClaudeClient = (): Anthropic => {
  if (!claudeClient) {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY not found in environment variables');
    }
    claudeClient = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  }
  return claudeClient;
};

/**
 * Generate Franco-Italian cognates using Claude AI
 * Claude has better linguistic understanding for identifying true cognates
 */
export const generateCognatesWithClaude = async (
  count: number,
  existingWords: string[]
): Promise<string[]> => {
  const client = getClaudeClient();

  // Only send last N words to avoid huge prompts
  const recentWords = existingWords.slice(-APP_CONFIG.MAX_EXCLUDED_WORDS_SAMPLE);

  const prompt = `Generate ${count} French-Italian cognates (words with IDENTICAL spelling in both languages).

Requirements:
- Words must be spelled EXACTLY the same in French and Italian
- Words must be simple, concrete nouns (things you can photograph)
- Each word must be a single word (no phrases)
- Avoid these already used words: ${recentWords.join(', ')}

Return ONLY a JSON array of words, like: ["mot1", "mot2", "mot3"]

Examples of valid cognates:
- "piano" (FR: piano, IT: piano)
- "radio" (FR: radio, IT: radio)
- "banana" (FR: banane → NO, IT: banana → different spelling)

Generate ${count} new cognates now:`;

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON response
    const text = content.text.trim();
    const jsonMatch = text.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error('No JSON array found in Claude response');
    }

    const words: string[] = JSON.parse(jsonMatch[0]);
    return words.slice(0, count);
  } catch (error) {
    console.error('Error generating cognates with Claude:', error);
    throw error;
  }
};

/**
 * Identify an object from an image using Claude's vision capabilities
 */
export const identifyWordFromImageWithClaude = async (
  imageDataUrl: string
): Promise<string> => {
  const client = getClaudeClient();

  try {
    // Extract base64 data and media type
    const matches = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid image data URL format');
    }

    const mediaType = matches[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    const base64Data = matches[2];

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `Identify the main object in this image in ONE WORD in French. The word should be:
- A simple, concrete noun
- In French
- Spelled identically in Italian (a cognate)

Return ONLY the word, nothing else.

Examples: "piano", "radio", "safari", "ticket"`,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return content.text.trim().toLowerCase();
  } catch (error) {
    console.error('Error identifying word with Claude:', error);
    throw error;
  }
};
