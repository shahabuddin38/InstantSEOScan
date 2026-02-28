import { useState } from "react";
import { 
  Loader2, ArrowRight, FileText, CheckCircle2, Search, Zap, 
  BarChart3, Link as LinkIcon, Edit3, Shield, Globe, AlertCircle,
  XCircle, CheckCircle, Info, Download, Share2, ExternalLink,
  ChevronRight, ChevronDown, Layout, Type, Image as ImageIcon,
  FileCode, List, Activity, Lock
} from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function OnPageSEO() {
  const [activeTab, setActiveTab] = useState("audit");
  const [url, setUrl] = useState("");
  const [inputData, setInputData] = useState({ keyword: "", content: "", topic: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleRunAI = async () => {
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/ai/on-page", {
        task: activeTab,
        data: inputData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.error || "Failed to generate AI insights.");
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    setLoading(true);
    setAuditResult(null);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/scan/eeat", { url }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuditResult(res.data);
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.error || "Failed to perform E-E-A-T audit.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const data = auditResult || result;
    if (!data) return;

    const doc = new jsPDF();
    const siteName = "InstantSEOScan";
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text(siteName, 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Professional SEO Intelligence Report", 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 37);
    doc.text(`Target URL: ${url || "AI Analysis"}`, 14, 44);
    
    doc.setDrawColor(200);
    doc.line(14, 50, 196, 50);

    if (auditResult) {
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(`E-E-A-T Audit Score: ${auditResult.score}%`, 14, 65);
      
      const tableData = auditResult.checks.map((c: any) => [c.name, c.status, c.detail]);
      autoTable(doc, {
        startY: 75,
        head: [['Check Name', 'Status', 'Details']],
        body: tableData,
        headStyles: { fillColor: [5, 150, 105] },
      });
      
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(14);
      doc.text("AI Recommendations:", 14, finalY + 15);
      doc.setFontSize(10);
      doc.setTextColor(80);
      
      const failedChecks = auditResult.checks.filter((c: any) => c.status === "Fail");
      let currentY = finalY + 25;
      failedChecks.forEach((check: any, i: number) => {
        if (currentY > 270) { doc.addPage(); currentY = 20; }
        doc.setFont(undefined, 'bold');
        doc.text(`${i + 1}. ${check.name}`, 14, currentY);
        doc.setFont(undefined, 'normal');
        const suggestion = check.id === "favicon" ? "Upload a favicon.ico file." : "Follow SEO best practices.";
        doc.text(suggestion, 20, currentY + 5);
        currentY += 15;
      });
    } else if (result) {
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text("AI SEO Analysis Results", 14, 65);
      
      let currentY = 75;
      Object.entries(result).forEach(([key, value]: any) => {
        if (currentY > 260) { doc.addPage(); currentY = 20; }
        doc.setFont(undefined, 'bold');
        doc.text(key.toUpperCase(), 14, currentY);
        doc.setFont(undefined, 'normal');
        const text = Array.isArray(value) ? value.join(", ") : String(value);
        const splitText = doc.splitTextToSize(text, 170);
        doc.text(splitText, 14, currentY + 7);
        currentY += (splitText.length * 7) + 15;
      });
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} - ${siteName} SEO Audit`, 105, 285, { align: "center" });
    }

    doc.save(`SEO_Report_${new Date().getTime()}.pdf`);
  };

  const handleExportCSV = () => {
    const data = auditResult ? auditResult.checks : result;
    if (!data) return;

    try {
      let csv = "";
      if (auditResult) {
        csv = "Name,Status,Detail\n" + 
          auditResult.checks.map((c: any) => `"${c.name}","${c.status}","${c.detail.replace(/"/g, '""')}"`).join("\n");
      } else {
        csv = "Key,Value\n" + 
          Object.entries(result).map(([k, v]: any) => `"${k}","${String(v).replace(/"/g, '""')}"`).join("\n");
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `SEO_Data_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("CSV Export Error:", err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'InstantSEOScan Report',
      text: `Check out this SEO report for ${url || "my website"} generated by InstantSEOScan.`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Report link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share Error:", err);
    }
  };

  const tabs = [
    { id: "audit", label: "E-E-A-T Audit", icon: Shield, description: "Full site authority & trust audit" },
    { id: "meta", label: "Meta SEO", icon: Search, description: "Generate titles & descriptions" },
    { id: "content", label: "Content Optimization", icon: Edit3, description: "Improve readability & EEAT" },
    { id: "keywords", label: "Keyword Strategy", icon: Zap, description: "LSI & semantic variations" },
    { id: "technical", label: "Technical Tips", icon: CheckCircle2, description: "On-page technical fixes" },
    { id: "score", label: "SEO Scoring", icon: BarChart3, description: "AI-powered content quality score" },
  ];

  const getStatusColor = (status: string) => {
    if (status === "Pass") return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (status === "Fail") return "text-rose-600 bg-rose-50 border-rose-100";
    return "text-amber-600 bg-amber-50 border-amber-100";
  };

  const getStatusIcon = (status: string) => {
    if (status === "Pass") return <CheckCircle size={16} />;
    if (status === "Fail") return <XCircle size={16} />;
    return <Info size={16} />;
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-neutral-200 pt-12 pb-8 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <Zap size={12} />
                AI-Powered Analysis
              </div>
              <h1 className="text-5xl font-black text-neutral-900 tracking-tight mb-3">On-Page SEO Intelligence</h1>
              <p className="text-xl text-neutral-500 max-w-2xl">
                Comprehensive site auditing and content optimization powered by Gemini 3 Flash.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleShare}
                disabled={!auditResult && !result}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                <Share2 size={18} />
                Share Report
              </button>
              <button 
                onClick={handleExportCSV}
                disabled={!auditResult && !result}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                <FileCode size={18} />
                Export CSV
              </button>
              <button 
                onClick={handleExportPDF}
                disabled={!auditResult && !result}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                <Download size={18} />
                Export PDF
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mt-12">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setResult(null); setAuditResult(null); setError(""); }}
                className={`group relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 min-w-[180px] ${
                  activeTab === tab.id 
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                    : "bg-white border-neutral-200 text-neutral-600 hover:border-emerald-300 hover:bg-emerald-50/30"
                }`}
              >
                <tab.icon size={20} className={activeTab === tab.id ? "text-white" : "text-emerald-500"} />
                <span className="font-bold mt-2">{tab.label}</span>
                <span className={`text-[10px] mt-1 opacity-70 ${activeTab === tab.id ? "text-emerald-50" : "text-neutral-400"}`}>
                  {tab.description}
                </span>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                {activeTab === "audit" ? <Globe className="text-emerald-500" /> : <Edit3 className="text-emerald-500" />}
                {activeTab === "audit" ? "Site Audit" : "AI Optimization"}
              </h2>

              {activeTab === "audit" ? (
                <form onSubmit={handleAudit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Website URL</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input 
                        type="text" 
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                        placeholder="example.com"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading || !url}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Shield size={18} />}
                    Run E-E-A-T Audit
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  {(activeTab === "meta" || activeTab === "keywords") && (
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">Target Keyword / Topic</label>
                      <input 
                        type="text" 
                        value={inputData.keyword}
                        onChange={e => setInputData({...inputData, keyword: e.target.value})}
                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                        placeholder="e.g. Best SEO Tools 2024"
                      />
                    </div>
                  )}

                  {(activeTab === "technical") && (
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">Page Topic / URL Context</label>
                      <input 
                        type="text" 
                        value={inputData.topic}
                        onChange={e => setInputData({...inputData, topic: e.target.value})}
                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                        placeholder="e.g. A guide on how to optimize images for SEO"
                      />
                    </div>
                  )}

                  {(activeTab === "content" || activeTab === "score") && (
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">Content to Analyze</label>
                      <textarea 
                        value={inputData.content}
                        onChange={e => setInputData({...inputData, content: e.target.value})}
                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium min-h-[250px] resize-none"
                        placeholder="Paste your article or page content here..."
                      />
                    </div>
                  )}

                  <button 
                    onClick={handleRunAI}
                    disabled={loading}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                    Generate AI Insights
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600 text-sm">
                  <AlertCircle className="shrink-0 mt-0.5" size={16} />
                  <p className="font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white p-12 rounded-[32px] border border-neutral-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[500px]"
                >
                  <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-emerald-100 rounded-full animate-pulse" />
                    <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600 animate-spin" size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">Analyzing Your Website</h3>
                  <p className="text-neutral-500 max-w-md">
                    Gemini AI is performing deep technical checks and content analysis. This usually takes 5-10 seconds.
                  </p>
                </motion.div>
              ) : auditResult ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  {/* Score Card */}
                  <div className="bg-white p-10 rounded-[40px] border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center gap-10">
                    <div className="relative shrink-0">
                      <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="transparent"
                          className="text-neutral-100"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="transparent"
                          strokeDasharray={552.92}
                          strokeDashoffset={552.92 - (552.92 * auditResult.score) / 100}
                          className="text-emerald-500 transition-all duration-1000 ease-out"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <span className="text-5xl font-black text-neutral-900">{auditResult.score}%</span>
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">E-E-A-T Score</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">E-E-A-T Audit Report</h3>
                      <p className="text-neutral-500 mb-6 leading-relaxed">
                        Your site scored <span className="font-bold text-neutral-900">{auditResult.score}%</span> in our authority and trust audit. 
                        We found <span className="font-bold text-emerald-600">{auditResult.summary.passed} passed</span> checks and 
                        <span className="font-bold text-rose-500"> {auditResult.summary.failed} failed</span> checks that need your attention.
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                          <div className="text-xs font-bold text-neutral-400 uppercase mb-1">Passed</div>
                          <div className="text-2xl font-black text-emerald-600">{auditResult.summary.passed}</div>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                          <div className="text-xs font-bold text-neutral-400 uppercase mb-1">Failed</div>
                          <div className="text-2xl font-black text-rose-500">{auditResult.summary.failed}</div>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                          <div className="text-xs font-bold text-neutral-400 uppercase mb-1">Total</div>
                          <div className="text-2xl font-black text-neutral-900">{auditResult.summary.total}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Checks */}
                  <div className="bg-white rounded-[40px] border border-neutral-200 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                      <h3 className="text-xl font-bold">Detailed Audit Log</h3>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100 uppercase">Passed: {auditResult.summary.passed}</span>
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full border border-rose-100 uppercase">Failed: {auditResult.summary.failed}</span>
                      </div>
                    </div>
                    <div className="divide-y divide-neutral-100">
                      {auditResult.checks.map((check: any) => (
                        <div key={check.id} className="p-6 hover:bg-neutral-50/50 transition-colors flex items-start justify-between group">
                          <div className="flex gap-4">
                            <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${getStatusColor(check.status)}`}>
                              {getStatusIcon(check.status)}
                            </div>
                            <div>
                              <h4 className="font-bold text-neutral-900 mb-1">{check.name}</h4>
                              <p className="text-sm text-neutral-500">{check.detail}</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(check.status)}`}>
                            {check.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fix Suggestions */}
                  <div className="bg-neutral-900 p-10 rounded-[40px] text-white">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                        <Zap className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">AI Fix Suggestions</h3>
                        <p className="text-neutral-400 text-sm">Actionable steps to improve your E-E-A-T score.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {auditResult.checks.filter((c: any) => c.status === "Fail").slice(0, 4).map((check: any) => (
                        <div key={check.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                          <div className="flex items-center gap-2 text-rose-400 mb-3">
                            <AlertCircle size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Fix Required</span>
                          </div>
                          <h4 className="font-bold mb-2">{check.name}</h4>
                          <p className="text-sm text-neutral-400 leading-relaxed">
                            {check.id === "favicon" && "Upload a 32x32 or 16x16 .ico or .png file and link it in your <head> section using <link rel='icon' href='/path/to/favicon.ico'>."}
                            {check.id === "canonical" && "Add a <link rel='canonical' href='https://yourdomain.com/current-page'> tag to prevent duplicate content issues."}
                            {check.id === "robots_sitemap" && "Update your robots.txt file to include a 'Sitemap: https://yourdomain.com/sitemap.xml' directive."}
                            {check.id === "og_tags" && "Implement Open Graph meta tags (og:title, og:description, og:image) to improve social sharing appearance."}
                            {check.id === "h1_count" && "Ensure every page has exactly one H1 tag that contains your primary target keyword."}
                            {check.id.startsWith("eeat_") && `Create a dedicated ${check.name.replace(' Page', '')} page and link to it clearly in your footer to build user trust.`}
                            {!["favicon", "canonical", "robots_sitemap", "og_tags", "h1_count"].includes(check.id) && !check.id.startsWith("eeat_") && "Review your technical implementation and ensure this element follows Google's best practices for transparency and authority."}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Zap className="text-amber-500" />
                        AI Analysis Results
                      </h3>
                      <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                        Powered by Gemini 3 Flash
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      {Object.entries(result).map(([key, value]: any) => (
                        <div key={key} className="group">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                          </div>
                          <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 group-hover:border-emerald-200 transition-colors">
                            {Array.isArray(value) ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {value.map((item, i) => (
                                  <div key={i} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-neutral-100">
                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-sm text-neutral-700 font-medium">{item}</span>
                                  </div>
                                ))}
                              </div>
                            ) : typeof value === 'object' ? (
                              <pre className="bg-neutral-900 text-emerald-400 p-6 rounded-2xl text-xs overflow-x-auto font-mono leading-relaxed">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            ) : (
                              <div className="text-neutral-800 prose prose-neutral max-w-none prose-headings:text-neutral-900 prose-headings:font-black prose-p:leading-relaxed prose-li:text-neutral-700">
                                <ReactMarkdown>{String(value)}</ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white p-12 rounded-[32px] border border-neutral-200 border-dashed flex flex-col items-center justify-center text-center min-h-[500px]"
                >
                  <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                    <Layout className="text-neutral-300" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Ready for Analysis</h3>
                  <p className="text-neutral-500 max-w-xs">
                    Select a tool from the tabs above and enter your data to start the AI-powered SEO optimization.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-left">
                      <Shield className="text-emerald-500 mb-2" size={20} />
                      <div className="text-xs font-bold text-neutral-900">E-E-A-T Audit</div>
                      <div className="text-[10px] text-neutral-400">Trust & Authority</div>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-left">
                      <Edit3 className="text-emerald-500 mb-2" size={20} />
                      <div className="text-xs font-bold text-neutral-900">Content Fixer</div>
                      <div className="text-[10px] text-neutral-400">AI Rewriting</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

