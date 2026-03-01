import Stripe from "stripe";

// If STRIPE_SECRET_KEY is missing, we initialize with a dummy key to prevent crashes.
// Actual Stripe calls will fail, but the rest of the API will work.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2026-02-25.clover",
});
