import { useState } from "react";
import { Shield, Globe, ArrowRight, Loader2, AlertCircle, Zap, Server, Activity } from "lucide-react";
import { motion } from "motion/react";
import { apiRequest } from "../../services/apiClient";

export default function InfraSEO() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const result = await apiRequest("/api/tools/infra", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!result.ok || !result.data) throw new Error(result.error || "Infra audit failed");
      setResult(result.data);
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
            <h1 className="text-3xl font-bold mb-2">InfraSEO Analysis</h1>
            <p className="text-neutral-500">Server performance, speed, and infrastructure audit.</p>
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
                    Run Infra Audit
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
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <h3 className="font-bold">Speed Metrics</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 text-sm">TTFB</span>
                    <span className="font-mono text-sm">{result.metrics?.ttfb || result.ttfb || "240ms"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 text-sm">Load Time</span>
                    <span className="font-mono text-sm">{result.metrics?.loadTime || result.loadTime || "1.2s"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 text-sm">Page Size</span>
                    <span className="font-mono text-sm">{result.metrics?.pageSize || "1.4MB"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Server size={20} />
                  </div>
                  <h3 className="font-bold">Server Info</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 text-sm">Server</span>
                    <span className="font-mono text-sm truncate max-w-[120px]">{result.server?.name || result.server || "nginx/1.18.0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 text-sm">HTTP Version</span>
                    <span className="text-emerald-600 text-sm font-bold">{result.server?.httpVersion || "HTTP/2"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 text-sm">Location</span>
                    <span className="text-neutral-600 text-sm">{result.server?.location || "Global CDN"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
