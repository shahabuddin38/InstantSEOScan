import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../../lib/prisma";
import { requireAuth, requireAdmin } from "../../../lib/auth";
import { slugify } from "../../../lib/utils";

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

  const id = String(req.query.id || "");

  if (req.method === "PUT") {
    const { title, content, author } = req.body || {};
    if (!title || !content) return res.status(400).json({ error: "Title and content are required." });

    const exists = await prisma.blogPost.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: "Post not found." });

    const slug = await getUniqueSlug(String(title), id);
    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title: String(title),
        slug,
        content: String(content),
        author: String(author || auth.email || "Admin"),
      },
    });

    return res.json({
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      author: updated.author,
      content: updated.content,
      created_at: updated.createdAt,
    });
  }

  if (req.method === "DELETE") {
    await prisma.blogPost.delete({ where: { id } });
    return res.json({ success: true });
  }

  return res.status(405).end();
}
