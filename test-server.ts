import express from "express";
import { createServer as createViteServer } from "vite";
import DatabaseConstructor from "better-sqlite3";

const Database = (DatabaseConstructor as any).default || DatabaseConstructor;

async function start() {
  const app = express();

  try {
    const db = new Database(":memory:");
    console.log("In-memory DB initialized");
  } catch (e) {
    console.error("DB Init failed:", e);
  }

  console.log("Initializing Vite...");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
  console.log("Vite initialized");

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.listen(3000, "0.0.0.0", () => console.log("Test server with Vite running on port 3000"));
}

start();
