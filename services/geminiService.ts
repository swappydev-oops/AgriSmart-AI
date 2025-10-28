import { GoogleGenAI, Chat, Part, Type } from "@google/genai";
// FIX: Import MutableRefObject to fix React namespace error.
import type { MutableRefObject } from 'react';
import type { UserProfile, BotType } from '../types';
import { mockTutorialVideos } from '../data/mockData';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageDirective = (language: 'en' | 'mr' | 'hi'): string => {
  const langMap = {
    en: "English",
    mr: "Marathi",
    hi: "Hindi"
  };
  return `Please respond exclusively in ${langMap[language]}.`;
};

const getBaseSystemInstruction = (userProfile: UserProfile): string => {
  return `You are AgriSmart AI, an expert agricultural assistant for farmers.
  Your user's details are:
  - Location: ${userProfile.tashil}, ${userProfile.district}, ${userProfile.state}, ${userProfile.country}.
  
  Provide concise, actionable, and easy-to-understand advice. Be friendly and supportive.`;
};

const agricultureSystemInstruction = (userProfile: UserProfile): string => `
  ${getBaseSystemInstruction(userProfile)}
  Your role is to provide comprehensive guidance on crop cultivation. This includes suggesting the best crops for their location and season, recommending fertilizers, planning irrigation schedules, and creating step-by-step cultivation calendars.
  
  Available tutorial videos for recommendation:
  ${mockTutorialVideos.filter(v => v.tags.includes('agriculture')).map(v => `- "${v.title.en}"`).join('\n')}
  
  If the user's query is related to one of these topics, recommend the relevant video by its full title in your response.
`;

const pestSystemInstruction = (userProfile: UserProfile): string => `
  ${getBaseSystemInstruction(userProfile)}
  Your primary role is to identify pests and diseases from images and provide detailed treatment plans.
  If an image is provided, prioritize its analysis. Your response should be structured:
  1.  **Identification:** Clearly state the likely pest or disease.
  2.  **Explanation:** Briefly describe the issue and its potential impact.
  3.  **Treatment Plan:** Provide clear, numbered steps for both organic and chemical treatment options.
  4.  **Prevention:** Offer advice to prevent future occurrences.
  
  Available tutorial videos for recommendation:
  ${mockTutorialVideos.filter(v => v.tags.includes('pest')).map(v => `- "${v.title.en}"`).join('\n')}
  
  If the user's query is related to one of these topics, recommend the relevant video by its full title in your response.
`;

const buyerSystemInstruction = (userProfile: UserProfile): string => `
  ${getBaseSystemInstruction(userProfile)}
  Your role is to act as a market and buyer assistant. Analyze local market trends, provide the latest prices from nearby markets (mandis), and suggest the best places or buyers to sell crops for a better price. You can also provide a "Sell Smart" comparison of different buyer offers if asked.
`;

const weatherSystemInstruction = (userProfile: UserProfile): string => `
  ${getBaseSystemInstruction(userProfile)}
  Your role is to be a dedicated weather expert. Provide detailed weather forecasts for the user's location. Answer specific questions about rain, wind, humidity, and temperature. Explain how upcoming weather conditions might impact their crops and offer proactive advice.
`;

const getSystemInstruction = (botType: BotType, userProfile: UserProfile): string => {
  switch (botType) {
    case 'agriculture':
      return agricultureSystemInstruction(userProfile);
    case 'pest':
      return pestSystemInstruction(userProfile);
    case 'buyer':
      return buyerSystemInstruction(userProfile);
    case 'weather':
        return weatherSystemInstruction(userProfile);
    default:
      return getBaseSystemInstruction(userProfile);
  }
};

export async function getChatResponse(
  // FIX: Use MutableRefObject type directly instead of React.MutableRefObject.
  chatRef: MutableRefObject<Chat | null>,
  botType: BotType,
  userProfile: UserProfile,
  language: 'en' | 'mr' | 'hi',
  prompt: string,
  base64Image: string | null,
  imageMimeType: string | null
): Promise<string> {

  const systemInstruction = `${getSystemInstruction(botType, userProfile)} ${getLanguageDirective(language)}`;

  // Start a new chat session if it's a new bot type or doesn't exist
  if (!chatRef.current) {
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction: systemInstruction },
    });
  }

  try {
    const parts: Part[] = [];
    if (prompt) {
      parts.push({ text: prompt });
    }
    if (base64Image && imageMimeType) {
      parts.push({
        inlineData: {
          data: base64Image,
          mimeType: imageMimeType,
        },
      });
    }

    if (parts.length === 0) {
      return "Please provide some input.";
    }

    // FIX: The `sendMessage` method expects the message content wrapped in a message object.
    const response = await chatRef.current.sendMessage({ message: parts });
    return response.text;

  } catch (error) {
    console.error("Gemini API error:", error);
    chatRef.current = null; // Reset chat on error
    if (error instanceof Error) {
        if (error.message.includes('NETWORK_ERROR')) {
            throw new Error('Could not connect to AI service. Please check your connection.');
        }
    }
    throw new Error('Analysis failed, please try again.');
  }
}
