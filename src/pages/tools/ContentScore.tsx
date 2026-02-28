import { useState } from "react";
import { Zap, Globe, ArrowRight, Loader2, AlertCircle, CheckCircle2, FileText, Search } from "lucide-react";
import { motion } from "motion/react";
import { optimizeContent } from "../../services/geminiService";

export default function ContentScore() {
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await optimizeContent(url || "User Content", content);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAIContent = (content: any) => {
    if (!content) return null;
    if (typeof content === "string") return content;
    if (Array.isArray(content)) return content.join(", ");
    if (typeof content === "object") {
      return Object.entries(content)
        .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`)
        .join(" | ");
    }
    return String(content);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <main className="flex-1 p-8 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-2">AI Content SEO Checker</h1>
            <p className="text-neutral-500">Get a real-time SEO score and optimization tips for your content.</p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 mb-8">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Target URL (Optional)</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="example.com/blog-post"
                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Your Content</label>
                <textarea 
                  required
                  rows={10}
                  placeholder="Paste your article or content here..."
                  className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <button 
                disabled={loading || !content}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Analyze Content Score
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
          </div>

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm text-center">
                  <div className="text-4xl font-black text-emerald-600 mb-1">{result.score}</div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">SEO Score</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm text-center">
                  <div className="text-lg font-bold text-blue-600 mb-1">{renderAIContent(result.readability)}</div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Readability</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm text-center">
                  <div className="text-lg font-bold text-orange-600 mb-1">{result.keywords?.length || 0}</div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Target Keywords</div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 font-bold flex items-center gap-2">
                  <Zap size={18} className="text-emerald-600" />
                  Optimization Suggestions
                </div>
                <div className="p-6 space-y-4">
                  {result.suggestions?.map((s: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-bold text-sm mb-1">{renderAIContent(s.title)}</div>
                        <div className="text-xs text-neutral-500 leading-relaxed">{renderAIContent(s.description)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6">
                <div className="font-bold mb-4 flex items-center gap-2">
                  <Search size={18} className="text-blue-600" />
                  Keyword Usage Analysis
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords?.map((kw: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
