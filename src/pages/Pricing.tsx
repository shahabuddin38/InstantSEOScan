import { Check, Zap, Shield, BarChart3 } from "lucide-react";
import { motion } from "motion/react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "0",
      desc: "Perfect for testing the waters",
      features: ["3 Scans per month", "Basic Technical Audit", "AI Recommendations", "PDF Export"],
      button: "Get Started",
      highlight: false
    },
    {
      name: "Pro",
      price: "49",
      desc: "For growing businesses & SEOs",
      features: ["Unlimited Scans", "Deep Technical Audit", "Backlink Radar", "Keyword Matrix", "Priority Support"],
      button: "Go Pro",
      highlight: true
    },
    {
      name: "Agency",
      price: "199",
      desc: "For large teams & multiple clients",
      features: ["Everything in Pro", "White-label Reports", "API Access", "Team Management", "Custom Domain"],
      button: "Contact Sales",
      highlight: false
    }
  ];

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
            className={`relative p-8 rounded-3xl border ${
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

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-200 text-neutral-500'}`}>
                    <Check size={12} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button className={`w-full py-4 rounded-xl font-bold transition-all ${
              plan.highlight ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200' : 'bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-50'
            }`}>
              {plan.button}
            </button>
          </motion.div>
        ))}
      </div>

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
