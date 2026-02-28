import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../../../lib/prisma";
import { requireAuth, requireAdmin } from "../../../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res);
  if (!auth) return;
  if (!requireAdmin(auth, res)) return;

  if (req.method !== "POST") return res.status(405).end();

  const id = String(req.query.id || "");
  const { plan, limit, days } = req.body || {};

  const subscriptionEnd = days ? new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000) : null;

  await prisma.user.update({
    where: { id },
    data: {
      plan: String(plan || "free"),
      usageLimit: Number(limit || 5),
      subscriptionEnd,
    },
  });

  res.json({ success: true });
}
