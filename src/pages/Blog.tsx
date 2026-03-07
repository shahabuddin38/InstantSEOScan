import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { apiRequest } from "../services/apiClient";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: string;
  createdAt?: string;
  created_at?: string;
};

const POSTS_PER_PAGE = 15;

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const getAuthorLabel = (author?: string) => {
    const value = (author || "").trim();
    if (!value) return "Admin";
    return value.toLowerCase() === "ai writer" ? "Admin" : value;
  };

  const loadPosts = async (p = 1) => {
    setLoading(true);
    const result = await apiRequest<any>(`/api/blog?page=${p}&limit=${POSTS_PER_PAGE}`);
    setLoading(false);
    if (result.ok && result.data && Array.isArray(result.data.posts)) {
      setPosts(result.data.posts);
      setTotal(result.data.total ?? result.data.posts.length);
      setTotalPages(result.data.totalPages ?? 1);
    } else {
      // fallback for old API shape (array)
      if (result.ok && Array.isArray(result.data)) {
        setPosts(result.data.slice(0, POSTS_PER_PAGE));
        setTotalPages(1);
      }
    }
  };

  useEffect(() => { loadPosts(1); }, []);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    loadPosts(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredPosts = search.trim()
    ? posts.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.excerpt || "").toLowerCase().includes(search.toLowerCase())
      )
    : posts;

  // Page number buttons: show up to 5 around current page
  const pageButtons = () => {
    const pages: number[] = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">SEO Insights &amp; Strategy</h1>
          <p className="text-neutral-600">The latest news, guides, and case studies from the world of search engine optimization.</p>
          {total > 0 && (
            <p className="text-sm text-neutral-400 mt-2">{total} articles &mdash; page {page} of {totalPages}</p>
          )}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-neutral-100 rounded-3xl h-96" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredPosts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-3xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:shadow-neutral-200/50 transition-all"
              >
                <div className="h-48 bg-neutral-100 relative overflow-hidden">
                  <img
                    src={post.coverImage || `https://picsum.photos/seed/${post.slug}/800/600`}
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
                      {new Date(post.createdAt || post.created_at || new Date().toISOString()).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      {getAuthorLabel(post.author)}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-4 group-hover:text-emerald-600 transition-colors leading-tight">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-neutral-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {post.excerpt || post.content}
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

          {/* Pagination */}
          {!search.trim() && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} /> Prev
              </button>

              {page > 3 && (
                <>
                  <button onClick={() => goToPage(1)} className="w-10 h-10 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 hover:border-emerald-400 hover:text-emerald-600 transition-all">1</button>
                  {page > 4 && <span className="text-neutral-400 px-1">&hellip;</span>}
                </>
              )}

              {pageButtons().map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-10 h-10 rounded-xl border text-sm font-bold transition-all ${
                    p === page
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-emerald-400 hover:text-emerald-600"
                  }`}
                >
                  {p}
                </button>
              ))}

              {page < totalPages - 2 && (
                <>
                  {page < totalPages - 3 && <span className="text-neutral-400 px-1">&hellip;</span>}
                  <button onClick={() => goToPage(totalPages)} className="w-10 h-10 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 hover:border-emerald-400 hover:text-emerald-600 transition-all">{totalPages}</button>
                </>
              )}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
