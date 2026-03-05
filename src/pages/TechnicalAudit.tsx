import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, Globe, Link2, Image, Heading, FileWarning, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/apiClient";
import { addActivity } from "../services/activityHistory";

export default function TechnicalAudit() {
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(40);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await apiRequest<any>("/api/technical-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, maxPages }),
      });

      if (!res.ok || !res.data) throw new Error(res.error || "Technical audit failed.");
      setResult(res.data);
      addActivity({
        type: "audit",
        title: "Technical Crawl Audit",
        detail: url,
      });
    } catch (err: any) {
      setError(err.message || "Technical audit failed.");
    } finally {
      setLoading(false);
    }
  };

  const IssueSection = ({ title, items, icon }: { title: string; items: any[]; icon: ReactNode }) => (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {items && items.length > 0 ? (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-sm">
          {items.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 break-words">
              {typeof item === "string" ? item : <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">No issues found.</p>
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-8">
        <ArrowLeft size={20} className="mr-2" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-black text-neutral-900 mb-2 tracking-tight">Technical Audit</h1>
        <p className="text-neutral-500">Crawl your website and detect technical SEO issues across all discovered links.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm mb-8">
        <form onSubmit={handleRun} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-sm font-bold text-neutral-700 mb-2">Website URL</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com"
                className="w-full pl-10 pr-3 py-3 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">Max Pages</label>
            <input
              type="number"
              min={1}
              max={100}
              value={maxPages}
              onChange={(e) => setMaxPages(Number(e.target.value) || 1)}
              className="w-full px-3 py-3 border border-neutral-200 rounded-xl bg-neutral-50 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-4 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>
              Run Technical Crawl Audit <ArrowRight size={16} />
            </>}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-neutral-200"><div className="text-xs text-neutral-500">Crawled Pages</div><div className="text-2xl font-black">{result.summary?.crawledPages || 0}</div></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-200"><div className="text-xs text-neutral-500">All Links</div><div className="text-2xl font-black">{result.summary?.discoveredLinks || 0}</div></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-200"><div className="text-xs text-neutral-500">Broken Links</div><div className="text-2xl font-black text-red-600">{result.summary?.brokenLinks || 0}</div></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-200"><div className="text-xs text-neutral-500">HTML Error Pages</div><div className="text-2xl font-black text-orange-600">{result.summary?.htmlErrorPages || 0}</div></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-200"><div className="text-xs text-neutral-500">Duplicate Content Groups</div><div className="text-2xl font-black text-indigo-600">{result.summary?.duplicateContentGroups || 0}</div></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-200"><div className="text-xs text-neutral-500">Missing Descriptions</div><div className="text-2xl font-black text-amber-600">{result.issues?.missingDescriptions?.length || 0}</div></div>
          </div>

          <IssueSection title="All Links" items={result.allLinks || []} icon={<Link2 size={16} className="text-emerald-600" />} />
          <IssueSection title="Missing Keywords" items={result.issues?.missingKeywords || []} icon={<Copy size={16} className="text-emerald-600" />} />
          <IssueSection title="Duplicate Keywords" items={result.issues?.duplicateKeywords || []} icon={<Copy size={16} className="text-emerald-600" />} />
          <IssueSection title="Missing Headings (H1/H2/H3)" items={[result.issues?.missingHeadings || {}]} icon={<Heading size={16} className="text-emerald-600" />} />
          <IssueSection title="Duplicate Headings (H1/H2/H3)" items={[result.issues?.duplicateHeadings || {}]} icon={<Heading size={16} className="text-emerald-600" />} />
          <IssueSection title="Missing Alt Text" items={result.issues?.missingAltText || []} icon={<Image size={16} className="text-emerald-600" />} />
          <IssueSection title="Duplicate Alt Text" items={result.issues?.duplicateAltText || []} icon={<Image size={16} className="text-emerald-600" />} />
          <IssueSection title="Missing Descriptions" items={result.issues?.missingDescriptions || []} icon={<FileWarning size={16} className="text-emerald-600" />} />
          <IssueSection title="Duplicate Descriptions" items={result.issues?.duplicateDescriptions || []} icon={<FileWarning size={16} className="text-emerald-600" />} />
          <IssueSection title="Broken Links (4xx/5xx)" items={result.issues?.brokenLinks || []} icon={<AlertCircle size={16} className="text-red-600" />} />
          <IssueSection title="HTML Errors" items={result.issues?.htmlErrors || []} icon={<FileWarning size={16} className="text-orange-600" />} />
          <IssueSection title="Duplicate Contents" items={result.issues?.duplicateContents || []} icon={<Copy size={16} className="text-indigo-600" />} />
        </div>
      )}
    </div>
  );
}
