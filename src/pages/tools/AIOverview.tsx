import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Zap, ArrowRight, Loader2, AlertCircle, CheckCircle2, MessageSquare, Target, Lightbulb } from "lucide-react";
import { motion } from "motion/react";
import { optimizeForAIOverview } from "../../services/geminiService";

export default function AIOverview() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await optimizeForAIOverview(content);
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
      <Sidebar />
      <main className="flex-1 p-8 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-2">AI Overview Optimizer</h1>
            <p className="text-neutral-500">Optimize your content to rank in Google's AI-generated overviews (SGE).</p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 mb-8">
            <form onSubmit={handleOptimize} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Your Content</label>
                <textarea 
                  required
                  rows={10}
                  placeholder="Paste your article or paragraph here..."
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
                    Optimize for AI Results
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="text-5xl font-black text-emerald-600 mb-2">{result.clarityScore}%</div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Answer Clarity Score</div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-neutral-400">
                    <Target size={16} className="text-blue-600" />
                    Entity Coverage
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{renderAIContent(result.entityCoverage)}</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 font-bold flex items-center gap-2">
                  <MessageSquare size={18} className="text-emerald-600" />
                  Optimized Direct Answer
                </div>
                <div className="p-8 bg-emerald-50/30 text-neutral-700 leading-relaxed italic">
                  "{renderAIContent(result.directAnswer)}"
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  Structured Q&A for AI
                </h3>
                <div className="space-y-4">
                  {result.structuredQA?.map((qa: any, i: number) => (
                    <div key={i} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div className="font-bold text-sm mb-1">{renderAIContent(qa.question)}</div>
                      <div className="text-xs text-neutral-500">{renderAIContent(qa.answer)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Lightbulb size={18} className="text-orange-600" />
                  Conversational Tips
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{renderAIContent(result.conversationalTips)}</p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
