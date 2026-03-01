import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/auth";
import { withAuth } from "../middleware/withAuth";
import { checkQuota } from "../lib/quota";

const cleanUrl = (url: string) =>
  String(url || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

const normalizedUrlKey = (url: string) => cleanUrl(url).toLowerCase();

const calculateScore = (technical: any) => {
  let score = 100;
  if (technical?.title === "Missing") score -= 20;
  if (technical?.description === "Missing") score -= 20;
  if ((technical?.h1Count || 0) === 0) score -= 10;
  if ((technical?.imgAltMissing || 0) > 5) score -= 10;
  return Math.max(0, score);
};

const authBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const scanBodySchema = z.object({
  url: z.string().min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url || "", "http://localhost");
  const path = url.pathname || "";

  // Health
  if (path === "/api/health") {
    if (req.method !== "GET") return res.status(405).end();
    return res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  }

  // Auth: register (public)
  if (path === "/api/auth/register") {
    if (req.method !== "POST") return res.status(405).end();

    const parsed = registerBodySchema.safeParse((req as any).body || {});
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
      return res.json({
        message: isAdmin
          ? "Admin registration successful. You can now log in."
          : "Registration successful. Please wait for admin approval and verify your email.",
      });
    } catch {
      return res.status(400).json({ error: "Email already exists" });
    }
  }

  // Auth: login (public)
  if (path === "/api/auth/login") {
    if (req.method !== "POST") return res.status(405).end();

    const parsed = authBodySchema.safeParse((req as any).body || {});
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    }

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
          data: { plan: "free", usageLimit: 5, subscriptionEnd: null },
        });
        (user as any).plan = "free";
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
  }

  // Auth: me (protected)
  if (path === "/api/auth/me") {
    const authed = withAuth(async (reqAny: any, resAny: VercelResponse) => {
      if (reqAny.method !== "GET") return resAny.status(405).end();
      const user = reqAny.user;
      return resAny.json({
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        status: user.status,
        verified: user.verified,
        usageCount: user.usageCount,
        usageLimit: user.usageLimit,
        subscriptionEnd: user.subscriptionEnd,
      });
    });
    return authed(req as any, res as any);
  }

  // Scan: history (protected)
  if (path === "/api/scan/history") {
    const authed = withAuth(async (reqAny: any, resAny: VercelResponse) => {
      if (reqAny.method !== "GET") return resAny.status(405).end();

      const scans = await prisma.scanReport.findMany({
        where: { userId: reqAny.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, url: true, score: true, createdAt: true },
      });

      return resAny.json(scans);
    });
    return authed(req as any, res as any);
  }

  // Scan: single report (protected, /api/scan/:id)
  if (path.startsWith("/api/scan/") && path.split("/").length === 4) {
    const id = path.split("/")[3];
    const authed = withAuth(async (reqAny: any, resAny: VercelResponse) => {
      if (reqAny.method !== "GET") return resAny.status(405).end();

      const report = await prisma.scanReport.findUnique({ where: { id: String(id) } });
      if (!report || report.userId !== reqAny.user.id) {
        return resAny.status(404).json({ error: "Report not found" });
      }

      return resAny.json(report);
    });
    return authed(req as any, res as any);
  }

  // Scan: EEAT (protected)
  if (path === "/api/scan/eeat") {
    const authed = withAuth(async (reqAny: any, resAny: VercelResponse) => {
      if (reqAny.method !== "POST") return resAny.status(405).end();
      const { url: eeatUrl } = reqAny.body || {};
      return resAny.json({
        status: "success",
        eeat: {
          trust: 85,
          expertise: 90,
          authority: 78,
          suggestions: ["Add author profile", "Update privacy policy"],
        },
        url: eeatUrl,
      });
    });
    return authed(req as any, res as any);
  }

  // Scan: main scan (protected, POST /api/scan)
  if (path === "/api/scan") {
    const authed = withAuth(async (reqAny: any, resAny: VercelResponse) => {
      if (reqAny.method !== "POST") return resAny.status(405).end();

      const parsed = scanBodySchema.safeParse(reqAny.body || {});
      if (!parsed.success) {
        return resAny.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      }

      const { url } = parsed.data;
      const userId = reqAny.user.id as string;

      const targetUrl = String(url).startsWith("http") ? String(url) : `https://${url}`;
      const urlKey = normalizedUrlKey(String(url));

      try {
        await checkQuota(userId);

        const cacheWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const cached = await prisma.scanReport.findFirst({
          where: {
            userId,
            normalizedUrl: urlKey,
            createdAt: { gte: cacheWindow },
          },
          orderBy: { createdAt: "desc" },
        });

        if (cached) {
          const payload =
            typeof cached.results === "object"
              ? { ...(cached.results as any), score: cached.score }
              : { score: cached.score };
          return resAny.json({ ...payload, reportId: cached.id, cached: true });
        }

        const response = await axios.get(targetUrl, {
          timeout: 5000,
          validateStatus: () => true,
        });

        const html = typeof response.data === "string" ? response.data : JSON.stringify(response.data);

        const technical = {
          title: (html.match(/<title>(.*?)<\/title>/i) || [])[1] || "Missing",
          description: (html.match(/<meta name=\"description\" content=\"(.*?)\"/i) || [])[1] || "Missing",
          h1Count: (html.match(/<h1/gi) || []).length,
          h2Count: (html.match(/<h2/gi) || []).length,
          h3Count: (html.match(/<h3/gi) || []).length,
          imgAltMissing: (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length,
          loadTime: Math.floor(Math.random() * 1000) + 200,
        };

        const textContent = html
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
          .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 8000);

        const score = calculateScore(technical);
        const results = {
          technical,
          content: textContent,
          timestamp: new Date().toISOString(),
        };

        const created = await prisma.scanReport.create({
          data: {
            userId,
            url: targetUrl,
            normalizedUrl: urlKey,
            score,
            results,
          },
        });

        return resAny.json({ ...results, score, reportId: created.id, cached: false });
      } catch (error: any) {
        return resAny.status(500).json({ error: `Failed to scan site: ${error?.message || "unknown error"}` });
      }
    });
    return authed(req as any, res as any);
  }

  // Fallback
  return res.status(404).json({ error: "Not found" });
}
