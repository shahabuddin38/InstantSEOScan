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

    // GET: Fetch all leads
    if (req.method === "GET") {
        try {
            const leads = await prisma.lead.findMany({
                orderBy: { createdAt: "desc" },
            });
            return res.status(200).json(leads);
        } catch (error: any) {
            console.error("Fetch leads error:", error);
            return res.status(500).json({ error: "Failed to fetch leads" });
        }
    }

    // POST: Create a new lead (mock scraper manual addition)
    if (req.method === "POST") {
        try {
            const { companyName, website, email, industry, seoScore } = req.body;

            const newLead = await prisma.lead.create({
                data: {
                    companyName,
                    website,
                    email,
                    industry,
                    seoScore,
                    status: "new"
                }
            });

            return res.status(201).json(newLead);
        } catch (error: any) {
            console.error("Create lead error:", error);
            return res.status(500).json({ error: "Failed to create lead" });
        }
    }

    // DELETE: Remove a lead
    if (req.method === "DELETE") {
        try {
            const { id } = req.query;
            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: "Lead ID is required" });
            }
            await prisma.lead.delete({ where: { id } });
            return res.status(200).json({ success: true });
        } catch (error: any) {
            console.error("Delete lead error:", error);
            return res.status(500).json({ error: "Failed to delete lead" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
