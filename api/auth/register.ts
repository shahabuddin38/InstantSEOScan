import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

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
