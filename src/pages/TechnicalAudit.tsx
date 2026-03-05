import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, Globe, Link2, Image, Heading, FileWarning, Copy, Download, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/apiClient";
import { addActivity } from "../services/activityHistory";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function TechnicalAudit() {
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(100);
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

  const TableSection = ({
    title,
    icon,
    headers,
    rows,
  }: {
    title: string;
    icon: ReactNode;
    headers: string[];
    rows: string[][];
  }) => (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-neutral-200 rounded-xl overflow-hidden">
            <thead className="bg-neutral-50">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="text-left px-3 py-2 font-bold text-neutral-700 border-b border-neutral-200">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`} className="border-b border-neutral-100 last:border-b-0">
                  {row.map((value, cellIndex) => (
                    <td key={`${title}-${index}-${cellIndex}`} className="px-3 py-2 text-neutral-700 align-top break-words">
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
      )}
    </div>
  );

  const listRows = (items: string[]) => items.map((item) => [item]);
  const missingHeadingRows = () => {
    const h1 = result?.issues?.missingHeadings?.h1 || [];
    const h2 = result?.issues?.missingHeadings?.h2 || [];
    const h3 = result?.issues?.missingHeadings?.h3 || [];
    const all = new Set([...h1, ...h2, ...h3]);
    return [...all].map((urlItem) => [urlItem, h1.includes(urlItem) ? "Yes" : "No", h2.includes(urlItem) ? "Yes" : "No", h3.includes(urlItem) ? "Yes" : "No"]);
  };

  const duplicateMapRows = (items: any[], valueKey: string) =>
    (items || []).map((item: any) => [String(item[valueKey] || ""), String((item.urls || []).length), String((item.urls || []).join(" | "))]);

  const htmlErrorRows = (items: any[]) =>
    (items || []).map((item: any) => [String(item.page || ""), String((item.issues || []).join(" | "))]);

  const brokenLinkRows = (items: any[]) =>
    (items || []).map((item: any) => [String(item.url || ""), String(item.status || ""), String(item.source || "")]);

  const handleExportCSV = () => {
    if (!result) return;

    const rows: string[] = [];
    rows.push("type,page_or_key,value,extra");

    (result.allLinks || []).forEach((link: string) => {
      rows.push(`"all_link","${link.replace(/"/g, '""')}","",\"\"`);
    });

    (result.issues?.brokenLinks || []).forEach((item: any) => {
      rows.push(`"broken_link","${String(item.url || "").replace(/"/g, '""')}","${String(item.status || "")}","${String(item.source || "").replace(/"/g, '""')}"`);
    });

    (result.issues?.missingDescriptions || []).forEach((page: string) => {
      rows.push(`"missing_description","${String(page).replace(/"/g, '""')}","",\"\"`);
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
      ["All Links", String(result.summary?.discoveredLinks || 0)],
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

    const broken = (result.issues?.brokenLinks || []).slice(0, 30).map((b: any) => [String(b.url || ""), String(b.status || ""), String(b.source || "")]);
    if (broken.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [["Broken URL", "Status", "Source"]],
        body: broken,
      });
    }

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

          <TableSection title="All Links (Internal)" icon={<Link2 size={16} className="text-emerald-600" />} headers={["Internal URL"]} rows={listRows(result.allLinks || [])} />
          <TableSection title="External Links" icon={<Link2 size={16} className="text-blue-600" />} headers={["External URL"]} rows={listRows(result.externalLinks || [])} />
          <TableSection title="Missing Keywords" icon={<Copy size={16} className="text-emerald-600" />} headers={["Page URL"]} rows={listRows(result.issues?.missingKeywords || [])} />
          <TableSection title="Duplicate Keywords" icon={<Copy size={16} className="text-emerald-600" />} headers={["Keyword", "Pages Count", "Pages"]} rows={duplicateMapRows(result.issues?.duplicateKeywords || [], "keyword")} />
          <TableSection title="Missing Headings (H1/H2/H3)" icon={<Heading size={16} className="text-emerald-600" />} headers={["Page URL", "Missing H1", "Missing H2", "Missing H3"]} rows={missingHeadingRows()} />
          <TableSection title="Duplicate Headings (H1)" icon={<Heading size={16} className="text-emerald-600" />} headers={["Heading", "Pages Count", "Pages"]} rows={duplicateMapRows(result.issues?.duplicateHeadings?.h1 || [], "value")} />
          <TableSection title="Duplicate Headings (H2)" icon={<Heading size={16} className="text-emerald-600" />} headers={["Heading", "Pages Count", "Pages"]} rows={duplicateMapRows(result.issues?.duplicateHeadings?.h2 || [], "value")} />
          <TableSection title="Duplicate Headings (H3)" icon={<Heading size={16} className="text-emerald-600" />} headers={["Heading", "Pages Count", "Pages"]} rows={duplicateMapRows(result.issues?.duplicateHeadings?.h3 || [], "value")} />
          <TableSection title="Missing Alt Text" icon={<Image size={16} className="text-emerald-600" />} headers={["Page", "Image URL"]} rows={(result.issues?.missingAltText || []).map((item: any) => [String(item.page || ""), String(item.image || "")])} />
          <TableSection title="Duplicate Alt Text" icon={<Image size={16} className="text-emerald-600" />} headers={["Alt Text", "Pages Count", "Pages"]} rows={duplicateMapRows(result.issues?.duplicateAltText || [], "value")} />
          <TableSection title="Missing Descriptions" icon={<FileWarning size={16} className="text-amber-600" />} headers={["Page URL"]} rows={listRows(result.issues?.missingDescriptions || [])} />
          <TableSection title="Duplicate Descriptions" icon={<FileWarning size={16} className="text-amber-600" />} headers={["Description", "Pages Count", "Pages"]} rows={duplicateMapRows(result.issues?.duplicateDescriptions || [], "value")} />
          <TableSection title="Broken Links (4xx/5xx)" icon={<AlertCircle size={16} className="text-red-600" />} headers={["Broken URL", "Status", "Source Page"]} rows={brokenLinkRows(result.issues?.brokenLinks || [])} />
          <TableSection title="HTML Errors" icon={<FileWarning size={16} className="text-orange-600" />} headers={["Page URL", "Issues"]} rows={htmlErrorRows(result.issues?.htmlErrors || [])} />
          <TableSection title="Duplicate Contents" icon={<Copy size={16} className="text-indigo-600" />} headers={["Content Hash", "Pages Count", "Pages"]} rows={(result.issues?.duplicateContents || []).map((item: any) => [String(item.hash || ""), String((item.urls || []).length), String((item.urls || []).join(" | "))])} />
        </div>
      )}
    </div>
  );
}
