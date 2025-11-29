import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Fail gracefully if no key, but code structure assumes it exists per prompt instructions

let aiClient: GoogleGenAI | null = null;

try {
  if (apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
  }
} catch (error) {
  console.error("Failed to initialize Gemini client:", error);
}

export const getSupportResponse = async (userMessage: string, context: string): Promise<string> => {
  if (!aiClient) return "AI Support is currently unavailable. Please contact human support.";

  try {
    const model = 'gemini-2.5-flash';
    const systemPrompt = `You are the AI Support Agent for NepBet, a premium online casino in Nepal. 
    Your tone is professional, helpful, and friendly.
    
    Context:
    ${context}
    
    Rules:
    - Answer questions about deposits (min 500 NPR), withdrawals, and game rules (Crash, Mines, Dice).
    - Do not give financial advice.
    - Keep answers concise (under 50 words unless complex).
    - If user asks about "winning hacks", strictly deny and mention fair play.
    `;

    const response = await aiClient.models.generateContent({
      model: model,
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the server right now.";
  }
};