import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma";
import { requireAuth, requireAdmin } from "../../lib/auth";
import { slugify } from "../../lib/utils";

const getUniqueSlug = async (title: string, ignoreId?: string) => {
  const base = slugify(title) || `post-${Date.now()}`;
  let candidate = base;
  let counter = 1;
  while (true) {
    const found = await prisma.blogPost.findUnique({ where: { slug: candidate } });
    if (!found || (ignoreId && found.id === ignoreId)) return candidate;
    candidate = `${base}-${counter++}`;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res);
  if (!auth) return;
  if (!requireAdmin(auth, res)) return;

  if (req.method === "GET") {
    const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(
      posts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        author: p.author,
        content: p.content,
        created_at: p.createdAt,
      }))
    );
  }

  if (req.method === "POST") {
    const { title, content, author } = req.body || {};
    if (!title || !content) return res.status(400).json({ error: "Title and content are required." });

    const slug = await getUniqueSlug(String(title));
    const created = await prisma.blogPost.create({
      data: {
        title: String(title),
        slug,
        content: String(content),
        author: String(author || auth.email || "Admin"),
      },
    });

    return res.json({
      id: created.id,
      title: created.title,
      slug: created.slug,
      author: created.author,
      content: created.content,
      created_at: created.createdAt,
    });
  }

  return res.status(405).end();
}
