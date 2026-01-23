
import { GoogleGenAI, Type } from "@google/genai";
import { SlangCollection } from "../types.ts";

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
          exampleSentence: { type: Type.STRING },
          coachTip: { type: Type.STRING, description: "A 'Coach' style tip on how to deliver the slang properly or social pitfalls to avoid" }
        },
        required: ["term", "meaning", "intensity", "usageContext", "exampleSentence", "coachTip"]
      }
    }
  },
  required: ["location", "cultureNote", "slangs"]
};

export const fetchSlangData = async (location: string): Promise<SlangCollection> => {
  // Use the exact required initialization syntax
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the world's leading regional dialect and slang expert. 
      Provide a list of 8-10 authentic slangs, street expressions, and regional insults (abuse) for: ${location}. 
      Include a mix of intensities from friendly daily street talk to stronger regional insults.
      The 'coachTip' should be witty and helpful, like a street-smart mentor.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: slangSchema,
        temperature: 0.85,
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
