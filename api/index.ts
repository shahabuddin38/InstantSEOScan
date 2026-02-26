import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import axios from "axios";

// Enable CORS
const enableCors = (res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-admin-secret"
  );
};

// Auth Middleware
const authenticateToken = (req: VercelRequest): any => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && (authHeader as string).split(" ")[1];
  if (!token) return null;

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || "secret");
    return user;
  } catch (err) {
    return null;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  enableCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { pathname } = new URL(req.url || "", "http://localhost");

  try {
    // Admin Seed
    if (pathname === "/api/admin/seed" && req.method === "POST") {
      const { email, password } = req.body;
      const adminSecret = req.headers["x-admin-secret"];

      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const id = Date.now();
      const token = jwt.sign(
        { id, email, role: "admin" },
        process.env.JWT_SECRET || "secret"
      );

      return res.json({
        token,
        user: { id, email, role: "admin", plan: "premium" },
        message: "Admin user created successfully",
      });
    }

    // Register
    if (pathname === "/api/auth/register" && req.method === "POST") {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const id = Date.now();
      const token = jwt.sign(
        { id, email, role: "user" },
        process.env.JWT_SECRET || "secret"
      );

      return res.json({
        token,
        user: { id, email, role: "user", plan: "free" },
      });
    }

    // Login
    if (pathname === "/api/auth/login" && req.method === "POST") {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      // Demo login - in production use real database
      const id = Date.now();
      const token = jwt.sign(
        { id, email, role: "user" },
        process.env.JWT_SECRET || "secret"
      );

      return res.json({
        token,
        user: { id, email, role: "user", plan: "free" },
      });
    }

    // SEO Scan
    if (pathname === "/api/scan" && req.method === "POST") {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      try {
        const response = await axios.get(url, { timeout: 5000 });
        const html = response.data;

        const technical = {
          title: (html.match(/<title>(.*?)<\/title>/i) || [])[1] || "Missing",
          description:
            (html.match(/<meta name="description" content="(.*?)"/i) || [])[1] ||
            "Missing",
          h1Count: (html.match(/<h1/gi) || []).length,
          imgAltMissing:
            (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length,
        };

        let score = 100;
        if (technical.title === "Missing") score -= 20;
        if (technical.description === "Missing") score -= 20;
        if (technical.h1Count === 0) score -= 10;
        if (technical.imgAltMissing > 5) score -= 10;

        const improvements = [
          { title: "Optimize meta description", priority: "high" },
          { title: "Add proper H1 tags", priority: "high" },
          { title: "Add alt text to images", priority: "medium" },
        ];

        return res.json({
          technical,
          improvements,
          score: Math.max(0, score),
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Failed to scan site: " + error.message });
      }
    }

    // Keywords
    if (pathname === "/api/keywords" && req.method === "POST") {
      const user = authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      try {
        const response = await axios.get(
          `https://${process.env.RAPIDAPI_HOST_KEYWORDS}/search`,
          {
            params: { q: query },
            headers: {
              "x-rapidapi-key": process.env.RAPIDAPI_KEY,
              "x-rapidapi-host": process.env.RAPIDAPI_HOST_KEYWORDS,
            },
          }
        );
        return res.json(response.data);
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "RapidAPI Error: " + error.message });
      }
    }

    // Backlinks
    if (pathname === "/api/backlinks" && req.method === "POST") {
      const user = authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { domain } = req.body;
      if (!domain) {
        return res.status(400).json({ error: "Domain is required" });
      }

      try {
        const response = await axios.get(
          `https://${process.env.RAPIDAPI_HOST_BACKLINKS}/backlinks`,
          {
            params: { domain },
            headers: {
              "x-rapidapi-key": process.env.RAPIDAPI_KEY,
              "x-rapidapi-host": process.env.RAPIDAPI_HOST_BACKLINKS,
            },
          }
        );
        return res.json(response.data);
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "RapidAPI Error: " + error.message });
      }
    }

    // Not Found
    return res.status(404).json({ error: "Endpoint not found" });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
