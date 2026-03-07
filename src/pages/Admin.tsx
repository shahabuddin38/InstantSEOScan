import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Zap,
  BarChart3,
  Settings,
  Shield,
  CheckCircle2,
  Calendar,
  Lock,
  Newspaper,
  FileText,
  Trash2,
  Plus,
  Save,
  RefreshCw,
  Eye,
  Key,
  X,
  GripVertical,
  MessageSquare,
  LayoutDashboard,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileEdit,
  Moon,
  Upload,
  // Growth Engine icons
  Target,
  Send,
  Bot,
  MapPin,
  AtSign,
  Play,
  Pause,
  Database,
  Globe,
  Mail,
  Activity,
  Loader2,
  ArrowUpRight,
  ToggleLeft,
  ToggleRight,
  Cpu,
  ChevronDown,
  Inbox,
} from "lucide-react";
import { apiRequest } from "../services/apiClient";
import { cn } from "../lib/utils";

type AdminStats = {
  userCount?: { count: number };
  scanCount?: { count: number };
  pendingCount?: { count: number };
  blogCount?: { count: number };
  messageCount?: { count: number };
};

type AdminUser = {
  id: string;
  email: string;
  role: string;
  plan: string;
  status: string;
  verified: number;
  usage_count: number;
  usage_limit: number;
  createdAt?: string;
};

type CRMResponse = {
  totals?: {
    totalUsers: number;
    approvedUsers: number;
    pendingUsers: number;
    paidUsers: number;
  };
  users?: AdminUser[];
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  blocks?: BlogBlock[];
  createdAt: string;
  status?: "Published" | "Draft";
  seoScore?: number;
};

type BlogBlock = {
  id: string;
  type: "h1" | "h2" | "h3" | "paragraph" | "quote" | "list" | "image" | "cta";
  text: string;
  url?: string;
  alt?: string;
  description?: string;
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "resolved";
  createdAt: string;
};

type GeminiKeyStat = {
  slot: number;
  key: string;
  configured: boolean;
  usage: number;
  limit: number | null;
  remaining: number | null;
  status: "available" | "limited" | "missing";
};

const tokenHeaders = () => ({});

// --- UI Components ---
const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <div
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group",
      active ? "bg-[#E7F7F1] text-[#10B981]" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon size={20} className={cn(active ? "text-[#10B981]" : "text-slate-400 group-hover:text-slate-600")} />
    <span className="font-medium text-sm">{label}</span>
  </div>
);

const StatCard = ({ label, value, change, icon: Icon, iconBg, iconColor }: { label: string, value: string | number, change: string | number, icon: any, iconBg: string, iconColor: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <span className="text-slate-500 text-sm font-medium">{label}</span>
      <div className={cn("p-2 rounded-lg", iconBg)}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      <span className="text-[#10B981] text-xs font-bold mb-1 flex items-center gap-0.5">
        {change} <TrendingUp size={12} />
      </span>
    </div>
  </div>
);

const SEOProgress = ({ score = 80 }: { score?: number }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let color = "#EF4444"; // Red
  if (score >= 80) color = "#10B981"; // Green
  else if (score >= 60) color = "#F59E0B"; // Orange

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="#F1F5F9"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-slate-700">{score}</span>
    </div>
  );
};


