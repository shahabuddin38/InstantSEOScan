import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle, Download, Share2, ArrowLeft, Globe, Zap, Shield, BarChart3 } from "lucide-react";
import { motion } from "motion/react";
import ScoreCircle from "../components/ScoreCircle";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Report() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const lastScan = sessionStorage.getItem("lastScan");
    if (lastScan) {
      setData(JSON.parse(lastScan));
    }
  }, [id]);

  const exportPDF = async () => {
    const element = document.getElementById("report-content");
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`SEO-Report-${data.technical.title}.pdf`);
  };

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-neutral-500">Loading your SEO report...</p>
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
        <div className="flex gap-3">
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all">
            <Download size={18} />
            Export PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all">
            <Share2 size={18} />
            Share Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Score Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 flex flex-col items-center justify-center text-center">
          <ScoreCircle score={data.score} />
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-1">Overall Score</h2>
            <p className="text-neutral-500 text-sm">Your website's SEO health is {data.score > 80 ? 'excellent' : data.score > 50 ? 'good' : 'needs work'}.</p>
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="lg:col-span-2 bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap className="text-emerald-400" size={20} />
              AI-Powered Recommendations
            </h2>
            <div className="space-y-4">
              {data.improvements.map((imp: any, i: number) => (
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

      {/* Audit Tabs */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
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
    </div>
  );
}
