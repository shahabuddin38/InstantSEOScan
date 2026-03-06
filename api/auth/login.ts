import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { signToken } from "../../lib/auth.js";

const authBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const isPrismaConnectionError = (error: any) => {
  const message = String(error?.message || "");
  return (
    /Can\'t reach database server/i.test(message) ||
    /P1001/.test(message) ||
    /ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(message)
  );
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const parsed = authBodySchema.safeParse((req as any).body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  try {
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email: String(email || "").toLowerCase() },
    });

    if (!user) return res.status(401).json({ error: "Account not found. Please create an account." });

    const valid = await bcrypt.compare(String(password || ""), user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password." });

    if (user.role !== "admin") {
      if (user.status !== "approved") return res.status(403).json({ error: "Your account is pending admin approval." });
      if (!user.verified) return res.status(403).json({ error: "Please verify your email first." });
      if (user.subscriptionEnd && new Date(user.subscriptionEnd) < new Date()) {
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: "free", usageLimit: 1, subscriptionEnd: null },
        });
      }
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const isProd = process.env.NODE_ENV === "production";
    res.setHeader(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60};${isProd ? " Secure;" : ""}`
    );

    return res.json({
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
    console.error("Login DB Error:", error);
    if (isPrismaConnectionError(error)) {
      return res.status(503).json({ error: "Database is temporarily unavailable. Please try again shortly." });
    }
    return res.status(500).json({ error: "Login failed due to a server error." });
  }
}
