import { motion } from "motion/react";
import { CheckCircle2, Globe, Zap, Shield } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-3xl mx-auto text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Our Mission: Democratize SEO</h1>
        <p className="text-xl text-neutral-600 leading-relaxed">
          We believe that every business, regardless of size, deserves access to world-class SEO tools. InstantSEOScan was built to simplify the complex world of search engine optimization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
        <div>
          <h2 className="text-3xl font-bold mb-6">Built by SEOs, for SEOs</h2>
          <p className="text-neutral-600 mb-6 leading-relaxed">
            After years of working in digital agencies, we realized that most SEO tools were either too expensive, too complex, or too slow. We set out to build a platform that is fast, intuitive, and powered by the latest AI technology.
          </p>
          <ul className="space-y-4">
            {[
              "Real-time technical analysis",
              "AI-powered content recommendations",
              "Privacy-first data handling",
              "Scalable cloud infrastructure"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 font-medium">
                <CheckCircle2 className="text-emerald-500" size={20} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="aspect-square bg-emerald-100 rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://picsum.photos/seed/team/800/800" 
              alt="Our Team" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-xl border border-neutral-100 max-w-xs">
            <p className="text-sm font-medium text-neutral-600 italic">
              "InstantSEOScan has completely transformed how our agency handles technical audits. It's a game changer."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-200 rounded-full" />
              <div>
                <div className="font-bold text-sm">Alex Rivera</div>
                <div className="text-xs text-neutral-400">CEO, GrowthLabs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
