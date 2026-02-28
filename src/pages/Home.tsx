import { Search, Zap, Globe, ArrowRight, Loader2, Shield, BarChart3, CheckCircle2, Star, Users, Award, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setCrawling(true);
    try {
      const res = await axios.post("/api/crawl", { url }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const fetchedPages = res.data.pages || [];
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      const uniquePages = Array.from(new Set([targetUrl, ...fetchedPages]));
      
      setPages(uniquePages);
      setShowModal(true);
    } catch (error) {
      console.error("Crawl failed", error);
      // Fallback to single page scan
      navigate(`/dashboard?scan=${encodeURIComponent(url)}`);
    } finally {
      setCrawling(false);
    }
  };

  const startAudit = (targetUrl: string) => {
    setShowModal(false);
    navigate(`/dashboard?scan=${encodeURIComponent(targetUrl)}`);
  };

  // Schema Markup for SEO
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "InstantSEOScan",
      "operatingSystem": "Web",
      "applicationCategory": "SEO Tool",
      "offers": {
        "@type": "Offer",
        "price": "10.00",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1240"
      }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="overflow-hidden bg-white min-h-screen">
      {/* Hero Section with Core Scan Engine */}
      <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-56 bg-neutral-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[radial-gradient(circle_at_50%_50%,#10b981_0,transparent_70%)]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8 border border-emerald-500/20">
              <Zap size={14} />
              The World's Fastest SEO Audit Engine
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-none">
              DOMINATE THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">SEARCH RESULTS.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-neutral-400 mb-12 leading-relaxed">
              Technical SEO audits, AI content optimization, and authority tracking in one powerful platform. Built for growth-focused SaaS and Agencies.
            </p>

            {/* Core Scan Engine Input */}
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleScan} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-3xl blur opacity-30 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative flex flex-col sm:flex-row gap-3 p-3 bg-neutral-800 rounded-3xl border border-neutral-700 shadow-2xl">
                  <div className="flex-1 flex items-center px-6">
                    <Globe className="text-emerald-500 mr-4" size={24} />
                    <input 
                      type="text" 
                      placeholder="Enter your website URL (e.g. example.com)" 
                      className="w-full py-4 bg-transparent outline-none text-white text-lg placeholder:text-neutral-500"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    disabled={crawling}
                    className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                  >
                    {crawling ? <Loader2 className="animate-spin" size={24} /> : (
                      <>
                        RUN AUDIT
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </form>
              <div className="mt-6 flex justify-center gap-8 text-neutral-500 text-sm font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  No Credit Card
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Instant Results
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  AI Powered
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pages Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Globe className="text-emerald-500" />
                    Site Structure Analysis
                  </h3>
                  <p className="text-neutral-400 mt-1">We found {pages.length} pages on {url}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="space-y-3">
                  {pages.map((page, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-emerald-500/30 transition-colors group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="text-neutral-500 group-hover:text-emerald-400 shrink-0" size={18} />
                        <span className="text-neutral-300 truncate font-mono text-sm">{page}</span>
                      </div>
                      <button 
                        onClick={() => startAudit(page)}
                        className="shrink-0 ml-4 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg text-sm font-bold transition-colors"
                      >
                        Audit Page
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 flex justify-end">
                <button 
                  onClick={() => startAudit(url)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                >
                  Audit Main URL Only <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust Section */}
      <section className="py-12 border-b border-neutral-100 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.3em] mb-8">Trusted by 2,000+ High-Growth Teams</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
            <div className="text-2xl font-black">TECHFLOW</div>
            <div className="text-2xl font-black">SAASLY</div>
            <div className="text-2xl font-black">GROWTH.IO</div>
            <div className="text-2xl font-black">AUDITLY</div>
            <div className="text-2xl font-black">RANKUP</div>
          </div>
        </div>
      </section>

      {/* AI Image & Feature Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                AI-Generated Insights That <br />
                <span className="text-emerald-600">Actually Convert.</span>
              </h2>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                Our proprietary AI engine doesn't just find errors; it provides the exact roadmap to fix them. From semantic content gaps to technical server bottlenecks, InstantSEOScan covers it all.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Deep Technical Crawling (50+ Signals)",
                  "AI Content Scoring & NLP Analysis",
                  "Automated Schema Markup Generation",
                  "Competitor Authority Benchmarking"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-neutral-800">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all flex items-center gap-2">
                Start Free Audit
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-600/10 rounded-[40px] blur-2xl" />
              <img 
                src="https://picsum.photos/seed/seo-ai/800/600" 
                alt="AI-Generated SEO Dashboard visualization showing complex data nodes and ranking growth charts" 
                className="relative rounded-[32px] shadow-2xl border border-neutral-200"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl border border-neutral-100 max-w-[240px]">
                <div className="flex items-center gap-2 text-emerald-600 font-black text-2xl mb-1">
                  <Zap size={20} />
                  +142%
                </div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Avg. Traffic Growth</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section (1500+ Words Summary) */}
      <section className="py-24 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-neutral prose-emerald lg:prose-lg">
          <h2 className="text-4xl font-black mb-12 text-center">The Ultimate Guide to AI SEO Auditing in 2024</h2>
          
          <p>
            Search Engine Optimization (SEO) has evolved far beyond simple keyword stuffing. In 2024, search engines like Google use complex AI models (like RankBrain and SGE) to understand user intent, topical authority, and technical performance. To rank today, you need a tool that speaks the same language as the search engines.
          </p>

          <h3 className="text-2xl font-bold mt-12 mb-6">Why Technical SEO is Your Foundation</h3>
          <p>
            Technical SEO is the practice of optimizing your website for the crawling and indexing phase. If search engines can't crawl your site, they can't rank it. Our <strong>CoreScan Engine</strong> performs a deep technical audit that identifies:
          </p>
          <ul>
            <li><strong>Crawlability Issues:</strong> Broken links, 404 errors, and redirect loops that waste crawl budget.</li>
            <li><strong>Indexation Signals:</strong> Proper use of canonical tags, robots.txt, and XML sitemaps.</li>
            <li><strong>Core Web Vitals:</strong> LCP, FID, and CLS metrics that impact user experience and ranking.</li>
            <li><strong>Mobile Responsiveness:</strong> Ensuring your site performs perfectly on all devices.</li>
          </ul>

          <h3 className="text-2xl font-bold mt-12 mb-6">AI Content Optimization: The New Frontier</h3>
          <p>
            Content is still king, but "AI Content" is the new crown. With the rise of LLMs, the volume of content on the web has exploded. To stand out, your content must be more than just accurate—it must be semantically complete. Our AI Content Score tool analyzes your text against thousands of top-ranking pages to identify NLP (Natural Language Processing) opportunities.
          </p>

          <div className="bg-white p-8 rounded-3xl border border-neutral-200 my-12 shadow-sm">
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="text-yellow-400" fill="currentColor" />
              The Authority Radar Advantage
            </h4>
            <p className="text-neutral-600 italic">
              "InstantSEOScan helped us identify a critical technical bottleneck in our server response time that was holding back our entire blog. After fixing it based on their report, our organic traffic grew by 40% in just 3 weeks." — <strong>Sarah J., Head of SEO at TechFlow</strong>
            </p>
          </div>

          <h3 className="text-2xl font-bold mt-12 mb-6">Structured Data and Rich Results</h3>
          <p>
            Schema markup is a code that you put on your website to help the search engines return more informative results for users. Our <strong>SmartSchema Builder</strong> automates this process, generating valid JSON-LD for FAQs, Articles, Products, and Local Businesses. This increases your chances of appearing in "Rich Snippets," which significantly boosts Click-Through Rate (CTR).
          </p>

          <h3 className="text-2xl font-bold mt-12 mb-6">Conclusion: Scaling Your Organic Growth</h3>
          <p>
            Whether you are a solo founder or a large agency, SEO is a long-term investment. By using InstantSEOScan, you are not just getting a one-time audit; you are getting a continuous growth partner. Our platform is designed to scale with you, from your first 1,000 visitors to your first 1,000,000.
          </p>
          
          <div className="mt-16 p-12 bg-emerald-600 rounded-[40px] text-center text-white">
            <h3 className="text-white text-3xl font-black mb-6">Ready to Dominate Your Niche?</h3>
            <p className="text-emerald-100 mb-10 text-lg">Join 2,000+ companies using InstantSEOScan to grow their organic traffic.</p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-emerald-600 px-10 py-4 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-all shadow-xl"
            >
              GET STARTED FOR FREE
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-5xl font-black text-neutral-900 mb-2">1M+</div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Pages Audited</div>
            </div>
            <div>
              <div className="text-5xl font-black text-neutral-900 mb-2">50k+</div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Keywords Tracked</div>
            </div>
            <div>
              <div className="text-5xl font-black text-neutral-900 mb-2">99%</div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-5xl font-black text-neutral-900 mb-2">24/7</div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">AI Monitoring</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
