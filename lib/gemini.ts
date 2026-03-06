import { GoogleGenAI } from "@google/genai";
import { prisma } from "./prisma.js";

type GeminiKeySlot = 1 | 2 | 3;

type GeminiKeyCandidate = {
  slot: GeminiKeySlot;
  keyName: string;
  keyValue: string;
  usageKey: string;
  limitKey: string;
  usage: number;
  limit: number | null;
};

type GeminiKeyStat = {
  slot: GeminiKeySlot;
  key: string;
  configured: boolean;
  usage: number;
  limit: number | null;
  remaining: number | null;
  status: "available" | "limited" | "missing";
};

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
  const candidates = await getGeminiCandidates();
  const keys = candidates.map((candidate) => candidate.keyValue);

  if (keys.length === 0) {
    const settings = await loadGeminiSettings();
    const legacy = settings.get("GEMINI_API_KEY") || process.env.GEMINI_API_KEY;
    if (legacy && legacy.trim()) keys.push(legacy.trim());
  }

  if (process.env.GEMINI_API_KEY && !keys.includes(process.env.GEMINI_API_KEY)) {
    keys.push(process.env.GEMINI_API_KEY);
  }

  return keys;
}

const keySlots: GeminiKeySlot[] = [1, 2, 3];

const keyNameForSlot = (slot: GeminiKeySlot) => `GEMINI_API_KEY_${slot}`;
const usageKeyForSlot = (slot: GeminiKeySlot) => `GEMINI_API_KEY_${slot}_USAGE`;
const limitKeyForSlot = (slot: GeminiKeySlot) => `GEMINI_API_KEY_${slot}_LIMIT`;

const parsePositiveInt = (value: string | undefined | null): number | null => {
  const num = Number(String(value || "").trim());
  if (!Number.isFinite(num)) return null;
  if (num <= 0) return null;
  return Math.floor(num);
};

async function loadGeminiSettings() {
  const keys = [
    "GEMINI_API_KEY",
    "CLAUDE_API_KEY",
    "ANTHROPIC_API_KEY",
    ...keySlots.flatMap((slot) => [keyNameForSlot(slot), usageKeyForSlot(slot), limitKeyForSlot(slot)]),
  ];
  const settings: Array<{ key: string; value: string }> = await (prisma as any).setting.findMany({
    where: { key: { in: keys } },
  });
  return new Map(settings.map((setting) => [setting.key, setting.value]));
}

async function getGeminiCandidates(): Promise<GeminiKeyCandidate[]> {
  const settings = await loadGeminiSettings();
  const candidates: GeminiKeyCandidate[] = [];

  for (const slot of keySlots) {
    const keyName = keyNameForSlot(slot);
    const keyValue = String(settings.get(keyName) || "").trim();
    if (!keyValue) continue;

    const usageKey = usageKeyForSlot(slot);
    const limitKey = limitKeyForSlot(slot);
    const usage = parsePositiveInt(settings.get(usageKey)) || 0;
    const limit = parsePositiveInt(settings.get(limitKey));

    if (limit !== null && usage >= limit) continue;

    candidates.push({
      slot,
      keyName,
      keyValue,
      usageKey,
      limitKey,
      usage,
      limit,
    });
  }

  return candidates;
}

async function incrementUsage(usageKey: string) {
  const existing = await (prisma as any).setting.findUnique({ where: { key: usageKey } });
  const current = parsePositiveInt(existing?.value) || 0;
  const next = current + 1;
  await (prisma as any).setting.upsert({
    where: { key: usageKey },
    update: { value: String(next) },
    create: { key: usageKey, value: String(next) },
  });
}

export async function getGeminiApiKeyStats(): Promise<GeminiKeyStat[]> {
  const settings = await loadGeminiSettings();

  return keySlots.map((slot) => {
    const key = keyNameForSlot(slot);
    const configured = Boolean(String(settings.get(key) || "").trim());
    const usage = parsePositiveInt(settings.get(usageKeyForSlot(slot))) || 0;
    const limit = parsePositiveInt(settings.get(limitKeyForSlot(slot)));
    const remaining = limit === null ? null : Math.max(0, limit - usage);

    let status: GeminiKeyStat["status"] = "missing";
    if (configured) {
      status = remaining === 0 && limit !== null ? "limited" : "available";
    }

    return {
      slot,
      key,
      configured,
      usage,
      limit,
      remaining,
      status,
    };
  });
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

async function getClaudeApiKey() {
  const settings = await loadGeminiSettings();
  const fromDb = settings.get("CLAUDE_API_KEY") || settings.get("ANTHROPIC_API_KEY");
  const fromEnv = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  const key = String(fromDb || fromEnv || "").trim();
  return key || null;
}

async function tryGenerateWithClaude(apiKey: string, prompt: string, fallback: any) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 2048,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Claude request failed: ${response.status}`);
  }

  const payload = await response.json();
  const text = Array.isArray(payload?.content)
    ? payload.content
        .filter((chunk: any) => chunk?.type === "text")
        .map((chunk: any) => String(chunk?.text || ""))
        .join("\n")
    : "";

  return safeParseJSON(text, fallback);
}

export async function generateAI(prompt: string, fallback: any = {}) {
  const candidates = await getGeminiCandidates();
  const fallbackKeys = await getApiKeys();
  const candidateValues = new Set(candidates.map((candidate) => candidate.keyValue));
  const keys = [
    ...candidates.map((candidate) => ({ apiKey: candidate.keyValue, usageKey: candidate.usageKey })),
    ...fallbackKeys
      .filter((key) => !candidateValues.has(key))
      .map((apiKey) => ({ apiKey, usageKey: null as string | null })),
  ];

  for (let i = 0; i < keys.length; i++) {
    try {
      const current = keys[i];
      const result = await tryGenerate(current.apiKey, prompt, fallback);
      if (current.usageKey) {
        await incrementUsage(current.usageKey);
      }
      return result;
    } catch (error: any) {
      const msg = error?.message || String(error);
      console.error(`generateAI: Key ${i + 1} failed:`, msg.substring(0, 120));
    }
  }

  const claudeApiKey = await getClaudeApiKey();
  if (claudeApiKey) {
    try {
      const result = await tryGenerateWithClaude(claudeApiKey, prompt, fallback);
      return result;
    } catch (error: any) {
      const msg = error?.message || String(error);
      console.error("generateAI: Claude fallback failed:", msg.substring(0, 160));
    }
  }

  if (keys.length === 0 && !claudeApiKey) {
    console.error("generateAI: No Gemini or Claude API key configured.");
  } else {
    console.error("generateAI: All providers exhausted, returning fallback.");
  }
  return fallback;
}
