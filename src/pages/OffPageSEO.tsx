import { useState } from "react";
import { Loader2, ArrowRight, FileText, CheckCircle2, Search, Zap, BarChart3, Link as LinkIcon, Edit3, MessageSquare, Users, Globe } from "lucide-react";
import { apiRequest } from "../services/apiClient";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function OffPageSEO() {
  const [activeTab, setActiveTab] = useState("backlinks");
  const [inputData, setInputData] = useState({ niche: "", goal: "", competitorInfo: "", topic: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await apiRequest<any>("/api/ai/off-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: activeTab,
          data: inputData
        })
      });
      if (!res.ok) throw new Error(res.error || "Failed to generate insights.");
      setResult(res.data);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to generate insights.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "backlinks", label: "Backlink Strategy", icon: LinkIcon },
    { id: "outreach", label: "Outreach Content", icon: MessageSquare },
    { id: "competitor", label: "Competitor Insight", icon: Users },
    { id: "social", label: "Social Media SEO", icon: Globe },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-2">Off-Page SEO AI</h1>
        <p className="text-xl text-neutral-500">Build authority and dominate SERPs with AI-driven off-page strategies.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-neutral-200 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === tab.id
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Edit3 className="text-emerald-500" />
            Input Data
          </h2>

          <div className="space-y-4">
            {(activeTab === "backlinks" || activeTab === "outreach") && (
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Target Niche / Industry</label>
                <input
                  type="text"
                  value={inputData.niche}
                  onChange={e => setInputData({ ...inputData, niche: e.target.value })}
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. SaaS, Fitness, Real Estate"
                />
              </div>
            )}

            {activeTab === "outreach" && (
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Outreach Goal</label>
                <input
                  type="text"
                  value={inputData.goal}
                  onChange={e => setInputData({ ...inputData, goal: e.target.value })}
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Guest post request, Link exchange"
                />
              </div>
            )}

            {activeTab === "competitor" && (
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Competitor Data (Manual Input)</label>
                <textarea
                  value={inputData.competitorInfo}
                  onChange={e => setInputData({ ...inputData, competitorInfo: e.target.value })}
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none min-h-[200px]"
                  placeholder="Paste competitor URLs, top ranking keywords, or content snippets here..."
                />
              </div>
            )}

            {activeTab === "social" && (
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Content Topic / URL</label>
                <input
                  type="text"
                  value={inputData.topic}
                  onChange={e => setInputData({ ...inputData, topic: e.target.value })}
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. 10 ways to improve website speed"
                />
              </div>
            )}

            <button
              onClick={handleRun}
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-6"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Zap />}
              Generate AI Strategies
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 shadow-sm min-h-[400px]">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="text-amber-500" />
            AI Output
          </h2>

          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>Enter data and click generate to see AI insights.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-emerald-600">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-medium animate-pulse">Gemini AI is analyzing...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
              {Object.entries(result).map(([key, value]: any) => (
                <div key={key} className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
                  <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                  {Array.isArray(value) ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {value.map((item, i) => <li key={i} className="text-neutral-800">{item}</li>)}
                    </ul>
                  ) : typeof value === 'object' ? (
                    <pre className="bg-neutral-100 p-3 rounded-xl text-sm overflow-x-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-neutral-800 prose prose-sm max-w-none">
                      <ReactMarkdown>{String(value)}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
