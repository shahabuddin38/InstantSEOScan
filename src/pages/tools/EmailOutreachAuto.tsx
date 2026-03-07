import { useState } from "react";
import { Mail, ArrowRight, Loader2, Sparkles, Building2, Globe, Bookmark } from "lucide-react";
import { apiRequest } from "../../services/apiClient";

export default function EmailOutreachAuto() {
    const [form, setForm] = useState({
        companyName: "",
        targetUrl: "",
        industry: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<{ subject: string; body: string } | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.companyName || !form.targetUrl) {
            setError("Company Name and Website URL are required.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        const res = await apiRequest<any>("/api/tools/generate-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        setLoading(false);

        if (!res.ok || !res.data) {
            setError(res.error || "Failed to generate outreach email. Ensure your Claude API key is set.");
            return;
        }

        setResult(res.data);
    };

    return (
        <div className="bg-neutral-50 min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold uppercase tracking-widest mb-6">
                        <Mail size={16} />
                        AI Email Outreach
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6">
                        Auto Email <span className="text-emerald-600">Personalization</span>
                    </h1>
                    <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                        Generate highly personalized, SEO-focused cold outreach emails using Claude AI.
                    </p>
                </div>

                <div className="bg-white rounded-[32px] border border-neutral-200 shadow-xl overflow-hidden p-8 md:p-12 mb-12">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-bold text-neutral-700 block mb-2">Company Name *</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                    <input
                                        type="text"
                                        value={form.companyName}
                                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                        placeholder="e.g. Acme Corp"
                                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-neutral-900 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-neutral-700 block mb-2">Website URL *</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                    <input
                                        type="url"
                                        value={form.targetUrl}
                                        onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                                        placeholder="https://example.com"
                                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-neutral-900 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-neutral-700 block mb-2">Industry (Optional)</label>
                            <div className="relative">
                                <Bookmark className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <input
                                    type="text"
                                    value={form.industry}
                                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                                    placeholder="e.g. Healthcare, SaaS, E-commerce"
                                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-neutral-900 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Generating Email...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} className="group-hover:text-emerald-400 transition-colors" />
                                    Generate AI Email
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {result && (
                        <div className="mt-12 pt-12 border-t border-neutral-200">
                            <h3 className="text-2xl font-black text-neutral-900 mb-6 flex items-center gap-3">
                                <Sparkles className="text-emerald-500" />
                                Your AI Generated Email
                            </h3>
                            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 relative">
                                <div className="mb-4 pb-4 border-b border-neutral-200">
                                    <p className="text-sm text-neutral-500 font-bold uppercase tracking-wider mb-1">Subject</p>
                                    <p className="text-lg font-bold text-neutral-900">{result.subject}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500 font-bold uppercase tracking-wider mb-2">Message Body</p>
                                    <div className="prose prose-neutral max-w-none whitespace-pre-wrap text-neutral-700">
                                        {result.body}
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`)}
                                    className="absolute top-6 right-6 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-bold text-neutral-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-sm"
                                >
                                    Copy All
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
