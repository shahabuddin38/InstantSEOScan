import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma";
import { withAuth } from "../../middleware/withAuth";

export default withAuth(async function handler(req: any, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const scans = await prisma.scanReport.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      url: true,
      score: true,
      createdAt: true,
    },
  });

  res.json(scans);
});
