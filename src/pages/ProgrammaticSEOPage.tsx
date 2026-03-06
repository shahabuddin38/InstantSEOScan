import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProgrammaticData } from "../services/seoToolsService";
import PageSEO from "../components/seo/PageSEO";
import InternalToolLinks from "../components/seo/InternalToolLinks";

export default function ProgrammaticSEOPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const routeKind = useMemo(() => {
    if (window.location.pathname.startsWith("/compare/")) return "compare";
    if (window.location.pathname.startsWith("/keyword-data/")) return "keyword-data";
    if (window.location.pathname.startsWith("/serp-analysis/")) return "serp-analysis";
    if (window.location.pathname.startsWith("/ranking/")) return "ranking";
    return "keyword-data";
  }, [window.location.pathname]);

  const raw = params.pair || params.keyword || "seo-tools";

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const keyword = String(raw).replace(/-vs-/g, " vs ").replace(/-/g, " ");
        setData(await getProgrammaticData(routeKind, keyword));
      } catch (err: any) {
        setError(err.message || "Failed to load page data");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [raw, routeKind]);

  const keywordText = String(raw).replace(/-/g, " ");

  const schema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${keywordText} ${routeKind} data`,
    description: `Programmatic SEO page for ${keywordText} with SERP and ranking insights.`,
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <main className="flex-1 p-8 bg-neutral-50">
        <PageSEO
          title={`${keywordText} ${routeKind} | InstantSEOScan`}
          description={`Live ${routeKind} insights for ${keywordText}: SERP competitors, difficulty score, ranking probability, and PAA blocks.`}
          schema={schema}
        />

        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold capitalize">{keywordText} {routeKind}</h1>
            <p className="text-neutral-500 mt-2">Programmatic SEO landing page optimized for Google, AI Overviews, PAA, and generative search engines.</p>
          </div>

          {loading && <div className="bg-white rounded-2xl border border-neutral-200 p-5">Loading analysis...</div>}
          {error && <div className="bg-red-50 rounded-2xl border border-red-200 p-5 text-red-700">{error}</div>}

          {data && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl border border-neutral-200 p-4"><div className="text-xs text-neutral-500">Difficulty</div><div className="text-2xl font-black">{data.difficultyScore}</div></div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-4"><div className="text-xs text-neutral-500">Ranking Probability</div><div className="text-2xl font-black">{data.rankingProbability}%</div></div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-4"><div className="text-xs text-neutral-500">Top Competitors</div><div className="text-2xl font-black">{data.competitors?.length || 0}</div></div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                <h2 className="font-bold mb-2">AI Overview Summary</h2>
                <p className="text-sm text-neutral-700 leading-6">{data.summary}</p>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                <h2 className="font-bold mb-2">People Also Ask (PAA)</h2>
                <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {(data.paaQuestions || []).map((q: string) => <li key={q}>{q}</li>)}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-5 overflow-auto">
                <h2 className="font-bold mb-2">SERP Competitors</h2>
                <table className="w-full text-sm">
                  <thead><tr className="text-neutral-500"><th className="text-left py-2">#</th><th className="text-left">Domain</th><th className="text-left">Title</th></tr></thead>
                  <tbody>
                    {(data.competitors || []).map((row: any) => (
                      <tr key={row.position} className="border-t border-neutral-100"><td className="py-2">{row.position}</td><td>{row.domain}</td><td>{row.title}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h2 className="font-bold mb-2">Programmatic SEO Navigation</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link to={`/compare/${String(raw)}`} className="text-emerald-700 hover:underline">Compare Page</Link>
              <Link to={`/keyword-data/${String(raw)}`} className="text-emerald-700 hover:underline">Keyword Data</Link>
              <Link to={`/serp-analysis/${String(raw)}`} className="text-emerald-700 hover:underline">SERP Analysis</Link>
              <Link to={`/ranking/${String(raw)}`} className="text-emerald-700 hover:underline">Ranking Data</Link>
            </div>
          </div>

          <InternalToolLinks />
        </div>
      </main>
    </div>
  );
}
