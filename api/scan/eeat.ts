import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import * as cheerio from "cheerio";
import { requireAuth } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "URL is required" });

  const targetUrl = String(url).startsWith("http") ? String(url) : `https://${url}`;

  try {
    const response = await axios.get(targetUrl, {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const html = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    const $ = cheerio.load(html);

    const checks = [
      {
        id: "ssl",
        name: "SSL Certificate (HTTPS)",
        status: targetUrl.startsWith("https") ? "Pass" : "Fail",
        detail: targetUrl.startsWith("https") ? "HTTPS enabled" : "HTTPS not detected",
      },
      {
        id: "title_check",
        name: "Title Tag",
        status: $("title").text().trim() ? "Pass" : "Fail",
        detail: $("title").text().trim() ? "Title detected" : "Missing title tag",
      },
      {
        id: "h1_count",
        name: "H1 Tag Count",
        status: $("h1").length === 1 ? "Pass" : "Fail",
        detail: `Found ${$("h1").length} H1 tag(s)`,
      },
    ];

    const passed = checks.filter((c) => c.status === "Pass").length;
    const score = Math.round((passed / checks.length) * 100);

    return res.json({
      url: targetUrl,
      score,
      summary: { passed, failed: checks.length - passed, total: checks.length },
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: `Audit failed: ${error?.message || "unknown error"}` });
  }
}
