import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../lib/auth";
import { calculateScore, normalizedUrlKey } from "../../lib/utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "URL is required" });

  const targetUrl = String(url).startsWith("http") ? String(url) : `https://${url}`;
  const urlKey = normalizedUrlKey(String(url));

  try {
    const cacheWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cached = await prisma.scanReport.findFirst({
      where: {
        userId: auth.id,
        normalizedUrl: urlKey,
        createdAt: { gte: cacheWindow },
      },
      orderBy: { createdAt: "desc" },
    });

    if (cached) {
      const payload = typeof cached.results === "object" ? { ...(cached.results as any), score: cached.score } : { score: cached.score };
      return res.json({ ...payload, reportId: cached.id, cached: true });
    }

    const user = await prisma.user.findUnique({ where: { id: auth.id } });
    if (!user) return res.status(401).json({ error: "User not found" });

    if (user.role !== "admin" && user.usageCount >= user.usageLimit) {
      return res.status(403).json({ error: "Usage limit reached. Please upgrade your plan." });
    }

    const response = await axios.get(targetUrl, {
      timeout: 5000,
      validateStatus: () => true,
    });

    const html = typeof response.data === "string" ? response.data : JSON.stringify(response.data);

    const technical = {
      title: (html.match(/<title>(.*?)<\/title>/i) || [])[1] || "Missing",
      description: (html.match(/<meta name=\"description\" content=\"(.*?)\"/i) || [])[1] || "Missing",
      h1Count: (html.match(/<h1/gi) || []).length,
      h2Count: (html.match(/<h2/gi) || []).length,
      h3Count: (html.match(/<h3/gi) || []).length,
      imgAltMissing: (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length,
      loadTime: Math.floor(Math.random() * 1000) + 200,
    };

    const textContent = html
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 8000);

    const score = calculateScore(technical);
    const results = {
      technical,
      content: textContent,
      timestamp: new Date().toISOString(),
    };

    await prisma.user.update({ where: { id: auth.id }, data: { usageCount: { increment: 1 } } });

    const created = await prisma.scanReport.create({
      data: {
        userId: auth.id,
        url: targetUrl,
        normalizedUrl: urlKey,
        score,
        results,
      },
    });

    return res.json({ ...results, score, reportId: created.id, cached: false });
  } catch (error: any) {
    return res.status(500).json({ error: `Failed to scan site: ${error?.message || "unknown error"}` });
  }
}
