import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, BarChart3, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface PendingUser {
  id: number;
  email: string;
  name: string;
  phone: string;
  created_at: string;
}

interface AdminUser {
  id: number;
  email: string;
  name: string;
  phone: string;
  approved: number;
  plan: string | null;
  end_date: string | null;
}

interface Stats {
  totalUsers: number;
  approvedUsers: number;
  pendingUsers: number;
  planStats: any[];
}

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(user);
    if (parsedUser.email !== 'shahabjan38@gmail.com') {
      navigate('/');
      alert('You do not have admin access');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [pending, users, statsData] = await Promise.all([
        axios.get('/api/admin/pending-users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPendingUsers(pending.data);
      setAllUsers(users.data);
      setStats(statsData.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: number) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        '/api/admin/approve-user',
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
      await fetchData();
    } catch (err) {
      alert('Failed to approve user');
    }
  };

  const handleRejectUser = async (userId: number) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Are you sure you want to reject this user?')) return;

    try {
      await axios.post(
        '/api/admin/reject-user',
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (err) {
      alert('Failed to reject user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-xl text-slate-600">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-emerald-400">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-4 bg-white rounded-lg shadow p-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500 text-white'
                : 'hover:bg-slate-100'
            }`}
          >
            <BarChart3 size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              activeTab === 'pending'
                ? 'bg-emerald-500 text-white'
                : 'hover:bg-slate-100'
            }`}
          >
            <UserCheck size={20} />
            Pending Approvals ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              activeTab === 'users' ? 'bg-emerald-500 text-white' : 'hover:bg-slate-100'
            }`}
          >
            <Users size={20} />
            All Users ({allUsers.length})
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="text-slate-600 text-sm font-semibold mb-2">Total Users</div>
                <div className="text-4xl font-bold text-slate-900">{stats.totalUsers}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="text-slate-600 text-sm font-semibold mb-2">Approved Users</div>
                <div className="text-4xl font-bold text-emerald-500">{stats.approvedUsers}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="text-slate-600 text-sm font-semibold mb-2">Pending Approval</div>
                <div className="text-4xl font-bold text-yellow-500">{stats.pendingUsers}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="text-slate-600 text-sm font-semibold mb-2">Active Plans</div>
                <div className="text-4xl font-bold text-blue-500">
                  {stats.planStats.reduce((sum, p) => sum + p.count, 0)}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Plan Distribution</h3>
              <div className="space-y-4">
                {stats.planStats.map((plan, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded">
                    <div className="font-semibold">{plan.name}</div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-500">{plan.count} users</div>
                      <div className="text-sm text-slate-600">
                        Revenue: ${(plan.monthly_revenue || 0).toFixed(2)}/month
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pending Approvals Tab */}
        {activeTab === 'pending' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Pending User Approvals</h2>
            {pendingUsers.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-slate-600">No pending approvals</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingUsers.map(user => (
                  <div key={user.id} className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                        <p className="text-slate-600">{user.email}</p>
                        {user.phone && <p className="text-slate-600">{user.phone}</p>}
                        <p className="text-sm text-slate-500 mt-2">
                          Applied: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
                        >
                          <UserCheck size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectUser(user.id)}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                        >
                          <UserX size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">All Users</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Plan</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => (
                    <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-900">{user.name}</td>
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            user.approved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {user.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.plan ? (
                          <span className="font-semibold text-emerald-600">{user.plan}</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {user.end_date ? new Date(user.end_date).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
