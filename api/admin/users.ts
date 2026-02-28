import type { VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma";
import { withAuth } from "../../middleware/withAuth";

export default withAuth(async function handler(req: any, res: VercelResponse) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  if (req.method !== "GET") return res.status(405).end();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      plan: true,
      status: true,
      verified: true,
      usageCount: true,
      usageLimit: true,
    },
  });

  res.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      plan: u.plan,
      status: u.status,
      verified: u.verified ? 1 : 0,
      usage_count: u.usageCount,
      usage_limit: u.usageLimit,
    }))
  );
});
