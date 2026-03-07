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

const NSFW_FRAGMENTS_GEN = [
  "sex","porn","nude","naked","adult","xxx","erotic","fetish","nsfw",
  "lingerie","bikini","escort","stripper","mature","onlyfans",
];

const sanitizeImageKeyword = (raw: string): string => {
  const kw = String(raw || "business").toLowerCase().trim();
  return NSFW_FRAGMENTS_GEN.some((f) => kw.includes(f)) ? "professional business technology" : kw;
};

// Unique numeric-seed picsum — curated SFW professional photography, never 404
const resolveKeywordImage = (_keyword: string, width = 1200, height = 630): string => {
  const seed = 100_000 + Math.floor(Math.random() * 8_900_000) + (Date.now() % 100_000);
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
};

const resolveStableKeywordImage = async (keyword: string, width = 1200, height = 630): Promise<string> => {
  const safeKeyword = sanitizeImageKeyword(keyword);
  const url = resolveKeywordImage(safeKeyword, width, height);
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { method: "HEAD", signal: ctrl.signal, redirect: "follow" });
    clearTimeout(timer);
    if (res.ok) return res.url || url;
  } catch { }
  const seed2 = 100_000 + Math.floor(Math.random() * 8_900_000);
  return `https://picsum.photos/seed/${seed2}/${width}/${height}`;
};

const generateDraft = async (topic: string) => {
  const apiKey = await getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key missing. Set CLAUDE_API_KEY or ANTHROPIC_API_KEY in Admin Settings.");
  }

  // Fetch existing blog posts for silo interlinking
  const siloPostsRaw = await prisma.blogPost.findMany({
    select: { slug: true, title: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const siloLinksInline = siloPostsRaw.length > 0
    ? siloPostsRaw.slice(0, 15).map((p) => `<a href="https://instantseoscan.com/blog/${p.slug}" style="color:#059669">${p.title}</a>`).join(" | ")
    : "";
  const siloRequirement = siloLinksInline
    ? `(10) SILO INTERLINKING — you MUST embed 2-4 of the following existing blog post links as natural contextual anchor-text hyperlinks inside the body paragraphs (choose the ones most topically relevant to this article, vary the anchor text naturally, do NOT list them in a bullet, weave them into sentences): ${siloLinksInline} `
    : "(10) ";

  const prompt = `You are a world-class SEO content writer for InstantSEOScan. Write a comprehensive, publication-ready blog article about: "${topic}".
Return STRICT JSON only (no markdown fences, no extra text) with this exact shape:
{
  "title": "Unique, compelling SEO title that is creative and NOT a copy of the topic",
  "slug": "seo-friendly-url-slug",
  "metaDescription": "Meta description under 160 characters including primary keyword",
  "excerpt": "Engaging 1-2 sentence summary for blog listing cards under 160 chars",
  "coverImageKeyword": "2-3 word professional keyword for cover photo (e.g. 'seo analytics dashboard')",
  "coverImageAlt": "Descriptive keyword-rich alt text for the cover image",
  "content": "FULL HTML article — ALL requirements below MUST be met: (1) Open with <h1 style='font-size:2rem;font-weight:900;margin-bottom:1rem'>[article title]</h1> (2) ALL <p> tags MUST include style='text-align:justify;line-height:1.8' (3) Write 5-6 <h2> main sections, each with 1-2 <h3> sub-sections and 2-3 justified paragraphs (4) Named Entities: naturally mention real brands/tools like Google Search Console, Semrush, Ahrefs, Moz, Screaming Frog, or other relevant entities from the topic domain (5) N-gram richness: embed 3-5 semantically related 2-4 word keyword phrases per section (6) After the second h2 section insert <img src='PLACEHOLDER_IMG' alt='[descriptive alt]' style='width:100%;border-radius:12px;margin:1.5rem 0;display:block' /> (7) Add a People Also Ask section: <h2 style='font-size:1.5rem;font-weight:800;margin:2rem 0 1rem'>People Also Ask</h2> with 4-5 Q&A pairs each as <div style='border:1px solid #e5e7eb;border-radius:8px;padding:1rem;margin:0.75rem 0'><strong style='display:block;margin-bottom:0.5rem'>Q: [question]</strong><p style='text-align:justify;line-height:1.8;margin:0'>A: [2-3 sentence answer]</p></div> (8) Add a Frequently Asked Questions section: <h2 style='font-size:1.5rem;font-weight:800;margin:2rem 0 1rem'>Frequently Asked Questions</h2> with 5 Q&A pairs in the same format (9) End with <h2>Conclusion</h2> and a 2-3 paragraph justified summary plus a CTA linking to https://instantseoscan.com ${siloRequirement}(11) Tool page links: also include 2-3 contextual <a href='https://instantseoscan.com/[tool]'> links to relevant tools e.g. /tools/corescan /tools/on-page /schema-generator /keyword-density (12) Minimum 1800 words total (13) Use <ul><li> for lists <strong> for key terms <em> for technical terms"
}
IMPORTANT: Return ONLY the JSON. No commentary, no code fences, no extra text.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 8000,
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
  const coverImageUrl = await resolveStableKeywordImage(coverKeyword, 1200, 630);
  const coverAlt = String((parsed as any).coverImageAlt || `Cover image for ${topic}`).trim();

  let content = String((parsed as any).content || "").trim();
  if (content.includes("PLACEHOLDER_IMG")) {
    content = content.replace(/PLACEHOLDER_IMG/g, await resolveStableKeywordImage(`${coverKeyword} technology`, 800, 450));
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
