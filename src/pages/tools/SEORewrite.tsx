import { useState } from "react";
import { Zap, Globe, ArrowRight, Loader2, AlertCircle, CheckCircle2, Copy, Check } from "lucide-react";
import { motion } from "motion/react";
import { rewriteForSEO } from "../../services/geminiService";

export default function SEORewrite() {
  const [content, setContent] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleRewrite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await rewriteForSEO(content, keyword);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <h1 className="text-3xl font-bold mb-2">AI SEO Content Rewriter</h1>
            <p className="text-neutral-500">Transform your content into a high-ranking SEO masterpiece.</p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 mb-8">
            <form onSubmit={handleRewrite} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Target Keyword</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., best coffee makers 2024"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Original Content</label>
                <textarea 
                  required
                  rows={8}
                  placeholder="Paste your content here..."
                  className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <button 
                disabled={loading || !content || !keyword}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Rewrite for SEO
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
              className="space-y-8"
            >
              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 font-bold flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap size={18} className="text-emerald-600" />
                    Optimized Content
                  </div>
                  <button 
                    onClick={() => copyToClipboard(result.rewrittenContent)}
                    className="text-neutral-400 hover:text-emerald-600 transition-colors"
                  >
                    {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                  </button>
                </div>
                <div className="p-8 prose prose-neutral max-w-none whitespace-pre-wrap text-sm text-neutral-600 leading-relaxed">
                  {renderAIContent(result.rewrittenContent)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                  <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-neutral-400">Meta Description</h3>
                  <p className="text-sm text-neutral-600 italic">"{renderAIContent(result.metaDescription)}"</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                  <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-neutral-400">Schema Markup (JSON-LD)</h3>
                  <pre className="text-[10px] bg-neutral-50 p-4 rounded-xl overflow-x-auto border border-neutral-100">
                    {JSON.stringify(result.schema, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  Generated FAQs
                </h3>
                <div className="space-y-4">
                  {result.faqs?.map((faq: any, i: number) => (
                    <div key={i} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div className="font-bold text-sm mb-1">{renderAIContent(faq.question)}</div>
                      <div className="text-xs text-neutral-500">{renderAIContent(faq.answer)}</div>
                    </div>
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
