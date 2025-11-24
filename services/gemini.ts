import { GoogleGenAI, Type } from "@google/genai";
import { APP_CONFIG } from "./config";

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a batch of words.
 * @param count Number of words to generate
 * @param existingWords Array of words to exclude
 */
export const generateNewWordsBatch = async (count: number, existingWords: string[]): Promise<string[]> => {
  const ai = getAiClient();

  // We send a sample of existing words to help the AI avoid duplicates,
  // but not the whole list if it's huge to save context.
  const excludedSample = existingWords.slice(-APP_CONFIG.MAX_EXCLUDED_WORDS_SAMPLE).join(", ");

  const prompt = `
    Génère une liste de ${count} noms communs concrets UNIQUES qui s'écrivent exactement de la même façon en Français et en Italien (vrais amis).
    
    Mots à EXCLURE (déjà générés) : ${excludedSample || "Aucun"}.

    Règles :
    1. Orthographe strictement IDENTIQUE (ex: "piano", "banana", "radio", "robot").
    2. Mots concrets faciles à visualiser (objets, animaux, nature).
    3. Pas de concepts abstraits.
    4. JSON uniquement.
  `;

  try {
    const response = await ai.models.generateContent({
      model: APP_CONFIG.GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
            },
            required: ["word"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text) as { word: string }[];
    
    // Double check filtering on client side
    const freshWords = data
      .map(item => item.word)
      .filter(w => !existingWords.includes(w));

    return freshWords;

  } catch (error) {
    console.error("Error generating word list:", error);
    throw error;
  }
};

/**
 * Generates an image for a specific word.
 */
export const generateImageForWord = async (word: string): Promise<string> => {
  const ai = getAiClient();
  
  const prompt = `Une photographie artistique, haute résolution, cinématique de : ${word}. Lumière naturelle, esthétique minimale, centré.`;

  try {
    const response = await ai.models.generateContent({
      model: APP_CONFIG.GEMINI_IMAGE_MODEL,
      contents: prompt,
      config: {}
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data generated");
  } catch (error) {
    console.error(`Error generating image for ${word}:`, error);
    return `${APP_CONFIG.FALLBACK_IMAGE_URL}/${word}/${APP_CONFIG.MAX_IMAGE_SIZE}/${APP_CONFIG.MAX_IMAGE_SIZE}`;
  }
};

/**
 * Analyzes an uploaded image to find a matching FR/IT word.
 */
export const identifyWordFromImage = async (base64Image: string): Promise<string | null> => {
  const ai = getAiClient();
  
  // Strip the prefix usually attached to browser FileReader results (e.g., "data:image/jpeg;base64,")
  const base64Data = base64Image.split(',')[1];

  const prompt = `
    Regarde cette image. Identifie l'objet principal.
    Si le mot pour cet objet s'écrit EXACTEMENT de la même façon en Français et en Italien (ex: Piano, Taxi, Radio, Lion), retourne ce mot.
    Si le mot est différent (ex: Chien/Cane, Voiture/Macchina), retourne NULL.
    
    Réponds uniquement au format JSON : { "word": "LE_MOT_OU_NULL" }
  `;

  try {
    const response = await ai.models.generateContent({
        model: APP_CONFIG.GEMINI_TEXT_MODEL,
        contents: {
            parts: [
                { inlineData: { mimeType: "image/jpeg", data: base64Data } },
                { text: prompt }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING, nullable: true }
                }
            }
        }
    });

    const text = response.text;
    if(!text) return null;
    const json = JSON.parse(text);
    return json.word || null;

  } catch (error) {
    console.error("Error identifying image:", error);
    return null;
  }
}
