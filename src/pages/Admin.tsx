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
  const [activeTab, setActiveTab] = useState<"dashboard" | "crm" | "cms" | "settings" | "aiwriter">("dashboard");
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

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetBlock, setUploadTargetBlock] = useState<string | null>(null);

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
    GEMINI_API_KEY_1: "",
    GEMINI_API_KEY_2: "",
    GEMINI_API_KEY_3: "",
  });
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
        GEMINI_API_KEY_1: result.data.GEMINI_API_KEY_1 || "",
        GEMINI_API_KEY_2: result.data.GEMINI_API_KEY_2 || "",
        GEMINI_API_KEY_3: result.data.GEMINI_API_KEY_3 || "",
      });
    }
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
      author: post.author || "",
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
      author: "AI Writer",
      blocks: result.data.blocks || [],
    });
    setAiTopic("");
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
            </h1>
            <p className="text-slate-500 font-medium">
              {activeTab === "dashboard" ? "System statistics and recent activity." :
                activeTab === "cms" ? "Manage, optimize and publish high-ranking AI articles." :
                  activeTab === "crm" ? "Manage users, subscriptions, and plans." :
                    activeTab === "settings" ? "Configure API keys and platform settings." :
                      "Generate SEO optimized articles in a single click."}
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
                            <textarea
                              value={block.text}
                              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                              placeholder={`${block.type}...`}
                              rows={block.type === "paragraph" ? 4 : 2}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none resize-y min-h-[60px]"
                            />
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

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-3xl bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
            <h2 className="font-bold mb-2 flex items-center gap-2 text-lg">
              <Settings size={20} className="text-neutral-400" />
              Gemini API Keys
            </h2>
            <p className="text-xs text-neutral-500 mb-6">
              Configure up to 3 API keys. If Key 1 expires, the system automatically falls back to Key 2, then Key 3.
            </p>

            <div className="space-y-5">
              {[
                { key: "GEMINI_API_KEY_1" as const, label: "Primary Key (Key 1)", color: "emerald" },
                { key: "GEMINI_API_KEY_2" as const, label: "Secondary Key (Key 2)", color: "blue" },
                { key: "GEMINI_API_KEY_3" as const, label: "Tertiary Key (Key 3)", color: "purple" },
              ].map(({ key, label, color }) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-${color}-500`} />
                    {label}
                  </label>
                  <input
                    type="password"
                    value={settingsForm[key]}
                    onChange={(e) => setSettingsForm({ ...settingsForm, [key]: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                </div>
              ))}

              <p className="text-xs text-neutral-400 pt-2">
                Keys are stored securely in the database (never in git). Leave a slot empty to skip it.
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
      </main>
    </div>
  );
}
