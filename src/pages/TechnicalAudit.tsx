import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, Globe, Link2, Image, Heading, FileWarning, Copy, Download, Share2, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/apiClient";
import { addActivity } from "../services/activityHistory";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type AuditSection = {
  key: string;
  title: string;
  icon: ReactNode;
  headers: string[];
  rows: string[][];
};

export default function TechnicalAudit() {
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const listRows = (items: string[]) => items.map((item) => [item]);

  const duplicateMapRows = (items: any[], valueKey: string) =>
    (items || []).map((item: any) => [String(item[valueKey] || ""), String((item.urls || []).length), String((item.urls || []).join(" | "))]);

  const htmlErrorRows = (items: any[]) =>
    (items || []).map((item: any) => [String(item.page || ""), String((item.issues || []).join(" | "))]);

  const brokenLinkRows = (items: any[]) =>
    (items || []).map((item: any) => [String(item.url || ""), String(item.status || ""), String(item.source || "")]);

  const missingHeadingRows = (data: any) => {
    const h1 = data?.issues?.missingHeadings?.h1 || [];
    const h2 = data?.issues?.missingHeadings?.h2 || [];
    const h3 = data?.issues?.missingHeadings?.h3 || [];
    const all = new Set([...h1, ...h2, ...h3]);
    return [...all].map((urlItem) => [urlItem, h1.includes(urlItem) ? "Yes" : "No", h2.includes(urlItem) ? "Yes" : "No", h3.includes(urlItem) ? "Yes" : "No"]);
  };

  const buildSections = (data: any): AuditSection[] => {
    if (!data) return [];

    return [
      { key: "all-links", title: "All Links (Internal)", icon: <Link2 size={16} className="text-emerald-600" />, headers: ["Internal URL"], rows: listRows(data.allLinks || []) },
      { key: "external-links", title: "External Links", icon: <Link2 size={16} className="text-blue-600" />, headers: ["External URL"], rows: listRows(data.externalLinks || []) },
      { key: "missing-keywords", title: "Missing Keywords", icon: <Copy size={16} className="text-emerald-600" />, headers: ["Page URL"], rows: listRows(data.issues?.missingKeywords || []) },
      { key: "duplicate-keywords", title: "Duplicate Keywords", icon: <Copy size={16} className="text-emerald-600" />, headers: ["Keyword", "Pages Count", "Pages"], rows: duplicateMapRows(data.issues?.duplicateKeywords || [], "keyword") },
      { key: "missing-headings", title: "Missing Headings (H1/H2/H3)", icon: <Heading size={16} className="text-emerald-600" />, headers: ["Page URL", "Missing H1", "Missing H2", "Missing H3"], rows: missingHeadingRows(data) },
      { key: "duplicate-h1", title: "Duplicate Headings (H1)", icon: <Heading size={16} className="text-emerald-600" />, headers: ["Heading", "Pages Count", "Pages"], rows: duplicateMapRows(data.issues?.duplicateHeadings?.h1 || [], "value") },
      { key: "duplicate-h2", title: "Duplicate Headings (H2)", icon: <Heading size={16} className="text-emerald-600" />, headers: ["Heading", "Pages Count", "Pages"], rows: duplicateMapRows(data.issues?.duplicateHeadings?.h2 || [], "value") },
      { key: "duplicate-h3", title: "Duplicate Headings (H3)", icon: <Heading size={16} className="text-emerald-600" />, headers: ["Heading", "Pages Count", "Pages"], rows: duplicateMapRows(data.issues?.duplicateHeadings?.h3 || [], "value") },
      { key: "missing-alt", title: "Missing Alt Text", icon: <Image size={16} className="text-emerald-600" />, headers: ["Page", "Image URL"], rows: (data.issues?.missingAltText || []).map((item: any) => [String(item.page || ""), String(item.image || "")]) },
      { key: "duplicate-alt", title: "Duplicate Alt Text", icon: <Image size={16} className="text-emerald-600" />, headers: ["Alt Text", "Pages Count", "Pages"], rows: duplicateMapRows(data.issues?.duplicateAltText || [], "value") },
      { key: "missing-descriptions", title: "Missing Descriptions", icon: <FileWarning size={16} className="text-amber-600" />, headers: ["Page URL"], rows: listRows(data.issues?.missingDescriptions || []) },
      { key: "duplicate-descriptions", title: "Duplicate Descriptions", icon: <FileWarning size={16} className="text-amber-600" />, headers: ["Description", "Pages Count", "Pages"], rows: duplicateMapRows(data.issues?.duplicateDescriptions || [], "value") },
      { key: "broken-links", title: "Broken Links (4xx/5xx)", icon: <AlertCircle size={16} className="text-red-600" />, headers: ["Broken URL", "Status", "Source Page"], rows: brokenLinkRows(data.issues?.brokenLinks || []) },
      { key: "html-errors", title: "HTML Errors", icon: <FileWarning size={16} className="text-orange-600" />, headers: ["Page URL", "Issues"], rows: htmlErrorRows(data.issues?.htmlErrors || []) },
      { key: "duplicate-content", title: "Duplicate Contents", icon: <Copy size={16} className="text-indigo-600" />, headers: ["Content Hash", "Pages Count", "Pages"], rows: (data.issues?.duplicateContents || []).map((item: any) => [String(item.hash || ""), String((item.urls || []).length), String((item.urls || []).join(" | "))]) },
    ];
  };

  const sections = buildSections(result);

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
      const initialCollapsed = Object.fromEntries(buildSections(res.data).map((section) => [section.key, true]));
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

  const TableSection = ({ section }: { section: AuditSection }) => {
    const isCollapsed = Boolean(collapsedSections[section.key]);

    return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <button
        onClick={() => setCollapsedSections((prev) => ({ ...prev, [section.key]: !prev[section.key] }))}
        className="w-full flex items-center justify-between mb-3"
      >
        <h3 className="font-bold flex items-center gap-2">
          {section.icon}
          {section.title}
          <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">{section.rows.length}</span>
        </h3>
        {isCollapsed ? <ChevronDown size={18} className="text-neutral-500" /> : <ChevronUp size={18} className="text-neutral-500" />}
      </button>

      {!isCollapsed && (section.rows.length > 0 ? (
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto rounded-xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                {section.headers.map((header) => (
                  <th key={`${section.key}-${header}`} className="text-left px-3 py-2 font-bold text-neutral-700 border-b border-neutral-200 sticky top-0 bg-neutral-50">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, index) => (
                <tr key={`${section.key}-${index}`} className={`border-b border-neutral-100 last:border-b-0 ${index % 2 === 0 ? "bg-white" : "bg-neutral-50/40"}`}>
                  {row.map((value, cellIndex) => (
                    <td key={`${section.key}-${index}-${cellIndex}`} className="px-3 py-2 text-neutral-700 align-top break-words">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">No issues found.</p>
      ))}
    </div>
  )};

  const handleExportCSV = () => {
    if (!result) return;

    const rows: string[] = [];
    rows.push("section,row,column,value");

    const summaryRows = [
      ["startUrl", String(result.summary?.startUrl || "")],
      ["crawledPages", String(result.summary?.crawledPages || 0)],
      ["internalLinks", String(result.summary?.discoveredLinks || 0)],
      ["externalLinks", String(result.summary?.externalLinks || 0)],
      ["brokenLinks", String(result.summary?.brokenLinks || 0)],
      ["htmlErrorPages", String(result.summary?.htmlErrorPages || 0)],
      ["duplicateContentGroups", String(result.summary?.duplicateContentGroups || 0)],
    ];

    summaryRows.forEach(([metric, value], index) => {
      rows.push(`"Summary","${index + 1}","${metric}","${String(value).replace(/"/g, '""')}"`);
    });

    sections.forEach((section) => {
      if (section.rows.length === 0) {
        rows.push(`"${section.title.replace(/"/g, '""')}","0","status","No issues found"`);
        return;
      }

      section.rows.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
          const columnName = section.headers[cellIndex] || `Column ${cellIndex + 1}`;
          rows.push(
            `"${section.title.replace(/"/g, '""')}","${rowIndex + 1}","${String(columnName).replace(/"/g, '""')}","${String(cell).replace(/"/g, '""')}"`
          );
        });
      });
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const downloadUrl = URL.createObjectURL(blob);
    link.setAttribute("href", downloadUrl);
    link.setAttribute("download", `technical-audit-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Technical Crawl Audit Report", 14, 18);
    doc.setFontSize(11);
    doc.text(`URL: ${url}`, 14, 26);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

    const summaryRows = [
      ["Crawled Pages", String(result.summary?.crawledPages || 0)],
      ["All Links (Internal)", String(result.summary?.discoveredLinks || 0)],
      ["External Links", String(result.summary?.externalLinks || 0)],
      ["Broken Links", String(result.summary?.brokenLinks || 0)],
      ["HTML Error Pages", String(result.summary?.htmlErrorPages || 0)],
      ["Duplicate Content Groups", String(result.summary?.duplicateContentGroups || 0)],
      ["Missing Descriptions", String(result.issues?.missingDescriptions?.length || 0)],
    ];

    autoTable(doc, {
      startY: 40,
      head: [["Metric", "Value"]],
      body: summaryRows,
    });

    let startY = (doc as any).lastAutoTable.finalY + 12;
    sections.forEach((section) => {
      if (section.rows.length === 0) return;

      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }

      doc.setFontSize(12);
      doc.text(section.title, 14, startY);

      autoTable(doc, {
        startY: startY + 4,
        head: [section.headers],
        body: section.rows,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [240, 240, 240], textColor: [33, 33, 33] },
      });

      startY = (doc as any).lastAutoTable.finalY + 10;
    });

    doc.save(`technical-audit-${Date.now()}.pdf`);
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
              <li>Use each collapsible section below for detailed per-URL diagnostics.</li>
            </ul>
          </div>

          {sections.map((section) => (
            <TableSection key={section.key} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}
