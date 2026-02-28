import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma";
import { requireAuth, requireAdmin } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res);
  if (!auth) return;
  if (!requireAdmin(auth, res)) return;
  if (req.method !== "GET") return res.status(405).end();

  const [totalUsers, approvedUsers, pendingUsers, paidUsers, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "approved" } }),
    prisma.user.count({ where: { status: "pending" } }),
    prisma.user.count({ where: { plan: { in: ["pro", "agency", "custom"] } } }),
    prisma.user.findMany({
      orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        email: true,
        plan: true,
        status: true,
        usageCount: true,
        usageLimit: true,
      },
    }),
  ]);

  res.json({
    totals: { totalUsers, approvedUsers, pendingUsers, paidUsers },
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      plan: u.plan,
      status: u.status,
      usage_count: u.usageCount,
      usage_limit: u.usageLimit,
    })),
  });
}
