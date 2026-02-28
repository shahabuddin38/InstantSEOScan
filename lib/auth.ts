import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

const getToken = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  return authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
};

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
