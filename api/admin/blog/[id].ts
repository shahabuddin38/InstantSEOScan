import type { VercelResponse } from "@vercel/node";
import { prisma } from "../../../lib/prisma";
import { withAuth } from "../../../middleware/withAuth";

export default withAuth(async function handler(req: any, res: VercelResponse) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { id } = req.query;

  if (req.method === "PUT") {
    const { title, slug, content, author } = req.body;
    try {
      const post = await prisma.blogPost.update({
        where: { id: String(id) },
        data: { title, slug, content, author },
      });
      return res.status(200).json(post);
    } catch (error: any) {
      console.error("Error updating blog post:", error);
      return res.status(500).json({ error: "Failed to update blog post" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.blogPost.delete({
        where: { id: String(id) },
      });
      return res.status(200).json({ message: "Post deleted" });
    } catch (error: any) {
      console.error("Error deleting blog post:", error);
      return res.status(500).json({ error: "Failed to delete blog post" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
