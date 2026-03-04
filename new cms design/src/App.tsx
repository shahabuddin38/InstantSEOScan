import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  PenTool, 
  BarChart3, 
  Settings, 
  Users, 
  Plus, 
  Filter, 
  ArrowUpDown, 
  MoreVertical, 
  Moon, 
  Eye, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  FileEdit
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---

interface Post {
  id: string;
  title: string;
  date: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    initials: string;
  };
  seoScore: number;
  status: 'Published' | 'Draft';
  image: string;
}

// --- Mock Data ---

const POSTS: Post[] = [
  {
    id: '1',
    title: 'The Ultimate Guide to AI SEO Auditing in 2024',
    date: 'Oct 24, 2024',
    category: 'Technical SEO',
    author: {
      name: 'Sarah Jones',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      initials: 'SJ'
    },
    seoScore: 92,
    status: 'Published',
    image: 'https://picsum.photos/seed/seo1/100/100'
  },
  {
    id: '2',
    title: 'How to Use LLMs for Content Gap Analysis',
    date: 'Oct 21, 2024',
    category: 'AI Strategy',
    author: {
      name: 'Alex Rivera',
      avatar: 'https://i.pravatar.cc/150?u=alex',
      initials: 'AR'
    },
    seoScore: 78,
    status: 'Published',
    image: 'https://picsum.photos/seed/seo2/100/100'
  },
  {
    id: '3',
    title: 'Modern Schema Markup: A Detailed Overview',
    date: 'Oct 18, 2024',
    category: 'Rich Results',
    author: {
      name: 'Marcus White',
      avatar: 'https://i.pravatar.cc/150?u=marcus',
      initials: 'MW'
    },
    seoScore: 45,
    status: 'Draft',
    image: 'https://picsum.photos/seed/seo3/100/100'
  }
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={cn(
    "flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group",
    active ? "bg-[#E7F7F1] text-[#10B981]" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
  )}>
    <Icon size={20} className={cn(active ? "text-[#10B981]" : "text-slate-400 group-hover:text-slate-600")} />
    <span className="font-medium text-sm">{label}</span>
  </div>
);

const StatCard = ({ label, value, change, icon: Icon, iconBg, iconColor }: { label: string, value: string, change: string, icon: any, iconBg: string, iconColor: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <span className="text-slate-500 text-sm font-medium">{label}</span>
      <div className={cn("p-2 rounded-lg", iconBg)}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      <span className="text-[#10B981] text-xs font-bold mb-1 flex items-center gap-0.5">
        {change} <TrendingUp size={12} />
      </span>
    </div>
  </div>
);

const SEOProgress = ({ score }: { score: number }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  let color = "#EF4444"; // Red
  if (score >= 80) color = "#10B981"; // Green
  else if (score >= 60) color = "#F59E0B"; // Orange

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="#F1F5F9"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-slate-700">{score}</span>
    </div>
  );
};

