import React, { useState } from 'react';
import { Link as LinkIcon, Loader2, ShieldAlert, Activity } from 'lucide-react';
import axios from 'axios';

export default function Authority() {
  const [domains, setDomains] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domains.trim()) return;

    const domainList = domains.split('\n').map(d => d.trim()).filter(d => d);
    if (domainList.length === 0) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/bulkAuthority', { domains: domainList });
      setResults(res.data);
    } catch (error) {
      console.error('Authority check failed', error);
      alert('Check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Bulk Authority Checker</h1>
        <p className="text-slate-500 text-lg">Check Domain Authority (DA) and Page Authority (PA) for multiple domains at once.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleCheck} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Enter Domains (One per line, up to 10)
            </label>
            <textarea
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
              placeholder="example.com&#10;competitor.com&#10;partner.org"
              className="w-full h-48 p-4 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none text-lg font-mono transition-all resize-none"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Check Authority'}
            </button>
          </div>
        </form>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Results</h2>
            <span className="text-sm font-medium text-slate-500">{results.length} domains checked</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="p-6 font-semibold">Domain</th>
                  <th className="p-6 font-semibold">Domain Authority (DA)</th>
                  <th className="p-6 font-semibold">Page Authority (PA)</th>
                  <th className="p-6 font-semibold">Total Backlinks</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {results.map((res: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-medium text-slate-900 flex items-center gap-3">
                      <GlobeIcon className="w-5 h-5 text-slate-400" />
                      {res.domain}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-slate-900">{res.da}</span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${res.da}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-slate-700">{res.pa}</span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-blue-400"
                            style={{ width: `${res.pa}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-6 font-mono text-slate-600">
                      {res.backlinks.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple globe icon component since we didn't import Globe from lucide in this file
function GlobeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}
