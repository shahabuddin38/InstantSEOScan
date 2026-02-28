import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  res.json(posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: p.content,
    author: p.author,
    created_at: p.createdAt,
  })));
}
