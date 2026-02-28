import { useState, useEffect } from "react";
import { Users, Zap, BarChart3, Settings, Shield, Search, MoreVertical, CheckCircle2, UserPlus, Calendar, Lock } from "lucide-react";
import { motion } from "motion/react";

export default function Admin() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const res = await fetch("/api/admin/stats", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    const data = await res.json();
    setStats(data);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    Promise.all([fetchStats(), fetchUsers()]).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (userId: number) => {
    await fetch(`/api/admin/users/${userId}/approve`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    fetchUsers();
  };

  const handleUpdatePlan = async (userId: number, plan: string, limit: number, days?: number) => {
    let finalDays = days;
    if (!finalDays) {
      const input = prompt("Enter number of days for this subscription:", "30");
      if (!input) return;
      finalDays = parseInt(input, 10);
      if (isNaN(finalDays) || finalDays <= 0) {
        alert("Invalid number of days.");
        return;
      }
    }

    await fetch(`/api/admin/users/${userId}/plan`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ plan, limit, days: finalDays })
    });
    fetchUsers();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-neutral-500">Manage your platform, users, and subscriptions</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert("Settings panel coming soon!")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all"
          >
            <Settings size={18} />
            Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { icon: <Users />, label: "Total Users", value: stats?.userCount?.count || "0", color: "blue" },
          { icon: <Zap />, label: "Total Scans", value: stats?.scanCount?.count || "0", color: "emerald" },
          { icon: <BarChart3 />, label: "Monthly Revenue", value: "$12,450", color: "purple" },
          { icon: <Shield />, label: "Active Subscriptions", value: users.filter(u => u.plan !== 'free').length, color: "orange" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
            <div className={`w-10 h-10 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-neutral-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
            <h2 className="font-bold">User Management</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
              <Users size={14} />
              {users.length} Total Users
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
                {users.map((user, i) => (
                  <tr key={i} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm">{user.email}</div>
                      <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">{user.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md w-fit ${
                          user.plan === 'agency' ? 'bg-purple-50 text-purple-700' :
                          user.plan === 'pro' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
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
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'approved' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                          <span className="text-sm text-neutral-600 capitalize">{user.status}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {user.verified ? "Verified" : "Unverified"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.status === 'pending' && (
                          <button 
                            onClick={() => handleApprove(user.id)}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                            title="Approve User"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleUpdatePlan(user.id, 'pro', 100, 30)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Set Pro Plan (30 Days)"
                        >
                          <Zap size={16} />
                        </button>
                        <button 
                          onClick={() => handleUpdatePlan(user.id, 'agency', 1000, 30)}
                          className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                          title="Set Agency Plan (30 Days)"
                        >
                          <Shield size={16} />
                        </button>
                        <button 
                          onClick={() => handleUpdatePlan(user.id, 'custom', 500)}
                          className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                          title="Set Custom Plan (Custom Days)"
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

        {/* System & SaaS Controls */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
            <h2 className="font-bold mb-6 flex items-center gap-2">
              <Lock size={18} className="text-neutral-400" />
              SaaS Controls
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Global Limitations</div>
                <div className="flex items-center justify-between text-sm">
                  <span>Free Plan Limit</span>
                  <span className="font-bold">5 Scans</span>
                </div>
              </div>
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Subscription Settings</div>
                <div className="flex items-center justify-between text-sm">
                  <span>Pro Price</span>
                  <span className="font-bold">$10/mo</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span>Agency Price</span>
                  <span className="font-bold">$100/mo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
            <h2 className="font-bold mb-4">Apify Run Monitor</h2>
            <p className="text-xs text-neutral-500 mb-4">Check status of any Apify actor run.</p>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Run ID"
                id="run-id-input"
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button 
                onClick={async () => {
                  const runId = (document.getElementById('run-id-input') as HTMLInputElement).value;
                  if (!runId) return;
                  const res = await fetch(`/api/tools/authority/status/${runId}`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                  });
                  const data = await res.json();
                  alert(`Status: ${data.status}\n${data.data ? JSON.stringify(data.data, null, 2) : ''}`);
                }}
                className="w-full bg-neutral-900 text-white py-2 rounded-xl text-sm font-bold hover:bg-neutral-800 transition-colors"
              >
                Check Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
