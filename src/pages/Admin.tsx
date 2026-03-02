import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { apiRequest } from "../services/apiClient";

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
};

type BlogBlock = {
  id: string;
  type: "h1" | "h2" | "h3" | "paragraph" | "quote" | "list" | "image" | "cta";
  text: string;
  url?: string;
  alt?: string;
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

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"overview" | "crm" | "cms" | "settings">("overview");
  const [stats, setStats] = useState<AdminStats>({});
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [crm, setCrm] = useState<CRMResponse>({});
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingPost, setSavingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
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
    setPosts(result.data);
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

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleViewUser = async (userId: string) => {
    setLoadingDetail(true);
    const result = await apiRequest<any>(`/api/admin/users/${userId}/detail`, { headers: tokenHeaders() });
    setLoadingDetail(false);
    if (!result.ok) { setError(result.error || "Failed to load user"); return; }
    setSelectedUser(result.data);
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
  };

  const createBlock = (type: BlogBlock["type"]): BlogBlock => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    text: "",
    url: "",
    alt: "",
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
    if (!postForm.title.trim() || !derivedContent.trim()) {
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
  };

  const activeSubscriptions = useMemo(() => users.filter((u) => u.plan !== "free").length, [users]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-neutral-500">Loading admin workspace...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Admin Workspace</h1>
          <p className="text-neutral-500">Overview, CRM operations, and CMS publishing in one place</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={() => navigate("/tools/mcp")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50"
          >
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: "overview", label: "Overview" },
          { id: "crm", label: "CRM" },
          { id: "cms", label: "CMS" },
          { id: "settings", label: "Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${activeTab === tab.id
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Users size={20} />
              </div>
              <div className="text-2xl font-bold">{stats.userCount?.count || 0}</div>
              <div className="text-sm text-neutral-500">Total Users</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Zap size={20} />
              </div>
              <div className="text-2xl font-bold">{stats.scanCount?.count || 0}</div>
              <div className="text-sm text-neutral-500">Total Scans</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 size={20} />
              </div>
              <div className="text-2xl font-bold">{stats.pendingCount?.count || 0}</div>
              <div className="text-sm text-neutral-500">Pending Approvals</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Newspaper size={20} />
              </div>
              <div className="text-2xl font-bold">{stats.blogCount?.count || 0}</div>
              <div className="text-sm text-neutral-500">Published Posts</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                <h2 className="font-bold">User Management</h2>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
                  <Users size={14} />
                  {users.length} Users
                </div>
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
                    {users.map((user) => (
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
                              onClick={() => handleUpdatePlan(user.id, "custom", 500)}
                              className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                              title="Set Custom Plan"
                            >
                              <Calendar size={16} />
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id, user.email)}
                              className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                              title="Reset Password"
                            >
                              <Key size={16} />
                            </button>
                            <button
                              onClick={() => handleViewUser(user.id)}
                              className="p-2 bg-neutral-50 text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
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

            {/* User Detail Modal */}
            {selectedUser && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-lg">User Details</h2>
                    <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-neutral-100 rounded-lg"><X size={18} /></button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { label: "User ID", value: selectedUser.id },
                      { label: "Email", value: selectedUser.email },
                      { label: "Role", value: selectedUser.role },
                      { label: "Plan", value: selectedUser.plan },
                      { label: "Status", value: selectedUser.status },
                      { label: "Verified", value: selectedUser.verified ? "Yes" : "No" },
                      { label: "Usage", value: `${selectedUser.usageCount} / ${selectedUser.usageLimit}` },
                      { label: "Joined", value: new Date(selectedUser.createdAt).toLocaleDateString() },
                      { label: "Subscription Ends", value: selectedUser.subscriptionEnd ? new Date(selectedUser.subscriptionEnd).toLocaleDateString() : "N/A" },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 bg-neutral-50 rounded-xl">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{label}</div>
                        <div className="text-sm font-medium text-neutral-800 break-all">{value}</div>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-bold text-sm mb-3">Scan Audit History ({selectedUser.scans?.length || 0})</h3>
                  {selectedUser.scans?.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-neutral-200">
                      <table className="w-full text-xs">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-bold text-neutral-500">URL</th>
                            <th className="px-4 py-2 text-left font-bold text-neutral-500">Score</th>
                            <th className="px-4 py-2 text-left font-bold text-neutral-500">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {selectedUser.scans.map((scan: any) => (
                            <tr key={scan.id} className="hover:bg-neutral-50">
                              <td className="px-4 py-2 text-neutral-700 truncate max-w-[200px]">{scan.url || scan.normalizedUrl}</td>
                              <td className="px-4 py-2"><span className={`font-bold ${scan.score >= 80 ? "text-emerald-600" : scan.score >= 50 ? "text-orange-600" : "text-red-600"}`}>{scan.score}</span></td>
                              <td className="px-4 py-2 text-neutral-500">{new Date(scan.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400">No scan history found.</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-8">
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

              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
                <h2 className="font-bold mb-2 flex items-center gap-2">
                  <BarChart3 size={18} className="text-neutral-400" />
                  System Summary
                </h2>
                <p className="text-xs text-neutral-500 mb-4">Quick signal of approval and publishing workflow.</p>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex justify-between"><span>Pending Users</span><strong>{stats.pendingCount?.count || 0}</strong></li>
                  <li className="flex justify-between"><span>Total Blog Posts</span><strong>{stats.blogCount?.count || 0}</strong></li>
                  <li className="flex justify-between"><span>Contact Messages</span><strong>{stats.messageCount?.count || 0}</strong></li>
                  <li className="flex justify-between"><span>Total Scans</span><strong>{stats.scanCount?.count || 0}</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

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
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(crm.users || []).map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 text-sm font-medium">{user.email}</td>
                      <td className="px-6 py-4 text-sm capitalize">{user.plan}</td>
                      <td className="px-6 py-4 text-sm capitalize">{user.status}</td>
                      <td className="px-6 py-4 text-sm">{user.usage_count} / {user.usage_limit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "cms" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-3xl border border-neutral-200 shadow-sm p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <FileText size={18} className="text-neutral-400" />
              {editingPostId ? "Edit Post" : "New Post"}
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                value={postForm.title}
                onChange={(e) => setPostForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Post title"
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <input
                type="text"
                value={postForm.slug}
                onChange={(e) => setPostForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="Slug (optional)"
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <input
                type="text"
                value={postForm.author}
                onChange={(e) => setPostForm((prev) => ({ ...prev, author: e.target.value }))}
                placeholder="Author (optional)"
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <input
                type="text"
                value={postForm.coverImage}
                onChange={(e) => setPostForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                placeholder="Cover image URL (optional)"
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <textarea
                value={postForm.excerpt}
                onChange={(e) => setPostForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Excerpt (optional)"
                rows={3}
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["h1", "H1"],
                  ["h2", "H2"],
                  ["h3", "H3"],
                  ["paragraph", "Paragraph"],
                  ["quote", "Quote"],
                  ["list", "List"],
                  ["image", "Image"],
                  ["cta", "CTA"],
                ].map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type as BlogBlock["type"])}
                    className="px-3 py-2 text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-neutral-100"
                  >
                    + {label}
                  </button>
                ))}
              </div>
              <textarea
                value={postForm.content}
                onChange={(e) => setPostForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Fallback plain content (optional)"
                rows={5}
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSavePost}
                  disabled={savingPost}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {editingPostId ? <Save size={16} /> : <Plus size={16} />} {editingPostId ? "Update" : "Publish"}
                </button>
                {editingPostId && (
                  <button
                    onClick={resetPostForm}
                    className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                <h2 className="font-bold">Drag & Drop Content Builder</h2>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{postForm.blocks.length} blocks</span>
              </div>
              <div className="p-6 space-y-3">
                {postForm.blocks.length === 0 && (
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-500">
                    Add blocks from the left panel to build your blog post like WordPress.
                  </div>
                )}

                {postForm.blocks.map((block) => (
                  <div
                    key={block.id}
                    className="p-4 border border-neutral-200 rounded-xl bg-white"
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
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
                        <GripVertical size={14} />
                        {block.type}
                      </div>
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        title="Remove block"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {(block.type === "image") ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={block.url || ""}
                          onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                          placeholder="Image URL"
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <input
                          type="text"
                          value={block.alt || ""}
                          onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                          placeholder="Image alt text"
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    ) : (
                      <textarea
                        value={block.text}
                        onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                        placeholder={`Write ${block.type} content...`}
                        rows={block.type === "paragraph" ? 4 : 2}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                <h2 className="font-bold">CMS Posts</h2>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{posts.length} posts</span>
              </div>
              <div className="divide-y divide-neutral-100">
                {posts.length === 0 && <div className="p-6 text-sm text-neutral-500">No posts yet.</div>}
                {posts.map((post) => (
                  <div key={post.id} className="p-6 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-sm mb-1">{post.title}</h3>
                      <p className="text-xs text-neutral-500 mb-2">/{post.slug} • {post.author || "Admin"}</p>
                      <p className="text-sm text-neutral-600 line-clamp-2">{post.excerpt || post.content}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => startEditPost(post)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                        title="Edit"
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2"><MessageSquare size={16} /> Contact Messages</h2>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{messages.length} messages</span>
              </div>
              <div className="divide-y divide-neutral-100">
                {messages.length === 0 && <div className="p-6 text-sm text-neutral-500">No messages yet.</div>}
                {messages.map((message) => (
                  <div key={message.id} className="p-6 flex items-start justify-between gap-4">
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
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        title="Delete message"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
