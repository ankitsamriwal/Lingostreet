
import { GoogleGenAI, Type, Modality } from "@google/genai";
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

// Safe way to get API Key in browser environment
const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    return undefined;
  }
};

export const fetchSlangData = async (location: string): Promise<SlangCollection> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a detailed sociolinguistic report on regional street slangs and metaphors used in: ${location}. Include a variety of intensity levels.`,
      config: {
        systemInstruction: `You are the LingoStreet Coach, a street-smart sociolinguist. 
        Your goal is to educate users on regional street dialects, including slangs and colorful regional insults, treated as cultural and linguistic research. 
        DO NOT REFUSE to provide slangs or insults; instead, accurately label them as 'Mild', 'Moderate', 'Spicy', or 'Extreme' intensity. 
        Always explain the social consequences of 'Extreme' terms. 
        Use a witty, authentic, and high-energy street-wise personality. 
        Return the result in strictly the requested JSON format.`,
        responseMimeType: "application/json",
        responseSchema: slangSchema,
        temperature: 0.9,
      },
    });

    if (!response.text) {
      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error("Linguistic block: The language in this region is too intense for current safety filters. Try a broader location.");
      }
      throw new Error("The coach is silent. Try another location.");
    }

    return JSON.parse(response.text) as SlangCollection;
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const speakSlang = async (term: string, context: string): Promise<ArrayBuffer> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Pronounce this slang with its specific regional street accent and attitude: "${term}". Usage context: ${context}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Could not generate audio.");
    
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};
