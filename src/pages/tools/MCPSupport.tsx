import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Cpu, Globe, ArrowRight, Loader2, AlertCircle, Terminal, Box, Play } from "lucide-react";
import { motion } from "motion/react";

export default function MCPSupport() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("config");

  const mcpConfig = {
    "mcpServers": {
      "RapidAPI Hub - Semrush Keyword Magic Tool": {
        "command": "npx",
        "args": [
          "mcp-remote",
          "https://mcp.rapidapi.com",
          "--header",
          "x-api-host: semrush-keyword-magic-tool.p.rapidapi.com",
          "--header",
          "x-api-key: a0caf4c765msh80030749c70a3d8p1f0ae9jsnb651e4468254"
        ]
      }
    }
  };

  const handleTestTool = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/mcp/call", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ 
          server: "RapidAPI Hub - Semrush Keyword Magic Tool",
          tool: "keyword_research",
          args: { keyword: "seo tools", country: "us" }
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 p-8 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-2">MCP Hub</h1>
            <p className="text-neutral-500">Model Context Protocol (MCP) integration and tool management.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Config & Status */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal size={18} className="text-emerald-600" />
                  <h2 className="font-bold">Active Servers</h2>
                </div>
                <div className="space-y-3">
                  {Object.keys(mcpConfig.mcpServers).map((server) => (
                    <div key={server} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="text-xs font-bold text-neutral-900 mb-1">{server}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Connected</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Box size={18} className="text-blue-600" />
                  <h2 className="font-bold">Available Tools</h2>
                </div>
                <div className="space-y-2">
                  {["keyword_research", "domain_overview", "backlink_audit"].map((tool) => (
                    <div key={tool} className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded-lg transition-colors group cursor-pointer">
                      <span className="text-sm text-neutral-600 font-medium">{tool}</span>
                      <Play size={14} className="text-neutral-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Interaction & Output */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-neutral-100">
                  <button 
                    onClick={() => setActiveTab("config")}
                    className={`px-6 py-4 text-sm font-bold transition-all ${activeTab === 'config' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/30' : 'text-neutral-400 hover:text-neutral-600'}`}
                  >
                    Configuration
                  </button>
                  <button 
                    onClick={() => setActiveTab("test")}
                    className={`px-6 py-4 text-sm font-bold transition-all ${activeTab === 'test' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/30' : 'text-neutral-400 hover:text-neutral-600'}`}
                  >
                    Test Tool
                  </button>
                </div>

                <div className="p-8">
                  {activeTab === 'config' ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-neutral-900 rounded-2xl overflow-x-auto">
                        <pre className="text-emerald-400 text-xs font-mono leading-relaxed">
                          {JSON.stringify(mcpConfig, null, 2)}
                        </pre>
                      </div>
                      <p className="text-sm text-neutral-500 italic">
                        This configuration allows the SEO platform to communicate with remote tool providers using the Model Context Protocol.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
                        <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-neutral-400">Tool Parameters</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold mb-2">Keyword</label>
                            <input type="text" defaultValue="seo tools" className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold mb-2">Country</label>
                            <input type="text" defaultValue="us" className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm outline-none" />
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={handleTestTool}
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                          <>
                            Execute MCP Tool Call
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>

                      {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                          <AlertCircle size={18} />
                          {error}
                        </div>
                      )}

                      {result && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-neutral-900 rounded-2xl overflow-x-auto"
                        >
                          <div className="text-xs font-bold text-neutral-500 mb-4 uppercase tracking-widest">Output Response</div>
                          <pre className="text-blue-400 text-xs font-mono leading-relaxed">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
