import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle, Download, Share2, ArrowLeft, Globe, Zap, Shield, BarChart3, FileJson, Twitter, Facebook, Linkedin } from "lucide-react";
import { motion } from "motion/react";
import ScoreCircle from "../components/ScoreCircle";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { apiRequest } from "../services/apiClient";

export default function Report() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showShare, setShowShare] = useState(false);

  const renderAIContent = (content: any) => {
    if (!content) return "No data available.";
    if (typeof content === 'string') return content;
    if (typeof content === 'object') {
      if (content.analysis || content.recommendation || content.primaryKeywords) {
        return (
          <div className="space-y-2">
            {content.primaryKeywords && (
              <div>
                <span className="font-bold text-xs uppercase text-neutral-400">Keywords: </span>
                <span className="text-sm">{Array.isArray(content.primaryKeywords) ? content.primaryKeywords.join(", ") : String(content.primaryKeywords)}</span>
              </div>
            )}
            {content.analysis && <p>{content.analysis}</p>}
            {content.recommendation && (
              <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-700 text-xs">
                <span className="font-bold">Recommendation: </span>{content.recommendation}
              </div>
            )}
          </div>
        );
      }
      return JSON.stringify(content);
    }
    return String(content);
  };

  useEffect(() => {
    const loadReport = async () => {
      if (id && id !== "latest") {
        const result = await apiRequest<{ report?: any }>(`/api/reports/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (result.ok && result.data?.report?.technical) {
          setData(result.data.report);
          return;
        }
      }

      const lastScan = sessionStorage.getItem("lastScan");
      if (!lastScan) return;

      try {
        const parsed = JSON.parse(lastScan);
        if (parsed && parsed.technical) {
          setData(parsed);
        }
      } catch {
        sessionStorage.removeItem("lastScan");
      }
    };

    loadReport();
  }, [id]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("SEO Audit Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`URL: ${data.technical.title}`, 14, 32);
    doc.text(`Score: ${data.score}/100`, 14, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 48);

    const auditData = audits.map(a => [a.title, a.status, a.value]);
    autoTable(doc, {
      startY: 60,
      head: [['Check', 'Status', 'Result']],
      body: auditData,
    });

    doc.save(`SEO-Report-${data.technical.title}.pdf`);
  };

  const exportCSV = () => {
    const headers = ['Check', 'Status', 'Result', 'Description'];
    const rows = audits.map(a => [
      `"${a.title}"`,
      `"${a.status}"`,
      `"${String(a.value).replace(/"/g, '""')}"`,
      `"${a.desc.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `SEO-Report-${data.technical.title}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SEO Report - ${data.technical.title}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .passed { color: green; }
          .warning { color: orange; }
          .error { color: red; }
        </style>
      </head>
      <body>
        <h1>SEO Audit Report</h1>
        <p><strong>URL:</strong> ${data.technical.title}</p>
        <p><strong>Score:</strong> ${data.score}/100</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <table>
          <tr><th>Check</th><th>Status</th><th>Result</th><th>Description</th></tr>
          ${audits.map(a => `
            <tr>
              <td>${a.title}</td>
              <td class="${a.status}">${a.status}</td>
              <td>${a.value}</td>
              <td>${a.desc}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `SEO-Report-${data.technical.title}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareUrl = window.location.href;
  const shareTitle = `Check out my SEO Audit Report for ${data?.technical?.title || 'my website'}`;

  if (!data || !data.technical) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-neutral-500">No report found. Start a new audit from your dashboard.</p>
        <Link to="/dashboard" className="inline-block mt-4 text-sm font-bold text-emerald-600 hover:text-emerald-700">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );

  const audits = [
    { title: "Page Title", status: data.technical.title !== "Missing" ? "passed" : "error", value: data.technical.title, desc: "The title tag is the most important on-page SEO element." },
    { title: "Meta Description", status: data.technical.description !== "Missing" ? "passed" : "warning", value: data.technical.description, desc: "Meta descriptions influence click-through rates from search results." },
    { title: "H1 Headers", status: data.technical.h1Count > 0 ? "passed" : "error", value: `${data.technical.h1Count} found`, desc: "H1 tags help search engines understand the main topic of the page." },
    { title: "Image Alt Tags", status: data.technical.imgAltMissing === 0 ? "passed" : "warning", value: `${data.technical.imgAltMissing} missing`, desc: "Alt tags provide context for images and improve accessibility." },
  ];

  const filteredAudits = audits.filter(a => {
    if (activeTab === "all") return true;
    if (activeTab === "passed") return a.status === "passed";
    if (activeTab === "errors") return a.status === "error";
    if (activeTab === "warnings") return a.status === "warning";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="report-content">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-emerald-600 mb-4 transition-colors">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">SEO Audit Report</h1>
          <div className="flex items-center gap-2 text-neutral-500">
            <Globe size={16} />
            <span className="text-sm font-medium">{data.technical.title}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all">
            <Download size={18} />
            PDF
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all">
            <FileJson size={18} />
            CSV
          </button>
          <button onClick={exportHTML} className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all">
            <Globe size={18} />
            HTML
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowShare(!showShare)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
            >
              <Share2 size={18} />
              Share
            </button>
            {showShare && (
              <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-neutral-100 z-50 flex gap-4">
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`} target="_blank" className="p-2 bg-neutral-50 rounded-xl hover:text-blue-400 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="p-2 bg-neutral-50 rounded-xl hover:text-blue-600 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="p-2 bg-neutral-50 rounded-xl hover:text-blue-700 transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-12">
        {/* Score Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
          <ScoreCircle score={data.score} />
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-1">Overall Score</h2>
            <p className="text-neutral-500 text-sm">Your website's SEO health is {data.score > 80 ? 'excellent' : data.score > 50 ? 'good' : 'needs work'}.</p>
          </div>
        </div>
      </div>

      {/* Audit Tabs (Report) */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden mb-12">
        <div className="flex border-b border-neutral-100">
          {[
            { id: "all", label: "All Audits" },
            { id: "errors", label: "Errors" },
            { id: "warnings", label: "Warnings" },
            { id: "passed", label: "Passed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-5 text-sm font-bold transition-all relative ${
                activeTab === tab.id ? 'text-emerald-600' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600" />
              )}
            </button>
          ))}
        </div>

        <div className="divide-y divide-neutral-100">
          {filteredAudits.map((audit, i) => (
            <div key={i} className="p-6 hover:bg-neutral-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="mt-1">
                    {audit.status === "passed" && <CheckCircle2 className="text-emerald-500" size={20} />}
                    {audit.status === "warning" && <AlertTriangle className="text-orange-500" size={20} />}
                    {audit.status === "error" && <XCircle className="text-red-500" size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{audit.title}</h3>
                    <p className="text-neutral-500 text-sm mb-3">{audit.desc}</p>
                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-neutral-100 text-neutral-600 text-xs font-mono">
                      {audit.value}
                    </div>
                  </div>
                </div>
                <div className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  audit.status === "passed" ? 'bg-emerald-50 text-emerald-700' :
                  audit.status === "warning" ? 'bg-orange-50 text-orange-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {audit.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New AI Analysis Sections in Report */}
      {data.ai && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
              <BarChart3 size={20} className="text-emerald-600" />
              Content & NLP Analysis
            </h3>
            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Keyword Usage</div>
                <div className="text-sm text-neutral-600 leading-relaxed">{renderAIContent(data.ai.keywordUsage)}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Readability Assessment</div>
                <div className="text-sm text-neutral-600 leading-relaxed">{renderAIContent(data.ai.readability)}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">NLP Improvement Suggestions</div>
                <div className="text-sm text-neutral-600 leading-relaxed">{renderAIContent(data.ai.nlpSuggestions)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
              <Shield size={20} className="text-emerald-600" />
              Strategy & Gaps
            </h3>
            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Content Gaps</div>
                <div className="text-sm text-neutral-600 leading-relaxed">{renderAIContent(data.ai.contentGaps)}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Search Intent Match</div>
                <div className="text-sm text-neutral-600 leading-relaxed">{renderAIContent(data.ai.intentMatch)}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Missing Headings</div>
                <div className="text-sm text-neutral-600 leading-relaxed">{renderAIContent(data.ai.missingHeadings)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Card */}
      <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden mb-12">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="text-emerald-400" size={20} />
            AI-Powered Recommendations
          </h2>
          <div className="space-y-4">
            {(data.ai?.improvements || data.improvements || []).map((imp: any, i: number) => (
              <div key={i} className="flex gap-4 p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0 text-emerald-400 font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold mb-1">{imp.title || imp.action}</h3>
                  <p className="text-emerald-100/70 text-sm leading-relaxed">{imp.description || imp.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full translate-y-1/2 translate-x-1/2 blur-3xl" />
      </div>
    </div>
  );
}
