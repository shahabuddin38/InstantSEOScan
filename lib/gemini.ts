import { GoogleGenAI } from "@google/genai";

function safeParseJSON(text: string | undefined, fallback: any) {
  const raw = String(text || "").trim();
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch?.[1]) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

const getClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey: key });
};

export async function generateAI(prompt: string, fallback: any = {}) {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });
  return safeParseJSON(response.text, fallback);
}
