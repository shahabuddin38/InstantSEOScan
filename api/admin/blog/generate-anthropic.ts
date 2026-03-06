import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { prisma } from "../../../lib/prisma.js";
import { verifyToken } from "../../../lib/auth.js";

const bodySchema = z.object({
  topic: z.string().min(3),
});

const parseAiJson = (raw: string, fallback: any = null) => {
  const text = String(raw || "").trim();
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
    if (fenced) {
      try {
        return JSON.parse(fenced.trim());
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
};

const getAnthropicApiKey = async () => {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["CLAUDE_API_KEY", "ANTHROPIC_API_KEY"] } },
  });
  const map = new Map(settings.map((item) => [item.key, item.value]));
  const key =
    String(map.get("CLAUDE_API_KEY") || map.get("ANTHROPIC_API_KEY") || process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "").trim();
  return key || null;
};

const generateDraft = async (topic: string) => {
  const apiKey = await getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key missing. Set CLAUDE_API_KEY or ANTHROPIC_API_KEY in Admin Settings.");
  }

  const prompt = `You are an expert SEO content writer. Create a complete blog draft about: "${topic}".
Return STRICT JSON only (no markdown, no extra text) with this exact shape:
{
  "title": "SEO-friendly title",
  "slug": "seo-friendly-slug",
  "excerpt": "Compelling summary under 160 chars",
  "content": "Full blog content in plain text with headings and paragraphs"
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
      max_tokens: 2500,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Anthropic request failed (${response.status})`);
  }

  const payload = await response.json();
  const outputText = Array.isArray(payload?.content)
    ? payload.content
        .filter((chunk: any) => chunk?.type === "text")
        .map((chunk: any) => String(chunk?.text || ""))
        .join("\n")
    : "";

  const parsed = parseAiJson(outputText, null);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Anthropic did not return valid JSON.");
  }

  return {
    title: String((parsed as any).title || topic).trim(),
    slug: String((parsed as any).slug || topic).trim(),
    excerpt: String((parsed as any).excerpt || "").trim(),
    content: String((parsed as any).content || "").trim(),
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Use POST with { topic } to generate an Anthropic blog draft.",
      path: "/api/admin/blog/generate-anthropic",
    });
  }

  if (req.method !== "POST") return res.status(405).end();

  let user: any;
  try {
    user = await verifyToken(req);
  } catch (err: any) {
    return res.status(401).json({ error: err?.message || "Unauthorized" });
  }

  if (user?.role !== "admin") return res.status(403).json({ error: "Admin only" });

  const parsed = bodySchema.safeParse((req as any).body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  try {
    const draft = await generateDraft(parsed.data.topic);
    return res.status(200).json(draft);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Failed to generate Anthropic blog draft" });
  }
}
