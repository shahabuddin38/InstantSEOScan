import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const auth = requireAuth(req, res);
  if (!auth) return;

  const id = String(req.query.id || "");
  const report = await prisma.scanReport.findUnique({ where: { id } });

  if (!report || report.userId !== auth.id) {
    return res.status(404).json({ error: "Report not found" });
  }

  const resultPayload = report.results && typeof report.results === "object"
    ? { ...(report.results as any), score: report.score }
    : { score: report.score };

  res.json({ id: report.id, createdAt: report.createdAt, report: resultPayload });
}
