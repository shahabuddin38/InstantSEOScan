import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma";
import { requireAuth, requireAdmin } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res);
  if (!auth) return;
  if (!requireAdmin(auth, res)) return;

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
}
