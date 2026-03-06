import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Globe,
  Link2,
  Image,
  Heading,
  FileWarning,
  Copy,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/apiClient";
import { addActivity } from "../services/activityHistory";
import jsPDF from "jspdf";
import { REPORT_BRAND, REPORT_NAP_TEXT } from "../constants/reportBrand";


type CountSection = {
  key: string;
  title: string;
  icon: ReactNode;
  count: number;
  detail?: string;
};

export default function TechnicalAudit() {
  const currentUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const userRole = String(currentUser?.role || "").toLowerCase();
  const userPlan = String(currentUser?.plan || "").toLowerCase();
  const allowedMaxPages =
    userRole === "admin"
      ? null
      : userPlan === "agency"
        ? 200
        : userPlan === "pro"
          ? 100
          : 60;

  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const buildCountSections = (data: any): CountSection[] => {
    if (!data) return [];

    const missingH1 = data?.issues?.missingHeadings?.h1?.length || 0;
    const missingH2 = data?.issues?.missingHeadings?.h2?.length || 0;
    const missingH3 = data?.issues?.missingHeadings?.h3?.length || 0;
    const missingHeadingPages = new Set([
      ...(data?.issues?.missingHeadings?.h1 || []),
      ...(data?.issues?.missingHeadings?.h2 || []),
      ...(data?.issues?.missingHeadings?.h3 || []),
    ]).size;

    return [
      {
        key: "internal-links",
        title: "All Links (Internal)",
        icon: <Link2 size={16} className="text-emerald-600" />,
        count: data?.summary?.discoveredLinks || 0,
        detail: "Total internal links found during crawl",
      },
      {
        key: "external-links",
        title: "External Links",
        icon: <Link2 size={16} className="text-blue-600" />,
        count: data?.summary?.externalLinks || 0,
        detail: "Total outbound links to other domains",
      },
      {
        key: "missing-keywords",
        title: "Missing Keywords",
        icon: <Copy size={16} className="text-emerald-600" />,
        count: data?.issues?.missingKeywords?.length || 0,
        detail: "Pages where keyword signals were not detected",
      },
      {
        key: "missing-headings",
        title: "Missing Headings (H1/H2/H3)",
        icon: <Heading size={16} className="text-emerald-600" />,
        count: missingHeadingPages,
        detail: `H1: ${missingH1}, H2: ${missingH2}, H3: ${missingH3}`,
      },
      {
        key: "duplicate-h1",
        title: "Duplicate Headings (H1)",
        icon: <Heading size={16} className="text-emerald-600" />,
        count: data?.issues?.duplicateHeadings?.h1?.length || 0,
        detail: "Number of duplicate H1 heading groups",
      },
      {
        key: "duplicate-h2",
        title: "Duplicate Headings (H2)",
        icon: <Heading size={16} className="text-emerald-600" />,
        count: data?.issues?.duplicateHeadings?.h2?.length || 0,
        detail: "Number of duplicate H2 heading groups",
      },
      {
        key: "duplicate-h3",
        title: "Duplicate Headings (H3)",
        icon: <Heading size={16} className="text-emerald-600" />,
        count: data?.issues?.duplicateHeadings?.h3?.length || 0,
        detail: "Number of duplicate H3 heading groups",
      },
      {
        key: "missing-alt",
        title: "Missing Alt Text",
        icon: <Image size={16} className="text-emerald-600" />,
        count: data?.issues?.missingAltText?.length || 0,
        detail: "Images without alt attributes",
      },
      {
        key: "duplicate-alt",
        title: "Duplicate Alt Text",
        icon: <Image size={16} className="text-emerald-600" />,
        count: data?.issues?.duplicateAltText?.length || 0,
        detail: "Duplicate alt text groups",
      },
      {
        key: "missing-descriptions",
        title: "Missing Descriptions",
        icon: <FileWarning size={16} className="text-amber-600" />,
        count: data?.issues?.missingDescriptions?.length || 0,
        detail: "Pages without meta description",
      },
      {
        key: "duplicate-descriptions",
        title: "Duplicate Descriptions",
        icon: <FileWarning size={16} className="text-amber-600" />,
        count: data?.issues?.duplicateDescriptions?.length || 0,
        detail: "Duplicate meta description groups",
      },
      {
        key: "broken-links",
        title: "Broken Links (4xx/5xx)",
        icon: <AlertCircle size={16} className="text-red-600" />,
        count: data?.summary?.brokenLinks || 0,
        detail: "Links returning HTTP errors",
      },
      {
        key: "html-errors",
        title: "HTML Errors",
        icon: <FileWarning size={16} className="text-orange-600" />,
        count: data?.summary?.htmlErrorPages || 0,
        detail: "Pages with HTML structure problems",
      },
      {
        key: "duplicate-content",
        title: "Duplicate Contents",
        icon: <Copy size={16} className="text-indigo-600" />,
        count: data?.summary?.duplicateContentGroups || 0,
        detail: "Duplicate content groups detected",
      },
    ];
  };

  const sections = buildCountSections(result);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const requestedPages = Math.max(1, Number(maxPages) || 30);
      const safeMaxPages = allowedMaxPages === null ? requestedPages : Math.min(allowedMaxPages, requestedPages);
      const res = await apiRequest<any>("/api/technical-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, maxPages: safeMaxPages }),
      });

      if (!res.ok || !res.data) throw new Error(res.error || "Technical audit failed.");
      setResult(res.data);
      const initialCollapsed = Object.fromEntries(buildCountSections(res.data).map((section) => [section.key, true]));
      setCollapsedSections(initialCollapsed);
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

  const handleExportCSV = () => {
    if (!result) return;

    const rows: string[] = [];
    rows.push("section,count,detail");
    rows.push(`"Report Brand","","${REPORT_BRAND.websiteName} (${REPORT_BRAND.websiteUrl})"`);
    rows.push(`"NAP","","${REPORT_NAP_TEXT}"`);
    sections.forEach((section) => {
      rows.push(
        `"${section.title.replace(/"/g, '""')}","${section.count}","${String(section.detail || "").replace(/"/g, '""')}"`
      );
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const downloadUrl = URL.createObjectURL(blob);
    link.setAttribute("href", downloadUrl);
    link.setAttribute("download", `technical-audit-counts-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();

    doc.setFillColor(16, 185, 129);
    doc.roundedRect(10, 10, 190, 24, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Technical Audit Snapshot", 16, 23);

    doc.setTextColor(55, 65, 81);
    doc.setFontSize(10);
    doc.text(`URL: ${url}`, 14, 40);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 46);
    doc.text(`Website: ${REPORT_BRAND.websiteName} (${REPORT_BRAND.websiteUrl})`, 14, 52);
    doc.text(`NAP: ${REPORT_NAP_TEXT}`, 14, 58);

    const boxColors: Array<[number, number, number]> = [
      [16, 185, 129],
      [37, 99, 235],
      [245, 158, 11],
      [239, 68, 68],
      [99, 102, 241],
      [20, 184, 166],
    ];

    let x = 14;
    let y = 70;
    const boxW = 58;
    const boxH = 26;

    sections.slice(0, 12).forEach((section, index) => {
      const color = boxColors[index % boxColors.length];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(x, y, boxW, boxH, 3, 3, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      const title = section.title.length > 22 ? `${section.title.slice(0, 22)}...` : section.title;
      doc.text(title, x + 3, y + 8);

      doc.setFontSize(14);
      doc.text(String(section.count), x + 3, y + 18);

      x += boxW + 6;
      if (x + boxW > 200) {
        x = 14;
        y += boxH + 6;
      }
    });

    doc.setTextColor(75, 85, 99);
    doc.setFontSize(9);
    doc.text(`Count-only export for quick review | ${REPORT_BRAND.websiteName}`, 14, 287);

    doc.save(`technical-audit-short-${Date.now()}.pdf`);
  };

  const handleShare = async () => {
    if (!result) return;
    const shareData = {
      title: "Technical Audit Report",
      text: `Technical audit summary for ${url}: ${result.summary?.crawledPages || 0} pages crawled, ${result.summary?.brokenLinks || 0} broken links found.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      }
    } catch {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
    }
  };

  const CountSectionCard = ({ section }: { section: CountSection }) => {
    const isCollapsed = Boolean(collapsedSections[section.key]);

    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <button
          onClick={() => setCollapsedSections((prev) => ({ ...prev, [section.key]: !prev[section.key] }))}
          className="w-full flex items-center justify-between"
        >
          <h3 className="font-bold flex items-center gap-2">
            {section.icon}
            {section.title}
            <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">{section.count}</span>
          </h3>
          {isCollapsed ? <ChevronDown size={18} className="text-neutral-500" /> : <ChevronUp size={18} className="text-neutral-500" />}
        </button>

        {!isCollapsed && (
          <div className="mt-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <div className="text-3xl font-black text-neutral-900 mb-1">{section.count}</div>
            <p className="text-sm text-neutral-600">{section.detail || "Count summary"}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-8">
        <ArrowLeft size={20} className="mr-2" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-black text-neutral-900 mb-2 tracking-tight">Technical Audit</h1>
        <p className="text-neutral-500">Crawl your website and review clear count-based technical SEO diagnostics.</p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-8">
        <div className="text-xs uppercase tracking-widest text-neutral-400 mb-1">Report Identity</div>
        <div className="text-sm font-bold text-neutral-900">Website: {REPORT_BRAND.websiteName} ({REPORT_BRAND.websiteUrl})</div>
        <div className="text-xs text-neutral-500 mt-1">NAP: {REPORT_NAP_TEXT}</div>
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
              max={allowedMaxPages ?? undefined}
              value={maxPages}
              onChange={(e) => setMaxPages(Number(e.target.value) || 1)}
              className="w-full px-3 py-3 border border-neutral-200 rounded-xl bg-neutral-50 outline-none"
            />
            <p className="mt-1 text-[11px] text-neutral-500">
              {allowedMaxPages === null ? "Admin: unlimited pages" : `Max allowed for your plan: ${allowedMaxPages} pages`}
            </p>
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
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={() => {
                const expanded = Object.fromEntries(sections.map((section) => [section.key, false]));
                setCollapsedSections(expanded);
              }}
              className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-bold hover:bg-neutral-50"
            >
              Expand All
            </button>
            <button
              onClick={() => {
                const collapsed = Object.fromEntries(sections.map((section) => [section.key, true]));
                setCollapsedSections(collapsed);
              }}
              className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-bold hover:bg-neutral-50"
            >
              Collapse All
            </button>
            <button onClick={handleExportPDF} className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-bold hover:bg-neutral-50 inline-flex items-center gap-2">
              <Download size={16} /> Export PDF
            </button>
            <button onClick={handleExportCSV} className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-bold hover:bg-neutral-50 inline-flex items-center gap-2">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={handleShare} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 inline-flex items-center gap-2">
              <Share2 size={16} /> Share
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-neutral-200"><div className="text-xs text-neutral-500">Crawled Pages</div><div className="text-2xl font-black">{result.summary?.crawledPages || 0}</div></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-200"><div className="text-xs text-neutral-500">All Links (Internal)</div><div className="text-2xl font-black">{result.summary?.discoveredLinks || 0}</div></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-200"><div className="text-xs text-neutral-500">External Links</div><div className="text-2xl font-black">{result.summary?.externalLinks || 0}</div></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-200"><div className="text-xs text-neutral-500">Broken Links</div><div className="text-2xl font-black text-red-600">{result.summary?.brokenLinks || 0}</div></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-200"><div className="text-xs text-neutral-500">HTML Error Pages</div><div className="text-2xl font-black text-orange-600">{result.summary?.htmlErrorPages || 0}</div></div>
            <div className="bg-white rounded-2xl p-4 border border-neutral-200"><div className="text-xs text-neutral-500">Duplicate Content Groups</div><div className="text-2xl font-black text-indigo-600">{result.summary?.duplicateContentGroups || 0}</div></div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h3 className="font-bold mb-3">Quick Reading Summary</h3>
            <ul className="text-sm text-neutral-700 space-y-2 list-disc pl-5">
              <li>{result.summary?.crawledPages || 0} pages crawled and analyzed.</li>
              <li>{result.summary?.discoveredLinks || 0} internal links and {result.summary?.externalLinks || 0} external links discovered.</li>
              <li>{result.summary?.brokenLinks || 0} broken links and {result.summary?.htmlErrorPages || 0} pages with HTML issues detected.</li>
              <li>{result.summary?.duplicateContentGroups || 0} duplicate content groups found.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section) => (
              <CountSectionCard key={section.key} section={section} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