export default function Admin() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "crm" | "cms" | "settings" | "aiwriter" | "autopost" | "leads" | "campaigns" | "templates" | "automation" | "scraper" | "inbox">("dashboard");
  const [stats, setStats] = useState<AdminStats>({});
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [crm, setCrm] = useState<CRMResponse>({});
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingPost, setSavingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [autoPostTopic, setAutoPostTopic] = useState("");
  const [autoPostAuthor, setAutoPostAuthor] = useState("Admin");
  const [autoPostCoverImage, setAutoPostCoverImage] = useState("");
  const [autoPostCustomInstructions, setAutoPostCustomInstructions] = useState("");
  const [autoPostingAnthropic, setAutoPostingAnthropic] = useState(false);
  const [autoPostResult, setAutoPostResult] = useState<any>(null);
  const [bulkTopics, setBulkTopics] = useState("");
  const [bulkPosting, setBulkPosting] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const [fixingImages, setFixingImages] = useState(false);
  const [fixImagesResult, setFixImagesResult] = useState<any>(null);

  // ── Growth Engine State ──────────────────────
  type GrowthLead = {
    id: string; companyName?: string; website: string; email?: string;
    seoScore?: number; status: string; industry?: string; location?: string;
    leadSource?: string; createdAt: string; issues?: string[];
  };
  type GrowthTemplate = { id: string; name: string; subject: string; body: string; createdAt: string; };
  type GrowthCampaign = {
    id: string; name: string; status: string; templateId: string; createdAt: string;
    template?: { name: string; subject: string };
    _count?: { logs: number };
  };
  type AutoModule = { id: string; module: string; enabled: boolean; scheduleInterval: string; updatedAt: string; };

  const [growthLeads, setGrowthLeads] = useState<GrowthLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const [growthTemplates, setGrowthTemplates] = useState<GrowthTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", subject: "", body: "" });
  const [growthCampaigns, setGrowthCampaigns] = useState<GrowthCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: "", templateId: "" });
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);
  const [campaignSendResult, setCampaignSendResult] = useState<any>(null);
  const [autoModules, setAutoModules] = useState<AutoModule[]>([]);
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [togglingModule, setTogglingModule] = useState<string | null>(null);
  const [scraperForm, setScraperForm] = useState({ keyword: "", location: "", source: "google", maxLeads: "10" });
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<any>(null);

  // ── Inbox State ──────────────────────────────
  type InboxLog = {
    id: string; subject: string; body: string; status: string; sentAt: string;
    lead?: { companyName?: string; website: string; email?: string };
    campaign?: { name: string };
  };
  const [inboxLogs, setInboxLogs] = useState<InboxLog[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [inboxFilter, setInboxFilter] = useState("all");
  const [inboxCounts, setInboxCounts] = useState<Record<string, number>>({});

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetBlock, setUploadTargetBlock] = useState<string | null>(null);
  const [interlinkDrafts, setInterlinkDrafts] = useState<Record<string, { text: string; href: string; target: "_self" | "_blank" }>>({});

  const [postForm, setPostForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    coverImage: "",
    author: "",
    blocks: [] as BlogBlock[],
  });

  const [settingsForm, setSettingsForm] = useState({
    CMS_API_KEY: "",
    GEMINI_API_KEY_1: "",
    GEMINI_API_KEY_1_LIMIT: "",
    GEMINI_API_KEY_2: "",
    GEMINI_API_KEY_2_LIMIT: "",
    GEMINI_API_KEY_3: "",
    GEMINI_API_KEY_3_LIMIT: "",
    SERP_API_KEY: "",
    DATAFORSEO_API_KEY: "",
    KEYWORD_API_KEY: "",
    BACKLINK_API_KEY: "",
    AI_API_KEY: "",
    CLAUDE_API_KEY: "",
    POSTGRES_URL: "",
    PRISMA_DATABASE_URL: "",
  });
  const [geminiKeyStats, setGeminiKeyStats] = useState<GeminiKeyStat[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);

  const navigate = useNavigate();

  const fetchStats = async () => {
    const result = await apiRequest<AdminStats>("/api/admin/stats", { headers: tokenHeaders() });
    if (!result.ok || !result.data) throw new Error(result.error || "Failed to load admin stats");
    setStats(result.data);
  };

  const fetchUsers = async () => {
    const result = await apiRequest<AdminUser[]>("/api/admin/users", { headers: tokenHeaders() });
    if (!result.ok || !result.data) throw new Error(result.error || "Failed to load users");
    setUsers(result.data);
  };

  const fetchCRM = async () => {
    const result = await apiRequest<CRMResponse>("/api/admin/crm", { headers: tokenHeaders() });
    if (!result.ok || !result.data) throw new Error(result.error || "Failed to load CRM data");
    setCrm(result.data);
  };

  const fetchBlogPosts = async () => {
    const result = await apiRequest<BlogPost[]>("/api/admin/blog", { headers: tokenHeaders() });
    if (!result.ok || !result.data) throw new Error(result.error || "Failed to load CMS posts");
    setPosts(result.data.map(p => ({ ...p, status: p.status || "Published", seoScore: p.seoScore || 85 })));
  };

  const fetchMessages = async () => {
    const result = await apiRequest<ContactMessage[]>("/api/admin/messages", { headers: tokenHeaders() });
    if (!result.ok || !result.data) throw new Error(result.error || "Failed to load messages");
    setMessages(result.data);
  };

  const fetchSettings = async () => {
    const result = await apiRequest<any>("/api/admin/settings", { headers: tokenHeaders() });
    if (result.ok && result.data) {
      setSettingsForm({
        CMS_API_KEY: result.data.CMS_API_KEY || "",
        GEMINI_API_KEY_1: result.data.GEMINI_API_KEY_1 || "",
        GEMINI_API_KEY_1_LIMIT: result.data.GEMINI_API_KEY_1_LIMIT || "",
        GEMINI_API_KEY_2: result.data.GEMINI_API_KEY_2 || "",
        GEMINI_API_KEY_2_LIMIT: result.data.GEMINI_API_KEY_2_LIMIT || "",
        GEMINI_API_KEY_3: result.data.GEMINI_API_KEY_3 || "",
        GEMINI_API_KEY_3_LIMIT: result.data.GEMINI_API_KEY_3_LIMIT || "",
        SERP_API_KEY: result.data.SERP_API_KEY || "",
        DATAFORSEO_API_KEY: result.data.DATAFORSEO_API_KEY || "",
        KEYWORD_API_KEY: result.data.KEYWORD_API_KEY || "",
        BACKLINK_API_KEY: result.data.BACKLINK_API_KEY || "",
        AI_API_KEY: result.data.AI_API_KEY || "",
        CLAUDE_API_KEY: result.data.CLAUDE_API_KEY || "",
        POSTGRES_URL: result.data.POSTGRES_URL || "",
        PRISMA_DATABASE_URL: result.data.PRISMA_DATABASE_URL || "",
      });
      setGeminiKeyStats(Array.isArray(result.data._geminiKeyStats) ? result.data._geminiKeyStats : []);
    }
  };

  // ── Growth Engine fetch helpers ─────────────────
  const fetchGrowthLeads = async () => {
    setLoadingLeads(true);
    const r = await apiRequest<any[]>("/api/admin/growth/leads", { headers: tokenHeaders() });
    if (r.ok && r.data) setGrowthLeads(r.data);
    setLoadingLeads(false);
  };

  const fetchGrowthTemplates = async () => {
    setLoadingTemplates(true);
    const r = await apiRequest<any[]>("/api/admin/growth/templates", { headers: tokenHeaders() });
    if (r.ok && r.data) setGrowthTemplates(r.data);
    setLoadingTemplates(false);
  };

  const fetchGrowthCampaigns = async () => {
    setLoadingCampaigns(true);
    const r = await apiRequest<any[]>("/api/admin/growth/campaigns", { headers: tokenHeaders() });
    if (r.ok && r.data) setGrowthCampaigns(r.data);
    setLoadingCampaigns(false);
  };

  const fetchAutoModules = async () => {
    setLoadingAuto(true);
    const r = await apiRequest<any[]>("/api/admin/growth/automation", { headers: tokenHeaders() });
    if (r.ok && r.data) setAutoModules(r.data);
    setLoadingAuto(false);
  };

  const fetchInbox = async (statusFilter?: string) => {
    setLoadingInbox(true);
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    const r = await apiRequest<any>(`/api/admin/growth/inbox${qs}`, { headers: tokenHeaders() });
    if (r.ok && r.data) {
      setInboxLogs(r.data.logs || []);
      setInboxCounts(r.data.statusCounts || {});
    }
    setLoadingInbox(false);
  };

  const handleMarkInboxStatus = async (logId: string, newStatus: string) => {
    const r = await apiRequest<any>(`/api/admin/growth/inbox/${logId}`, {
      method: "PATCH",
      headers: { ...tokenHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (r.ok) {
      setInboxLogs((prev) => prev.map((l) => l.id === logId ? { ...l, status: newStatus } : l));
    } else {
      alert(r.error || "Failed to update status");
    }
  };

  const handleScrape = async () => {
    if (!scraperForm.keyword.trim()) return;
    setScraping(true);
    setScrapeResult(null);
    const r = await apiRequest<any>("/api/admin/growth/scraper", {
      method: "POST",
      headers: { ...tokenHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword: scraperForm.keyword,
        location: scraperForm.location,
        source: scraperForm.source,
        maxLeads: Number(scraperForm.maxLeads),
      }),
    });
    if (r.ok) {
      setScrapeResult(r.data);
      await fetchGrowthLeads();
    } else {
      setScrapeResult({ error: r.error });
    }
    setScraping(false);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await apiRequest<any>("/api/admin/growth/templates", {
      method: "POST",
      headers: { ...tokenHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(newTemplate),
    });
    if (r.ok) {
      await fetchGrowthTemplates();
      setShowTemplateModal(false);
      setNewTemplate({ name: "", subject: "", body: "" });
    } else {
      alert(r.error || "Failed to create template");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await apiRequest(`/api/admin/growth/templates?id=${id}`, { method: "DELETE", headers: tokenHeaders() });
    setGrowthTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await apiRequest<any>("/api/admin/growth/campaigns", {
      method: "POST",
      headers: { ...tokenHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(newCampaign),
    });
    if (r.ok) {
      await fetchGrowthCampaigns();
      setShowCampaignModal(false);
      setNewCampaign({ name: "", templateId: "" });
    } else {
      alert(r.error || "Failed to create campaign");
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    await apiRequest(`/api/admin/growth/campaigns?id=${id}`, { method: "DELETE", headers: tokenHeaders() });
    setGrowthCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm("Send this campaign to all new leads with email addresses?")) return;
    setSendingCampaignId(campaignId);
    setCampaignSendResult(null);
    const r = await apiRequest<any>("/api/admin/growth/campaigns/send", {
      method: "POST",
      headers: { ...tokenHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
    });
    setSendingCampaignId(null);
    setCampaignSendResult(r.data || { error: r.error });
    if (r.ok) await fetchGrowthCampaigns();
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await apiRequest(`/api/admin/growth/leads?id=${id}`, { method: "DELETE", headers: tokenHeaders() });
    setGrowthLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const handleToggleModule = async (module: string, currentEnabled: boolean) => {
    setTogglingModule(module);
    const r = await apiRequest<any>("/api/admin/growth/automation", {
      method: "POST",
      headers: { ...tokenHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ module, enabled: !currentEnabled }),
    });
    if (r.ok) {
      setAutoModules((prev) => prev.map((m) => m.module === module ? { ...m, enabled: !currentEnabled } : m));
    }
    setTogglingModule(null);
  };

  const handleUpdateSchedule = async (module: string, scheduleInterval: string) => {
    await apiRequest<any>("/api/admin/growth/automation", {
      method: "POST",
      headers: { ...tokenHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ module, scheduleInterval }),
    });
    setAutoModules((prev) => prev.map((m) => m.module === module ? { ...m, scheduleInterval } : m));
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    setError("");
    const result = await apiRequest("/api/admin/settings", {
      method: "POST",
      headers: { ...tokenHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(settingsForm),
    });
    setSavingSettings(false);
    if (!result.ok) {
      setError(result.error || "Failed to save settings");
    } else {
      if (result.data?._geminiKeyStats) {
        setGeminiKeyStats(result.data._geminiKeyStats);
      }
      alert("Settings saved successfully!");
    }
  };

  const loadAll = async () => {
    setError("");
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchUsers(), fetchCRM(), fetchBlogPosts(), fetchMessages(), fetchSettings()]);
    } catch (err: any) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (posts.length > 0 && !selectedPost && activeTab === "cms") {
      setSelectedPost(posts[0]);
    }
  }, [posts, activeTab]);

  // Lazy-load Growth Engine data when tabs become active
  useEffect(() => {
    if (activeTab === "leads" || activeTab === "scraper") fetchGrowthLeads();
    if (activeTab === "templates") fetchGrowthTemplates();
    if (activeTab === "campaigns") { fetchGrowthCampaigns(); fetchGrowthTemplates(); }
    if (activeTab === "automation") fetchAutoModules();
    if (activeTab === "inbox") fetchInbox();
  }, [activeTab]);

  const handleApprove = async (userId: string) => {
    const result = await apiRequest(`/api/admin/users/${userId}/approve`, {
      method: "POST",
      headers: tokenHeaders(),
    });

    if (!result.ok) {
      setError(result.error || "Failed to approve user");
      return;
    }

    await Promise.all([fetchUsers(), fetchCRM(), fetchStats()]);
  };

  const handleUpdatePlan = async (userId: string, plan: string, limit: number, days?: number) => {
    let finalDays = days;
    if (!finalDays) {
      const input = prompt("Enter number of days for this subscription:", "30");
      if (!input) return;
      finalDays = parseInt(input, 10);
      if (isNaN(finalDays) || finalDays <= 0) {
        setError("Invalid number of days.");
        return;
      }
    }

    const result = await apiRequest(`/api/admin/users/${userId}/plan`, {
      method: "POST",
      headers: {
        ...tokenHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan, limit, days: finalDays }),
    });

    if (!result.ok) {
      setError(result.error || "Failed to update user plan");
      return;
    }

    await Promise.all([fetchUsers(), fetchCRM()]);
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to DELETE user ${email}? This will also delete all their scan reports. This action cannot be undone.`)) return;
    const result = await apiRequest(`/api/admin/users/${userId}/delete`, {
      method: "POST",
      headers: tokenHeaders(),
    });
    if (!result.ok) { setError(result.error || "Failed to delete user"); return; }
    await Promise.all([fetchUsers(), fetchCRM(), fetchStats()]);
  };

  const handleResetPassword = async (userId: string, email: string) => {
    const newPassword = prompt(`Enter new password for ${email} (min 6 chars):`);
    if (!newPassword) return;
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    const result = await apiRequest(`/api/admin/users/${userId}/reset-password`, {
      method: "POST",
      headers: { ...tokenHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    if (!result.ok) { setError(result.error || "Failed to reset password"); return; }
    alert(`Password for ${email} has been reset successfully.`);
  };

  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleViewUser = async (userId: string) => {
    setLoadingDetail(true);
    const result = await apiRequest<any>(`/api/admin/users/${userId}/detail`, { headers: tokenHeaders() });
    setLoadingDetail(false);
    if (!result.ok) { setError(result.error || "Failed to load user"); return; }
    setSelectedUserDetail(result.data);
  };

  const resetPostForm = () => {
    setPostForm({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      coverImage: "",
      author: "",
      blocks: [],
    });
    setEditingPostId(null);
    setIsCreatingPost(true);
    setInterlinkDrafts({});
  };

  const createBlock = (type: BlogBlock["type"]): BlogBlock => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    text: "",
    url: "",
    alt: "",
    description: "",
  });

  const addBlock = (type: BlogBlock["type"]) => {
    setPostForm((prev) => ({ ...prev, blocks: [...prev.blocks, createBlock(type)] }));
  };

  const updateBlock = (blockId: string, patch: Partial<BlogBlock>) => {
    setPostForm((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
    }));
  };

  const removeBlock = (blockId: string) => {
    setPostForm((prev) => ({ ...prev, blocks: prev.blocks.filter((block) => block.id !== blockId) }));
    setInterlinkDrafts((prev) => {
      const next = { ...prev };
      delete next[blockId];
      return next;
    });
  };

  const setInterlinkDraft = (blockId: string, patch: Partial<{ text: string; href: string; target: "_self" | "_blank" }>) => {
    setInterlinkDrafts((prev) => ({
      ...prev,
      [blockId]: {
        text: prev[blockId]?.text || "",
        href: prev[blockId]?.href || "",
        target: prev[blockId]?.target || "_self",
        ...patch,
      },
    }));
  };

  const insertInterlink = (blockId: string) => {
    const draft = interlinkDrafts[blockId];
    const linkText = (draft?.text || "").trim();
    const href = (draft?.href || "").trim();
    const target = draft?.target || "_self";

    if (!linkText || !href) {
      setError("Interlink text and href are required.");
      return;
    }

    const anchorTag = `<a href="${href}" target="${target}">${linkText}</a>`;
    const currentBlock = postForm.blocks.find((block) => block.id === blockId);
    const nextText = currentBlock?.text?.trim() ? `${currentBlock.text} ${anchorTag}` : anchorTag;

    updateBlock(blockId, { text: nextText });
    setInterlinkDraft(blockId, { text: "", href: "", target: "_self" });
  };

  const moveBlock = (fromBlockId: string, toBlockId: string) => {
    setPostForm((prev) => {
      const fromIndex = prev.blocks.findIndex((block) => block.id === fromBlockId);
      const toIndex = prev.blocks.findIndex((block) => block.id === toBlockId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return prev;

      const updated = [...prev.blocks];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { ...prev, blocks: updated };
    });
  };

  const startEditPost = (post: BlogPost) => {
    const parsedBlocks = Array.isArray(post.blocks) && post.blocks.length > 0
      ? post.blocks
      : [createBlock("paragraph")];

    setEditingPostId(post.id);
    setIsCreatingPost(false);
    setPostForm({
      title: post.title,
      slug: post.slug,
      content: post.content || "",
      excerpt: post.excerpt || "",
      coverImage: post.coverImage || "",
      author: (post.author || "").toLowerCase() === "ai writer" ? "Admin" : (post.author || ""),
      blocks: parsedBlocks,
    });
  };

  const handleSavePost = async () => {
    const derivedContent = postForm.blocks.map((block) => block.text.trim()).filter(Boolean).join("\n\n") || postForm.content;
    if (!postForm.title.trim() || (!derivedContent.trim() && postForm.blocks.length === 0)) {
      setError("Post title and content are required.");
      return;
    }

    setSavingPost(true);
    setError("");

    const endpoint = editingPostId ? `/api/admin/blog/${editingPostId}` : "/api/admin/blog";
    const method = editingPostId ? "PUT" : "POST";

    const result = await apiRequest(endpoint, {
      method,
      headers: {
        ...tokenHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...postForm,
        content: derivedContent,
      }),
    });

    setSavingPost(false);

    if (!result.ok) {
      setError(result.error || "Failed to save post");
      return;
    }

    await Promise.all([fetchBlogPosts(), fetchStats()]);
    resetPostForm();
    setIsCreatingPost(false);
  };

  const handleMessageStatus = async (id: string, status: ContactMessage["status"]) => {
    const result = await apiRequest(`/api/admin/messages/${id}`, {
      method: "PUT",
      headers: {
        ...tokenHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!result.ok) {
      setError(result.error || "Failed to update message status");
      return;
    }

    await Promise.all([fetchMessages(), fetchStats()]);
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return;

    const result = await apiRequest(`/api/admin/messages/${id}`, {
      method: "DELETE",
      headers: tokenHeaders(),
    });

    if (!result.ok) {
      setError(result.error || "Failed to delete message");
      return;
    }

    await Promise.all([fetchMessages(), fetchStats()]);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post permanently?")) return;

    const result = await apiRequest(`/api/admin/blog/${id}`, {
      method: "DELETE",
      headers: tokenHeaders(),
    });

    if (!result.ok) {
      setError(result.error || "Failed to delete post");
      return;
    }

    await Promise.all([fetchBlogPosts(), fetchStats()]);
    if (editingPostId === id) resetPostForm();
    if (selectedPost?.id === id) setSelectedPost(null);
  };

  // --- Handlers for Image Upload via Base64 ---
  const triggerImageUpload = (blockId: string | null = null) => {
    setUploadTargetBlock(blockId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (uploadTargetBlock === null) {
        setPostForm(prev => ({ ...prev, coverImage: base64String }));
      } else {
        updateBlock(uploadTargetBlock, { url: base64String });
      }
      setUploadTargetBlock(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Handler for AI Gen ---
  const handleGenerateAIArticle = async () => {
    if (!aiTopic.trim()) {
      setError("Please enter a topic for the AI to write about.");
      return;
    }
    setGeneratingAi(true);
    setError("");

    const result = await apiRequest<any>("/api/admin/blog/generate", {
      method: "POST",
      headers: { ...tokenHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ topic: aiTopic }),
    });

    setGeneratingAi(false);

    if (!result.ok || !result.data) {
      setError(result.error || "Failed to generate AI article");
      return;
    }

    setActiveTab("cms");
    setEditingPostId(null);
    setPostForm({
      title: result.data.title,
      slug: "",
      content: "",
      excerpt: result.data.excerpt || "",
      coverImage: result.data.coverImage || "",
      author: "Admin",
      blocks: result.data.blocks || [],
    });
    setAiTopic("");
  };

  const handleAutoPostAnthropic = async () => {
    if (!autoPostTopic.trim()) {
      setError("Please enter a topic for auto-post.");
      return;
    }

    setAutoPostingAnthropic(true);
    setError("");
    setAutoPostResult(null);

    const result = await apiRequest<any>("/api/admin/blog/auto-post-anthropic", {
      method: "POST",
      headers: { ...tokenHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: autoPostTopic,
        author: autoPostAuthor,
        coverImage: autoPostCoverImage,
        customInstructions: autoPostCustomInstructions,
      }),
    });

    setAutoPostingAnthropic(false);

    if (!result.ok || !result.data) {
      setError(result.error || "Failed to auto-post with Anthropic.");
      return;
    }

    setAutoPostResult(result.data);
    await Promise.all([fetchBlogPosts(), fetchStats()]);
  };

  const handleBulkPostAnthropic = async () => {
    const lines = bulkTopics
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length >= 3);

    const normalizedSeen = new Set<string>();
    const uniqueLines = lines.filter((line) => {
      const key = line.toLowerCase().replace(/\s+/g, " ").trim();
      if (!key || normalizedSeen.has(key)) return false;
      normalizedSeen.add(key);
      return true;
    });

    if (lines.length === 0) {
      setError("Enter at least one topic (one per line).");
      return;
    }
    if (lines.length > 10) {
      setError("Maximum 10 topics per bulk post.");
      return;
    }

    setBulkPosting(true);
    setError("");
    setBulkResult(null);

    try {
      const result = await apiRequest<any>("/api/admin/blog/auto-post-anthropic?action=bulk", {
        method: "POST",
        headers: { ...tokenHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: uniqueLines,
          author: autoPostAuthor || "Admin",
          customInstructions: autoPostCustomInstructions,
        }),
      });

      if (!result.ok || !result.data) {
        setError(result.error || "Bulk post failed.");
        return;
      }

      setBulkResult({
        ...result.data,
        entered: lines.length,
        dedupedBeforeSubmit: lines.length - uniqueLines.length,
      });
      await Promise.all([fetchBlogPosts(), fetchStats()]);
    } finally {
      setBulkPosting(false);
    }
  };

  const handleFixImages = async () => {
    if (!confirm("Scan all blog posts for broken/NSFW image URLs and replace them with safe Picsum photos?")) return;
    setFixingImages(true);
    setFixImagesResult(null);
    const r = await apiRequest<any>("/api/admin/blog/fix-images", {
      method: "POST",
      headers: tokenHeaders(),
    });
    setFixingImages(false);
    if (r.ok && r.data) {
      setFixImagesResult(r.data);
      if (r.data.fixed > 0) fetchBlogPosts();
    } else {
      setFixImagesResult({ error: r.error || "Fix failed" });
    }
  };

  const activeSubscriptions = useMemo(() => users.filter((u) => u.plan !== "free").length, [users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="text-neutral-500 font-bold flex items-center gap-2">
          <RefreshCw className="animate-spin" size={20} /> Loading admin workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6 sticky top-0 h-screen shrink-0">
        <div className="flex items-center gap-2 mb-10 cursor-pointer" onClick={() => navigate("/")}>
          <div className="bg-[#10B981] p-1.5 rounded-lg">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Instant<span className="text-[#10B981]">SEO</span>Scan
          </span>
        </div>

        <div className="flex flex-col gap-8 flex-1">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">Platform</p>
            <nav className="flex flex-col gap-1">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
              <SidebarItem icon={FileText} label="Content Manager" active={activeTab === "cms"} onClick={() => setActiveTab("cms")} />
              <SidebarItem icon={Sparkles} label="AI Writer" active={activeTab === "aiwriter"} onClick={() => setActiveTab("aiwriter")} />
              <SidebarItem icon={Upload} label="Auto Post (Anthropic)" active={activeTab === "autopost"} onClick={() => setActiveTab("autopost")} />
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">Growth Engine</p>
            <nav className="flex flex-col gap-1">
              <SidebarItem icon={Target} label="Lead Scraper" active={activeTab === "scraper"} onClick={() => setActiveTab("scraper")} />
              <SidebarItem icon={Database} label="Leads CRM" active={activeTab === "leads"} onClick={() => setActiveTab("leads")} />
              <SidebarItem icon={Mail} label="Campaigns" active={activeTab === "campaigns"} onClick={() => setActiveTab("campaigns")} />
              <SidebarItem icon={FileEdit} label="Email Templates" active={activeTab === "templates"} onClick={() => setActiveTab("templates")} />
              <SidebarItem icon={Bot} label="Automation" active={activeTab === "automation"} onClick={() => setActiveTab("automation")} />
              <SidebarItem icon={Inbox} label="Inbox" active={activeTab === "inbox"} onClick={() => setActiveTab("inbox")} />
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">Configuration</p>
            <nav className="flex flex-col gap-1">
              <SidebarItem icon={Users} label="Team Members" active={activeTab === "crm"} onClick={() => setActiveTab("crm")} />
              <SidebarItem icon={Settings} label="SEO Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
            </nav>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-6">
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
            <Moon size={18} />
            <span className="text-sm font-medium">Toggle Appearance</span>
          </button>

          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600">
              AD
            </div>
            <div className="flex flex-col border-emerald-100">
              <span className="text-sm font-bold text-slate-900">Admin User</span>
              <span className="text-[11px] text-slate-500 font-medium">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto relative">
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "cms" && (<>SEO CMS <span className="text-[#10B981]">Content Manager</span></>)}
              {activeTab === "crm" && "Team Members & CRM"}
              {activeTab === "settings" && "SEO Settings"}
              {activeTab === "aiwriter" && "AI Article Writer"}
              {activeTab === "autopost" && "Auto Post via Anthropic"}
              {activeTab === "scraper" && (<>Lead <span className="text-indigo-600">Scraper Engine</span></>)}
              {activeTab === "leads" && (<>Leads <span className="text-indigo-600">CRM</span></>)}
              {activeTab === "campaigns" && "Email Campaigns"}
              {activeTab === "templates" && "Email Templates"}
              {activeTab === "automation" && "Automation Rules"}
              {activeTab === "inbox" && (<>Email <span className="text-indigo-600">Inbox</span></>)}
            </h1>
            <p className="text-slate-500 font-medium">
              {activeTab === "dashboard" ? "System statistics and recent activity." :
                activeTab === "cms" ? "Manage, optimize and publish high-ranking AI articles." :
                  activeTab === "crm" ? "Manage users, subscriptions, and plans." :
                    activeTab === "settings" ? "Configure API keys and platform settings." :
                      activeTab === "aiwriter" ? "Generate SEO optimized articles in a single click." :
                        activeTab === "autopost" ? "Create and publish a complete blog post from one topic using Anthropic." :
                          activeTab === "scraper" ? "Discover businesses with poor SEO at scale — up to 10,000 leads/day." :
                            activeTab === "leads" ? "Manage and track scraped leads, SEO opportunities, and outreach status." :
                              activeTab === "campaigns" ? "Create and send personalized AI-powered email campaigns to leads." :
                                activeTab === "templates" ? "Build reusable outreach templates with dynamic personalization variables." :
                                  activeTab === "inbox" ? "View all sent emails and incoming replies, track open rates and update lead statuses." :
                                    "Enable automated lead discovery, SEO scanning, and email outreach workflows."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadAll}
              className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
            {activeTab === "cms" && (
              <button onClick={resetPostForm} className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-100">
                <Plus size={20} />
                Create New Post
              </button>
            )}
            {activeTab === "templates" && (
              <button onClick={() => setShowTemplateModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                <Plus size={20} /> New Template
              </button>
            )}
            {activeTab === "campaigns" && (
              <button onClick={() => setShowCampaignModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                <Plus size={20} /> New Campaign
              </button>
            )}
            {(activeTab === "scraper" || activeTab === "leads" || activeTab === "campaigns" || activeTab === "templates" || activeTab === "automation" || activeTab === "inbox") && (
              <a href="/growth-engine-guide.html" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-indigo-700 text-sm font-bold hover:bg-indigo-50 transition-colors">
                📘 User Guide
              </a>
            )}
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium flex items-center justify-between">
            {error}
            <button onClick={() => setError("")}><X size={16} /></button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-4 gap-6 mb-10">
              <StatCard label="Total Users" value={stats.userCount?.count || 0} change="+12" icon={Users} iconBg="bg-blue-50" iconColor="text-blue-500" />
              <StatCard label="Total Scans" value={stats.scanCount?.count || 0} change="+42" icon={Zap} iconBg="bg-emerald-50" iconColor="text-[#10B981]" />
              <StatCard label="Total Blog Posts" value={stats.blogCount?.count || 0} change="+5" icon={FileText} iconBg="bg-purple-50" iconColor="text-purple-500" />
              <StatCard label="Pending Approvals" value={stats.pendingCount?.count || 0} change="Needs review" icon={CheckCircle2} iconBg="bg-orange-50" iconColor="text-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                  <h2 className="font-bold flex items-center gap-2"><MessageSquare size={16} /> Recent Contact Messages</h2>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{messages.length} total</span>
                </div>
                <div className="divide-y divide-neutral-100">
                  {messages.length === 0 && <div className="p-6 text-sm text-neutral-500">No messages yet.</div>}
                  {messages.slice(0, 5).map((message) => (
                    <div key={message.id} className="p-6 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div>
                        <h3 className="font-bold text-sm">{message.subject}</h3>
                        <p className="text-xs text-neutral-500 mb-2">{message.name} • {message.email} • {new Date(message.createdAt).toLocaleString()}</p>
                        <p className="text-sm text-neutral-700 whitespace-pre-wrap">{message.message}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <select
                          value={message.status}
                          onChange={(e) => handleMessageStatus(message.id, e.target.value as ContactMessage["status"])}
                          className="px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold"
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
                <h2 className="font-bold mb-6 flex items-center gap-2">
                  <Lock size={18} className="text-neutral-400" />
                  SaaS Controls
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Subscriptions</div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Active Paid Users</span>
                      <span className="font-bold">{activeSubscriptions}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Plans</div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Pro</span>
                      <span className="font-bold">$10/mo</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span>Agency</span>
                      <span className="font-bold">$100/mo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* CMS Tab */}
        {activeTab === "cms" && (
          <div className="flex flex-col lg:flex-row gap-8 items-start relative">
            <div className="w-full lg:w-2/3 space-y-8">

              {/* Search & Filters Placeholder */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-bottom border-slate-50 bg-slate-50/30">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post Title & Metadata</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">SEO Score</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className={cn(
                          "group hover:bg-slate-50/50 transition-colors cursor-pointer border-t border-slate-50",
                          selectedPost?.id === post.id && "bg-emerald-50/30"
                        )}
                        onClick={() => setSelectedPost(post)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            {post.coverImage ? (
                              <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-12 h-12 rounded-xl object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                <FileText className="text-slate-400" size={20} />
                              </div>
                            )}

                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-bold text-slate-900 group-hover:text-[#10B981] transition-colors">{post.title}</span>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users size={12} /> {post.author || "Admin"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <SEOProgress score={post.seoScore} />
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold",
                            post.status === 'Published' ? "bg-emerald-100 text-[#10B981]" : "bg-slate-100 text-slate-500"
                          )}>
                            • {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right flex justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); startEditPost(post); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Edit inline">
                            <FileEdit size={18} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {posts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                          No posts found. Create one or use the AI Writer.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Right Sidebar - Full Editor if editing/creating, else Quick View */}
            <div className="w-full lg:w-1/3 shrink-0">
              {isCreatingPost || editingPostId || postForm.title !== "" || postForm.blocks.length > 0 ? (
                <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 flex flex-col gap-6 sticky top-6 max-h-[calc(100vh-80px)] overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h2 className="font-bold flex items-center gap-2">
                      <FileEdit size={18} className="text-[#10B981]" />
                      {editingPostId ? "Full Editor" : "New Post Editor"}
                    </h2>
                    <button onClick={resetPostForm} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={postForm.title}
                      onChange={(e) => setPostForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Post title"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <input
                      type="text"
                      value={postForm.slug}
                      onChange={(e) => setPostForm((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="Slug (optional)"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Image</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={postForm.coverImage}
                          onChange={(e) => setPostForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                          placeholder="Cover image URL or upload ->"
                          className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <button onClick={() => triggerImageUpload(null)} className="px-4 bg-emerald-100 text-[#10B981] rounded-xl hover:bg-emerald-200 transition-colors flex items-center justify-center" title="Upload Image">
                          <Upload size={18} />
                        </button>
                      </div>
                      {postForm.coverImage && <img src={postForm.coverImage} alt="Cover Preview" className="h-24 object-cover rounded-xl mt-2 border border-slate-100 max-w-full" />}
                    </div>

                    <div className="flex gap-2 bg-slate-50 p-2 rounded-xl overflow-x-auto no-scrollbar">
                      {[
                        ["h2", "H2"],
                        ["paragraph", "Text"],
                        ["list", "List"],
                        ["image", "Img"],
                      ].map(([type, label]) => (
                        <button
                          key={type}
                          onClick={() => addBlock(type as BlogBlock["type"])}
                          className="px-3 py-1.5 text-xs font-bold bg-white text-slate-600 border border-slate-200 rounded-lg hover:border-[#10B981] hover:text-[#10B981] transition-colors shrink-0"
                        >
                          + {label}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4 pt-2">
                      {postForm.blocks.length === 0 && (
                        <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                          Add blocks to build content.
                        </div>
                      )}
                      {postForm.blocks.map((block) => (
                        <div
                          key={block.id}
                          className="p-3 border border-slate-200 bg-slate-50 rounded-xl flex flex-col gap-2"
                          draggable
                          onDragStart={() => setDraggingBlockId(block.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (!draggingBlockId || draggingBlockId === block.id) return;
                            moveBlock(draggingBlockId, block.id);
                            setDraggingBlockId(null);
                          }}
                          onDragEnd={() => setDraggingBlockId(null)}
                        >
                          <div className="flex items-center justify-between opacity-50 hover:opacity-100 mb-1">
                            <GripVertical size={14} className="cursor-grab text-slate-400" />
                            <button onClick={() => removeBlock(block.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                          </div>

                          {(block.type === "image") ? (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={block.url || ""}
                                  onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                  placeholder="Image URL or upload ->"
                                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                                />
                                <button onClick={() => triggerImageUpload(block.id)} className="w-10 flex items-center justify-center bg-emerald-100 text-[#10B981] rounded-lg hover:bg-emerald-200">
                                  <Upload size={16} />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={block.alt || ""}
                                onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                                placeholder="Alt text (SEO)"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                              />
                              <input
                                type="text"
                                value={block.description || ""}
                                onChange={(e) => updateBlock(block.id, { description: e.target.value })}
                                placeholder="Caption / Description"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                              />
                              {block.url && <img src={block.url} className="mt-2 rounded max-h-32 object-contain bg-white border" alt="preview" />}
                            </div>
                          ) : (
                            <>
                              <textarea
                                value={block.text}
                                onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                                placeholder={`${block.type}...`}
                                rows={block.type === "paragraph" ? 4 : 2}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none resize-y min-h-[60px]"
                              />

                              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Interlink (href + target)</div>
                                <div className="grid grid-cols-1 gap-2">
                                  <input
                                    type="text"
                                    value={interlinkDrafts[block.id]?.text || ""}
                                    onChange={(e) => setInterlinkDraft(block.id, { text: e.target.value })}
                                    placeholder="Link text"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={interlinkDrafts[block.id]?.href || ""}
                                    onChange={(e) => setInterlinkDraft(block.id, { href: e.target.value })}
                                    placeholder="Href (e.g. /pricing or https://example.com)"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                                  />
                                  <div className="flex gap-2">
                                    <select
                                      value={interlinkDrafts[block.id]?.target || "_self"}
                                      onChange={(e) => setInterlinkDraft(block.id, { target: e.target.value as "_self" | "_blank" })}
                                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                                    >
                                      <option value="_self">Open in same tab (_self)</option>
                                      <option value="_blank">Open in new tab (_blank)</option>
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => insertInterlink(block.id)}
                                      className="px-3 py-2 bg-emerald-100 text-[#10B981] rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors"
                                    >
                                      Insert Link
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleSavePost}
                      disabled={savingPost}
                      className="w-full py-3 mt-4 bg-[#10B981] text-white rounded-xl font-bold text-sm hover:bg-[#059669] transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {savingPost ? "Saving..." : <><Save size={18} /> Save & Publish</>}
                    </button>
                  </div>
                </div>
              ) : selectedPost ? (
                <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 flex flex-col gap-6 sticky top-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Quick View</h2>
                    <span className="px-2 py-1 bg-emerald-50 text-[#10B981] text-[9px] font-bold rounded uppercase tracking-wider">Ready</span>
                  </div>

                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Currently Selected</p>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-sm font-bold text-slate-900 mb-3 leading-relaxed">{selectedPost.title}</p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                          style={{ width: `${selectedPost.seoScore || 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold mb-4">
                        <span className="text-slate-400">SEO Score</span>
                        <span className="text-[#10B981]">{selectedPost.seoScore}%</span>
                      </div>
                      <button onClick={() => startEditPost(selectedPost)} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                        Full Editor Mode
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Content Summary</p>
                    <p className="text-sm text-slate-600 line-clamp-4">{selectedPost.excerpt || selectedPost.content}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 text-center text-slate-400 text-sm">
                  Select a post to view details
                </div>
              )}
            </div>
          </div>
        )}

        {/* CRM Tab */}
        {activeTab === "crm" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white rounded-3xl border border-neutral-200 shadow-sm p-6">
              <h2 className="font-bold mb-4">CRM Snapshot</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Total Users</span><strong>{crm.totals?.totalUsers || 0}</strong></div>
                <div className="flex justify-between"><span>Approved</span><strong>{crm.totals?.approvedUsers || 0}</strong></div>
                <div className="flex justify-between"><span>Pending</span><strong>{crm.totals?.pendingUsers || 0}</strong></div>
                <div className="flex justify-between"><span>Paid Users</span><strong>{crm.totals?.paidUsers || 0}</strong></div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100">
                <h2 className="font-bold">Most Active Users</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-neutral-400 uppercase tracking-widest bg-neutral-50">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Plan & Usage</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(crm.users || []).map((user) => (
                      <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-sm">{user.email}</div>
                          <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">{user.role}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md w-fit ${user.plan === "agency"
                                ? "bg-purple-50 text-purple-700"
                                : user.plan === "pro"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-neutral-100 text-neutral-600"
                                }`}
                            >
                              {user.plan}
                            </span>
                            <div className="text-[10px] text-neutral-500">
                              Usage: {user.usage_count} / {user.usage_limit}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${user.status === "approved" ? "bg-emerald-500" : "bg-orange-500"
                                  }`}
                              />
                              <span className="text-sm text-neutral-600 capitalize">{user.status}</span>
                            </div>
                            <div className="text-[10px] text-neutral-400">{user.verified ? "Verified" : "Unverified"}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {user.status === "pending" && (
                              <button
                                onClick={() => handleApprove(user.id)}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                title="Approve User"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdatePlan(user.id, "pro", 100, 30)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Set Pro Plan"
                            >
                              <Zap size={16} />
                            </button>
                            <button
                              onClick={() => handleUpdatePlan(user.id, "agency", 1000, 30)}
                              className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                              title="Set Agency Plan"
                            >
                              <Shield size={16} />
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id, user.email)}
                              className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                              title="Reset Password"
                            >
                              <Key size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AI Writer Tab */}
        {activeTab === "aiwriter" && (
          <div className="max-w-3xl bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
            <h2 className="font-bold mb-4 flex items-center gap-2 text-xl">
              <Sparkles className="text-[#10B981]" size={24} />
              Generate SEO Article
            </h2>
            <p className="text-slate-500 mb-8">
              Let Gemini generate a structured, SEO-optimized article ready for your CMS. Just provide a topic or primary keywords.
            </p>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Topic or Keywords</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. 10 Best SEO Practices for Local Businesses in 2024"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#10B981]/20 font-medium text-slate-700"
                />
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[9px] font-bold text-[#10B981] uppercase tracking-widest mb-2">Pro Tip</p>
                  <h3 className="text-sm font-bold mb-2">Detailed Prompts Work Best</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-1">
                    Include target audience, tone of voice, and any specific headers you want included. The AI will return structured blocks (H1, H2, text, lists).
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 bg-[#10B981]/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-[#10B981]/20 transition-all" />
              </div>

              <button
                onClick={handleGenerateAIArticle}
                disabled={generatingAi || !aiTopic.trim()}
                className="w-full py-4 mt-2 bg-[#10B981] text-white rounded-xl font-bold hover:bg-[#059669] transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2"
              >
                {generatingAi ? (
                  <><RefreshCw className="animate-spin" size={20} /> Generating via Gemini...</>
                ) : (
                  <><Sparkles size={20} /> Generate Article</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Auto Post Anthropic Tab */}
        {activeTab === "autopost" && (
          <div className="space-y-8 max-w-3xl">
            {/* ── Single Post Card ── */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
              <h2 className="font-bold mb-4 flex items-center gap-2 text-xl">
                <Upload className="text-[#10B981]" size={22} />
                Single Auto Post
              </h2>
              <p className="text-slate-500 mb-6">
                Enter one topic — auto-generates content, cover image, meta description, alt text, and publishes directly.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Topic</label>
                  <input
                    type="text"
                    value={autoPostTopic}
                    onChange={(e) => setAutoPostTopic(e.target.value)}
                    placeholder="e.g. Best technical SEO checklist for SaaS"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#10B981]/20 font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Author</label>
                  <input
                    type="text"
                    value={autoPostAuthor}
                    onChange={(e) => setAutoPostAuthor(e.target.value)}
                    placeholder="Admin"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#10B981]/20 font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Cover Image URL (optional — auto-generated if empty)</label>
                  <input
                    type="text"
                    value={autoPostCoverImage}
                    onChange={(e) => setAutoPostCoverImage(e.target.value)}
                    placeholder="Leave empty for auto Unsplash image"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#10B981]/20 font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Custom AI Instructions (optional)</label>
                  <textarea
                    value={autoPostCustomInstructions}
                    onChange={(e) => setAutoPostCustomInstructions(e.target.value)}
                    rows={3}
                    placeholder="e.g. Write in a highly technical tone, emphasize programmatic SEO concepts, mention internal tools specific to InstantSEOScan, etc."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#10B981]/20 font-medium text-slate-700 text-sm leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleAutoPostAnthropic}
                  disabled={autoPostingAnthropic || !autoPostTopic.trim()}
                  className="w-full py-4 mt-2 bg-[#10B981] text-white rounded-xl font-bold hover:bg-[#059669] transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2"
                >
                  {autoPostingAnthropic ? (
                    <><RefreshCw className="animate-spin" size={20} /> Publishing...</>
                  ) : (
                    <><Upload size={20} /> Generate & Publish</>
                  )}
                </button>
              </div>

              {autoPostResult?.post && (
                <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800">
                  <p className="font-bold text-sm mb-1">Post published successfully</p>
                  <p className="text-sm">Title: {autoPostResult.post.title}</p>
                  <p className="text-sm">Slug: {autoPostResult.post.slug}</p>
                  {autoPostResult.post.coverImage && (
                    <img src={autoPostResult.post.coverImage} alt={autoPostResult.post.title} className="mt-3 rounded-xl max-h-40 object-cover" referrerPolicy="no-referrer" />
                  )}
                </div>
              )}
            </div>

            {/* ── Bulk Post Card ── */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
              <h2 className="font-bold mb-4 flex items-center gap-2 text-xl">
                <Newspaper className="text-blue-600" size={22} />
                Bulk Auto Post (up to 10)
              </h2>
              <p className="text-slate-500 mb-6">
                Enter up to 10 topics (one per line). Each gets a unique title, content, cover image, meta description, and alt text.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Topics (one per line, max 10)</label>
                  <textarea
                    value={bulkTopics}
                    onChange={(e) => setBulkTopics(e.target.value)}
                    rows={8}
                    placeholder={"Technical SEO audit guide\nLocal SEO for small business\nHow to improve Core Web Vitals\nOn-page SEO best practices 2026\nE-commerce SEO strategies\nSEO for startups\nVoice search optimization tips\nMobile-first indexing guide\nLink building strategies that work\nContent marketing for SEO growth"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700 text-sm leading-relaxed"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {bulkTopics.split("\n").filter((l) => l.trim().length >= 3).length} / 10 topics entered
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Author for all posts</label>
                  <input
                    type="text"
                    value={autoPostAuthor}
                    onChange={(e) => setAutoPostAuthor(e.target.value)}
                    placeholder="Admin"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Custom AI Instructions for Bulk (optional)</label>
                  <textarea
                    value={autoPostCustomInstructions}
                    onChange={(e) => setAutoPostCustomInstructions(e.target.value)}
                    rows={3}
                    placeholder="e.g. Use a professional tone, strictly organize structures into 8+ headers, and emphasize SaaS analytics."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700 text-sm leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleBulkPostAnthropic}
                  disabled={bulkPosting || bulkTopics.split("\n").filter((l) => l.trim().length >= 3).length === 0}
                  className="w-full py-4 mt-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2"
                >
                  {bulkPosting ? (
                    <><RefreshCw className="animate-spin" size={20} /> Generating {bulkTopics.split("\n").filter((l) => l.trim().length >= 3).length} Posts...</>
                  ) : (
                    <><Newspaper size={20} /> Bulk Generate & Publish</>
                  )}
                </button>
              </div>

              {bulkResult && (
                <div className="mt-6 space-y-3">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800">
                    <p className="font-bold text-sm mb-2">
                      {bulkResult.message || `Bulk complete: ${bulkResult.count} published`}
                    </p>
                    <div className="text-xs space-y-1 opacity-80">
                      <p>Entered: {bulkResult.entered ?? bulkResult.requested ?? bulkResult.count}</p>
                      <p>Processed unique topics: {bulkResult.processed ?? bulkResult.count}</p>
                      <p>Published: {bulkResult.count}</p>
                      {typeof bulkResult.skipped === "number" && bulkResult.skipped > 0 && <p>Skipped: {bulkResult.skipped}</p>}
                      {typeof bulkResult.failed === "number" && bulkResult.failed > 0 && <p>Failed: {bulkResult.failed}</p>}
                      {bulkResult.dedupedBeforeSubmit > 0 && <p>Removed duplicate lines before submit: {bulkResult.dedupedBeforeSubmit}</p>}
                    </div>
                  </div>
                  {bulkResult.posts?.map((post: any, i: number) => (
                    <div key={post.id || i} className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex gap-3 items-start">
                      {post.coverImage && (
                        <img src={post.coverImage} alt={post.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                      )}
                      <div>
                        <p className="font-bold text-sm">{post.title}</p>
                        <p className="text-xs opacity-70">/{post.slug}</p>
                      </div>
                    </div>
                  ))}
                  {bulkResult.skippedItems?.map((item: any, i: number) => (
                    <div key={`skip-${i}`} className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-sm">
                      <span className="font-bold">{item.topic}:</span> {item.reason}
                    </div>
                  ))}
                  {bulkResult.errors?.map((err: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                      <span className="font-bold">{err.topic}:</span> {err.error}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fix Corrupt / NSFW Images */}
            <div className="mt-8 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-neutral-900 mb-1 flex items-center gap-2 text-base">
                🛡️ Fix Corrupt &amp; NSFW Images
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                Scans every blog post for broken loremflickr URLs, string-seed Picsum URLs (which can 404),
                and any URL containing adult keywords. Replaces all bad images with fresh, verified,
                always-SFW Picsum photos.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleFixImages}
                  disabled={fixingImages}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  {fixingImages ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                  {fixingImages ? "Scanning & fixing..." : "Fix Bad Images"}
                </button>
                <button
                  onClick={() => {
                    if (!confirm("Force-refresh ALL images on every post? This replaces even working images with fresh Picsum photos.")) return;
                    setFixingImages(true);
                    setFixImagesResult(null);
                    apiRequest<any>("/api/admin/blog/fix-images?force=1", { method: "POST", headers: tokenHeaders() })
                      .then((r) => { setFixImagesResult(r.ok ? r.data : { error: r.error || "Fix failed" }); if (r.ok && r.data?.fixed > 0) fetchBlogPosts(); })
                      .finally(() => setFixingImages(false));
                  }}
                  disabled={fixingImages}
                  className="flex items-center gap-2 px-5 py-2.5 bg-neutral-700 hover:bg-neutral-900 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  {fixingImages ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Force Refresh ALL Images
                </button>
              </div>
              {fixImagesResult && (
                <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${
                  fixImagesResult.error
                    ? "bg-red-50 border border-red-200 text-red-700"
                    : fixImagesResult.fixed === 0
                      ? "bg-neutral-50 border border-neutral-200 text-neutral-600"
                      : "bg-emerald-50 border border-emerald-200 text-emerald-800"
                }`}>
                  {fixImagesResult.error
                    ? fixImagesResult.error
                    : fixImagesResult.fixed === 0
                      ? `✅ All ${fixImagesResult.scanned} posts already have safe images. No fixes needed.`
                      : `✅ Fixed ${fixImagesResult.fixed} of ${fixImagesResult.scanned} posts. All images are now safe and verified.`
                  }
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-3xl bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
            <h2 className="font-bold mb-2 flex items-center gap-2 text-lg">
              <Settings size={20} className="text-neutral-400" />
              Gemini API Keys
            </h2>
            <p className="text-xs text-neutral-500 mb-6">
              Configure CMS and Gemini API keys, per-key limits, and database configuration.
            </p>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-neutral-800 border-b pb-2">CMS Configuration</h3>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-neutral-700">CMS_API_KEY</label>
                  <input
                    type="password"
                    value={settingsForm.CMS_API_KEY}
                    onChange={(e) => setSettingsForm({ ...settingsForm, CMS_API_KEY: e.target.value })}
                    placeholder="cms_..."
                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                </div>
              </div>

              {/* Gemini Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-neutral-800 border-b pb-2">AI Configuration</h3>
                {[
                  { key: "GEMINI_API_KEY_1" as const, limitKey: "GEMINI_API_KEY_1_LIMIT" as const, label: "Primary Key (Key 1)", color: "emerald", type: "password", slot: 1 },
                  { key: "GEMINI_API_KEY_2" as const, limitKey: "GEMINI_API_KEY_2_LIMIT" as const, label: "Secondary Key (Key 2)", color: "blue", type: "password", slot: 2 },
                  { key: "GEMINI_API_KEY_3" as const, limitKey: "GEMINI_API_KEY_3_LIMIT" as const, label: "Tertiary Key (Key 3)", color: "purple", type: "password", slot: 3 },
                ].map(({ key, limitKey, label, color, type, slot }) => {
                  const stat = geminiKeyStats.find((item) => item.slot === slot);
                  return (
                    <div key={key} className="space-y-1">
                      <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full bg-${color}-500`} />
                        {label}
                      </label>
                      <input
                        type={type}
                        value={settingsForm[key]}
                        onChange={(e) => setSettingsForm({ ...settingsForm, [key]: e.target.value })}
                        placeholder="AIzaSy..."
                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                      />
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Limit</label>
                          <input
                            type="number"
                            min={0}
                            value={settingsForm[limitKey]}
                            onChange={(e) => setSettingsForm({ ...settingsForm, [limitKey]: e.target.value })}
                            placeholder="0 = unlimited"
                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
                            <div className="text-neutral-500">Usage</div>
                            <div className="font-bold text-neutral-800">{stat?.usage ?? 0}</div>
                          </div>
                          <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
                            <div className="text-neutral-500">Remaining</div>
                            <div className="font-bold text-neutral-800">{stat?.remaining === null ? "Unlimited" : stat?.remaining ?? "-"}</div>
                          </div>
                          <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
                            <div className="text-neutral-500">Status</div>
                            <div className="font-bold text-neutral-800 capitalize">{stat?.status || "missing"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Database Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-neutral-800 border-b pb-2">SEO API Settings</h3>
                {[
                  { key: "SERP_API_KEY" as const, label: "SERP API Key" },
                  { key: "DATAFORSEO_API_KEY" as const, label: "DataForSEO API Key" },
                  { key: "KEYWORD_API_KEY" as const, label: "Keyword API Key" },
                  { key: "BACKLINK_API_KEY" as const, label: "Backlink API Key" },
                  { key: "AI_API_KEY" as const, label: "AI API Key" },
                  { key: "CLAUDE_API_KEY" as const, label: "Claude API Key" },
                ].map(({ key, label }) => (
                  <div className="space-y-1" key={key}>
                    <label className="text-sm font-bold text-neutral-700">{label}</label>
                    <input
                      type="password"
                      value={settingsForm[key]}
                      onChange={(e) => setSettingsForm({ ...settingsForm, [key]: e.target.value })}
                      placeholder="Paste API key"
                      className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                    />
                  </div>
                ))}
              </div>

              {/* Database Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-neutral-800 border-b pb-2">Database Configuration</h3>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-neutral-700">POSTGRES_URL</label>
                  <input
                    type="password"
                    value={settingsForm.POSTGRES_URL}
                    onChange={(e) => setSettingsForm({ ...settingsForm, POSTGRES_URL: e.target.value })}
                    placeholder="postgres://user:password@host/db"
                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-neutral-700">PRISMA_DATABASE_URL</label>
                  <input
                    type="password"
                    value={settingsForm.PRISMA_DATABASE_URL}
                    onChange={(e) => setSettingsForm({ ...settingsForm, PRISMA_DATABASE_URL: e.target.value })}
                    placeholder="postgres://user:password@host/db?pgbouncer=true"
                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                </div>
              </div>

              <p className="text-xs text-neutral-400 pt-2">
                Keys are stored in the database and then synced to Vercel project env vars when credentials are configured.
              </p>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Save size={16} />
                  {savingSettings ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== GROWTH ENGINE: LEAD SCRAPER TAB ===== */}
        {activeTab === "scraper" && (
          <div className="max-w-3xl space-y-8">
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-xl"><Target size={22} className="text-indigo-600" /></div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">Lead Discovery Scraper</h2>
                  <p className="text-xs text-slate-500">Search for businesses with poor SEO by keyword + location</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Industry / Keyword <span className="text-red-500">*</span></label>
                  <input value={scraperForm.keyword} onChange={e => setScraperForm({ ...scraperForm, keyword: e.target.value })}
                    placeholder="e.g. dentist, plumber, law firm"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><MapPin size={14} /> City / Location</label>
                  <input value={scraperForm.location} onChange={e => setScraperForm({ ...scraperForm, location: e.target.value })}
                    placeholder="e.g. New York, London"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Source</label>
                  <select value={scraperForm.source} onChange={e => setScraperForm({ ...scraperForm, source: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white">
                    <option value="google">Google Search</option>
                    <option value="bing">Bing Search</option>
                    <option value="maps">Google Maps</option>
                    <option value="yellowpages">Yellow Pages</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Max Leads</label>
                  <input type="number" min="1" max="50" value={scraperForm.maxLeads}
                    onChange={e => setScraperForm({ ...scraperForm, maxLeads: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
              </div>
              <button onClick={handleScrape} disabled={scraping || !scraperForm.keyword.trim()}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all">
                {scraping ? <><Loader2 size={16} className="animate-spin" /> Scraping...</> : <><Target size={16} /> Start Scraping</>}
              </button>
            </div>

            {scrapeResult && (
              <div className={`p-5 rounded-2xl border text-sm font-medium ${scrapeResult.error ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
                {scrapeResult.error ? `Error: ${scrapeResult.error}` : (
                  <div>
                    <div className="font-bold text-base mb-1">✓ Scrape Complete — Query: "{scrapeResult.query}"</div>
                    <div>{scrapeResult.found} new lead{scrapeResult.found !== 1 ? "s" : ""} discovered and saved to CRM.</div>
                    <button onClick={() => setActiveTab("leads")} className="mt-3 text-sm font-bold text-indigo-600 underline">View in Leads CRM →</button>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6">
              <h3 className="font-bold text-sm text-slate-800 mb-3">Example Search Patterns</h3>
              <div className="grid grid-cols-2 gap-2">
                {["dentist in New York", "plumber near London", "law firm Chicago", "restaurant in Paris", "real estate agent Dubai", "marketing agency Berlin"].map(q => (
                  <button key={q} onClick={() => { const [kw, , loc] = q.split(" in "); setScraperForm(p => ({ ...p, keyword: kw || q, location: loc || "" })); }}
                    className="text-left text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== GROWTH ENGINE: LEADS CRM TAB ===== */}
        {activeTab === "leads" && (
          <div>
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input type="text" placeholder="Search by company or domain..." value={leadSearch}
                    onChange={e => setLeadSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">{growthLeads.length} total leads</span>
                  <button onClick={() => setActiveTab("scraper")}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
                    <Target size={16} /> New Scrape
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-600">
                  <thead className="bg-neutral-50 text-neutral-700 text-xs uppercase font-bold border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">SEO Score</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Source</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingLeads ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-500"><Loader2 className="animate-spin mx-auto mb-2" size={24} /> Loading leads...</td></tr>
                    ) : growthLeads.filter(l => !leadSearch || l.companyName?.toLowerCase().includes(leadSearch.toLowerCase()) || l.website.toLowerCase().includes(leadSearch.toLowerCase())).length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-400">No leads found. Go to Lead Scraper to discover leads.</td></tr>
                    ) : growthLeads.filter(l => !leadSearch || l.companyName?.toLowerCase().includes(leadSearch.toLowerCase()) || l.website.toLowerCase().includes(leadSearch.toLowerCase())).map(lead => (
                      <tr key={lead.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0 text-sm">
                              {(lead.companyName?.[0] || lead.website[0] || "?").toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-neutral-900 text-sm">{lead.companyName || "Unknown"}</div>
                              <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5">
                                {lead.website}<ArrowUpRight size={10} />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {lead.seoScore != null ? (
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${lead.seoScore >= 80 ? "bg-emerald-50 text-emerald-700" : lead.seoScore >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                              {lead.seoScore}/100
                            </span>
                          ) : <span className="text-neutral-400 text-xs italic">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          {lead.email ? <span className="flex items-center gap-1 text-sm"><AtSign size={12} className="text-neutral-400" />{lead.email}</span>
                            : <span className="text-xs text-neutral-400 italic">No email</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-neutral-500 capitalize">{lead.leadSource || "manual"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${lead.status === "new" ? "bg-blue-50 text-blue-700 border border-blue-100" : lead.status === "contacted" ? "bg-purple-50 text-purple-700 border border-purple-100" : lead.status === "replied" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : lead.status === "converted" ? "bg-green-50 text-green-700 border border-green-100" : "bg-neutral-100 text-neutral-600 border border-neutral-200"}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteLead(lead.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                            title="Delete lead"><Trash2 size={15} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {growthLeads.length > 0 && (
                <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                  <span className="text-xs text-neutral-500">{growthLeads.filter(l => l.email).length} leads have email addresses (ready for campaigns)</span>
                  <button onClick={() => setActiveTab("campaigns")}
                    className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
                    <Send size={12} /> Launch Campaign
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== GROWTH ENGINE: EMAIL TEMPLATES TAB ===== */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            {growthTemplates.length === 0 && !loadingTemplates && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-sm text-indigo-800 font-medium flex items-start gap-3">
                <Mail size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                <div>No templates yet. Create your first template below. Use <code className="bg-white px-1 rounded text-xs">{"{{companyName}}"}</code>, <code className="bg-white px-1 rounded text-xs">{"{{website}}"}</code>, <code className="bg-white px-1 rounded text-xs">{"{{seoScore}}"}</code> for personalization.</div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {loadingTemplates && <div className="col-span-full text-center py-12 text-neutral-400"><Loader2 className="animate-spin mx-auto mb-2" size={24} />Loading...</div>}
              {growthTemplates.map(t => (
                <div key={t.id} className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">{t.name}</h3>
                    <button onClick={() => handleDeleteTemplate(t.id)} className="text-neutral-400 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                  </div>
                  <div className="text-xs font-semibold text-neutral-500 mb-2 truncate">Subject: {t.subject}</div>
                  <div className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg flex-1 overflow-hidden line-clamp-5 whitespace-pre-wrap">{t.body}</div>
                  <div className="mt-3 text-[10px] text-neutral-400 uppercase tracking-wider font-bold">{new Date(t.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== GROWTH ENGINE: CAMPAIGNS TAB ===== */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            {campaignSendResult && (
              <div className={`p-5 rounded-2xl border text-sm font-medium ${campaignSendResult.error ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
                {campaignSendResult.error ? `Send Error: ${campaignSendResult.error}` : (
                  <div>
                    <div className="font-bold">✓ Campaign sent successfully!</div>
                    <div>{campaignSendResult.sent} email{campaignSendResult.sent !== 1 ? "s" : ""} sent via <strong>{campaignSendResult.provider}</strong>.</div>
                    {campaignSendResult.provider?.startsWith("simulated") && (
                      <div className="mt-1 text-xs text-amber-700">To send real emails, set <code className="bg-white px-1 rounded">EMAIL_API_KEY</code> (Resend API key) and <code className="bg-white px-1 rounded">EMAIL_FROM</code> in your Vercel env vars.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {growthCampaigns.length === 0 && !loadingCampaigns && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 text-center">
                <Mail size={32} className="text-neutral-300 mx-auto mb-3" />
                <p className="font-bold text-neutral-700 mb-1">No campaigns yet</p>
                <p className="text-sm text-neutral-500 mb-4">Create your first campaign, select a template, and send personalized emails to all your leads.</p>
                <button onClick={() => setShowCampaignModal(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                  <span className="flex items-center gap-2"><Plus size={16} /> Create Campaign</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {loadingCampaigns && <div className="col-span-full text-center py-12 text-neutral-400"><Loader2 className="animate-spin mx-auto mb-2" size={24} />Loading...</div>}
              {growthCampaigns.map(c => (
                <div key={c.id} className="bg-white border border-neutral-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-neutral-900 mb-1">{c.name}</h3>
                      <div className="text-xs text-neutral-500">Template: {c.template?.name || c.templateId}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${c.status === "draft" ? "bg-slate-100 text-slate-600" : c.status === "running" ? "bg-indigo-50 text-indigo-700" : c.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-neutral-500">{c._count?.logs ?? 0} emails sent</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleDeleteCampaign(c.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
                      <button onClick={() => handleSendCampaign(c.id)} disabled={sendingCampaignId === c.id}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        {sendingCampaignId === c.id ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send Now</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Campaign Modal */}
            {showCampaignModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                  <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2"><Mail className="text-indigo-600" size={20} /> Create Campaign</h3>
                    <button onClick={() => setShowCampaignModal(false)} className="text-neutral-400 hover:text-neutral-600"><X size={20} /></button>
                  </div>
                  <form id="campaignForm" onSubmit={handleCreateCampaign} className="p-6 space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-neutral-700">Campaign Name <span className="text-red-500">*</span></label>
                      <input required value={newCampaign.name} onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                        placeholder="e.g. Q1 Cold Outreach" className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-neutral-700">Email Template <span className="text-red-500">*</span></label>
                      <select required value={newCampaign.templateId} onChange={e => setNewCampaign({ ...newCampaign, templateId: e.target.value })}
                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white">
                        <option value="">Select a template…</option>
                        {growthTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      {growthTemplates.length === 0 && <p className="text-xs text-amber-600 mt-1">No templates found. <button type="button" className="underline" onClick={() => { setShowCampaignModal(false); setActiveTab("templates"); }}>Create a template first.</button></p>}
                    </div>
                  </form>
                  <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setShowCampaignModal(false)} className="px-4 py-2 text-sm font-bold text-neutral-600 hover:text-neutral-900">Cancel</button>
                    <button type="submit" form="campaignForm" className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">Create Campaign</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== GROWTH ENGINE: AUTOMATION TAB ===== */}
        {activeTab === "automation" && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-sm text-indigo-800 flex items-start gap-3">
              <Bot size={18} className="text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <strong>Automation Engine</strong> — Toggle each module to enable or disable automatic execution. Schedules are processed by your deployment's cron jobs or n8n workflows.
                To set up live cron execution, visit the <a href="/growth-engine-guide.html" target="_blank" className="underline">User Guide</a>.
              </div>
            </div>

            {loadingAuto && <div className="text-center py-12 text-neutral-400"><Loader2 className="animate-spin mx-auto mb-2" size={24} />Loading...</div>}

            {autoModules.map(mod => {
              const info: Record<string, { icon: any; description: string; color: string }> = {
                AutoLeadDiscovery: { icon: Target, description: "Automatically discovers new business domains using search patterns and stores them as leads.", color: "indigo" },
                AutoSEOScanning: { icon: BarChart3, description: "Runs automated SEO audits on newly discovered leads and scores them 0–100.", color: "blue" },
                AutoLeadEnrichment: { icon: AtSign, description: "Scrapes contact pages to extract email addresses and phone numbers for each lead.", color: "violet" },
                AutoEmailOutreach: { icon: Send, description: "Sends personalized outreach emails to qualifying leads with SEO scores below 65.", color: "emerald" },
              };
              const meta = info[mod.module] || { icon: Cpu, description: "Automation module.", color: "neutral" };
              const Icon = meta.icon;

              return (
                <div key={mod.id} className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className={`p-3 bg-${meta.color}-50 rounded-xl shrink-0`}>
                    <Icon size={22} className={`text-${meta.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-neutral-900 text-base mb-1">{mod.module.replace(/([A-Z])/g, " $1").trim()}</div>
                    <p className="text-sm text-neutral-500 mb-3">{meta.description}</p>
                    <div className="flex items-center gap-3">
                      <select value={mod.scheduleInterval} disabled={!mod.enabled}
                        onChange={e => handleUpdateSchedule(mod.module, e.target.value)}
                        className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs font-medium outline-none bg-white text-neutral-700 disabled:opacity-50">
                        <option value="hourly">Every Hour</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${mod.enabled ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                        {mod.enabled ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleToggleModule(mod.module, mod.enabled)} disabled={togglingModule === mod.module}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${mod.enabled ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" : "bg-indigo-600 text-white hover:bg-indigo-700"} disabled:opacity-50`}>
                    {togglingModule === mod.module ? <Loader2 size={15} className="animate-spin" /> : mod.enabled ? <><Pause size={15} /> Disable</> : <><Play size={15} /> Enable</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Inbox Tab */}
        {activeTab === "inbox" && (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-sm text-indigo-800 flex items-start gap-3">
              <Inbox size={18} className="text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <strong>Email Inbox</strong> — All sent campaigns and incoming replies in one place.
                Filter by status or mark emails as replied to update lead statuses automatically.
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "sent", "opened", "clicked", "replied", "bounced"] as const).map((f) => {
                const count = f === "all"
                  ? Object.values(inboxCounts).reduce((a, b) => (a as number) + (b as number), 0) as number
                  : (inboxCounts[f] || 0);
                return (
                  <button key={f} onClick={() => { setInboxFilter(f); fetchInbox(f === "all" ? undefined : f); }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors ${
                      inboxFilter === f
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white border border-neutral-200 text-neutral-600 hover:border-indigo-400 hover:text-indigo-600"
                    }`}>
                    {f === "all" ? "All" : f} <span className="ml-1 opacity-70">({count})</span>
                  </button>
                );
              })}
              <button onClick={() => fetchInbox(inboxFilter === "all" ? undefined : inboxFilter)}
                className="ml-auto p-2 bg-white border border-neutral-200 rounded-xl text-neutral-500 hover:text-indigo-600 transition-colors" title="Refresh">
                <RefreshCw size={15} />
              </button>
            </div>

            {loadingInbox ? (
              <div className="text-center py-16 text-neutral-400">
                <Loader2 size={28} className="animate-spin mx-auto mb-3" />
                <p className="text-sm">Loading emails...</p>
              </div>
            ) : inboxLogs.length === 0 ? (
              <div className="text-center py-20">
                <Inbox size={44} className="text-neutral-200 mx-auto mb-3" />
                <p className="font-bold text-neutral-600 text-lg">No emails found</p>
                <p className="text-sm text-neutral-400 mt-1">Run a campaign to start sending emails and tracking replies.</p>
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{inboxLogs.length} emails</span>
                  <span className="text-xs text-neutral-400">
                    {inboxCounts["replied"] || 0} replied · {inboxCounts["opened"] || 0} opened · {inboxCounts["bounced"] || 0} bounced
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-100">
                        <th className="px-5 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Recipient</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Subject</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Campaign</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Date</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                      {inboxLogs.map((log) => {
                        const statusStyles: Record<string, string> = {
                          sent: "bg-blue-50 text-blue-700",
                          delivered: "bg-indigo-50 text-indigo-700",
                          opened: "bg-amber-50 text-amber-700",
                          clicked: "bg-orange-50 text-orange-700",
                          replied: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
                          bounced: "bg-red-50 text-red-700",
                        };
                        return (
                          <tr key={log.id} className="hover:bg-neutral-50 transition-colors group">
                            <td className="px-5 py-4">
                              <div className="font-semibold text-neutral-800 text-sm">
                                {log.lead?.companyName || log.lead?.website || "—"}
                              </div>
                              <div className="text-xs text-neutral-400 mt-0.5">{log.lead?.email || <span className="italic">no email</span>}</div>
                            </td>
                            <td className="px-5 py-4 max-w-xs">
                              <div className="text-neutral-700 truncate text-sm">{log.subject}</div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-lg">
                                {log.campaign?.name || "—"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs text-neutral-400 whitespace-nowrap">
                              {new Date(log.sentAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                              <div className="text-neutral-300 mt-0.5">
                                {new Date(log.sentAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                statusStyles[log.status] || "bg-neutral-100 text-neutral-600"
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                {log.status === "sent" && (
                                  <>
                                    <button onClick={() => handleMarkInboxStatus(log.id, "opened")}
                                      className="text-xs text-amber-600 font-semibold hover:underline">Mark Opened</button>
                                    <span className="text-neutral-300">·</span>
                                    <button onClick={() => handleMarkInboxStatus(log.id, "replied")}
                                      className="text-xs text-emerald-600 font-semibold hover:underline">Mark Replied</button>
                                  </>
                                )}
                                {log.status === "opened" && (
                                  <button onClick={() => handleMarkInboxStatus(log.id, "replied")}
                                    className="text-xs text-emerald-600 font-semibold hover:underline">Mark Replied</button>
                                )}
                                {log.status === "replied" && (
                                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Replied
                                  </span>
                                )}
                                {log.status === "bounced" && (
                                  <span className="text-xs text-red-500">Delivery failed</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Email Template Modal (from templates tab) */}
        {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2"><Mail className="text-indigo-600" size={20} /> Create Email Template</h3>
                <button onClick={() => setShowTemplateModal(false)} className="text-neutral-400 hover:text-neutral-600"><X size={20} /></button>
              </div>
              <form id="templateForm2" onSubmit={handleCreateTemplate} className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-neutral-700">Template Name <span className="text-red-500">*</span></label>
                  <input required value={newTemplate.name} onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="e.g. Cold SEO Outreach" className="w-full px-4 py-2 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-neutral-700">Email Subject <span className="text-red-500">*</span></label>
                  <input required value={newTemplate.subject} onChange={e => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    placeholder="Quick SEO improvement opportunity for {{companyName}}" className="w-full px-4 py-2 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  <p className="text-xs text-neutral-500">Variables: <code>{"{{companyName}}"}</code> <code>{"{{website}}"}</code> <code>{"{{seoScore}}"}</code></p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-neutral-700">Email Body <span className="text-red-500">*</span></label>
                  <textarea required rows={8} value={newTemplate.body} onChange={e => setNewTemplate({ ...newTemplate, body: e.target.value })}
                    placeholder={"Hello,\n\nI ran a quick SEO check on {{website}} and found some opportunities...\n\nBest regards,\nInstantSEOScan Team"}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none" />
                </div>
              </form>
              <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowTemplateModal(false)} className="px-4 py-2 text-sm font-bold text-neutral-600 hover:text-neutral-900">Cancel</button>
                <button type="submit" form="templateForm2" className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">Save Template</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
