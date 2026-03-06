import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Copy, RefreshCw } from "lucide-react";
import { getStatisticsPage } from "../services/seoToolsService";
import PageSEO from "../components/seo/PageSEO";
import InternalToolLinks from "../components/seo/InternalToolLinks";

const titles: Record<string, string> = {
  "seo-statistics": "SEO Statistics",
  "ai-seo-statistics": "AI SEO Statistics",
  "link-building-statistics": "Link Building Statistics",
  "local-seo-statistics": "Local SEO Statistics",
  "content-marketing-statistics": "Content Marketing Statistics",
  "google-ranking-statistics": "Google Ranking Statistics",
};

export default function SEOStatisticsPage() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, "") || "seo-statistics";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const pageTitle = titles[slug] || "SEO Statistics";

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getStatisticsPage(slug);
      setData(result);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [slug]);

  useEffect(() => {
    const id = window.setInterval(() => load(), 15 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [slug]);

  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What are the latest ${pageTitle.toLowerCase()}?`, acceptedAnswer: { "@type": "Answer", text: `Explore updated ${pageTitle.toLowerCase()} with source-ready data points.` } },
      { "@type": "Question", name: "How often are these statistics updated?", acceptedAnswer: { "@type": "Answer", text: "The statistics feed auto-refreshes and is timestamped for current SEO planning." } },
    ],
  }), [pageTitle]);

  const copyStat = async (line: string) => {
    await navigator.clipboard.writeText(line);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <main className="flex-1 p-8 bg-neutral-50">
        <PageSEO
          title={`${pageTitle} 2026 | InstantSEOScan`}
          description={`Discover 150+ verified ${pageTitle.toLowerCase()} for SEO strategy, AI search optimization, and growth forecasting.`}
          canonicalPath={`/${slug}`}
          schema={faqSchema}
        />

        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">{pageTitle} 2026</h1>
              <p className="text-neutral-500 mt-2">150+ curated statistics designed for Google search, AI Overviews, PAA snippets, and GEO content strategies.</p>
            </div>
            <button onClick={load} className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-bold inline-flex items-center gap-2"><RefreshCw size={14}/> Refresh</button>
          </div>

          <div className="text-xs text-neutral-500">Auto update active • Last refreshed: {lastUpdated.toLocaleString()}</div>

          {loading && <div className="bg-white rounded-2xl border border-neutral-200 p-5 text-sm">Loading statistics...</div>}
          {error && <div className="bg-red-50 rounded-2xl border border-red-200 p-5 text-sm text-red-700">{error}</div>}

          {data && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(data.stats || []).map((item: any) => {
                  const line = `${item.stat}: ${item.value} (${item.source}, ${item.year})`;
                  return (
                    <div key={item.id} className="border border-neutral-100 rounded-xl p-3 bg-neutral-50">
                      <div className="text-sm font-semibold text-neutral-800">{item.stat}</div>
                      <div className="text-xs text-neutral-500 mt-1">{item.value} • {item.source} • {item.year}</div>
                      <button onClick={() => copyStat(line)} className="mt-2 text-xs text-emerald-700 inline-flex items-center gap-1"><Copy size={12}/> Copy citation</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <InternalToolLinks />
        </div>
      </main>
    </div>
  );
}
