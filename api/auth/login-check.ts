import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const isPrismaConnectionError = (error: any) => {
  const message = String(error?.message || "");
  return (
    /Can.?t reach database server/i.test(message) ||
    /P1001/.test(message) ||
    /ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(message)
  );
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Use POST with { email, password } to validate login credentials.",
      path: "/api/auth/login-check",
      requiredBody: { email: "string", password: "string" },
    });
  }

  if (req.method !== "POST") return res.status(405).end();

  const parsed = bodySchema.safeParse((req as any).body || {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, valid: false, error: "Invalid payload", details: parsed.error.flatten() });
  }

  try {
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ ok: false, valid: false, error: "Account not found" });
    }

    const valid = await bcrypt.compare(String(password), user.password);
    if (!valid) {
      return res.status(401).json({ ok: false, valid: false, error: "Invalid password" });
    }

    return res.status(200).json({
      ok: true,
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        status: user.status,
        verified: user.verified,
      },
    });
  } catch (error: any) {
    if (isPrismaConnectionError(error)) {
      return res.status(503).json({ ok: false, valid: false, error: "Database is temporarily unavailable" });
    }
    return res.status(500).json({ ok: false, valid: false, error: error?.message || "Login check failed" });
  }
}
