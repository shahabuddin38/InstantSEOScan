import type { VercelRequest, VercelResponse } from "@vercel/node";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    return res.status(400).json({ error: "Missing stripe-signature" });
  }

  try {
    const rawBody = await getRawBody(req);
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const email = session.customer_email as string | undefined;

      if (email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "pro",
              usageLimit: 1000,
              subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }
    }

    return res.json({ received: true });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Invalid webhook event" });
  }
}
