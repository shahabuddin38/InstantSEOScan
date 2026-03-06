import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getIntentAnalysis } from "../../services/seoToolsService";
import PageSEO from "../../components/seo/PageSEO";
import InternalToolLinks from "../../components/seo/InternalToolLinks";

export default function SERPIntentAnalyzer() {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("us");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      setResult(await getIntentAnalysis({ keyword, country }));
    } catch (err: any) {
      setError(err.message || "Failed to analyze intent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <main className="flex-1 p-8 bg-neutral-50">
        <PageSEO title="SERP Intent Analyzer | InstantSEOScan" description="Detect informational, commercial, transactional, and navigational intent from top 10 SERP results." canonicalPath="/tools/serp-intent-analyzer" schema={{"@context":"https://schema.org","@type":"SoftwareApplication","name":"SERP Intent Analyzer"}} />
        <div className="max-w-5xl mx-auto space-y-6">
          <div><h1 className="text-3xl font-bold">SERP Intent Analyzer</h1><p className="text-neutral-500 mt-2">Analyze top 10 Google results to detect dominant search intent and content type distribution.</p></div>
          <form onSubmit={run} className="bg-white rounded-2xl border border-neutral-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} required />
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
            <button className="md:col-span-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700" disabled={loading}>{loading ? <Loader2 className="animate-spin inline" size={16}/> : "Analyze Intent"}</button>
          </form>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}
          {result && <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <div className="text-sm"><b>Dominant Intent:</b> {result.dominantIntent}</div>
            <div className="text-sm"><b>Distribution:</b> Informational {result.intentDistribution?.informational || 0}, Commercial {result.intentDistribution?.commercial || 0}, Transactional {result.intentDistribution?.transactional || 0}, Navigational {result.intentDistribution?.navigational || 0}</div>
          </div>}
          <InternalToolLinks />
        </div>
      </main>
    </div>
  );
}
