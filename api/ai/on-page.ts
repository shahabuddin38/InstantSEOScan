import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../../lib/auth";
import { generateAI } from "../../lib/gemini";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { task, data } = req.body || {};
  let prompt = "";

  if (task === "meta") {
    prompt = `Generate optimized SEO elements for the following topic/keyword: "${data?.keyword}". Return JSON with keys: title, description, slug, structure.`;
  } else if (task === "content") {
    prompt = `Analyze and optimize this content for SEO: "${data?.content}". Return JSON with keys: optimizedContent, readabilityScore, addedKeywords.`;
  } else if (task === "keywords") {
    prompt = `Generate a basic keyword strategy for: "${data?.keyword}". Return JSON with keys: related, longTail, questions, semantic.`;
  } else if (task === "technical") {
    prompt = `Provide technical on-page SEO suggestions for: "${data?.topic}". Return JSON with keys: altText, internalLinks, schema, mobile, speed.`;
  } else {
    return res.status(400).json({ error: "Invalid task" });
  }

  try {
    const result = await generateAI(prompt, {});
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "AI request failed" });
  }
}
