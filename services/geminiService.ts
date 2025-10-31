
import { GoogleGenAI, Type, GenerateContentConfig } from "@google/genai";
import { NewsItem } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const newsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      headline: {
        type: Type.STRING,
        description: 'The main headline of the news article.'
      },
      summary: {
        type: Type.STRING,
        description: 'A one-sentence summary of the article.'
      },
      source: {
        type: Type.STRING,
        description: 'The fictional source of the news, e.g., "TechPulse Today".'
      },
      url: {
        type: Type.STRING,
        description: 'A plausible but fictional URL for the article, e.g., "https://techpulse.com/ai-breakthrough".'
      },
      articleSnippet: {
        type: Type.STRING,
        description: 'A detailed paragraph (3-4 sentences) that could be the introduction of the article.'
      }
    },
    required: ['headline', 'summary', 'source', 'url', 'articleSnippet'],
  },
};

export const fetchTechNews = async (isThinkingMode: boolean): Promise<NewsItem[]> => {
  try {
    const config: GenerateContentConfig = {
      responseMimeType: "application/json",
      responseSchema: newsSchema,
    };

    if (isThinkingMode) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Generate 5 recent, realistic-sounding tech news items. For each, provide a headline, a one-sentence summary, a fictional source, a plausible but fictional URL, and a detailed article snippet (a 3-4 sentence paragraph). The topics are AI, Tech startups, Cybersecurity, Programming, Cloud, and Gadgets. Return the result as a JSON array of objects.`,
      config: config,
    });

    const jsonText = response.text.trim();
    const newsData = JSON.parse(jsonText);
    return newsData;
  } catch (error) {
    console.error("Error fetching tech news:", error);
    throw new Error("Failed to generate news from Gemini API.");
  }
};

export const generateCaption = async (headline: string, summary: string, isThinkingMode: boolean): Promise<string> => {
  try {
    const prompt = `Create an engaging LinkedIn post caption for the following tech news headline: "${headline}". Summary: "${summary}". The caption must include relevant emojis, a concise summary, and an engaging question to spark conversation. Keep it under 250 characters.`;
    
    const model = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const config: GenerateContentConfig = {};

    if (isThinkingMode) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating caption:", error);
    return `Error: Could not generate a caption for "${headline}".`;
  }
};

export const generateImage = async (headline: string): Promise<string> => {
  try {
    const prompt = `A cinematic, ultra-realistic header image for a tech news article about "${headline}". The image should be professional digital art, 4K quality, with dramatic lighting and a futuristic aesthetic.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("No image was generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    // Re-throw the error so the calling component can handle the UI state
    throw error;
  }
};
