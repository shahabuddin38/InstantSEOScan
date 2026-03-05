import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Globe, History, BarChart3, Zap, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { getAIInsights, calculateScore } from "../services/geminiService";
import { apiRequest } from "../services/apiClient";
import { addActivity, getActivityHistory, type ActivityEntry } from "../services/activityHistory";

export default function Dashboard({ user }: { user: any }) {
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("scan") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Array<{ id: string; url: string; score: number; createdAt: string }>>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityEntry[]>([]);
  const navigate = useNavigate();

  const formatRelativeDate = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${Math.max(1, minutes)} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const loadHistory = async () => {
    const result = await apiRequest<Array<{ id: string; url: string; score: number; createdAt: string }>>("/api/scan/history");
    if (result.ok && Array.isArray(result.data)) {
      setHistory(result.data);
    }
  };

  useEffect(() => {
    if (searchParams.get("scan")) {
      handleScan();
    }
    loadHistory();
    setActivityHistory(getActivityHistory());
  }, []);

  // Real stats computed from actual scan history
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = history.filter(s => {
      const d = new Date(s.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalScans = thisMonth.length;
    const avgScore = totalScans > 0
      ? Math.round(thisMonth.reduce((sum, s) => sum + s.score, 0) / totalScans)
      : 0;
    return { totalScans, avgScore };
  }, [history]);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");

    try {
      const result = await apiRequest<any>("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url }),
      });

      if (!result.ok || !result.data) throw new Error(result.error || "Scan failed");
      const data = result.data;

      // Perform AI Analysis on frontend
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      const aiResponse = await getAIInsights(targetUrl, data.technical, data.content);
      const score = calculateScore(data.technical);

      const finalResults = {
        ...data,
        ai: aiResponse,
        score
      };

      const activityUpdated = addActivity({
        type: "audit",
        title: "Website Audit",
        detail: targetUrl,
      });
      setActivityHistory(activityUpdated);

      sessionStorage.setItem("lastScan", JSON.stringify(finalResults));
      await loadHistory();
      navigate(`/report/${data.reportId || "latest"}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isPaidUser = user?.plan === "pro" || user?.plan === "agency";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.email.split('@')[0]}</h1>
        <p className="text-neutral-500">Ready to audit another website?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Scan Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap className="text-emerald-600" size={20} />
              New Audit
            </h2>
            <form onSubmit={handleScan} className="space-y-4">
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="text"
                  required
                  placeholder="example.com"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Run Deep Scan
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
          </div>

          {/* Quick Stats — real data from scan history */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 size={20} />
              </div>
              <div className="text-2xl font-bold">{stats.totalScans}</div>
              <div className="text-sm text-neutral-500">Total Scans This Month</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Zap size={20} />
              </div>
              <div className="text-2xl font-bold">{stats.avgScore > 0 ? `${stats.avgScore}%` : "—"}</div>
              <div className="text-sm text-neutral-500">Average SEO Score</div>
            </div>
          </div>
        </div>

        {/* Sidebar: History */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <History className="text-neutral-400" size={20} />
              Recent Scans
            </h2>
            <div className="space-y-4">
              {history.length > 0 ? history.map((scan, i) => (
                <div
                  key={scan.id || i}
                  onClick={() => navigate(`/report/${scan.id}`)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-sm group-hover:text-emerald-600 transition-colors">{scan.url}</div>
                    <div className="text-xs text-neutral-400">{formatRelativeDate(scan.createdAt)}</div>
                  </div>
                  <div className={`text-sm font-bold ${scan.score > 90 ? 'text-emerald-600' : scan.score > 60 ? 'text-orange-500' : 'text-red-500'}`}>
                    {scan.score}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-neutral-400">
                  <Search size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No scans yet. Run your first audit above!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <History className="text-neutral-400" size={20} />
              Tool Activity History
            </h2>
            <div className="space-y-4">
              {activityHistory.length > 0 ? activityHistory.slice(0, 12).map((entry) => (
                <div key={entry.id} className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div className="font-bold text-sm text-neutral-800">{entry.title}</div>
                  <div className="text-xs text-neutral-500 mt-1">{entry.detail || "No details"}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">{formatRelativeDate(entry.createdAt)}</div>
                </div>
              )) : (
                <div className="text-center py-8 text-neutral-400">
                  <History size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No tool activity yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Go Pro — only show for free plan users */}
          {!isPaidUser && (
            <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Go Pro</h3>
                <p className="text-emerald-200 text-sm mb-6 leading-relaxed">Unlock backlink tracking, keyword research, and unlimited scans.</p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full bg-white text-emerald-900 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
