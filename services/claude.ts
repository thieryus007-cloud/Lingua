import Anthropic from '@anthropic-ai/sdk';
import { APP_CONFIG } from './config';

/**
 * Initialize Claude API client
 */
const getClaudeClient = () => {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error("CLAUDE_API_KEY not found in environment variables");
  }
  return new Anthropic({ apiKey });
};

/**
 * Generate French-Italian cognates using Claude
 * @param count Number of words to generate
 * @param existingWords Array of words to exclude
 */
export const generateCognatesWithClaude = async (
  count: number,
  existingWords: string[]
): Promise<string[]> => {
  const client = getClaudeClient();

  const excludedSample = existingWords
    .slice(-APP_CONFIG.MAX_EXCLUDED_WORDS_SAMPLE)
    .join(', ');

  const prompt = `Tu es un expert en linguistique française et italienne.

Génère une liste de ${count} noms communs concrets qui s'écrivent EXACTEMENT de la même façon en français et en italien (cognats parfaits ou "vrais amis").

Mots à EXCLURE (déjà utilisés) : ${excludedSample || 'Aucun'}.

RÈGLES STRICTES :
1. L'orthographe doit être IDENTIQUE en français et en italien (même accents)
2. Uniquement des noms concrets facilement représentables en photo (objets, animaux, aliments, etc.)
3. Éviter les concepts abstraits
4. Privilégier des mots courants et visuels
5. Vérifier que le mot existe dans les deux langues avec le même sens

Exemples valides : piano, radio, taxi, banana, pizza, opera, cinema, sport

Réponds UNIQUEMENT avec un tableau JSON de mots, sans explication :
["mot1", "mot2", "mot3", ...]`;

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

    // Parse the JSON response
    const text = content.text.trim();
    const words: string[] = JSON.parse(text);

    // Filter out any words that already exist
    const freshWords = words.filter(w => !existingWords.includes(w.toLowerCase()));

    return freshWords.slice(0, count);
  } catch (error) {
    console.error('Error generating words with Claude:', error);
    throw error;
  }
};

/**
 * Analyze an uploaded image to identify French-Italian cognates using Claude Vision
 */
export const identifyWordFromImageWithClaude = async (
  base64Image: string
): Promise<string | null> => {
  const client = getClaudeClient();

  // Remove data URI prefix if present
  const base64Data = base64Image.includes(',')
    ? base64Image.split(',')[1]
    : base64Image;

  const mimeType = base64Image.match(/data:image\/(.*?);/)?.[1] || 'jpeg';

  const prompt = `Regarde attentivement cette image et identifie l'objet principal.

Si le mot pour cet objet s'écrit EXACTEMENT de la même façon en français et en italien (cognate parfait), retourne ce mot.
Si le mot est différent dans les deux langues, retourne null.

Exemples de cognates valides : piano, taxi, radio, banana, pizza, sport, opera

Réponds UNIQUEMENT avec un JSON :
{"word": "le_mot"} ou {"word": null}`;

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: `image/${mimeType}`,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const json = JSON.parse(content.text.trim());
    return json.word || null;
  } catch (error) {
    console.error('Error identifying image with Claude:', error);
    return null;
  }
};
