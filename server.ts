import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    plan TEXT DEFAULT 'free',
    stripe_customer_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    url TEXT,
    score INTEGER,
    results TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    slug TEXT UNIQUE,
    content TEXT,
    author TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const info = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, hashedPassword);
      const token = jwt.sign({ id: info.lastInsertRowid, email, role: 'user' }, process.env.JWT_SECRET || 'secret');
      res.json({ token, user: { id: info.lastInsertRowid, email, role: 'user', plan: 'free' } });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, plan: user.plan } });
  });

  // SEO Scan Engine
  app.post("/api/scan", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      // 1. Technical Audit (Basic fetch)
      const response = await axios.get(url, { timeout: 5000 });
      const html = response.data;
      
      // Basic Technical Checks
      const technical = {
        title: (html.match(/<title>(.*?)<\/title>/i) || [])[1] || "Missing",
        description: (html.match(/<meta name="description" content="(.*?)"/i) || [])[1] || "Missing",
        h1Count: (html.match(/<h1/gi) || []).length,
        imgAltMissing: (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length,
        loadTime: 0, // Mocked for now
      };

      // 2. AI Analysis (Gemini)
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this SEO data for ${url}: ${JSON.stringify(technical)}. Provide 3 actionable improvements in JSON format.`,
        config: { responseMimeType: "application/json" }
      });
      const aiResult = await model;
      const improvements = JSON.parse(aiResult.text || "[]");

      // 3. Score Calculation
      let score = 100;
      if (technical.title === "Missing") score -= 20;
      if (technical.description === "Missing") score -= 20;
      if (technical.h1Count === 0) score -= 10;
      if (technical.imgAltMissing > 5) score -= 10;

      const results = {
        technical,
        improvements,
        score: Math.max(0, score),
        timestamp: new Date().toISOString()
      };

      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to scan site: " + error.message });
    }
  });

  // Blog
  app.get("/api/blog", (req, res) => {
    const posts = db.prepare("SELECT * FROM blog_posts ORDER BY created_at DESC").all();
    res.json(posts);
  });

  // Admin
  app.get("/api/admin/stats", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
    const scanCount = db.prepare("SELECT COUNT(*) as count FROM scans").get();
    res.json({ userCount, scanCount });
  });

  // RapidAPI: Keywords
  app.post("/api/keywords", authenticateToken, async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    try {
      const response = await axios.get(`https://${process.env.RAPIDAPI_HOST_KEYWORDS}/search`, {
        params: { q: query },
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': process.env.RAPIDAPI_HOST_KEYWORDS
        }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(500).json({ error: "RapidAPI Error: " + error.message });
    }
  });

  // RapidAPI: Backlinks
  app.post("/api/backlinks", authenticateToken, async (req, res) => {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: "Domain is required" });

    try {
      const response = await axios.get(`https://${process.env.RAPIDAPI_HOST_BACKLINKS}/backlinks`, {
        params: { domain },
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': process.env.RAPIDAPI_HOST_BACKLINKS
        }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(500).json({ error: "RapidAPI Error: " + error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
