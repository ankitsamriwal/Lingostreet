
import { GoogleGenAI, Type } from "@google/genai";
import { SlangCollection, Intensity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const slangSchema = {
  type: Type.OBJECT,
  properties: {
    location: { type: Type.STRING, description: "The specific city or region requested" },
    cultureNote: { type: Type.STRING, description: "A brief overview of how people talk in this area" },
    slangs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING },
          pronunciation: { type: Type.STRING },
          meaning: { type: Type.STRING },
          literalTranslation: { type: Type.STRING },
          origin: { type: Type.STRING },
          intensity: { 
            type: Type.STRING, 
            description: "Must be one of: Mild, Moderate, Spicy, Extreme" 
          },
          usageContext: { type: Type.STRING, description: "When and where to use it" },
          exampleSentence: { type: Type.STRING }
        },
        required: ["term", "meaning", "intensity", "usageContext", "exampleSentence"]
      }
    }
  },
  required: ["location", "cultureNote", "slangs"]
};

export const fetchSlangData = async (location: string): Promise<SlangCollection> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a list of 8-10 commonly used slangs, street expressions, and regional insults for: ${location}. 
      Include a mix of intensities from daily street talk to stronger regional 'abuse' or insults used between friends or in heat.
      Be authentic to local culture.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: slangSchema,
        temperature: 0.8,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(response.text) as SlangCollection;
  } catch (error) {
    console.error("Error fetching slang data:", error);
    throw error;
  }
};
