import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getCannibalization } from "../../services/seoToolsService";
import PageSEO from "../../components/seo/PageSEO";
import InternalToolLinks from "../../components/seo/InternalToolLinks";

export default function KeywordCannibalizationChecker() {
  const [domain, setDomain] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      setResult(await getCannibalization({ domain, keyword }));
    } catch (err: any) {
      setError(err.message || "Failed to check cannibalization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <main className="flex-1 p-8 bg-neutral-50">
        <PageSEO title="Keyword Cannibalization Checker | InstantSEOScan" description="Detect pages competing for the same keyword and get cannibalization fixes." canonicalPath="/tools/keyword-cannibalization" schema={{"@context":"https://schema.org","@type":"SoftwareApplication","name":"Keyword Cannibalization Checker"}} />
        <div className="max-w-5xl mx-auto space-y-6">
          <div><h1 className="text-3xl font-bold">Keyword Cannibalization Checker</h1><p className="text-neutral-500 mt-2">Find URL overlap, cannibalization warnings, and consolidation recommendations.</p></div>
          <form onSubmit={run} className="bg-white rounded-2xl border border-neutral-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} required />
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} required />
            <button className="md:col-span-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700" disabled={loading}>{loading ? <Loader2 className="animate-spin inline" size={16}/> : "Check Cannibalization"}</button>
          </form>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}
          {result && <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <div className="text-sm"><b>Warning:</b> {result.cannibalizationWarning ? "High cannibalization risk" : "No significant cannibalization"}</div>
            <div className="text-sm"><b>Suggested Fix:</b> {result.suggestedFix}</div>
            <div className="text-sm"><b>Competing Pages:</b> {result.competingPages?.length || 0}</div>
          </div>}
          <InternalToolLinks />
        </div>
      </main>
    </div>
  );
}
