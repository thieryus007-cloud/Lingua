
import { GoogleGenAI, Type } from "@google/genai";

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
  const excludedSample = existingWords.slice(-50).join(", ");

  const prompt = `
    Génère une liste de ${count} noms communs concrets UNIQUES qui s'écrivent exactement de la même façon en Français et en Italien (vrais amis).
    
    Mots à EXCLURE (déjà générés) : ${excludedSample || "Aucun"}.

    Règles :
    1. Orthographe strictement IDENTIQUE.
    2. Mots concrets faciles à visualiser (objets, animaux, nature).
    3. Pas de concepts abstraits.
    4. JSON uniquement.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
      model: "gemini-2.5-flash-image",
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
    return `https://picsum.photos/seed/${word}/800/800`;
  }
};
