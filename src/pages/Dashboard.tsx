import { Activity, Search, Link as LinkIcon, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = [
    { name: 'Total Audits', value: '12', icon: Search, color: 'text-blue-500', bg: 'bg-blue-100' },
    { name: 'Avg SEO Score', value: '78', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { name: 'Keywords Tracked', value: '45', icon: BarChart, color: 'text-purple-500', bg: 'bg-purple-100' },
    { name: 'Backlinks Found', value: '1.2k', icon: LinkIcon, color: 'text-amber-500', bg: 'bg-amber-100' },
  ];

  const recentScans = [
    { domain: 'example.com', score: 85, date: '2 hours ago', status: 'Good' },
    { domain: 'mywebsite.net', score: 62, date: '1 day ago', status: 'Needs Work' },
    { domain: 'competitor.org', score: 91, date: '3 days ago', status: 'Excellent' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-2">Welcome back! Here's an overview of your SEO performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Audits</h2>
            <Link to="/audit" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-500">
                  <th className="pb-3 font-medium">Domain</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentScans.map((scan, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-medium text-slate-900">{scan.domain}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                        scan.score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                        scan.score >= 60 ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {scan.score}/100
                      </span>
                    </td>
                    <td className="py-4 text-slate-600">{scan.status}</td>
                    <td className="py-4 text-right text-slate-500">{scan.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl shadow-sm p-6 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-2">Quick Actions</h2>
            <p className="text-slate-400 text-sm mb-6">Run a new scan or check your competitors.</p>
            <div className="space-y-3">
              <Link to="/audit" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
                <Search className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">New Site Audit</span>
              </Link>
              <Link to="/keyword" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
                <BarChart className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Keyword Research</span>
              </Link>
              <Link to="/authority" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
                <LinkIcon className="w-5 h-5 text-amber-400" />
                <span className="font-medium">Check Domain Authority</span>
              </Link>
            </div>
          </div>
          <div className="mt-8 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <p className="text-sm text-emerald-400 font-medium">Pro Tip</p>
            <p className="text-xs text-slate-300 mt-1">Connect your Google Search Console for more accurate ranking data.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
