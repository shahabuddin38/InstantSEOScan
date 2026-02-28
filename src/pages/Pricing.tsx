import { Check, Zap, Shield, BarChart3, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

// Replace with your Stripe Publishable Key
const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

export default function Pricing() {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "0",
      desc: "Perfect for testing the waters",
      features: ["5 Scans per month", "Basic Technical Audit", "AI Recommendations", "PDF Export"],
      button: "Get Started",
      highlight: false
    },
    {
      id: "pro",
      name: "Pro",
      price: "10",
      desc: "For growing businesses & SEOs",
      features: ["100 Scans per month", "Deep Technical Audit", "Backlink Radar", "Keyword Matrix", "Priority Support", "CSV Export"],
      button: "Go Pro",
      highlight: true
    },
    {
      id: "agency",
      name: "Agency",
      price: "100",
      desc: "For large teams & multiple clients",
      features: ["Unlimited Scans", "White-label Reports", "API Access", "Team Management", "Custom Domain", "Priority AI Processing"],
      button: "Get Agency",
      highlight: false
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      navigate('/login?mode=register');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?mode=register');
      return;
    }

    setLoadingPlan(planId);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planId }),
      });

      const session = await response.json();

      if (session.error) {
        alert(session.error);
        setLoadingPlan(null);
        return;
      }

      const stripe: any = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: session.id,
        });
        if (error) {
          console.error("Stripe error:", error);
          alert(error.message);
        }
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to initiate checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">Choose the plan that fits your growth stage. No hidden fees, cancel anytime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-8 rounded-3xl border flex flex-col ${
              plan.highlight ? 'border-emerald-600 bg-white shadow-2xl shadow-emerald-100' : 'border-neutral-200 bg-neutral-50/50'
            }`}
          >
            {plan.highlight && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Most Popular
              </div>
            )}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-black">${plan.price}</span>
                <span className="text-neutral-500 text-sm font-medium">/month</span>
              </div>
              <p className="text-neutral-500 text-sm">{plan.desc}</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-200 text-neutral-500'}`}>
                    <Check size={12} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleSubscribe(plan.id)}
              disabled={loadingPlan === plan.id}
              className={`w-full py-4 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-2 ${
                plan.highlight ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200' : 'bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-50'
              } ${loadingPlan === plan.id ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loadingPlan === plan.id ? <Loader2 size={18} className="animate-spin" /> : null}
              {plan.button}
            </button>
            {plan.id === 'pro' && (
              <button 
                onClick={() => document.getElementById('manual-payment')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-4 text-xs font-bold text-emerald-600 hover:underline text-center w-full"
              >
                Or Pay Manually
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Manual Payment Section */}
      <motion.div 
        id="manual-payment"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-24 bg-white rounded-[40px] border border-neutral-200 shadow-xl overflow-hidden"
      >
        <div className="p-12 md:p-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">Manual Payment Instructions</h2>
            <p className="text-neutral-500">Follow the instructions below to complete your manual payment. Once sent, our team will verify and upgrade your account.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Crypto Payment */}
            <div className="bg-neutral-50 p-8 rounded-[32px] border border-neutral-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold">Pay via Crypto (USDT)</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Binance Email</label>
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 font-mono text-sm break-all">
                    Shahab_uddin38@yahoo.com
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Binance ID</label>
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 font-mono text-sm">
                    46293528
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">TRC20 Address</label>
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 font-mono text-sm break-all">
                    TJdNjjxb4qLqf3K8kAXEXJm8d1zdq3p16D
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Transfer */}
            <div className="bg-neutral-50 p-8 rounded-[32px] border border-neutral-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold">Pay via Bank Transfer (UBL)</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Account Title</label>
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 font-mono text-sm">
                    Shahab uddin
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Account Number</label>
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 font-mono text-sm">
                    0105318820172
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">IBAN</label>
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 font-mono text-sm break-all">
                    PK39UNIL0109000318820172
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
            <p className="text-emerald-800 font-medium">
              Please send the screenshot of the transaction along with your registered email to our support team to activate your plan.
            </p>
            <a href="mailto:shahabjan38@gmail.com" className="inline-block mt-4 text-emerald-600 font-bold hover:underline">
              shahabjan38@gmail.com
            </a>
          </div>
        </div>
      </motion.div>

      <div className="mt-24 bg-neutral-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Need a custom solution?</h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">We offer enterprise-grade SEO infrastructure for high-volume platforms. Let's build something great together.</p>
          <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all">
            Talk to Enterprise
          </button>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-600/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>
    </div>
  );
}
