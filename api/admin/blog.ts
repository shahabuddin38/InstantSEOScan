import type { VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma";
import { withAuth } from "../../middleware/withAuth";

export default withAuth(async function handler(req: any, res: VercelResponse) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });

  if (req.method === "GET") {
    const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(posts);
  }

  if (req.method === "POST") {
    const { title, slug, content, author } = req.body;
    const post = await prisma.blogPost.create({
      data: { title, slug, content, author },
    });
    return res.json(post);
  }

  res.status(405).end();
});
