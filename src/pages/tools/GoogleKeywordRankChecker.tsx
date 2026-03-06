import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { getKeywordRank } from "../../services/seoToolsService";
import PageSEO from "../../components/seo/PageSEO";
import InternalToolLinks from "../../components/seo/InternalToolLinks";

export default function GoogleKeywordRankChecker() {
  const [keyword, setKeyword] = useState("");
  const [domain, setDomain] = useState("");
  const [country, setCountry] = useState("us");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await getKeywordRank({ keyword, domain, country, email: email || undefined });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze ranking");
    } finally {
      setLoading(false);
    }
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Google Keyword Rank Checker",
    applicationCategory: "SEOApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <main className="flex-1 p-8 bg-neutral-50">
        <PageSEO
          title="Google Keyword Rank Checker Tool | InstantSEOScan"
          description="Check Google keyword ranking position, top competitors, keyword difficulty, SERP overlap, and traffic potential."
          canonicalPath="/tools/google-keyword-rank-checker"
          schema={schema}
        />

        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Google Keyword Rank Checker</h1>
            <p className="text-neutral-500 mt-2">Track keyword ranking, competitors, keyword difficulty, and SERP overlap for faster SEO decisions.</p>
          </div>

          <form onSubmit={run} className="bg-white rounded-2xl border border-neutral-200 p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} required />
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} required />
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Country (us)" value={country} onChange={(e) => setCountry(e.target.value)} required />
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Email (unlock advanced)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="md:col-span-4 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} Analyze Ranking
            </button>
          </form>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}

          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-neutral-200"><div className="text-xs text-neutral-500">Google Position</div><div className="text-2xl font-black">{result.rankingPosition ?? "N/A"}</div></div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200"><div className="text-xs text-neutral-500">Difficulty</div><div className="text-2xl font-black">{result.keywordDifficulty}</div></div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200"><div className="text-xs text-neutral-500">SERP Overlap</div><div className="text-2xl font-black">{result.serpOverlap}%</div></div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200"><div className="text-xs text-neutral-500">Traffic Potential</div><div className="text-2xl font-black">{result.trafficPotential}</div></div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200"><div className="text-xs text-neutral-500">GEO Boost</div><div className="text-2xl font-black">A+</div></div>

              <div className="md:col-span-2 lg:col-span-5 bg-white p-5 rounded-2xl border border-neutral-200">
                <h2 className="font-bold mb-2">Top 10 Competitors</h2>
                <div className="flex flex-wrap gap-2">{(result.topCompetitors || []).map((c: string) => <span key={c} className="px-3 py-1 rounded-xl text-xs bg-neutral-100">{c}</span>)}</div>
                {result.leadLocked && <p className="text-sm text-amber-700 mt-3">Enter email to unlock advanced keyword clusters and AI Overview optimization suggestions.</p>}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h2 className="font-bold mb-2">AI Search Optimization Notes</h2>
            <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
              <li>Use clear answer-first intros for Google AI Overviews and ChatGPT-style retrieval.</li>
              <li>Include entity mentions, semantic variants, and question blocks for GEO performance.</li>
              <li>Build topical clusters with internal links to improve ranking probability.</li>
            </ul>
          </div>

          <InternalToolLinks />
        </div>
      </main>
    </div>
  );
}
