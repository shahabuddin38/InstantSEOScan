import type { VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma";
import { withAuth } from "../../middleware/withAuth";

export default withAuth(async function handler(req: any, res: VercelResponse) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });

  const users = await prisma.user.findMany({
    orderBy: { usageCount: "desc" },
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

  const totals = {
    totalUsers: users.length,
    approvedUsers: users.filter((u) => u.status === "approved").length,
    pendingUsers: users.filter((u) => u.status === "pending").length,
    paidUsers: users.filter((u) => u.plan !== "free").length,
  };

  res.json({
    totals,
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      plan: u.plan,
      status: u.status,
      verified: u.verified ? 1 : 0,
      usage_count: u.usageCount ?? 0,
      usage_limit: u.usageLimit ?? 0,
    })),
  });
});
