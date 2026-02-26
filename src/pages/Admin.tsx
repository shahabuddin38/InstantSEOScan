import { useState, useEffect } from "react";
import { Users, Zap, BarChart3, Settings, Shield, Search, MoreVertical } from "lucide-react";
import { motion } from "motion/react";

export default function Admin() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-neutral-500">Manage your platform and users</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all">
          <Settings size={18} />
          Platform Settings
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { icon: <Users />, label: "Total Users", value: stats?.userCount?.count || "0", color: "blue" },
          { icon: <Zap />, label: "Total Scans", value: stats?.scanCount?.count || "0", color: "emerald" },
          { icon: <BarChart3 />, label: "Monthly Revenue", value: "$12,450", color: "purple" },
          { icon: <Shield />, label: "Active Subscriptions", value: "142", color: "orange" },
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
        {/* Recent Users Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
            <h2 className="font-bold">Recent Users</h2>
            <button className="text-sm text-emerald-600 font-bold">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-neutral-400 uppercase tracking-widest bg-neutral-50">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {[
                  { email: "john@example.com", plan: "Pro", status: "Active", date: "2 hours ago" },
                  { email: "sarah@design.co", plan: "Free", status: "Active", date: "5 hours ago" },
                  { email: "mike@startup.io", plan: "Agency", status: "Pending", date: "1 day ago" },
                  { email: "anna@blog.com", plan: "Pro", status: "Active", date: "2 days ago" },
                ].map((user, i) => (
                  <tr key={i} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                        user.plan === 'Agency' ? 'bg-purple-50 text-purple-700' :
                        user.plan === 'Pro' ? 'bg-emerald-50 text-emerald-700' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                        <span className="text-sm text-neutral-600">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400">{user.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-neutral-400 hover:text-neutral-600">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
          <h2 className="font-bold mb-6">System Logs</h2>
          <div className="space-y-6">
            {[
              { msg: "New user registered", time: "2m ago", type: "info" },
              { msg: "Scan completed for apple.com", time: "15m ago", type: "success" },
              { msg: "Stripe payment failed", time: "1h ago", type: "error" },
              { msg: "Database backup completed", time: "3h ago", type: "success" },
            ].map((log, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-1 h-10 rounded-full shrink-0 ${
                  log.type === 'success' ? 'bg-emerald-500' :
                  log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div>
                  <div className="text-sm font-medium text-neutral-900">{log.msg}</div>
                  <div className="text-xs text-neutral-400">{log.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
