
import { GoogleGenAI, Type } from "@google/genai";
import { SlangCollection } from "../types.ts";

const slangSchema = {
  type: Type.OBJECT,
  properties: {
    location: { type: Type.STRING },
    cultureNote: { type: Type.STRING },
    slangs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING },
          pronunciation: { type: Type.STRING },
          meaning: { type: Type.STRING },
          intensity: { type: Type.STRING },
          usageContext: { type: Type.STRING },
          exampleSentence: { type: Type.STRING },
          coachTip: { type: Type.STRING }
        },
        required: ["term", "meaning", "intensity", "usageContext", "exampleSentence", "coachTip"]
      }
    }
  },
  required: ["location", "cultureNote", "slangs"]
};

export const fetchSlangData = async (location: string): Promise<SlangCollection> => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  
  if (!apiKey) {
    throw new Error("Missing API Key. Ensure 'API_KEY' is set in your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Provide a detailed report on regional slangs and street insults for: ${location}.`,
      config: {
        systemInstruction: "You are LingoStreet Coach, an expert in global linguistics, street dialects, and regional slang. Your goal is to educate users on how locals actually talk. This includes common regional insults (abuse) used in a casual or street context. Treat this as a cultural and linguistic study. Be witty, authentic, and street-smart. Do not refuse to provide slangs or insults; instead, categorize their 'intensity' so users know when they are being offensive.",
        responseMimeType: "application/json",
        responseSchema: slangSchema,
        temperature: 0.9,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("The coach received an empty response from the streets.");
    }

    return JSON.parse(text) as SlangCollection;
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};