export default function App() {
  const [selectedPost, setSelectedPost] = useState(POSTS[0]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-[#10B981] p-1.5 rounded-lg">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Instant<span className="text-[#10B981]">SEO</span>Scan
          </span>
        </div>

        <div className="flex flex-col gap-8 flex-1">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">Platform</p>
            <nav className="flex flex-col gap-1">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" />
              <SidebarItem icon={Search} label="Site Audits" />
              <SidebarItem icon={FileText} label="Content Manager" active />
              <SidebarItem icon={Sparkles} label="AI Writer" />
              <SidebarItem icon={BarChart3} label="Rank Tracker" />
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">Configuration</p>
            <nav className="flex flex-col gap-1">
              <SidebarItem icon={Settings} label="SEO Settings" />
              <SidebarItem icon={Users} label="Team Members" />
            </nav>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-6">
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
            <Moon size={18} />
            <span className="text-sm font-medium">Toggle Appearance</span>
          </button>

          <div className="flex items-center gap-3 px-2">
            <img 
              src="https://i.pravatar.cc/150?u=alex" 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-slate-100"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">Alex Rivera</span>
              <span className="text-[11px] text-slate-500 font-medium">Head of SEO</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              SEO CMS <span className="text-[#10B981]">Content Manager</span>
            </h1>
            <p className="text-slate-500 font-medium">Manage, optimize and publish high-ranking AI articles.</p>
          </div>
          <button className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-100">
            <Plus size={20} />
            Create New Post
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <StatCard 
            label="Total Posts" 
            value="142" 
            change="+12%" 
            icon={FileText} 
            iconBg="bg-blue-50" 
            iconColor="text-blue-500" 
          />
          <StatCard 
            label="Avg SEO Score" 
            value="84/100" 
            change="+4.2%" 
            icon={Zap} 
            iconBg="bg-emerald-50" 
            iconColor="text-[#10B981]" 
          />
          <StatCard 
            label="Monthly Views" 
            value="48.5K" 
            change="+18%" 
            icon={Eye} 
            iconBg="bg-purple-50" 
            iconColor="text-purple-500" 
          />
          <StatCard 
            label="Drafts" 
            value="12" 
            change="Ready to optimize" 
            icon={FileEdit} 
            iconBg="bg-orange-50" 
            iconColor="text-orange-500" 
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search articles, keywords, or authors..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
            <ArrowUpDown size={18} />
            Latest First
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-bottom border-slate-50 bg-slate-50/30">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post Title & Metadata</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Author</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">SEO Score</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {POSTS.map((post) => (
                <tr 
                  key={post.id} 
                  className={cn(
                    "group hover:bg-slate-50/50 transition-colors cursor-pointer border-t border-slate-50",
                    selectedPost.id === post.id && "bg-emerald-50/30"
                  )}
                  onClick={() => setSelectedPost(post)}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <img 
                        src={post.image} 
                        alt="" 
                        className="w-12 h-12 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-[#10B981] transition-colors">{post.title}</span>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <LayoutDashboard size={12} /> {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={12} /> {post.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-[#10B981]">
                        {post.author.initials}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{post.author.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <SEOProgress score={post.seoScore} />
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold",
                      post.status === 'Published' ? "bg-emerald-100 text-[#10B981]" : "bg-slate-100 text-slate-500"
                    )}>
                      • {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center">
            <span className="text-xs font-medium text-slate-500">Showing 1 to 10 of 142 entries</span>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#10B981] text-white text-xs font-bold">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 text-xs font-bold hover:bg-white transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 text-xs font-bold hover:bg-white transition-colors">3</button>
              <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-white transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Quick Editor */}
      <aside className="w-80 bg-white border-l border-slate-100 p-6 flex flex-col gap-8 sticky top-0 h-screen overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Quick Editor</h2>
          <span className="px-2 py-1 bg-emerald-50 text-[#10B981] text-[9px] font-bold rounded uppercase tracking-wider">AI Suggestion Ready</span>
        </div>

        {/* Selected Post */}
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Currently Selected</p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-sm font-bold text-slate-900 mb-3 leading-relaxed">{selectedPost.title}</p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-[#10B981] h-full rounded-full transition-all duration-500" 
                style={{ width: `${selectedPost.seoScore}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold mb-4">
              <span className="text-slate-400">SEO Score</span>
              <span className="text-[#10B981]">{selectedPost.seoScore}%</span>
            </div>
            <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
              Full Editor Mode
            </button>
          </div>
        </div>

        {/* Meta Description */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meta Description</p>
            <button className="text-[#10B981] text-[10px] font-bold flex items-center gap-1 hover:underline">
              <Sparkles size={12} /> AI Rewrite
            </button>
          </div>
          <textarea 
            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-medium text-slate-600 leading-relaxed resize-none focus:ring-2 focus:ring-emerald-500/20"
            rows={4}
            defaultValue="Search Engine Optimization (SEO) has evolved far beyond simple keyword stuffing. In 2024, search engines like Google..."
          />
          <span className="text-[10px] font-medium text-slate-400 text-right">152/160 characters</span>
        </div>

        {/* Content Tags */}
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI-Generated Content Tags</p>
          <div className="flex flex-wrap gap-2">
            {['#seo_trends_2024', '#ai_optimization', '#growth_hacking'].map(tag => (
              <span key={tag} className="px-3 py-1.5 bg-emerald-50 text-[#10B981] text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                {tag} <Plus size={12} className="rotate-45" />
              </span>
            ))}
            <button className="px-3 py-1.5 border border-dashed border-slate-200 text-slate-400 text-[10px] font-bold rounded-lg flex items-center gap-1.5 hover:bg-slate-50 transition-colors">
              <Plus size={12} /> Add Tag
            </button>
          </div>
        </div>

        {/* Keyword Density */}
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Keyword Density</p>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-900">"SEO Audit"</span>
                <span className="text-[#10B981]">2.1% (Good)</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full w-[60%]" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-900">"AI SEO"</span>
                <span className="text-orange-500">0.4% (Low)</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full w-[20%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-3 pt-6 border-t border-slate-100">
          <button className="flex-1 py-3 bg-[#10B981] text-white rounded-xl font-bold text-sm hover:bg-[#059669] transition-all shadow-lg shadow-emerald-100">
            Save Changes
          </button>
          <button className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
            <Eye size={20} />
          </button>
        </div>

        {/* Pro Tip */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[9px] font-bold text-[#10B981] uppercase tracking-widest mb-2">Pro Tip</p>
            <h3 className="text-sm font-bold mb-2">Auto-Index Articles</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Enable instant Google Search Console indexing for all new posts.</p>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="bg-[#10B981] h-full w-[75%]" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 bg-[#10B981]/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-[#10B981]/20 transition-all" />
        </div>
      </aside>
    </div>
  );
}
