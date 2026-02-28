import type { VercelResponse } from "@vercel/node";
import { prisma } from "../../../../lib/prisma";
import { withAuth } from "../../../../middleware/withAuth";

export default withAuth(async function handler(req: any, res: VercelResponse) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await prisma.user.update({
      where: { id: String(id) },
      data: {
        status: "approved",
        verified: true,
      },
    });

    return res.status(200).json(user);
  } catch (error: any) {
    console.error("Error approving user:", error);
    return res.status(500).json({ error: "Failed to approve user" });
  }
});
