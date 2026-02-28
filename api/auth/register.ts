import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const parsed = bodySchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;

  const hashed = await bcrypt.hash(String(password), 10);
  const adminEmail = process.env.ADMIN_EMAIL || "shahabjan38@gmail.com";
  const isAdmin = String(email).toLowerCase() === adminEmail.toLowerCase();

  try {
    await prisma.user.create({
      data: {
        email: String(email).toLowerCase(),
        password: hashed,
        role: isAdmin ? "admin" : "user",
        plan: isAdmin ? "agency" : "free",
        status: isAdmin ? "approved" : "pending",
        verified: isAdmin,
        usageLimit: isAdmin ? 999999 : 5,
      },
    });
    res.json({ message: isAdmin ? "Admin registration successful. You can now log in." : "Registration successful. Please wait for admin approval and verify your email." });
  } catch {
    res.status(400).json({ error: "Email already exists" });
  }
}
