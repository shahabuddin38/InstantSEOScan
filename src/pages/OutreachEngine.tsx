import { useState, useEffect } from "react";
import { Users, Mail, Settings, Activity, Building, Globe, Zap, ListFilter, Search, Download, Trash2, ChevronRight, Loader2, ArrowUpRight } from "lucide-react";
import { apiRequest } from "../services/apiClient";
import dayjs from "dayjs";

type TabType = "leads" | "campaigns" | "templates" | "automations";

interface Lead {
    id: string;
    companyName: string;
    website: string;
    email: string | null;
    seoScore: number | null;
    status: string;
    createdAt: string;
}

interface Lead {
    id: string;
    companyName: string;
    website: string;
    email: string | null;
    seoScore: number | null;
    status: string;
    createdAt: string;
}

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    createdAt: string;
}

export default function OutreachEngine() {
    const [activeTab, setActiveTab] = useState<TabType>("leads");

    // Leads Database State
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loadingLeads, setLoadingLeads] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Templates Database State
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ name: "", subject: "", body: "" });

    useEffect(() => {
        if (activeTab === "leads") {
            fetchLeads();
        } else if (activeTab === "templates") {
            fetchTemplates();
        }
    }, [activeTab]);

    const fetchLeads = async () => {
        setLoadingLeads(true);
        try {
            const res = await apiRequest<Lead[]>("/api/admin/outreach/leads");
            if (res.ok && res.data) {
                setLeads(res.data);
            } else {
                console.error("Failed to fetch leads:", res.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingLeads(false);
        }
    };

    const deleteLead = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this lead?")) return;
        try {
            const res = await apiRequest(`/api/admin/outreach/leads?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setLeads(leads.filter(l => l.id !== id));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const res = await apiRequest<EmailTemplate[]>("/api/admin/outreach/templates");
            if (res.ok && res.data) {
                setTemplates(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await apiRequest<EmailTemplate>("/api/admin/outreach/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTemplate),
            });
            if (res.ok && res.data) {
                setTemplates([res.data, ...templates]);
                setShowNewTemplateModal(false);
                setNewTemplate({ name: "", subject: "", body: "" });
            } else {
                alert(res.error || "Failed to create template");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteTemplate = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            const res = await apiRequest(`/api/admin/outreach/templates?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setTemplates(templates.filter(t => t.id !== id));
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="bg-neutral-50 min-h-[calc(100vh-64px)] p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-4">
                            <Zap size={14} /> AI Growth Engine
                        </div>
                        <h1 className="text-3xl font-black text-neutral-900">Outreach CRM</h1>
                        <p className="text-neutral-500 mt-2 max-w-2xl">
                            Discover poor SEO leads at scale, generate automated audit reports, and deploy personalized AI cold outreach emails.
                        </p>
                    </div>
                    <div className="flex bg-white rounded-xl shadow-sm border border-neutral-200 p-1">
                        {[
                            { id: "leads", label: "Leads database", icon: Users },
                            { id: "campaigns", label: "Campaigns", icon: Mail },
                            { id: "templates", label: "Email templates", icon: Globe },
                            { id: "automations", label: "Scraping & Rules", icon: Settings },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                                    }`}
                            >
                                <tab.icon size={16} />
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content Placeholders */}
                {activeTab === "leads" && (
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full sm:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by company or domain..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
                                    <ListFilter size={16} /> Filters
                                </button>
                                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
                                    <Globe size={16} /> New Scrape
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left text-sm text-neutral-600">
                                <thead className="bg-neutral-50 text-neutral-700 text-xs uppercase font-bold border-b border-neutral-200">
                                    <tr>
                                        <th className="px-6 py-4">Company</th>
                                        <th className="px-6 py-4">SEO Score</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Discovered</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingLeads ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                                                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                                Loading leads...
                                            </td>
                                        </tr>
                                    ) : leads.filter(l =>
                                        l.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        l.website.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                                                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center border border-neutral-200 shadow-sm mx-auto mb-3">
                                                    <Search size={24} className="text-neutral-400" />
                                                </div>
                                                <p className="font-semibold text-neutral-700">No leads found</p>
                                                <p className="text-sm">Try adjusting your search or initiate a new scrape.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        leads.filter(l =>
                                            l.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            l.website.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).map((lead) => (
                                            <tr key={lead.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0">
                                                            {lead.companyName?.[0] || lead.website[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-neutral-900">{lead.companyName || "Unknown"}</div>
                                                            <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                                                {lead.website} <ArrowUpRight size={10} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {lead.seoScore !== null ? (
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${lead.seoScore >= 80 ? "bg-emerald-50 text-emerald-700" :
                                                            lead.seoScore >= 50 ? "bg-amber-50 text-amber-700" :
                                                                "bg-red-50 text-red-700"
                                                            }`}>
                                                            {lead.seoScore}/100
                                                        </span>
                                                    ) : (
                                                        <span className="text-neutral-400 text-xs italic">Not scanned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {lead.email ? (
                                                        <span className="text-sm text-neutral-700 font-medium">{lead.email}</span>
                                                    ) : (
                                                        <span className="text-xs text-neutral-400 italic">No email</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${lead.status === "new" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                                        lead.status === "contacted" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                                                            lead.status === "replied" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                                                "bg-neutral-100 text-neutral-700 border border-neutral-200"
                                                        }`}>
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-neutral-500 whitespace-nowrap">
                                                    {dayjs(lead.createdAt).format("MMM D, YYYY")}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="View details">
                                                            <ChevronRight size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteLead(lead.id)}
                                                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete lead"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "campaigns" && (
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden min-h-[500px] flex items-center justify-center">
                        <h2 className="text-xl font-bold text-neutral-900">Campaigns Module Under Construction</h2>
                    </div>
                )}

                {activeTab === "templates" && (
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-neutral-900">Email Templates</h2>
                            <button
                                onClick={() => setShowNewTemplateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                <Globe size={16} /> New Template
                            </button>
                        </div>

                        <div className="flex-1 overflow-x-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loadingTemplates ? (
                                <div className="col-span-full py-12 text-center text-neutral-500">
                                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                    Loading templates...
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-neutral-500 border-2 border-dashed border-neutral-200 rounded-xl">
                                    <Globe className="mx-auto mb-2 text-neutral-400" size={32} />
                                    <p className="font-semibold text-neutral-700">No templates found</p>
                                    <p className="text-sm">Create your first outreach template to start sending emails.</p>
                                </div>
                            ) : (
                                templates.map(template => (
                                    <div key={template.id} className="border border-neutral-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all relative group flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">{template.name}</h3>
                                            <button
                                                onClick={() => deleteTemplate(template.id)}
                                                className="text-neutral-400 hover:text-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="text-xs font-semibold text-neutral-500 mb-2 truncate">Subj: {template.subject}</div>
                                        <div className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg flex-1 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-50 bottom-0 h-12 mt-auto"></div>
                                            <p className="whitespace-pre-wrap">{template.body}</p>
                                        </div>
                                        <div className="mt-3 text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                                            Created {dayjs(template.createdAt).format("MMM D")}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "automations" && (
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden min-h-[500px] flex items-center justify-center">
                        <h2 className="text-xl font-bold text-neutral-900">Automations Module Under Construction</h2>
                    </div>
                )}
            </div>

            {/* New Template Modal */}
            {showNewTemplateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                <Globe className="text-indigo-600" size={20} />
                                Create Outreach Template
                            </h3>
                            <button
                                onClick={() => setShowNewTemplateModal(false)}
                                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-neutral-50/30">
                            <form id="templateForm" onSubmit={handleCreateTemplate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 mb-1">Template Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTemplate.name}
                                        onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="e.g. Broken Links Outreach"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 mb-1">Email Subject Line</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTemplate.subject}
                                        onChange={e => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="e.g. Quick question about {{companyName}}"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">Available variables: {'{{companyName}}, {{website}}'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 mb-1">Email Body</label>
                                    <textarea
                                        required
                                        value={newTemplate.body}
                                        onChange={e => setNewTemplate({ ...newTemplate, body: e.target.value })}
                                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none min-h-[200px]"
                                        placeholder="Hi there,\n\nI noticed some broken links on {{website}}..."
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">Available variables: {'{{companyName}}, {{website}}'}</p>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 bg-white">
                            <button
                                type="button"
                                onClick={() => setShowNewTemplateModal(false)}
                                className="px-4 py-2 text-sm font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="templateForm"
                                className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                Save Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
