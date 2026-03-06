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

const keywordToImagePath = (keyword: string) =>
  String(keyword || "blog")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ",")
    .replace(/^,+|,+$/g, "")
    .slice(0, 80) || "blog";

const resolveKeywordImage = (keyword: string, width = 1200, height = 630): string =>
  `https://loremflickr.com/${width}/${height}/${keywordToImagePath(keyword)}`;

const generateDraft = async (topic: string) => {
  const apiKey = await getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key missing. Set CLAUDE_API_KEY or ANTHROPIC_API_KEY in Admin Settings.");
  }

  const prompt = `You are an expert SEO content writer. Create a complete blog draft about: "${topic}".
Return STRICT JSON only (no markdown fences, no extra text) with this exact shape:
{
  "title": "Unique SEO-friendly title (do NOT just repeat the topic)",
  "slug": "unique-seo-friendly-slug",
  "metaDescription": "Compelling meta description under 160 chars for search engines",
  "excerpt": "Engaging summary under 160 chars for blog listing cards",
  "coverImageKeyword": "1-3 word keyword for sourcing a relevant cover photo (e.g. 'seo analytics')",
  "coverImageAlt": "Descriptive alt text for the cover image (accessibility + SEO)",
  "content": "Full blog content in HTML with <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags. Minimum 800 words. Include an <img> tag in the middle with src=PLACEHOLDER_IMG and a descriptive alt attribute."
}
IMPORTANT: The title MUST be unique and creative, not a copy of the topic.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 4000,
      temperature: 0.7,
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

  const coverKeyword = String((parsed as any).coverImageKeyword || topic).trim();
  const coverImageUrl = resolveKeywordImage(coverKeyword, 1200, 630);
  const coverAlt = String((parsed as any).coverImageAlt || `Cover image for ${topic}`).trim();

  let content = String((parsed as any).content || "").trim();
  if (content.includes("PLACEHOLDER_IMG")) {
    content = content.replace(/PLACEHOLDER_IMG/g, resolveKeywordImage(`${coverKeyword} technology`, 800, 450));
  }

  return {
    title: String((parsed as any).title || topic).trim(),
    slug: String((parsed as any).slug || topic).trim(),
    metaDescription: String((parsed as any).metaDescription || "").trim(),
    excerpt: String((parsed as any).excerpt || "").trim(),
    content,
    coverImage: coverImageUrl,
    coverImageAlt: coverAlt,
    coverImageKeyword: coverKeyword,
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
