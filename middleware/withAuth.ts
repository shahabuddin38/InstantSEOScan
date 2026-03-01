import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyToken } from "../lib/auth.js";

type AuthedRequest = VercelRequest & { user?: any };

export function withAuth(
  handler: (req: AuthedRequest, res: VercelResponse) => Promise<any> | any
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      const origin = req.headers.origin;
      const appUrl = process.env.APP_URL;

      if (appUrl && origin && origin !== appUrl) {
        return res.status(403).json({ error: "CORS origin not allowed" });
      }

      if (appUrl) {
        res.setHeader("Access-Control-Allow-Origin", appUrl);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      }

      if (req.method === "OPTIONS") return res.status(204).end();

      const user = await verifyToken(req);
      (req as AuthedRequest).user = user;
      return handler(req as AuthedRequest, res);
    } catch (err: any) {
      return res.status(401).json({ error: err?.message || "Unauthorized" });
    }
  };
}
