import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma.js";

/**
 * GET /api/sitemap/posts
 *
 * Dynamically generates an XML sitemap containing every published
 * blog post. Google (and other crawlers) reach this via the
 * sitemap index at /sitemap.xml.
 *
 * Returns: application/xml
 */
export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
) {
  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        slug: true,
        updatedAt: true,
        coverImage: true,
        title: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const BASE = "https://instantseoscan.com";

    const urlEntries = posts
      .map((p) => {
        const lastmod = p.updatedAt
          ? p.updatedAt.toISOString().slice(0, 10)
          : "2026-03-07";

        const imageTag = p.coverImage
          ? `
      <image:image>
        <image:loc>${escapeXml(p.coverImage)}</image:loc>
        <image:title>${escapeXml(p.title)}</image:title>
      </image:image>`
          : "";

        return `  <url>
    <loc>${BASE}/blog/${escapeXml(p.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>${imageTag}
  </url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  InstantSEOScan – Blog Post Sitemap
  Auto-generated from the CMS database.
  Total posts: ${posts.length}
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
    return res.status(200).send(xml);
  } catch (err) {
    console.error("[sitemap/posts] Error:", err);
    // Return a valid but empty sitemap so crawlers don't break
    const empty = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.status(200).send(empty);
  }
}

/** Escape special XML characters */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
