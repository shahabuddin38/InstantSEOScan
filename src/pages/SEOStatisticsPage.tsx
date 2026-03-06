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

const targetKeywordSets: Record<string, string[]> = {
  "seo-statistics": ["seo statistics", "seo industry data", "seo benchmarks", "organic traffic statistics"],
  "ai-seo-statistics": ["ai seo statistics", "google ai overviews data", "generative engine optimization", "ai search trends"],
  "link-building-statistics": ["link building statistics", "backlink statistics", "authority building data", "off page seo stats"],
  "local-seo-statistics": ["local seo statistics", "google business profile stats", "map pack ranking data", "local search trends"],
  "content-marketing-statistics": ["content marketing statistics", "blog seo performance", "content roi data", "organic content trends"],
  "google-ranking-statistics": ["google ranking statistics", "serp ranking factors", "search ranking data", "keyword ranking benchmarks"],
};

export default function SEOStatisticsPage() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, "") || "seo-statistics";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const pageTitle = titles[slug] || "SEO Statistics";
  const targetKeywords = targetKeywordSets[slug] || targetKeywordSets["seo-statistics"];

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

  const structuredSchema = useMemo(() => {
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What are the latest ${pageTitle.toLowerCase()}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Explore updated ${pageTitle.toLowerCase()} with source-ready data points designed for rankings and AI search visibility.`,
          },
        },
        {
          "@type": "Question",
          name: `How can I use ${pageTitle.toLowerCase()} to rank content?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: "Use statistics in answer blocks, cite data in headings, and connect each stat to actionable recommendations with internal links.",
          },
        },
        {
          "@type": "Question",
          name: "How often are these statistics updated?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The statistics feed auto-refreshes and includes timestamped updates for current SEO planning.",
          },
        },
      ],
    };

    const howTo = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to use ${pageTitle} for SEO growth`,
      step: [
        { "@type": "HowToStep", name: "Find relevant stats", text: "Select statistics that match your target keyword cluster and search intent." },
        { "@type": "HowToStep", name: "Embed in content", text: "Place critical numbers in summary paragraphs, table sections, and FAQ answers." },
        { "@type": "HowToStep", name: "Link to tools", text: "Connect statistics pages to rank checker, SERP tools, and keyword pages." },
      ],
    };

    const dataset = {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: `${pageTitle} dataset`,
      description: `Continuously refreshed ${pageTitle.toLowerCase()} used for SEO, GEO, and AI search optimization workflows.`,
      keywords: targetKeywords,
    };

    return [faq, howTo, dataset];
  }, [pageTitle, targetKeywords]);

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
          schema={structuredSchema}
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

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
            <h2 className="text-xl font-bold">Long-Form SEO Content Template</h2>
            <p className="text-sm text-neutral-700 leading-6">
              This page is optimized as a long-form statistics hub for easy ranking across Google Search, AI Overviews, PAA results,
              and AI engines like ChatGPT, Claude, Perplexity, and Gemini. Use the template below to publish keyword-targeted
              sections with entity references, semantic terms, and internal links.
            </p>
            <div>
              <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Primary Target Keywords</div>
              <div className="flex flex-wrap gap-2">{targetKeywords.map((k) => <span key={k} className="px-2 py-1 text-xs bg-neutral-100 rounded-lg">{k}</span>)}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="border border-neutral-100 rounded-xl p-3 bg-neutral-50">
                <div className="font-bold mb-1">Section Template A (Overview)</div>
                <p>Define the market, mention key entities, and summarize trend direction in 80-120 words.</p>
              </div>
              <div className="border border-neutral-100 rounded-xl p-3 bg-neutral-50">
                <div className="font-bold mb-1">Section Template B (Data + Insight)</div>
                <p>Insert 8-12 statistics, add interpretation, and connect each stat to tactical SEO action.</p>
              </div>
              <div className="border border-neutral-100 rounded-xl p-3 bg-neutral-50">
                <div className="font-bold mb-1">Section Template C (AI Overview Block)</div>
                <p>Write a direct 2-3 sentence answer, then include supporting data points and definitions.</p>
              </div>
              <div className="border border-neutral-100 rounded-xl p-3 bg-neutral-50">
                <div className="font-bold mb-1">Section Template D (Internal Links)</div>
                <p>Link to SERP tools, keyword tools, ranking pages, and related statistics clusters.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <h2 className="text-xl font-bold">PAA + FAQ + HowTo Content Blocks</h2>
            <div>
              <h3 className="font-semibold">People Also Ask</h3>
              <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1 mt-1">
                <li>What are the most important {pageTitle.toLowerCase()} this year?</li>
                <li>How do {pageTitle.toLowerCase()} improve SEO content strategy?</li>
                <li>How often should I refresh statistics pages for ranking?</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Quick FAQ Answers</h3>
              <p className="text-sm text-neutral-700 leading-6">Use short answer-first paragraphs, then add a supporting table and a "what to do next" list for AI and featured snippets.</p>
            </div>
            <div>
              <h3 className="font-semibold">HowTo Steps</h3>
              <ol className="list-decimal pl-5 text-sm text-neutral-700 space-y-1 mt-1">
                <li>Pick a target keyword cluster and match page intent.</li>
                <li>Add 20-40 high-confidence statistics with citations.</li>
                <li>Summarize insights in concise AI-friendly answer blocks.</li>
                <li>Link to related tool pages and programmatic pages.</li>
              </ol>
            </div>
          </div>

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
