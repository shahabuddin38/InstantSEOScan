import { Link } from "react-router-dom";

const LINKS = [
  { to: "/tools/google-keyword-rank-checker", label: "Google Keyword Rank Checker" },
  { to: "/tools/serp-comparison", label: "SERP Comparison Tool" },
  { to: "/tools/keyword-cannibalization", label: "Keyword Cannibalization Checker" },
  { to: "/tools/serp-intent-analyzer", label: "SERP Intent Analyzer" },
  { to: "/tools/free-serp-database", label: "Free SERP Database" },
  { to: "/tools/technical", label: "Technical Audit Tool" },
  { to: "/ai-keyword-ideas-tool", label: "AI Keyword Ideas" },
  { to: "/seo-statistics", label: "SEO Statistics" },
];

export default function InternalToolLinks() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <div className="text-xs uppercase tracking-widest text-neutral-400 mb-3">Internal Tool Links</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
