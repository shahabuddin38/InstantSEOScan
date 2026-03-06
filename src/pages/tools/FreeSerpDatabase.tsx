import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getSerpDatabase } from "../../services/seoToolsService";
import PageSEO from "../../components/seo/PageSEO";
import InternalToolLinks from "../../components/seo/InternalToolLinks";

export default function FreeSerpDatabase() {
  const [keyword, setKeyword] = useState("");
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
      setResult(await getSerpDatabase({ keyword, country, email: email || undefined }));
    } catch (err: any) {
      setError(err.message || "Failed to load SERP database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <main className="flex-1 p-8 bg-neutral-50">
        <PageSEO title="Free SERP Database | InstantSEOScan" description="Search keyword and explore top 100 Google results with title, description, backlinks, traffic, and word count." canonicalPath="/tools/free-serp-database" schema={{"@context":"https://schema.org","@type":"Dataset","name":"Free SERP Database"}} />
        <div className="max-w-6xl mx-auto space-y-6">
          <div><h1 className="text-3xl font-bold">Free SERP Database</h1><p className="text-neutral-500 mt-2">Browse top Google results with SEO metrics for keyword research, content mapping, and competitive intelligence.</p></div>
          <form onSubmit={run} className="bg-white rounded-2xl border border-neutral-200 p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} required />
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
            <input className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50" placeholder="Email (unlock top 100)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="md:col-span-3 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700" disabled={loading}>{loading ? <Loader2 className="animate-spin inline" size={16}/> : "Search SERP Database"}</button>
          </form>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}
          {result && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 overflow-auto">
              {result.leadLocked && <div className="mb-3 text-sm text-amber-700">{result.unlockMessage}</div>}
              <table className="w-full text-left text-sm">
                <thead><tr className="text-neutral-500"><th className="py-2">#</th><th>Title</th><th>Backlinks</th><th>Traffic</th><th>Words</th></tr></thead>
                <tbody>
                  {(result.results || []).map((row: any) => (
                    <tr key={row.position} className="border-t border-neutral-100"><td className="py-2">{row.position}</td><td><a href={row.url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">{row.title}</a><div className="text-xs text-neutral-500">{row.description}</div></td><td>{row.backlinks}</td><td>{row.estimatedTraffic}</td><td>{row.wordCount}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <InternalToolLinks />
        </div>
      </main>
    </div>
  );
}
