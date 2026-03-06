import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getSerpComparison } from "../../services/seoToolsService";
import PageSEO from "../../components/seo/PageSEO";
import InternalToolLinks from "../../components/seo/InternalToolLinks";

export default function SERPComparisonTool() {
  const [keywordA, setKeywordA] = useState("");
  const [keywordB, setKeywordB] = useState("");
  const [country, setCountry] = useState("us");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      setResult(await getSerpComparison({ keywordA, keywordB, country }));
    } catch (err: any) {
      setError(err.message || "Failed to compare SERPs");
    } finally {
      setLoading(false);
    }
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SERP Comparison Tool",
    applicationCategory: "SEOApplication",
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <main className="flex-1 p-8 bg-neutral-50">
        <PageSEO title="SERP Comparison Tool | InstantSEOScan" description="Compare two keywords, calculate SERP overlap, and decide single page vs separate pages strategy." canonicalPath="/tools/serp-comparison" schema={schema} />
        <div className="max-w-5xl mx-auto space-y-6">
          <div><h1 className="text-3xl font-bold">SERP Comparison Tool</h1><p className="text-neutral-500 mt-2">Compare keyword SERPs, shared ranking pages, and targeting strategy recommendations.</p></div>
          <form onSubmit={run} className="bg-white rounded-2xl border border-neutral-200 p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Keyword A" value={keywordA} onChange={(e) => setKeywordA(e.target.value)} required />
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Keyword B" value={keywordB} onChange={(e) => setKeywordB(e.target.value)} required />
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
            <button className="md:col-span-3 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700" disabled={loading}>{loading ? <Loader2 className="animate-spin inline" size={16} /> : "Compare SERP"}</button>
          </form>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}
          {result && <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <div className="text-sm"><b>SERP Similarity:</b> {result.serpSimilarity}%</div>
            <div className="text-sm"><b>Shared Ranking Pages:</b> {result.sharedRankingPages?.length || 0}</div>
            <div className="text-sm"><b>Recommendation:</b> {result.recommendation}</div>
          </div>}
          <InternalToolLinks />
        </div>
      </main>
    </div>
  );
}
