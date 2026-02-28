import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const auth = requireAuth(req, res);
  if (!auth) return;

  const reports = await prisma.scanReport.findMany({
    where: { userId: auth.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, url: true, score: true, createdAt: true },
  });

  res.json(reports);
}
