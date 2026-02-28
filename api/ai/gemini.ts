import type { VercelResponse } from "@vercel/node";
import { withAuth } from "../../middleware/withAuth";
import { generateAI } from "../../lib/gemini";

export default withAuth(async function handler(req: any, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { action, payload } = req.body;
  
  const responses: Record<string, string> = {
    health: "Health check ok",
    insights: `Analyze these SEO insights: ${JSON.stringify(payload)}`,
    keywords: `Suggest keyword strategies for: ${JSON.stringify(payload)}`,
  };

  const prompt = responses[action] || `Generate SEO insights for: ${JSON.stringify(payload)}`;
  
  if (action === "health") return res.json({ message: "API working" });

  try {
    const result = await generateAI(prompt, {});
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "AI failed" });
  }
});
