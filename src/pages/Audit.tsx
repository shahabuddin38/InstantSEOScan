import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle, Info, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function Audit() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [aiOverview, setAiOverview] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    setLoading(true);
    setResult(null);
    setAiOverview(null);

    try {
      const res = await axios.post('/api/audit', { url: targetUrl });
      setResult(res.data);
      
      // Automatically fetch AI Overview
      fetchAiOverview(res.data);
    } catch (error) {
      console.error('Audit failed', error);
      alert('Audit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAiOverview = async (auditData: any) => {
    setAiLoading(true);
    try {
      const res = await axios.post('/api/aiOverview', {
        auditData: auditData.data,
        daScore: { da: 45, pa: 50 }, // Mock DA for now
        keywordData: { topKeyword: 'seo tools', volume: 12000 } // Mock keyword data
      });
      setAiOverview(res.data);
    } catch (error) {
      console.error('AI Overview failed', error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Technical SEO Audit</h1>
        <p className="text-slate-500 text-lg">Enter a URL to analyze its on-page SEO, technical health, and performance.</p>
      </div>

      <form onSubmit={handleAudit} className="relative max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-6 h-6 text-slate-400" />
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full pl-12 pr-32 py-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none text-lg transition-all"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Score Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={result.score >= 80 ? '#10b981' : result.score >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="10"
                    strokeDasharray={`${(result.score / 100) * 283} 283`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-slate-900">{result.score}</span>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Score</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">SEO Health Score</h2>
                <p className="text-slate-500 max-w-md">
                  {result.score >= 80 ? "Great job! Your site is well-optimized." :
                   result.score >= 60 ? "Your site has good fundamentals but needs some improvements." :
                   "Critical SEO issues found. Immediate action required."}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-center p-4 bg-red-50 rounded-2xl min-w-[100px]">
                <p className="text-3xl font-bold text-red-600">{result.issues.filter((i: any) => i.type === 'error').length}</p>
                <p className="text-xs font-medium text-red-800 uppercase mt-1">Errors</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-2xl min-w-[100px]">
                <p className="text-3xl font-bold text-amber-600">{result.issues.filter((i: any) => i.type === 'warning').length}</p>
                <p className="text-xs font-medium text-amber-800 uppercase mt-1">Warnings</p>
              </div>
            </div>
          </div>

          {/* AI Overview */}
          {aiLoading ? (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100 flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <span className="text-indigo-900 font-medium">Generating AI SEO Action Plan...</span>
            </div>
          ) : aiOverview ? (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold">AI Action Plan</h2>
                </div>
                
                <p className="text-indigo-100 text-lg mb-8 leading-relaxed max-w-3xl">
                  {aiOverview.summary}
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4">Immediate Actions</h3>
                    <ul className="space-y-3">
                      {aiOverview.actionSteps.map((step: string, i: number) => (
                        <li key={i} className="flex gap-3 text-slate-200 bg-white/5 p-4 rounded-xl border border-white/10">
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4">Priority Tasks</h3>
                    <div className="space-y-3">
                      {aiOverview.priorityList.map((task: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                          <span className="font-medium text-slate-200">{task.task}</span>
                          <div className="flex gap-2">
                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                              task.impact === 'High' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>Impact: {task.impact}</span>
                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                              task.effort === 'High' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>Effort: {task.effort}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Issues List */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Detailed Findings</h2>
              <div className="space-y-4">
                {result.issues.map((issue: any, i: number) => (
                  <div key={i} className={`flex gap-4 p-4 rounded-2xl border ${
                    issue.type === 'error' ? 'bg-red-50 border-red-100 text-red-900' :
                    issue.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                    'bg-emerald-50 border-emerald-100 text-emerald-900'
                  }`}>
                    {issue.type === 'error' ? <AlertCircle className="w-6 h-6 shrink-0 text-red-500" /> :
                     issue.type === 'warning' ? <Info className="w-6 h-6 shrink-0 text-amber-500" /> :
                     <CheckCircle className="w-6 h-6 shrink-0 text-emerald-500" />}
                    <p className="font-medium">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Data */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Page Metrics</h2>
              <div className="space-y-4">
                {Object.entries(result.data).map(([key, value]: [string, any]) => {
                  if (typeof value === 'boolean') value = value ? 'Yes' : 'No';
                  if (typeof value === 'string' && value.length > 30) value = value.substring(0, 30) + '...';
                  
                  // Format key
                  const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                  return (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                      <span className="text-slate-500 text-sm font-medium">{formattedKey}</span>
                      <span className="text-slate-900 font-bold text-sm text-right max-w-[50%] truncate" title={String(value)}>{String(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
