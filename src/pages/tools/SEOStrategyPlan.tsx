import { useState } from "react";
import { Target, ArrowRight, Loader2, AlertCircle, CheckCircle2, CalendarClock, Flag } from "lucide-react";
import { motion } from "motion/react";
import { generateSEOStrategyPlan } from "../../services/geminiService";
import jsPDF from "jspdf";
import { addActivity } from "../../services/activityHistory";

export default function SEOStrategyPlan() {
  const [form, setForm] = useState({
    website: "",
    niche: "",
    goals: "",
    budget: "",
    timeline: "90 days",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleExportPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const websiteTitle = form.website || "website";
    const generatedAt = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text("SEO Strategy Plan", 14, 18);

    doc.setFontSize(10);
    doc.text(`Website: ${websiteTitle}`, 14, 26);
    doc.text(`Niche: ${form.niche || "N/A"}`, 14, 32);
    doc.text(`Timeline: ${form.timeline || "N/A"}`, 14, 38);
    doc.text(`Generated: ${generatedAt}`, 14, 44);
    doc.text("generate by instanseoscan ai", 14, 50);

    let y = 60;

    const addSection = (title: string, content: string) => {
      doc.setFontSize(12);
      doc.text(title, 14, y);
      y += 6;

      doc.setFontSize(10);
      const lines = doc.splitTextToSize(content || "N/A", 180);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 6;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    };

    addSection("Strategy Summary", String(result.summary || result.planSummary || ""));
    addSection("Timeline Plan", String(result.timelinePlan || result.timeline || ""));

    if (Array.isArray(result.priorities) && result.priorities.length > 0) {
      doc.setFontSize(12);
      doc.text("Prioritized Action Plan", 14, y);
      y += 8;

      result.priorities.forEach((item: any, index: number) => {
        const title = item?.title || `Priority ${index + 1}`;
        const detail = item?.detail || item?.description || "";
        const block = `${index + 1}. ${title}: ${detail}`;

        doc.setFontSize(10);
        const lines = doc.splitTextToSize(block, 180);
        doc.text(lines, 14, y);
        y += lines.length * 5 + 3;

        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    }

    const safeName = String(websiteTitle).replace(/[^a-zA-Z0-9-_]/g, "-");
    doc.save(`seo-strategy-plan-${safeName}.pdf`);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await generateSEOStrategyPlan(form);
      setResult(data);
      addActivity({
        type: "strategy_plan",
        title: "SEO Strategy Plan",
        detail: form.website,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to generate strategy plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <main className="flex-1 p-8 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-2">SEO Strategy Plan</h1>
            <p className="text-neutral-500">Generate a complete SEO roadmap for your website with priorities, milestones, and action items.</p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 mb-8">
            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-neutral-700 mb-2">Website URL</label>
                <input
                  required
                  type="text"
                  placeholder="example.com"
                  value={form.website}
                  onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Business Niche</label>
                <input
                  required
                  type="text"
                  placeholder="SaaS, Ecommerce, Agency..."
                  value={form.niche}
                  onChange={(e) => setForm((prev) => ({ ...prev, niche: e.target.value }))}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Budget (optional)</label>
                <input
                  type="text"
                  placeholder="$1,000/month"
                  value={form.budget}
                  onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-neutral-700 mb-2">Main Goals</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Increase organic traffic, improve rankings, generate leads..."
                  value={form.goals}
                  onChange={(e) => setForm((prev) => ({ ...prev, goals: e.target.value }))}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Timeline</label>
                <select
                  value={form.timeline}
                  onChange={(e) => setForm((prev) => ({ ...prev, timeline: e.target.value }))}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option>30 days</option>
                  <option>60 days</option>
                  <option>90 days</option>
                  <option>6 months</option>
                  <option>12 months</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <><Target size={18} /> Generate Plan <ArrowRight size={16} /></>}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                  <h3 className="font-bold mb-3 flex items-center gap-2"><Flag size={16} className="text-emerald-600" /> Strategy Summary</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">{result.summary || result.planSummary || "No summary generated."}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                  <h3 className="font-bold mb-3 flex items-center gap-2"><CalendarClock size={16} className="text-blue-600" /> Timeline Focus</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">{result.timelinePlan || result.timeline || "No timeline generated."}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleExportPDF}
                  className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors"
                >
                  Export PDF Plan
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Prioritized Action Plan</h3>
                {Array.isArray(result.priorities) ? (
                  <div className="space-y-3">
                    {result.priorities.map((item: any, index: number) => (
                      <div key={index} className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50">
                        <div className="font-bold text-sm mb-1">{item.title || `Priority ${index + 1}`}</div>
                        <div className="text-sm text-neutral-600">{item.detail || item.description || JSON.stringify(item)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed">{result.priorities || "No priorities generated."}</p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
