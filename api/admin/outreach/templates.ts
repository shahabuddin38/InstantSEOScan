import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../../lib/prisma.js";
import { verifyToken } from "../../../lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    let user: any;
    try {
        user = await verifyToken(req);
        if (user.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }
    } catch (err: any) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    // GET: Fetch all templates
    if (req.method === "GET") {
        try {
            const templates = await prisma.emailTemplate.findMany({
                orderBy: { createdAt: "desc" },
            });
            return res.status(200).json(templates);
        } catch (error: any) {
            console.error("Fetch templates error:", error);
            return res.status(500).json({ error: "Failed to fetch templates" });
        }
    }

    // POST: Create a new template 
    if (req.method === "POST") {
        try {
            const { name, subject, body } = req.body;

            if (!name || !subject || !body) {
                return res.status(400).json({ error: "Name, subject, and body are required." });
            }

            const templatesCount = await prisma.emailTemplate.count();
            if (templatesCount >= 20) {
                return res.status(403).json({ error: "You have reached the maximum template limit of 20." });
            }

            const newTemplate = await prisma.emailTemplate.create({
                data: {
                    name,
                    subject,
                    body
                }
            });

            return res.status(201).json(newTemplate);
        } catch (error: any) {
            console.error("Create template error:", error);
            return res.status(500).json({ error: "Failed to create template" });
        }
    }

    // DELETE: Remove a template
    if (req.method === "DELETE") {
        try {
            const { id } = req.query;
            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: "Template ID is required" });
            }
            await prisma.emailTemplate.delete({ where: { id } });
            return res.status(200).json({ success: true });
        } catch (error: any) {
            console.error("Delete template error:", error);
            return res.status(500).json({ error: "Failed to delete template" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
