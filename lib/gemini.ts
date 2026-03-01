import { GoogleGenAI } from "@google/genai";
import { prisma } from "./prisma.js";

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

async function getApiKeys(): Promise<string[]> {
  const keyNames = ["GEMINI_API_KEY_1", "GEMINI_API_KEY_2", "GEMINI_API_KEY_3"];
  const dbKeys: Array<{ key: string; value: string }> = await (prisma as any).setting.findMany({
    where: { key: { in: [...keyNames, "GEMINI_API_KEY"] } },
  });
  const dbMap = new Map<string, string>(dbKeys.map((s) => [s.key, s.value]));

  const keys: string[] = [];
  for (const name of keyNames) {
    const val = dbMap.get(name);
    if (val && val.trim()) keys.push(val.trim());
  }
  // Legacy single-key fallback (DB then env)
  if (keys.length === 0) {
    const legacy = dbMap.get("GEMINI_API_KEY") || process.env.GEMINI_API_KEY;
    if (legacy && legacy.trim()) keys.push(legacy.trim());
  }
  // Env var as last resort
  if (process.env.GEMINI_API_KEY && !keys.includes(process.env.GEMINI_API_KEY)) {
    keys.push(process.env.GEMINI_API_KEY);
  }
  return keys;
}

async function tryGenerate(apiKey: string, prompt: string, fallback: any) {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });
  return safeParseJSON(response.text, fallback);
}

export async function generateAI(prompt: string, fallback: any = {}) {
  const keys = await getApiKeys();
  if (keys.length === 0) {
    console.error("generateAI: No Gemini API keys configured.");
    return fallback;
  }

  for (let i = 0; i < keys.length; i++) {
    try {
      const result = await tryGenerate(keys[i], prompt, fallback);
      return result;
    } catch (error: any) {
      const msg = error?.message || String(error);
      console.error(`generateAI: Key ${i + 1} failed:`, msg.substring(0, 120));
      // Continue to next key
    }
  }

  console.error("generateAI: All keys exhausted, returning fallback.");
  return fallback;
}
