import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

const getToken = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);

  const cookieHeader = req.headers.cookie || "";
  const tokenCookie = cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith("token="));

  if (tokenCookie) return decodeURIComponent(tokenCookie.slice("token=".length));
  return "";
};

export async function verifyToken(req: VercelRequest) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT secret is not configured");

  const token = getToken(req);
  if (!token) throw new Error("No token provided");

  const decoded = jwt.verify(token, secret) as { id?: string };
  if (!decoded?.id) throw new Error("Invalid token payload");

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) throw new Error("User not found");
  return user;
}

export const signToken = (user: AuthUser) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(user, secret, { expiresIn: "7d" });
};

export const requireAuth = (req: VercelRequest, res: VercelResponse): AuthUser | null => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: "JWT secret is not configured" });
      return null;
    }

    const token = getToken(req);
    if (!token) {
      res.status(401).json({ error: "Missing token" });
      return null;
    }

    const user = jwt.verify(token, secret) as AuthUser;
    return user;
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
    return null;
  }
};

export const requireAdmin = (user: AuthUser | null, res: VercelResponse) => {
  if (!user) return false;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return false;
  }
  return true;
};
