import type { VercelResponse } from "@vercel/node";
import { withAuth } from "../../middleware/withAuth";

export default withAuth(async function handler(req: any, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const user = req.user;
  return res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    plan: user.plan,
    status: user.status,
    verified: user.verified,
    usageCount: user.usageCount,
    usageLimit: user.usageLimit,
    subscriptionEnd: user.subscriptionEnd,
  });
});
