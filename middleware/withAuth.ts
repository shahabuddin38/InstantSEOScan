import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyToken } from "../lib/auth.js";

type AuthedRequest = VercelRequest & { user?: any };

const isPrismaConnectionError = (error: any) => {
  const message = String(error?.message || "");
  return (
    /Can't reach database server/i.test(message) ||
    /P1001/.test(message) ||
    /ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(message)
  );
};

export function withAuth(
  handler: (req: AuthedRequest, res: VercelResponse) => Promise<any> | any
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      const origin = req.headers.origin || "*";
      const appUrl = process.env.APP_URL;

      // Allow all Vercel domains, localhost, and the main APP_URL
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

      if (req.method === "OPTIONS") return res.status(204).end();

      const user = await verifyToken(req);
      (req as AuthedRequest).user = user;
      return await handler(req as AuthedRequest, res);
    } catch (err: any) {
      if (isPrismaConnectionError(err)) {
        return res.status(503).json({
          error: "Database is temporarily unavailable. Please try again shortly.",
        });
      }
      return res.status(401).json({ error: err?.message || "Unauthorized" });
    }
  };
}
