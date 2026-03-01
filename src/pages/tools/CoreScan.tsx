import { useState } from "react";
import { Zap, Globe, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { getAIInsights, calculateScore } from "../../services/geminiService";
import { apiRequest } from "../../services/apiClient";

export default function CoreScan() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const renderAIContent = (content: any) => {
    if (!content) return "No analysis available.";
    if (typeof content === 'string') return content;
    if (typeof content === 'object') {
      // Handle the specific object structure mentioned in the error
      if (content.analysis || content.recommendation || content.primaryKeywords) {
        return (
          <div className="space-y-2">
            {content.primaryKeywords && (
              <div>
                <span className="font-bold text-xs uppercase text-neutral-400">Keywords: </span>
                <span className="text-sm">{Array.isArray(content.primaryKeywords) ? content.primaryKeywords.join(", ") : String(content.primaryKeywords)}</span>
              </div>
            )}
            {content.analysis && <p>{content.analysis}</p>}
            {content.recommendation && (
              <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-700 text-xs">
                <span className="font-bold">Recommendation: </span>{content.recommendation}
              </div>
            )}
          </div>
        );
      }
      // Fallback for other objects
      return JSON.stringify(content);
    }
    return String(content);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const result = await apiRequest<any>("/api/scan", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!result.ok || !result.data) throw new Error(result.error || "Scan failed");
      const data = result.data;

      // Perform AI Analysis on frontend
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      const aiResponse = await getAIInsights(targetUrl, data.technical, data.content);
      const score = calculateScore(data.technical);

      setResult({
        ...data,
        ai: aiResponse,
        score
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <main className="flex-1 p-8 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-2">CoreScan Engine</h1>
            <p className="text-neutral-500">Deep technical SEO analysis for any website.</p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 mb-8">
            <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input 
                  type="text" 
                  required
                  placeholder="example.com"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button 
                disabled={loading}
                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Analyze
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
                  <div className="text-4xl font-black text-blue-600 mb-1">{result.technical.h1Count}</div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">H1 Tags</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm text-center">
                  <div className="text-4xl font-black text-orange-600 mb-1">{result.technical.imgAltMissing}</div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Missing Alt</div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 font-bold">Technical Details</div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Title Tag</span>
                    <span className="font-medium text-right ml-4">{result.technical.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Meta Description</span>
                    <span className="font-medium truncate max-w-xs text-right ml-4">{result.technical.description}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Heading Structure</span>
                    <span className="font-medium">H1: {result.technical.h1Count} | H2: {result.technical.h2Count} | H3: {result.technical.h3Count}</span>
                  </div>
                </div>
              </div>

              {/* AI Powered Audit Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    Keyword Usage
                  </h3>
                  <div className="text-sm text-neutral-600 leading-relaxed">{renderAIContent(result.ai?.keywordUsage)}</div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    Content Gaps
                  </h3>
                  <div className="text-sm text-neutral-600 leading-relaxed">{renderAIContent(result.ai?.contentGaps)}</div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    Search Intent Match
                  </h3>
                  <div className="text-sm text-neutral-600 leading-relaxed">{renderAIContent(result.ai?.intentMatch)}</div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    NLP Suggestions
                  </h3>
                  <div className="text-sm text-neutral-600 leading-relaxed">{renderAIContent(result.ai?.nlpSuggestions)}</div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold mb-6 flex items-center gap-2 text-lg">
                  <Zap size={20} className="text-emerald-600" />
                  AI Generated FAQs
                </h3>
                <div className="space-y-4">
                  {result.ai?.faq && Array.isArray(result.ai.faq) ? result.ai.faq.map((item: any, i: number) => (
                    <div key={i} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div className="font-bold text-sm mb-1">{typeof item === 'string' ? item : (item.question || "Question")}</div>
                      {item.answer && <div className="text-xs text-neutral-500">{item.answer}</div>}
                    </div>
                  )) : (
                    <p className="text-sm text-neutral-500">
                      {typeof result.ai?.faq === 'string' ? result.ai.faq : "No FAQs generated."}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold mb-6 text-lg">Actionable Improvements</h3>
                <div className="space-y-6">
                  {result.ai?.improvements && Array.isArray(result.ai.improvements) ? result.ai.improvements.map((imp: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-bold mb-1">{imp.title}</div>
                        <div className="text-sm text-neutral-500 leading-relaxed">{imp.description}</div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-neutral-500">No specific improvements identified.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
