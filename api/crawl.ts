import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "URL is required" });

  const targetUrl = String(url).startsWith("http") ? String(url) : `https://${url}`;
  const domain = new URL(targetUrl).hostname;

  try {
    const response = await axios.get(targetUrl, {
      timeout: 10000,
      validateStatus: () => true,
    });

    const html = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    const hrefRegex = /href=["'](.*?)["']/gi;
    const links = new Set<string>();

    let match: RegExpExecArray | null;
    while ((match = hrefRegex.exec(html)) !== null) {
      let link = match[1];
      if (link.startsWith("/")) link = `https://${domain}${link}`;
      if (link.includes(domain) && !link.includes("#") && !link.match(/\.(png|jpg|jpeg|gif|css|js|pdf)$/i)) {
        links.add(link);
      }
    }

    res.json({ pages: Array.from(links).slice(0, 50) });
  } catch (error: any) {
    res.status(500).json({ error: `Failed to crawl site: ${error?.message || "unknown error"}` });
  }
}
