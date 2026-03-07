import {
  Search, Zap, Globe, ArrowRight, Loader2, Shield, BarChart3, CheckCircle2,
  Star, Users, Award, FileText, X, TrendingUp, Eye, Code2, Link2, Server,
  Gauge, ChevronDown, ChevronUp, Play, Smartphone, Lock, Bot, Target,
  Layers, LineChart, Activity, ExternalLink, BookOpen, MessageSquare,
  MonitorSmartphone, ShieldCheck, Cpu, Sparkles
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../services/apiClient";

/* ─── Animated GSC-Style Growth Chart ─── */
function AnimatedGSCChart({ delay = 0 }: { delay?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Generate a realistic GSC-style curve: starts low, grows upward
  const dataPoints = [
    { x: 0, y: 85 }, { x: 20, y: 82 }, { x: 40, y: 78 }, { x: 60, y: 80 },
    { x: 80, y: 74 }, { x: 100, y: 70 }, { x: 120, y: 65 }, { x: 140, y: 58 },
    { x: 160, y: 52 }, { x: 180, y: 48 }, { x: 200, y: 42 }, { x: 220, y: 35 },
    { x: 240, y: 30 }, { x: 260, y: 24 }, { x: 280, y: 18 }, { x: 300, y: 15 },
    { x: 320, y: 12 }, { x: 340, y: 10 }, { x: 360, y: 8 }
  ];
  const linePath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L360,95 L0,95 Z`;

  return (
    <svg ref={ref} viewBox="0 0 370 100" className="w-full h-full" preserveAspectRatio="none">
      {/* Grid lines */}
      {[20, 40, 60, 80].map(y => (
        <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4 4" />
      ))}
      {/* Gradient fill */}
      <defs>
        <linearGradient id="gscGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
        </linearGradient>
        <clipPath id="gscClip">
          <motion.rect
            x="0" y="0" height="100"
            initial={{ width: 0 }}
            animate={isInView ? { width: 370 } : { width: 0 }}
            transition={{ duration: 2, delay: delay, ease: "easeOut" }}
          />
        </clipPath>
      </defs>
      <g clipPath="url(#gscClip)">
        <path d={areaPath} fill="url(#gscGrad)" />
        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = Math.max(1, Math.floor(target / 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ─── Animated Impressions/Clicks Chart ─── */
function AnimatedImpressionsChart() {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const impressions = [
    { x: 0, y: 90 }, { x: 30, y: 85 }, { x: 60, y: 80 }, { x: 90, y: 72 },
    { x: 120, y: 65 }, { x: 150, y: 55 }, { x: 180, y: 48 }, { x: 210, y: 38 },
    { x: 240, y: 30 }, { x: 270, y: 22 }, { x: 300, y: 15 }, { x: 330, y: 10 }
  ];
  const clicks = [
    { x: 0, y: 92 }, { x: 30, y: 90 }, { x: 60, y: 88 }, { x: 90, y: 82 },
    { x: 120, y: 78 }, { x: 150, y: 70 }, { x: 180, y: 62 }, { x: 210, y: 55 },
    { x: 240, y: 45 }, { x: 270, y: 38 }, { x: 300, y: 28 }, { x: 330, y: 20 }
  ];

  const impLine = impressions.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const clickLine = clicks.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <svg ref={ref} viewBox="0 0 340 100" className="w-full h-full" preserveAspectRatio="none">
      {[25, 50, 75].map(y => (
        <line key={y} x1="0" y1={y} x2="340" y2={y} stroke="#374151" strokeWidth="0.3" strokeDasharray="4 4" />
      ))}
      <defs>
        <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
        <clipPath id="impClip">
          <motion.rect x="0" y="0" height="100"
            initial={{ width: 0 }}
            animate={isInView ? { width: 340 } : { width: 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          />
        </clipPath>
      </defs>
      <g clipPath="url(#impClip)">
        <path d={`${impLine} L330,100 L0,100 Z`} fill="url(#impGrad)" />
        <path d={impLine} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
        <path d={clickLine} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ─── Animated Bar Chart ─── */
function AnimatedBarChart() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const bars = [
    { label: "Before SEO", value: 25, color: "bg-red-400" },
    { label: "Month 1", value: 42, color: "bg-orange-400" },
    { label: "Month 3", value: 68, color: "bg-yellow-400" },
    { label: "Month 6", value: 89, color: "bg-emerald-500" },
  ];

  return (
    <div ref={ref} className="flex items-end gap-3 h-40">
      {bars.map((bar, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-2">
          <motion.div
            className={`w-full ${bar.color} rounded-t-lg`}
            initial={{ height: 0 }}
            animate={isInView ? { height: `${bar.value}%` } : { height: 0 }}
            transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
          />
          <span className="text-[10px] text-neutral-500 font-semibold text-center leading-tight">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center p-6 text-left hover:bg-neutral-50 transition-colors">
        <span className="font-bold text-neutral-800 pr-4">{question}</span>
        {open ? <ChevronUp size={20} className="text-emerald-600 shrink-0" /> : <ChevronDown size={20} className="text-neutral-400 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-6 text-neutral-600 leading-relaxed">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   HOME PAGE
   ════════════════════════════════════════════════════════════════ */

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [pages, setPages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setCrawling(true);
    try {
      const res = await apiRequest<any>("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      if (!res.ok) throw new Error(res.error || "Crawl failed.");
      const fetchedPages = res.data?.pages || [];
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      const uniquePages = Array.from(new Set([targetUrl, ...fetchedPages]));
      setPages(uniquePages);
      setShowModal(true);
    } catch (error) {
      console.error("Crawl failed", error);
      navigate(`/dashboard?scan=${encodeURIComponent(url)}`);
    } finally {
      setCrawling(false);
    }
  };

  const startAudit = (targetUrl: string) => {
    setShowModal(false);
    navigate(`/dashboard?scan=${encodeURIComponent(targetUrl)}`);
  };

  const scrollToAudit = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Schema Markup
  useEffect(() => {
    const schemas = [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "InstantSEOScan",
        operatingSystem: "Web",
        applicationCategory: "SEO Tool",
        offers: { "@type": "Offer", price: "10.00", priceCurrency: "USD" },
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "1240" }
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Can I change my plan later?", acceptedAnswer: { "@type": "Answer", text: "Yes. You can upgrade, downgrade, or cancel your plan anytime from your account dashboard." } },
          { "@type": "Question", name: "Do I need technical SEO knowledge to use this tool?", acceptedAnswer: { "@type": "Answer", text: "No. InstantSEOScan explains every issue in plain language with step-by-step fix instructions." } },
          { "@type": "Question", name: "How is InstantSEOScan different from other tools?", acceptedAnswer: { "@type": "Answer", text: "We combine traditional SEO auditing with AI visibility tracking across ChatGPT, Perplexity, Gemini, and Google SGE." } }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to use InstantSEOScan",
        step: [
          { "@type": "HowToStep", position: 1, name: "Enter a website URL", text: "Type or paste any website URL into the scan bar." },
          { "@type": "HowToStep", position: 2, name: "Start the SEO scan", text: "Click 'Run Audit' to begin the analysis." },
          { "@type": "HowToStep", position: 3, name: "Analyze the SEO report", text: "Review scores, issues, and AI-powered recommendations." },
          { "@type": "HowToStep", position: 4, name: "Fix technical issues", text: "Follow step-by-step instructions to resolve each problem." },
          { "@type": "HowToStep", position: 5, name: "Monitor SEO performance", text: "Track ranking improvements over time." }
        ]
      }
    ];
    const scripts = schemas.map(s => {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.text = JSON.stringify(s);
      document.head.appendChild(el);
      return el;
    });
    return () => scripts.forEach(el => document.head.removeChild(el));
  }, []);

  return (
    <div className="overflow-hidden bg-white min-h-screen">

      {/* ════════════ HERO — H1: Instant SEO Scan ════════════ */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-48 bg-neutral-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[radial-gradient(circle_at_50%_30%,#10b981_0,transparent_60%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text + Audit Input */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-500/20">
                <Zap size={14} /> Free AI-Powered SEO Audit
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-[0.95]">
                Instant SEO<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Scan</span>
              </h1>
              <p className="text-lg text-neutral-400 mb-8 leading-relaxed max-w-xl">
                Analyze any website in seconds. Get a complete SEO audit covering technical health, on-page optimization, AI visibility, and actionable recommendations to improve your Google rankings.
              </p>

              {/* Run Audit Input */}
              <form onSubmit={handleScan} className="relative group mb-6">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative flex flex-col sm:flex-row gap-3 p-3 bg-neutral-800 rounded-2xl border border-neutral-700 shadow-2xl">
                  <div className="flex-1 flex items-center px-5">
                    <Globe className="text-emerald-500 mr-3 shrink-0" size={22} />
                    <input
                      type="text"
                      placeholder="Enter your website URL (e.g. example.com)"
                      className="w-full py-3 bg-transparent outline-none text-white text-lg placeholder:text-neutral-500"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    disabled={crawling}
                    className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-black text-lg hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                  >
                    {crawling ? <Loader2 className="animate-spin" size={22} /> : (
                      <>RUN AUDIT <ArrowRight size={18} /></>
                    )}
                  </button>
                </div>
              </form>
              <div className="flex flex-wrap gap-6 text-neutral-500 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> No Credit Card</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Instant Results</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> AI Powered</span>
              </div>
            </motion.div>

            {/* Right: Animated GSC Chart */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="bg-neutral-800/80 backdrop-blur rounded-3xl border border-neutral-700 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Google Search Console</p>
                    <p className="text-white text-2xl font-black mt-1">Organic Growth</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                      <TrendingUp size={16} /> +284%
                    </div>
                    <p className="text-neutral-500 text-xs">Last 6 months</p>
                  </div>
                </div>
                <div className="h-44">
                  <AnimatedGSCChart delay={0.5} />
                </div>
                <div className="flex gap-6 mt-4 pt-4 border-t border-neutral-700">
                  <div>
                    <p className="text-neutral-500 text-xs font-semibold">Total Clicks</p>
                    <p className="text-white font-black text-lg">48.2K</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs font-semibold">Impressions</p>
                    <p className="text-white font-black text-lg">1.2M</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs font-semibold">Avg CTR</p>
                    <p className="text-white font-black text-lg">4.1%</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs font-semibold">Avg Pos.</p>
                    <p className="text-white font-black text-lg">8.3</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pages Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3"><Globe className="text-emerald-500" /> Site Structure Analysis</h3>
                  <p className="text-neutral-400 mt-1">We found {pages.length} pages on {url}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-white"><X size={24} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="space-y-3">
                  {pages.map((page, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-emerald-500/30 transition-colors group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="text-neutral-500 group-hover:text-emerald-400 shrink-0" size={18} />
                        <span className="text-neutral-300 truncate font-mono text-sm">{page}</span>
                      </div>
                      <button onClick={() => startAudit(page)} className="shrink-0 ml-4 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg text-sm font-bold transition-colors">Audit Page</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-neutral-800 flex justify-end">
                <button onClick={() => startAudit(url)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2">
                  Audit Main URL Only <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════ Trust Bar ════════════ */}
      <section className="py-10 border-b border-neutral-100 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.3em] mb-6">Trusted by 2,000+ High-Growth Teams</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale">
            {["TECHFLOW", "SAASLY", "GROWTH.IO", "AUDITLY", "RANKUP"].map(n => (
              <div key={n} className="text-2xl font-black">{n}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ H2: Test your website with an SEO Checker ════════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Test Your Website With an <span className="text-emerald-600">SEO Checker</span>
              </h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Our SEO checker crawls your entire website and analyzes 50+ ranking signals in seconds. From HTML structure to Core Web Vitals, get a complete technical SEO audit that shows exactly what Google sees when it visits your site.
              </p>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Unlike basic website analyzers, InstantSEOScan uses AI to correlate issues and prioritize fixes by impact. You get a ranked action plan, not just a list of errors.
              </p>
              <ul className="space-y-3 mb-8">
                {["Deep Technical Crawling (50+ Signals)", "AI Content Scoring & NLP Analysis", "Automated Schema Markup Generation", "Competitor Authority Benchmarking"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-neutral-800">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><CheckCircle2 size={14} /></div>
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={scrollToAudit} className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all flex items-center gap-2">
                Start Free Audit <ArrowRight size={18} />
              </button>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
              <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs text-neutral-400 font-mono">instantseoscan.com/report</span>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-neutral-600">SEO Score</span>
                    <span className="text-3xl font-black text-emerald-600">92/100</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Performance", pct: 95, color: "bg-emerald-500" },
                      { label: "Accessibility", pct: 88, color: "bg-cyan-500" },
                      { label: "Best Practices", pct: 92, color: "bg-violet-500" },
                      { label: "SEO", pct: 96, color: "bg-emerald-500" },
                    ].map((bar, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs font-semibold text-neutral-500 mb-1">
                          <span>{bar.label}</span><span>{bar.pct}%</span>
                        </div>
                        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${bar.color} rounded-full`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${bar.pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: i * 0.15 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-neutral-100">
                <div className="flex items-center gap-2 text-emerald-600 font-black text-xl"><Zap size={18} /> +142%</div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Avg. Traffic Growth</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════ H2: Get Your Free SEO Roadmap Analysis — with GSC graph ════════════ */}
      <section className="py-24 bg-neutral-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="bg-neutral-800 rounded-3xl border border-neutral-700 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-neutral-400 text-sm font-bold">Clicks + Impressions</p>
                    <div className="flex gap-4 text-xs">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> Impressions</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Clicks</span>
                    </div>
                  </div>
                  <div className="h-40">
                    <AnimatedImpressionsChart />
                  </div>
                </div>
                {/* Keyword ranking cards */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { kw: "seo audit tool", pos: "3", change: "+12" },
                    { kw: "website checker", pos: "5", change: "+8" },
                    { kw: "seo analyzer", pos: "1", change: "+22" },
                  ].map((k, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1 }}
                      className="bg-neutral-800 rounded-xl p-3 border border-neutral-700 text-center"
                    >
                      <p className="text-xs text-neutral-400 truncate mb-1">{k.kw}</p>
                      <p className="text-2xl font-black text-white">#{k.pos}</p>
                      <p className="text-xs text-emerald-400 font-bold">{k.change} positions</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Get Your Free SEO<br /><span className="text-emerald-400">Roadmap Analysis</span>
              </h2>
              <p className="text-neutral-400 text-lg mb-6 leading-relaxed">
                Stop guessing what's holding your rankings back. Our AI-powered roadmap analyzes your website against the latest Google ranking systems — including the Helpful Content System, E-E-A-T signals, and Core Web Vitals — then delivers a prioritized action plan.
              </p>
              <p className="text-neutral-400 mb-8 leading-relaxed">
                Watch your Search Console metrics climb as you follow the step-by-step recommendations. Most users see measurable improvements within the first 30 days.
              </p>
              <button onClick={scrollToAudit} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-500 transition-all flex items-center gap-2">
                Get Free Roadmap <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════ H2: SEO Site Checkup helps you rank higher... ════════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">SEO Site Checkup Helps You Rank Higher<br />on <span className="text-emerald-600">Google</span> and <span className="text-cyan-600">AI Engines</span></h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">Whether you're a SaaS startup or a global e-commerce brand, our platform adapts to your SEO workflow.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Cpu size={28} />, title: "For SaaS Marketers", desc: "Track keyword rankings, monitor technical health, and optimize product pages to acquire customers through organic search." },
              { icon: <BookOpen size={28} />, title: "For Content-Led Companies", desc: "Analyze content gaps, optimize topical authority clusters, and ensure every article meets Google's Helpful Content standards." },
              { icon: <TrendingUp size={28} />, title: "For Growth Agencies", desc: "Manage multiple client domains, generate white-label reports, and deliver measurable SEO results at scale." },
              { icon: <Layers size={28} />, title: "For E-commerce Brands", desc: "Audit product schemas, fix crawl budget waste, optimize category pages, and monitor Core Web Vitals across thousands of URLs." }
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-neutral-200 hover:border-emerald-200 hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-neutral-500 leading-relaxed text-sm">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ H2: How To Use This Tool (5 Steps) ════════════ */}
      <section className="py-24 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">How To Use This Tool</h2>
            <p className="text-lg text-neutral-500">Five simple steps to better Google rankings.</p>
          </div>
          <div className="space-y-6">
            {[
              { step: 1, title: "Enter a website URL", desc: "Type or paste any URL into the scan bar above. We accept domains, subdomains, and individual page URLs." },
              { step: 2, title: "Start the SEO scan", desc: "Click 'Run Audit' and our crawler visits your site, analyzing HTML, performance, structured data, and 50+ ranking signals." },
              { step: 3, title: "Analyze the SEO report", desc: "Review your overall SEO score, category breakdowns, and a prioritized list of issues ranked by impact on rankings." },
              { step: 4, title: "Fix technical issues", desc: "Follow the step-by-step fix instructions for each issue. No developer required — the guide is written in plain language." },
              { step: 5, title: "Monitor SEO performance", desc: "Re-scan periodically to track improvements, monitor keyword positions, and ensure new issues don't slip through." }
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex gap-6 items-start bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm"
              >
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-lg shrink-0">{s.step}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                  <p className="text-neutral-500 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ SEO Growth Animation Section ════════════ */}
      <section className="py-24 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Watch Your SEO <span className="text-emerald-400">Scale Upward</span></h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">Real performance improvements our users see after following InstantSEOScan recommendations.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* GSC Clicks Chart */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-neutral-800/60 backdrop-blur rounded-3xl border border-neutral-700 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-neutral-400">Organic Clicks</p>
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><TrendingUp size={14} /> +312%</span>
              </div>
              <div className="h-36">
                <AnimatedGSCChart delay={0} />
              </div>
              <div className="flex justify-between mt-3 text-xs text-neutral-500">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              </div>
            </motion.div>

            {/* SEO Score Bar Chart */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="bg-neutral-800/60 backdrop-blur rounded-3xl border border-neutral-700 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-neutral-400">SEO Score Growth</p>
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><TrendingUp size={14} /> 25→89</span>
              </div>
              <AnimatedBarChart />
            </motion.div>

            {/* Stats Cards */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {[
                { label: "Pages Audited", value: 1000000, suffix: "+", icon: <FileText size={20} /> },
                { label: "Keywords Tracked", value: 50000, suffix: "+", icon: <Target size={20} /> },
                { label: "Avg Ranking Improvement", value: 24, suffix: " positions", icon: <TrendingUp size={20} /> },
              ].map((stat, i) => (
                <div key={i} className="bg-neutral-800/60 backdrop-blur rounded-2xl border border-neutral-700 p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">{stat.icon}</div>
                  <div>
                    <p className="text-2xl font-black"><AnimatedCounter target={stat.value} suffix={stat.suffix} /></p>
                    <p className="text-xs text-neutral-500 font-semibold">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════ H2: What is SEO? ════════════ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black mb-8 text-center">What is SEO?</h2>
          <div className="prose prose-neutral prose-lg max-w-none">
            <p>
              Search Engine Optimization (SEO) is the practice of improving your website so it ranks higher in search engine results pages (SERPs). When someone types a query into Google, Bing, or an AI search engine like ChatGPT or Perplexity, SEO determines which websites appear at the top.
            </p>
            <p>
              SEO covers three main areas: <strong>Technical SEO</strong> ensures search engines can crawl and index your pages. <strong>On-Page SEO</strong> optimizes your content, headings, meta tags, and internal links. <strong>Off-Page SEO</strong> builds your domain authority through backlinks and brand mentions.
            </p>
            <p>
              In 2026, SEO also includes <strong>Generative Engine Optimization (GEO)</strong> — making your content visible in AI-generated answers from Google SGE, ChatGPT, Gemini, and Perplexity.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════ H2: Factors That Influence SEO ════════════ */}
      <section className="py-24 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-center">Factors That Influence SEO</h2>
          <p className="text-lg text-neutral-500 text-center mb-16 max-w-2xl mx-auto">Google uses hundreds of ranking signals. These are the most impactful.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <BookOpen size={24} />, title: "Content Quality", desc: "Original, helpful content that satisfies search intent and demonstrates E-E-A-T is the strongest ranking signal." },
              { icon: <Link2 size={24} />, title: "Backlinks", desc: "High-quality links from authoritative domains signal trust and improve your domain authority scores." },
              { icon: <Gauge size={24} />, title: "Page Speed", desc: "Core Web Vitals (LCP, CLS, INP) directly impact rankings. Faster sites win the SERP." },
              { icon: <Smartphone size={24} />, title: "Mobile Optimization", desc: "Google uses mobile-first indexing. Your mobile experience determines your ranking, not desktop." },
              { icon: <Link2 size={24} />, title: "Internal Linking", desc: "A strong internal link structure distributes authority and helps search engines discover all your pages." },
              { icon: <Shield size={24} />, title: "Domain Authority", desc: "Built over time through consistent publishing, backlinks, and brand reputation across the web." },
              { icon: <Bot size={24} />, title: "Crawlability", desc: "Clean robots.txt, XML sitemaps, and proper canonical tags ensure search engines can index every important page." },
              { icon: <Sparkles size={24} />, title: "AI Visibility", desc: "Structured data and entity-rich content help your site appear in AI-generated answers from ChatGPT, Perplexity, and SGE." }
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ H2: Why It's Important? ════════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Why SEO<br />Is <span className="text-emerald-600">Important</span></h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Organic search drives 53% of all website traffic. Unlike paid ads, SEO compounds over time — every page you optimize continues generating traffic for months and years.
              </p>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Businesses that invest in SEO see 5.3x more traffic than those relying solely on paid channels. With AI search engines now sending referral traffic, optimizing for both Google and LLMs is critical for long-term growth.
              </p>
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><MessageSquare size={20} className="text-emerald-600" /> Talk Strategy With An Expert</h3>
                <p className="text-neutral-600 text-sm mb-4">Not sure where to start? Our SEO specialists can review your report and recommend a custom growth plan.</p>
                <Link to="/contact" className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Book a Free Consultation <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
              {[
                { value: "53%", label: "of all website traffic comes from organic search", color: "bg-emerald-600" },
                { value: "5.3x", label: "more traffic vs paid-only strategies", color: "bg-cyan-600" },
                { value: "14.6%", label: "close rate for SEO leads vs 1.7% for outbound", color: "bg-violet-600" },
                { value: "70%", label: "of marketers say SEO is more effective than PPC", color: "bg-amber-500" },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm"
                >
                  <div className={`text-3xl font-black text-white ${stat.color} w-fit px-3 py-1 rounded-lg mb-3`}>{stat.value}</div>
                  <p className="text-neutral-500 text-sm leading-relaxed">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════ H2: SEO Site Checkup's Features ════════════ */}
      <section className="py-24 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">SEO Site Checkup's <span className="text-emerald-400">Features</span></h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">Everything you need to audit, optimize, and monitor your SEO from one platform.</p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Search size={24} />, title: "Deep Domain Analysis", desc: "Full-site crawl covering HTML structure, meta tags, headings hierarchy, image optimization, and canonical configuration." },
              { icon: <Eye size={24} />, title: "LLM Visibility Checker", desc: "Track how your brand appears in AI engines like ChatGPT, Perplexity, Gemini, and Google SGE. Know which prompts trigger your competitors." },
              { icon: <Bot size={24} />, title: "AI Content Analysis", desc: "Score your content against top-ranking pages using NLP. Identify semantic gaps, missing entities, and optimization opportunities." },
              { icon: <Code2 size={24} />, title: "Technical SEO Audits", desc: "Detect crawl errors, redirect chains, missing sitemaps, robots.txt issues, Core Web Vitals problems, and server configuration flaws." },
              { icon: <Gauge size={24} />, title: "Site Speed & Outage Monitoring", desc: "24/7 uptime monitoring and page speed tracking. Get alerted instantly when your site goes down or performance degrades." },
              { icon: <Link2 size={24} />, title: "Backlinks Checker", desc: "Analyze your backlink profile, identify toxic links, discover competitor link sources, and track new and lost links over time." },
              { icon: <Target size={24} />, title: "Top Keywords & Position Tracker", desc: "Monitor your keyword rankings daily. Track position changes, discover new keyword opportunities, and benchmark against competitors." },
              { icon: <FileText size={24} />, title: "White Label Reports", desc: "Generate branded PDF reports with your agency logo, custom colors, and client-ready insights. Perfect for agencies managing multiple domains." },
              { icon: <Activity size={24} />, title: "Competitor Benchmarking", desc: "Compare your SEO metrics side-by-side with competitors. Identify their strengths and find opportunities they're missing." }
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="bg-neutral-800/50 backdrop-blur rounded-2xl p-6 border border-neutral-700 hover:border-emerald-500/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ H2: AI Visibility Problems Businesses Face ════════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">AI Visibility Problems<br /><span className="text-red-500">Businesses Face</span></h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">AI search is the new battleground. If you're not visible in LLM-generated answers, you're losing deals every day.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "You're losing deals to competitors cited by AI", desc: "When ChatGPT or Perplexity recommends your competitor's product instead of yours, those prospects never even visit your website. AI citations are becoming the new #1 ranking." },
              { title: "You don't know what prompts trigger competitors", desc: "Your competitors might be appearing in dozens of AI-generated answers you don't know about. Without visibility tracking, you're flying blind in the AI search landscape." },
              { title: "Your brand is not mentioned by LLM agents", desc: "Large Language Models build their responses from structured, entity-rich content. If your website lacks proper schema markup and semantic depth, AI engines simply don't know you exist." },
              { title: "You don't know how to optimize for AI visibility", desc: "Traditional SEO alone isn't enough. You need a GEO (Generative Engine Optimization) and AEO (Answer Engine Optimization) strategy specifically designed for AI search engines." }
            ].map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-red-50 rounded-2xl p-8 border border-red-100"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center mb-4 font-black">{i + 1}</div>
                <h3 className="font-bold text-xl mb-3 text-neutral-800">{p.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ H2: What To Do With The Results ════════════ */}
      <section className="py-24 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black mb-8 text-center">What To Do With The Results</h2>
          <div className="prose prose-neutral prose-lg max-w-none">
            <p>
              Your SEO report is a roadmap, not just a diagnosis. Start with the highest-impact issues flagged as "Critical" — these are the problems most likely holding back your rankings. Fix broken links, add missing meta descriptions, and resolve crawl errors first.
            </p>
            <p>
              Next, move to "Warnings" — issues like slow page speed, missing alt text, or thin content that reduce your competitiveness. Finally, tackle "Opportunities" — schema markup additions, internal linking improvements, and content gaps that can push you from page two to page one.
            </p>
            <p>
              Re-scan your site after each round of fixes to verify improvements and catch new issues. SEO is iterative. The teams that audit, fix, and monitor consistently are the ones that dominate the SERPs.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════ Meta, Page Quality, Link Structure, Server Config ════════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Code2 size={24} />, title: "Meta Information", desc: "Meta titles and descriptions are the first thing users see in SERPs. Optimize length (50-60 chars for titles, 150-160 for descriptions), include target keywords naturally, and write compelling copy that drives clicks." },
              { icon: <BookOpen size={24} />, title: "Page Quality", desc: "Content depth, uniqueness, and relevance determine your page quality score. Avoid duplicate content, thin pages, and keyword stuffing. Aim for semantic completeness — cover related entities and subtopics." },
              { icon: <Link2 size={24} />, title: "Page & Link Structure", desc: "Clean URL hierarchies, descriptive slugs, and strategic internal linking distribute authority across your site. Use breadcrumbs, contextual links within content, and hub-and-spoke architecture." },
              { icon: <Server size={24} />, title: "Server Configuration", desc: "HTTP/2, proper redirect chains (301 vs 302), HSTS headers, GZIP compression, and server response times under 200ms all contribute to technical SEO health." }
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center mb-4">{s.icon}</div>
                <h3 className="font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ H2: Customer Reviews ════════════ */}
      <section className="py-24 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-center">Customer Reviews</h2>
          <p className="text-lg text-neutral-500 text-center mb-16 max-w-xl mx-auto">Real feedback from real SEO professionals and business owners.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah J.", role: "Head of SEO, TechFlow", quote: "InstantSEOScan identified a critical server response issue that was killing our blog rankings. After the fix, organic traffic jumped 40% in 3 weeks." },
              { name: "Marcus L.", role: "Founder, GrowthScale", quote: "The AI visibility checker is a game changer. We discovered our competitors were appearing in 3x more ChatGPT responses — now we've closed that gap." },
              { name: "Emily R.", role: "Marketing Director, ShopWell", quote: "We manage 200+ client sites. The white-label reports and bulk auditing features save our team 15+ hours every week." }
            ].map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => <Star key={s} size={16} className="text-yellow-400" fill="currentColor" />)}
                </div>
                <p className="text-neutral-600 leading-relaxed mb-6 italic">"{r.quote}"</p>
                <div>
                  <p className="font-bold text-neutral-800">{r.name}</p>
                  <p className="text-sm text-neutral-400">{r.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ H2: Frequently Asked Questions ════════════ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-center">Frequently Asked Questions</h2>
          <p className="text-lg text-neutral-500 text-center mb-12">Quick answers to common questions about InstantSEOScan.</p>
          <div className="space-y-4">
            <FAQItem question="Can I change my plan later?" answer="Yes. You can upgrade, downgrade, or cancel your plan at any time from your account dashboard. Changes take effect immediately with prorated billing." />
            <FAQItem question="Can I white-label reports for my clients?" answer="Absolutely. Our Pro and Agency plans include white-label PDF reports with your custom logo, brand colors, and personalized recommendations. Perfect for agencies managing multiple client domains." />
            <FAQItem question="Do I need technical SEO knowledge to use this tool?" answer="No. InstantSEOScan explains every issue in plain language with step-by-step fix instructions. Our AI assistant can also help you understand complex technical concepts." />
            <FAQItem question="How is InstantSEOScan different from other tools?" answer="We combine traditional SEO auditing (technical crawls, on-page analysis) with AI visibility tracking across ChatGPT, Perplexity, Gemini, and Google SGE. We're the only tool that covers both Google rankings and LLM citations." />
            <FAQItem question="What if I want to manage more domains?" answer="Our Agency plan supports unlimited domains. You can add, remove, and organize domains from a single dashboard with role-based access for your team." />
            <FAQItem question="What's included in the AI visibility tracking?" answer="We monitor how your brand is mentioned in AI-generated responses across major LLMs. You'll see which prompts trigger mentions of your brand vs competitors, and get recommendations to improve your AI citation rate." />
          </div>
        </div>
      </section>

      {/* ════════════ H2: More Free SEO Tools ════════════ */}
      <section className="py-24 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">More Free SEO Tools</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Code2 size={22} className="text-emerald-600" /> On-Page & Technical SEO</h3>
              <div className="grid gap-3">
                {[
                  { name: "Meta Tag Analyzer", href: "/tools/meta-tags" },
                  { name: "Heading Structure Checker", href: "/tools/heading-checker" },
                  { name: "Schema Markup Validator", href: "/tools/schema-validator" },
                  { name: "Core Web Vitals Tester", href: "/tools/core-web-vitals" },
                  { name: "Robots.txt Checker", href: "/tools/robots-txt" },
                  { name: "Sitemap Validator", href: "/tools/sitemap-validator" },
                ].map((tool, i) => (
                  <Link key={i} to={tool.href} className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 hover:border-emerald-300 hover:shadow-sm transition-all group">
                    <span className="font-semibold text-neutral-700 group-hover:text-emerald-600 transition-colors">{tool.name}</span>
                    <ArrowRight size={16} className="text-neutral-300 group-hover:text-emerald-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><BarChart3 size={22} className="text-cyan-600" /> Off-Page & SERPs</h3>
              <div className="grid gap-3">
                {[
                  { name: "Backlink Checker", href: "/tools/backlinks" },
                  { name: "Domain Authority Checker", href: "/tools/domain-authority" },
                  { name: "SERP Simulator", href: "/tools/serp-simulator" },
                  { name: "Keyword Density Analyzer", href: "/tools/keyword-density" },
                  { name: "AI Overview Checker", href: "/tools/ai-overview" },
                  { name: "Redirect Chain Checker", href: "/tools/redirect-checker" },
                ].map((tool, i) => (
                  <Link key={i} to={tool.href} className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 hover:border-cyan-300 hover:shadow-sm transition-all group">
                    <span className="font-semibold text-neutral-700 group-hover:text-cyan-600 transition-colors">{tool.name}</span>
                    <ArrowRight size={16} className="text-neutral-300 group-hover:text-cyan-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ H2: Latest Writings ════════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl md:text-5xl font-black">Latest Writings</h2>
            <Link to="/blog" className="text-emerald-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "When Great Content Fails: Why People Love It but AI Ignores It", desc: "Your article went viral on social media but ChatGPT never mentions it. Here's why content virality and AI visibility are two completely different games.", category: "AI SEO" },
              { title: "What Brand Subreddits Do for SEO", desc: "Reddit threads are now appearing in Google's AI Overviews. Learn how to leverage brand subreddits as a powerful off-page SEO signal.", category: "Off-Page SEO" },
              { title: "The Complete Guide to E-E-A-T in 2026", desc: "Experience, Expertise, Authoritativeness, and Trust — how Google evaluates content quality and what you need to do to meet its standards.", category: "On-Page SEO" },
            ].map((post, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <div className="h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                  <BookOpen size={48} className="text-neutral-300" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{post.category}</span>
                  <h3 className="font-bold text-lg mt-2 mb-3 group-hover:text-emerald-600 transition-colors">{post.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{post.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ Final CTA ════════════ */}
      <section className="py-24 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Dominate Your Niche?</h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">Join 2,000+ companies using InstantSEOScan to grow their organic traffic and capture AI search visibility.</p>
          <button
            onClick={scrollToAudit}
            className="bg-white text-emerald-600 px-10 py-4 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-all shadow-xl"
          >
            GET STARTED FOR FREE
          </button>
        </div>
      </section>
    </div>
  );
}
