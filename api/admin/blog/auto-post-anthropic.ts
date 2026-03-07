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

// ── Image Safety ─────────────────────────────────────────────────────────
// Blocklist: any keyword containing these fragments gets replaced with a safe
// generic business term so we never accidentally pull adult/NSFW imagery.
const NSFW_FRAGMENTS = [
  "sex","porn","nude","naked","adult","xxx","erotic","fetish","nsfw",
  "lingerie","bikini","escort","stripper","mature","onlyfans",
];

const sanitizeImageKeyword = (raw: string): string => {
  const kw = String(raw || "business").toLowerCase().trim();
  const isUnsafe = NSFW_FRAGMENTS.some((f) => kw.includes(f));
  return isUnsafe ? "professional business technology" : kw;
};

// picsum.photos is powered by curated Unsplash professional photography —
// every photo in their library is SFW. Using a pure numeric seed (not a string
// keyword) guarantees the URL always resolves without a 404.
//
// Uniqueness: each call draws a seed from 1 … 9 000 000, combined with the
// current millisecond timestamp, so consecutive bulk posts never share an image.
const resolveKeywordImage = (_keyword: string, width = 1200, height = 630): string => {
  // Numeric seed in range [100_000, 9_000_000] — always resolves on picsum
  const numericSeed = 100_000 + Math.floor(Math.random() * 8_900_000) + (Date.now() % 100_000);
  return `https://picsum.photos/seed/${numericSeed}/${width}/${height}`;
};

// Verify the URL actually resolves (HEAD request). If it fails for any reason
// (network, 404, timeout) fall back to a beautiful SVG placeholder that is
// always available and never corrupted.
const resolveStableKeywordImage = async (keyword: string, width = 1200, height = 630): Promise<string> => {
  const safeKeyword = sanitizeImageKeyword(keyword);
  const url = resolveKeywordImage(safeKeyword, width, height);
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000); // 4 s timeout
    const res = await fetch(url, { method: "HEAD", signal: ctrl.signal, redirect: "follow" });
    clearTimeout(timer);
    if (res.ok) return res.url || url; // follow redirect to stable CDN URL
  } catch {
    // Network failure or timeout — fall through to fresh picsum seed
  }
  // Fallback: another randomised numeric-seed picsum (SFW, never 404)
  const seed2 = 100_000 + Math.floor(Math.random() * 8_900_000);
  return `https://picsum.photos/seed/${seed2}/${width}/${height}`;
};



const generateDraft = async (topic: string, customInstructions?: string) => {
  const apiKey = await getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key missing. Set CLAUDE_API_KEY or ANTHROPIC_API_KEY in Admin Settings.");
  }

  const customPromptSection = customInstructions?.trim()
    ? `\nAdditionally, adhere strictly to these custom instructions: "${customInstructions}"\n`
    : "";

  // Fetch existing blog posts for silo interlinking so new posts link back to related content
  const siloPostsRaw = await prisma.blogPost.findMany({
    select: { slug: true, title: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const siloSection = siloPostsRaw.length > 0
    ? `\nSILO INTERLINKING REQUIREMENT: You MUST include 2-4 contextual anchor-text internal links to these existing published blog posts (pick the most topically relevant — vary anchor text naturally):\n${siloPostsRaw.map((p) => `  - <a href="https://instantseoscan.com/blog/${p.slug}">${p.title}</a>`).join("\n")}\n`
    : "";

  const prompt = `You are a world-class SEO content writer for InstantSEOScan. Write a comprehensive, publication-ready blog article about: "${topic}".${customPromptSection}
Return STRICT JSON only (no markdown fences, no extra text) with this exact shape:
{
  "title": "Unique, compelling SEO title that is creative and NOT a copy of the topic",
  "slug": "seo-friendly-url-slug",
  "metaDescription": "Meta description under 160 characters including primary keyword",
  "excerpt": "Engaging 1-2 sentence summary for blog listing cards under 160 chars",
  "coverImageKeyword": "2-3 word professional keyword for cover photo (e.g. 'seo analytics dashboard')",
  "coverImageAlt": "Descriptive keyword-rich alt text for the cover image",
  "content": "FULL HTML article — ALL requirements below MUST be met: (1) Open with <h1 style='font-size:2rem;font-weight:900;margin-bottom:1rem'>[article title]</h1> (2) ALL <p> tags MUST include style='text-align:justify;line-height:1.8' (3) Write 5-6 <h2> main sections, each with 1-2 <h3> sub-sections and 2-3 justified paragraphs (4) Named Entities: naturally mention real brands/tools like Google Search Console, Semrush, Ahrefs, Moz, Screaming Frog, or other relevant entities from the topic domain (5) N-gram richness: embed 3-5 semantically related 2-4 word keyword phrases per section (6) After the second h2 section insert <img src='PLACEHOLDER_IMG' alt='[descriptive alt]' style='width:100%;border-radius:12px;margin:1.5rem 0;display:block' /> (7) Add a People Also Ask section: <h2 style='font-size:1.5rem;font-weight:800;margin:2rem 0 1rem'>People Also Ask</h2> with 4-5 Q&A pairs each as <div style='border:1px solid #e5e7eb;border-radius:8px;padding:1rem;margin:0.75rem 0'><strong style='display:block;margin-bottom:0.5rem'>Q: [question]</strong><p style='text-align:justify;line-height:1.8;margin:0'>A: [2-3 sentence answer]</p></div> (8) Add a Frequently Asked Questions section: <h2 style='font-size:1.5rem;font-weight:800;margin:2rem 0 1rem'>Frequently Asked Questions</h2> with 5 Q&A pairs in the same format (9) End with <h2>Conclusion</h2> and a 2-3 paragraph justified summary plus a CTA linking to https://instantseoscan.com (10) Include at least 2 <a href='https://instantseoscan.com/[tool]'> internal links to relevant tools such as /tools/corescan /tools/on-page /schema-generator /keyword-density (11) SILO — also contextually link to related published blog posts as instructed above (12) Minimum 1800 words total (13) Use <ul><li> for lists <strong> for key terms <em> for technical terms"
}
IMPORTANT: Return ONLY the JSON. No commentary, no code fences, no extra text.${siloSection}`;

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
