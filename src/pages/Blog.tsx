import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import { motion } from "motion/react";

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then(res => res.json())
      .then(data => {
        setPosts(data.length > 0 ? data : [
          { id: 1, title: "10 Technical SEO Mistakes That Are Killing Your Rankings", slug: "technical-seo-mistakes", content: "Learn how to fix the most common issues...", author: "SEO Expert", created_at: "2024-03-20" },
          { id: 2, title: "The Future of Search: How AI is Changing Everything", slug: "future-of-search-ai", content: "AI is no longer a buzzword, it's a necessity...", author: "AI Researcher", created_at: "2024-03-18" },
          { id: 3, title: "How to Build a Backlink Strategy from Scratch", slug: "backlink-strategy-guide", content: "Authority is still king. Here is how to get it...", author: "Link Builder", created_at: "2024-03-15" },
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">SEO Insights & Strategy</h1>
          <p className="text-neutral-600">The latest news, guides, and case studies from the world of search engine optimization.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input 
            type="text" 
            placeholder="Search articles..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-neutral-100 rounded-3xl h-96" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-3xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:shadow-neutral-200/50 transition-all"
            >
              <div className="h-48 bg-neutral-100 relative overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${post.slug}/800/600`} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  SEO Guide
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-4 text-xs text-neutral-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {post.author}
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-4 group-hover:text-emerald-600 transition-colors leading-tight">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-neutral-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {post.content}
                </p>
                <Link 
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:gap-3 transition-all"
                >
                  Read Article
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
