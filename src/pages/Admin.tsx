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
} from "lucide-react";
import { apiRequest } from "../services/apiClient";

type AdminStats = {
  userCount?: { count: number };
  scanCount?: { count: number };
  pendingCount?: { count: number };
  blogCount?: { count: number };
};

type AdminUser = {
  id: number;
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
  id: number;
  title: string;
  slug: string;
  author: string;
  content: string;
  created_at: string;
};

const tokenHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"overview" | "crm" | "cms">("overview");
  const [stats, setStats] = useState<AdminStats>({});
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [crm, setCrm] = useState<CRMResponse>({});
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingPost, setSavingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [postForm, setPostForm] = useState({ title: "", content: "", author: "" });
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

  const loadAll = async () => {
    setError("");
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchUsers(), fetchCRM(), fetchBlogPosts()]);
    } catch (err: any) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleApprove = async (userId: number) => {
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

  const handleUpdatePlan = async (userId: number, plan: string, limit: number, days?: number) => {
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

  const resetPostForm = () => {
    setPostForm({ title: "", content: "", author: "" });
    setEditingPostId(null);
  };

  const startEditPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setPostForm({ title: post.title, content: post.content, author: post.author || "" });
  };

  const handleSavePost = async () => {
    if (!postForm.title.trim() || !postForm.content.trim()) {
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
      body: JSON.stringify(postForm),
    });

    setSavingPost(false);

    if (!result.ok) {
      setError(result.error || "Failed to save post");
      return;
    }

    await Promise.all([fetchBlogPosts(), fetchStats()]);
    resetPostForm();
  };

  const handleDeletePost = async (id: number) => {
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
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "overview" | "crm" | "cms")}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              activeTab === tab.id
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
                              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md w-fit ${
                                user.plan === "agency"
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
                                className={`w-1.5 h-1.5 rounded-full ${
                                  user.status === "approved" ? "bg-emerald-500" : "bg-orange-500"
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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
                value={postForm.author}
                onChange={(e) => setPostForm((prev) => ({ ...prev, author: e.target.value }))}
                placeholder="Author (optional)"
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <textarea
                value={postForm.content}
                onChange={(e) => setPostForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write the post content..."
                rows={12}
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

          <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
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
                    <p className="text-sm text-neutral-600 line-clamp-2">{post.content}</p>
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
        </div>
      )}
    </div>
  );
}
