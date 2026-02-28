import type { VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma";
import { withAuth } from "../../middleware/withAuth";

export default withAuth(async function handler(req: any, res: VercelResponse) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });

  const [userCount, scanCount, pendingCount, blogCount] = await Promise.all([
    prisma.user.count(),
    prisma.scanReport.count(),
    prisma.user.count({ where: { status: "pending" } }),
    prisma.blogPost.count(),
  ]);

  res.json({
    userCount: { count: userCount },
    scanCount: { count: scanCount },
    pendingCount: { count: pendingCount },
    blogCount: { count: blogCount },
  });
});
