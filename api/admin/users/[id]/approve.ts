import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../../../lib/prisma";
import { requireAuth, requireAdmin } from "../../../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res);
  if (!auth) return;
  if (!requireAdmin(auth, res)) return;

  if (req.method !== "POST") return res.status(405).end();

  const id = String(req.query.id || "");
  await prisma.user.update({ where: { id }, data: { status: "approved", verified: true } });
  res.json({ success: true });
}
