import type { VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma";
import { withAuth } from "../../middleware/withAuth";

export default withAuth(async function handler(req: any, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const { id } = req.query;
  const report = await prisma.scanReport.findUnique({
    where: { id: String(id) },
  });

  if (!report || report.userId !== req.user.id) {
    return res.status(404).json({ error: "Report not found" });
  }

  res.json(report);
});
