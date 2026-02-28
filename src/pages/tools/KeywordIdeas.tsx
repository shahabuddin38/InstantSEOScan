import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Search, ArrowRight, Loader2, AlertCircle, CheckCircle2, Hash, HelpCircle, Network } from "lucide-react";
import { motion } from "motion/react";
import { generateKeywords } from "../../services/geminiService";

export default function KeywordIdeas() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await generateKeywords(topic);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 p-8 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-2">AI Keyword Generator</h1>
            <p className="text-neutral-500">Discover high-volume, low-competition keywords for your niche.</p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 mb-8">
            <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input 
                  type="text" 
                  required
                  placeholder="Enter a topic or seed keyword..."
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <button 
                disabled={loading || !topic}
                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Get Ideas
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
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <Hash size={18} className="text-emerald-600" />
                  Primary Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.ideas?.map((kw: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <ArrowRight size={18} className="text-blue-600" />
                  Long-Tail Keywords
                </h3>
                <div className="space-y-3">
                  {result.longTail?.map((kw: string, i: number) => (
                    <div key={i} className="text-sm text-neutral-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      {kw}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <Network size={18} className="text-purple-600" />
                  Semantic & Entities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.semantic?.map((kw: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-xs font-medium border border-purple-100">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <HelpCircle size={18} className="text-orange-600" />
                  Question-Based (PAA)
                </h3>
                <div className="space-y-3">
                  {result.questions?.map((q: string, i: number) => (
                    <div key={i} className="text-sm text-neutral-600 leading-relaxed italic">
                      "{q}"
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
