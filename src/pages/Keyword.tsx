import React, { useState } from 'react';
import { Search, Loader2, Globe, TrendingUp, DollarSign, Target } from 'lucide-react';
import axios from 'axios';

export default function Keyword() {
  const [keyword, setKeyword] = useState('');
  const [country, setCountry] = useState('us');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/keyword', { keyword, country });
      setResult(res.data);
    } catch (error) {
      console.error('Keyword search failed', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Keyword Research</h1>
        <p className="text-slate-500 text-lg">Discover high-volume, low-competition keywords to drive traffic.</p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto flex gap-4">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 w-6 h-6 text-slate-400" />
          <input
            type="text"
            placeholder="Enter a keyword (e.g., 'seo tools')"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none text-lg transition-all"
            required
          />
        </div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none text-lg bg-white font-medium text-slate-700"
        >
          <option value="us">🇺🇸 US</option>
          <option value="uk">🇬🇧 UK</option>
          <option value="ca">🇨🇦 CA</option>
          <option value="au">🇦🇺 AU</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Search'}
        </button>
      </form>

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
                <h3 className="font-semibold text-slate-600">Search Volume</h3>
              </div>
              <p className="text-4xl font-black text-slate-900">{result.volume.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-2">Monthly searches in {result.country.toUpperCase()}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Target className="w-5 h-5" /></div>
                <h3 className="font-semibold text-slate-600">Keyword Difficulty</h3>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-black text-slate-900">{result.kd}</p>
                <p className="text-lg font-bold text-slate-400 mb-1">/100</p>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${result.kd > 70 ? 'bg-red-500' : result.kd > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${result.kd}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign className="w-5 h-5" /></div>
                <h3 className="font-semibold text-slate-600">Cost Per Click</h3>
              </div>
              <p className="text-4xl font-black text-slate-900">${result.cpc}</p>
              <p className="text-sm text-slate-500 mt-2">Average CPC on Google Ads</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Globe className="w-5 h-5" /></div>
                <h3 className="font-semibold text-slate-600">Search Intent</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{result.intent}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider rounded-lg">
                {result.intent === 'Informational' ? 'Learn' : result.intent === 'Commercial' ? 'Investigate' : 'Buy'}
              </span>
            </div>
          </div>

          {/* Related Keywords */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">Related Keywords</h2>
              <p className="text-slate-500 text-sm mt-1">Long-tail variations to target in your content.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-sm text-slate-500 uppercase tracking-wider">
                    <th className="p-6 font-semibold">Keyword</th>
                    <th className="p-6 font-semibold">Volume</th>
                    <th className="p-6 font-semibold">Difficulty (KD)</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {result.relatedKeywords.map((rk: any, i: number) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-6 font-medium text-slate-900">{rk.keyword}</td>
                      <td className="p-6 font-mono">{rk.volume.toLocaleString()}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${
                            rk.kd > 70 ? 'bg-red-100 text-red-700' : 
                            rk.kd > 40 ? 'bg-amber-100 text-amber-700' : 
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {rk.kd}
                          </span>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full ${rk.kd > 70 ? 'bg-red-500' : rk.kd > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${rk.kd}%` }}
                            />
                          </div>
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
    </div>
  );
}
