import type { VercelResponse } from "@vercel/node";
import { z } from "zod";
import { stripe } from "../../lib/stripe";
import { withAuth } from "../../middleware/withAuth";

const bodySchema = z.object({
  priceId: z.string().min(1),
});

export default withAuth(async function handler(req: any, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const parsed = bodySchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const { priceId } = parsed.data;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: req.user.email,
    success_url: `${process.env.APP_URL}/dashboard`,
    cancel_url: `${process.env.APP_URL}/pricing`,
  });

  return res.json({ url: session.url });
});
