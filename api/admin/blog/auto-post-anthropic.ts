import type { VercelResponse } from "@vercel/node";
import { z } from "zod";
import { prisma } from "../../../lib/prisma.js";
import { verifyToken } from "../../../lib/auth.js";
import type { VercelRequest } from "@vercel/node";

/* ── Schemas ─────────────────────────────────────────── */

const bodySchema = z.object({
  topic: z.string().min(3),
  author: z.string().optional(),
  coverImage: z.string().optional(),
  customInstructions: z.string().optional(),
});

const bulkBodySchema = z.object({
  topics: z.array(z.string().min(3)).min(1).max(10),
  author: z.string().optional(),
  customInstructions: z.string().optional(),
});

/* ── Helpers ─────────────────────────────────────────── */

const slugify = (value: string) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

const uniqueSlug = async (baseSlug: string) => {
  const safeBase = slugify(baseSlug) || `post-${Date.now()}`;
  let attempt = safeBase;
  let suffix = 1;

  while (true) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: attempt } });
    if (!existing) return attempt;
    suffix += 1;
    attempt = `${safeBase}-${suffix}`;
  }
};

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

// Returns a unique Picsum image URL per call — no two posts ever share the same image.
const resolveKeywordImage = (keyword: string, width = 1200, height = 630): string => {
  const kw = String(keyword || "blog")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "blog";
  // Combine keyword + timestamp + random number → guaranteed unique seed per call
  const uniqueSeed = `${kw}-${Date.now()}-${Math.floor(Math.random() * 999999)}`;
  return `https://picsum.photos/seed/${encodeURIComponent(uniqueSeed)}/${width}/${height}`;
};

// Kept async for compatibility; no redirect-following needed with picsum seeds
const resolveStableKeywordImage = async (keyword: string, width = 1200, height = 630): Promise<string> => {
  return resolveKeywordImage(keyword, width, height);
};



const generateDraft = async (topic: string, customInstructions?: string) => {
  const apiKey = await getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key missing. Set CLAUDE_API_KEY or ANTHROPIC_API_KEY in Admin Settings.");
  }

  const customPromptSection = customInstructions?.trim()
    ? `\nAdditionally, adhere strictly to these custom instructions: "${customInstructions}"\n`
    : "";

  const prompt = `You are an expert SEO content writer forming an article for InstantSEOScan. Create a complete blog draft about: "${topic}".${customPromptSection}
Return STRICT JSON only (no markdown fences, no extra text) with this exact shape:
{
  "title": "Unique SEO-friendly title (do NOT just repeat the topic)",
  "slug": "unique-seo-friendly-slug",
  "metaDescription": "Compelling meta description under 160 chars for search engines",
  "excerpt": "Engaging summary under 160 chars for blog listing cards",
  "coverImageKeyword": "1-3 word keyword for sourcing a relevant cover photo (e.g. 'seo analytics')",
  "coverImageAlt": "Descriptive alt text for the cover image (accessibility + SEO)",
  "content": "Full blog content in HTML with <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags. Minimum 800 words. Include an <img> tag in the middle with src=PLACEHOLDER_IMG and a descriptive alt attribute. MUST INCLUDE at least 2 contextual <a> tags pointing to relevant internal tool pages on https://instantseoscan.com (e.g. https://instantseoscan.com/tools/corescan, https://instantseoscan.com/tools/on-page, https://instantseoscan.com/schema-generator, etc)."
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
  const coverImageUrl = await resolveStableKeywordImage(coverKeyword, 1200, 630);
  const coverAlt = String((parsed as any).coverImageAlt || `Cover image for ${topic}`).trim();

  // Replace any PLACEHOLDER_IMG in content with an actual Unsplash inline image
  let content = String((parsed as any).content || "").trim();
  if (content.includes("PLACEHOLDER_IMG")) {
    const inlineImgUrl = await resolveStableKeywordImage(`${coverKeyword} technology`, 800, 450);
    content = content.replace(/PLACEHOLDER_IMG/g, inlineImgUrl);
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

/* ── Utility: create a single post from topic ──────── */

const createPostFromTopic = async (topic: string, author: string, coverImageOverride?: string, customInstructions?: string) => {
  const draft = await generateDraft(topic, customInstructions);
  const resolvedSlug = await uniqueSlug(draft.slug || draft.title);
  const normalizedContent = String(draft.content || "").trim();
  const coverImage = String(coverImageOverride || draft.coverImage || "").trim() || null;

  // Build blocks array with cover image block
  const blocks: any[] = [];
  if (coverImage) {
    blocks.push({
      id: `img-cover-${Date.now()}`,
      type: "image",
      text: "",
      url: coverImage,
      alt: draft.coverImageAlt || `Cover image for ${draft.title}`,
      description: draft.metaDescription || "",
    });
  }

  const post = await prisma.blogPost.create({
    data: {
      title: draft.title,
      slug: resolvedSlug,
      content: normalizedContent,
      excerpt: String(draft.metaDescription || draft.excerpt || normalizedContent.slice(0, 160) || "").trim(),
      coverImage,
      blocks: blocks.length > 0 ? blocks : [],
      author: String(author || "Admin").trim(),
    },
  });

  // Asynchronously notify search engines about the new content - DEPRECATED
  // pingSearchEngines().catch(console.error);

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    author: post.author,
    created_at: post.createdAt,
  };
};

/* ── Handler ─────────────────────────────────────────── */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "POST { topic, author?, coverImage? } for single post, or POST { topics: [...], author? } with action=bulk query param for 10 posts.",
      path: "/api/admin/blog/auto-post-anthropic",
    });
  }

  if (req.method !== "POST") return res.status(405).end();

  // Auth
  let user: any;
  try {
    user = await verifyToken(req);
  } catch (err: any) {
    return res.status(401).json({ error: err?.message || "Unauthorized" });
  }
  if (user?.role !== "admin") return res.status(403).json({ error: "Admin only" });

  // Check for bulk mode
  const url = new URL(req.url || "", "http://localhost");
  const isBulk = url.searchParams.get("action") === "bulk";

  if (isBulk) {
    // ── Bulk mode: create up to 10 posts ──
    const parsed = bulkBodySchema.safeParse((req as any).body || {});
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload. Send { topics: ['topic1', ...], author? }", details: parsed.error.flatten() });
    }

    const { topics, author, customInstructions } = parsed.data;
    const results: any[] = [];
    const errors: any[] = [];

    const batchSize = 3;
    for (let index = 0; index < topics.length; index += batchSize) {
      const batch = topics.slice(index, index + batchSize);
      const settled = await Promise.allSettled(
        batch.map((topic) => createPostFromTopic(topic, author || "Admin", undefined, customInstructions))
      );

      settled.forEach((entry, batchIndex) => {
        const topic = batch[batchIndex];
        if (entry.status === "fulfilled") {
          results.push(entry.value);
          return;
        }

        errors.push({ topic, error: entry.reason?.message || "Failed" });
      });
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      failed: errors.length,
      posts: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  }

  // ── Single post mode ──
  const parsed = bodySchema.safeParse((req as any).body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const { topic, author, coverImage, customInstructions } = parsed.data;

  try {
    const post = await createPostFromTopic(topic, author || "Admin", coverImage, customInstructions);
    return res.status(200).json({ success: true, post });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Failed to auto-post Anthropic blog" });
  }
}
