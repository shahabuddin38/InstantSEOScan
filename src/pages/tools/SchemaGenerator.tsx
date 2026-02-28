import { useState } from "react";
import { Zap, ArrowRight, Loader2, AlertCircle, CheckCircle2, Code, Copy, Check } from "lucide-react";
import { motion } from "motion/react";
import { generateSchema } from "../../services/geminiService";

export default function SchemaGenerator() {
  const [type, setType] = useState("FAQ");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const schema = await generateSchema(type, { input: data });
      setResult(schema);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <main className="flex-1 p-8 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-2">AI Schema Markup Generator</h1>
            <p className="text-neutral-500">Instantly generate valid JSON-LD schema for FAQ, Article, Product, and more.</p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 mb-8">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Schema Type</label>
                <select 
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="FAQ">FAQ Schema</option>
                  <option value="Article">Article Schema</option>
                  <option value="Product">Product Schema</option>
                  <option value="HowTo">HowTo Schema</option>
                  <option value="LocalBusiness">Local Business Schema</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Data / Content</label>
                <textarea 
                  required
                  rows={6}
                  placeholder="Paste the relevant content or details here..."
                  className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>

              <button 
                disabled={loading || !data}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Generate JSON-LD Schema
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
              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 font-bold flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Code size={18} className="text-emerald-600" />
                    JSON-LD Output
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="text-neutral-400 hover:text-emerald-600 transition-colors"
                  >
                    {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                  </button>
                </div>
                <div className="p-8 bg-neutral-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  How to use this?
                </h4>
                <p className="text-emerald-700 text-sm leading-relaxed">
                  Copy the code above and paste it into the <code>&lt;head&gt;</code> section of your HTML or use a plugin to add it to your page.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
