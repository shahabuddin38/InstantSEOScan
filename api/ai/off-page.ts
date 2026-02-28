import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../../lib/auth";
import { generateAI } from "../../lib/gemini";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { task, data } = req.body || {};
  let prompt = "";

  if (task === "backlinks") {
    prompt = `Generate backlink strategy ideas for niche: "${data?.niche}". Return JSON with keys: guestPosts, outreachTemplate, anchorTexts, directories.`;
  } else if (task === "outreach") {
    prompt = `Generate outreach content for goal: "${data?.goal}" in niche "${data?.niche}". Return JSON with keys: emailTemplate, bloggerMessage, collaborationProposal.`;
  } else if (task === "competitor") {
    prompt = `Analyze competitor info: "${data?.competitorInfo}". Return JSON with keys: styleAnalysis, linkIdeas, topicGaps.`;
  } else if (task === "social") {
    prompt = `Generate social SEO support for topic: "${data?.topic}". Return JSON with keys: captions, metaVariants, twitterPost, linkedinPost.`;
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
