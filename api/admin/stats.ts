import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma";
import { requireAuth, requireAdmin } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res);
  if (!auth) return;
  if (!requireAdmin(auth, res)) return;
  if (req.method !== "GET") return res.status(405).end();

  const [users, pendingUsers, scans, posts] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "pending" } }),
    prisma.scanReport.count(),
    prisma.blogPost.count(),
  ]);

  res.json({
    userCount: { count: users },
    scanCount: { count: scans },
    pendingCount: { count: pendingUsers },
    blogCount: { count: posts },
  });
}
