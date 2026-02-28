import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body || {};
  const user = await prisma.user.findUnique({ where: { email: String(email || "").toLowerCase() } });

  if (!user) return res.status(401).json({ error: "Account not found. Please create an account." });

  const valid = await bcrypt.compare(String(password || ""), user.password);
  if (!valid) return res.status(401).json({ error: "Invalid password." });

  if (user.role !== "admin") {
    if (user.status !== "approved") return res.status(403).json({ error: "Your account is pending admin approval." });
    if (!user.verified) return res.status(403).json({ error: "Please verify your email first." });
    if (user.subscriptionEnd && new Date(user.subscriptionEnd) < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: "free", usageLimit: 5, subscriptionEnd: null },
      });
      user.plan = "free";
    }
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      status: user.status,
      verified: user.verified,
    },
  });
}
