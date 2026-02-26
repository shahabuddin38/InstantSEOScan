import { Search, Shield, Zap, Globe, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      navigate(`/dashboard?scan=${encodeURIComponent(url)}`);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-20 bg-[radial-gradient(circle_at_50%_50%,#10b981_0,transparent_50%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-neutral-200" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-100">
              <Zap size={14} />
              Next-Gen SEO Audit Engine
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 mb-8 leading-[1.1]">
              Audit Your Website <br />
              <span className="text-emerald-600">In Seconds, Not Hours.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-neutral-600 mb-12 leading-relaxed">
              InstantSEOScan provides deep technical audits, AI-powered content optimization, and authority tracking to help you dominate search results.
            </p>

            <form onSubmit={handleScan} className="max-w-2xl mx-auto relative group">
              <div className="absolute -inset-1 bg-emerald-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl border border-neutral-200 shadow-xl shadow-neutral-200/50">
                <div className="flex-1 flex items-center px-4">
                  <Globe className="text-neutral-400 mr-3" size={20} />
                  <input 
                    type="url" 
                    placeholder="https://yourwebsite.com" 
                    className="w-full py-3 bg-transparent outline-none text-neutral-900 placeholder:text-neutral-400"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>
                <button className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                  Analyze Now
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-neutral-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span className="text-sm font-medium">Technical Audit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span className="text-sm font-medium">AI Content Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span className="text-sm font-medium">Backlink Radar</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Rank</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Our modular SEO engine covers every aspect of search engine optimization, from server speed to semantic intent.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Zap />, title: "CoreScan Engine", desc: "Deep technical analysis of meta tags, headers, and site structure." },
              { icon: <Shield />, title: "InfraSEO Analysis", desc: "Server-side performance and security signals that impact rankings." },
              { icon: <BarChart3 />, title: "Authority Radar", desc: "Track your domain authority and backlink profile in real-time." },
              { icon: <Globe />, title: "GeoRank System", desc: "Local SEO signals and map pack optimization tracking." },
              { icon: <Search />, title: "Keyword Matrix", desc: "Advanced keyword research with difficulty and intent mapping." },
              { icon: <CheckCircle2 />, title: "SmartSchema Builder", desc: "Generate perfect structured data for rich search results." },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:shadow-xl hover:shadow-neutral-200/50 transition-all"
              >
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Section (1500 words placeholder/summary) */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-neutral prose-emerald">
          <h2 className="text-4xl font-bold mb-8">Why SEO Auditing is Critical for Modern SaaS Growth</h2>
          <p className="text-lg leading-relaxed mb-6">
            In the hyper-competitive landscape of digital marketing, having a website is not enough. You need a website that search engines can understand, index, and rank. This is where <strong>InstantSEOScan</strong> comes in. Our platform is designed to be the ultimate companion for marketers, developers, and business owners who want to take their organic traffic to the next level.
          </p>
          
          <h3 className="text-2xl font-bold mt-12 mb-4">Technical SEO: The Foundation of Success</h3>
          <p className="mb-6">
            Technical SEO refers to website and server optimizations that help search engine spiders crawl and index your site more effectively. Without a solid technical foundation, even the best content will struggle to rank. Our <strong>CoreScan Engine</strong> analyzes over 50 technical signals, including:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
            <li className="flex items-center gap-2 bg-white p-4 rounded-xl border border-neutral-200">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <span>Crawlability & Indexing status</span>
            </li>
            <li className="flex items-center gap-2 bg-white p-4 rounded-xl border border-neutral-200">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <span>XML Sitemap & Robots.txt validation</span>
            </li>
            <li className="flex items-center gap-2 bg-white p-4 rounded-xl border border-neutral-200">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <span>Canonical tag implementation</span>
            </li>
            <li className="flex items-center gap-2 bg-white p-4 rounded-xl border border-neutral-200">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <span>SSL/HTTPS security signals</span>
            </li>
          </ul>

          <h3 className="text-2xl font-bold mt-12 mb-4">AI-Powered Content Optimization</h3>
          <p className="mb-6">
            With the rise of semantic search, search engines like Google are getting better at understanding the <em>intent</em> behind a query. Our <strong>ContentBoost AI</strong> uses advanced LLMs to analyze your on-page content and suggest improvements that align with user intent and topical authority.
          </p>
          <div className="bg-emerald-900 text-white p-8 rounded-3xl my-12">
            <h4 className="text-white text-xl font-bold mb-4">The Future of Search is Semantic</h4>
            <p className="opacity-80 leading-relaxed">
              We don't just look for keywords. We look for entities, relationships, and context. Our IntentMap AI helps you visualize how your content covers a topic, identifying "content gaps" that your competitors might be exploiting.
            </p>
          </div>

          <p className="text-neutral-500 italic text-sm mt-12">
            [SEO Optimized Content continues for 1500+ words covering Authority, Local SEO, and Schema...]
          </p>
        </div>
      </section>
    </div>
  );
}
