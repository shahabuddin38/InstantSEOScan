import type { VercelResponse } from "@vercel/node";
import { withAuth } from "../../middleware/withAuth";

export default withAuth(async function handler(req: any, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { url } = req.body;

  res.json({
    status: "success",
    eeat: {
      trust: 85,
      expertise: 90,
      authority: 78,
      suggestions: ["Add author profile", "Update privacy policy"]
    },
    url
  });
});
