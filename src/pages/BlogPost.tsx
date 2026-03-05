import { useState, useEffect, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { apiRequest } from "../services/apiClient";

type BlogBlock = {
  id?: string;
  type: "h1" | "h2" | "h3" | "paragraph" | "quote" | "list" | "image" | "cta";
  text?: string;
  url?: string;
  alt?: string;
};

type BlogPostType = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  createdAt?: string;
  created_at?: string;
  read_time?: string;
  category?: string;
  blocks?: BlogBlock[];
};

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  const getAuthorLabel = (author?: string) => {
    const value = (author || "").trim();
    if (!value) return "Admin";
    return value.toLowerCase() === "ai writer" ? "Admin" : value;
  };

  const renderInlineAnchors = (text: string) => {
    const pattern = /<a\s+href=["']([^"']+)["'](?:\s+target=["']([^"']+)["'])?[^>]*>(.*?)<\/a>/gi;
    const nodes: ReactNode[] = [];
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const [full, href, target, label] = match;
      const start = match.index;
      const end = start + full.length;

      if (start > cursor) {
        nodes.push(text.slice(cursor, start));
      }

      const safeTarget = target === "_blank" ? "_blank" : "_self";
      nodes.push(
        <a
          key={`${href}-${start}`}
          href={href}
          target={safeTarget}
          rel={safeTarget === "_blank" ? "noopener noreferrer" : undefined}
          className="text-emerald-600 hover:text-emerald-700 underline"
        >
          {label}
        </a>
      );

      cursor = end;
    }

    if (cursor < text.length) {
      nodes.push(text.slice(cursor));
    }

    return nodes.length > 0 ? nodes : [text];
  };

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      const result = await apiRequest<BlogPostType>(`/api/blog/${slug}`);
      if (!result.ok || !result.data) {
        setPost(null);
        setLoading(false);
        return;
      }

      setPost(result.data);
      setLoading(false);
    };

    loadPost();
  }, [slug]);

  const renderBlock = (block: BlogBlock, index: number) => {
    const key = block.id || `${block.type}-${index}`;
    const text = block.text || "";

    if (block.type === "h1") return <h1 key={key} className="text-3xl md:text-4xl font-black text-neutral-900 mt-8 mb-4">{renderInlineAnchors(text)}</h1>;
    if (block.type === "h2") return <h2 key={key} className="text-2xl md:text-3xl font-bold text-neutral-900 mt-8 mb-4">{renderInlineAnchors(text)}</h2>;
    if (block.type === "h3") return <h3 key={key} className="text-xl md:text-2xl font-bold text-neutral-900 mt-6 mb-3">{renderInlineAnchors(text)}</h3>;
    if (block.type === "quote") return <blockquote key={key} className="border-l-4 border-emerald-500 pl-4 italic text-neutral-700 my-6">{renderInlineAnchors(text)}</blockquote>;
    if (block.type === "list") {
      const items = text.split("\n").map((item) => item.trim()).filter(Boolean);
      return (
        <ul key={key} className="list-disc pl-6 my-4 space-y-1 text-neutral-700">
          {items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{renderInlineAnchors(item)}</li>)}
        </ul>
      );
    }
    if (block.type === "image") {
      if (!block.url) return null;
      return (
        <figure key={key} className="my-8">
          <img src={block.url} alt={block.alt || "Blog image"} className="w-full rounded-2xl border border-neutral-200" referrerPolicy="no-referrer" />
          {block.alt && <figcaption className="text-xs text-neutral-500 mt-2">{block.alt}</figcaption>}
        </figure>
      );
    }
    if (block.type === "cta") {
      return (
        <div key={key} className="my-8 p-5 rounded-2xl bg-emerald-50 border border-emerald-100 font-bold text-emerald-800">
          {text}
        </div>
      );
    }
    return <p key={key} className="text-neutral-700 leading-relaxed mb-4">{renderInlineAnchors(text)}</p>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16 text-center px-4">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Post Not Found</h1>
        <p className="text-neutral-500 mb-8">The article you are looking for does not exist or has been moved.</p>
        <Link to="/blog" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">
          Back to Blog
        </Link>
      </div>
    );
  }

  const shareUrl = window.location.href;

  return (
    <div className="bg-neutral-50 min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to all articles
        </Link>

        <article className="bg-white rounded-3xl p-8 md:p-12 border border-neutral-200 shadow-sm">
          <div className="mb-8">
            <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
              {post.category || "SEO Guide"}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500 border-b border-neutral-100 pb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                  <User size={14} />
                </div>
                <span className="font-medium text-neutral-900">{getAuthorLabel(post.author)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {new Date(post.createdAt || post.created_at || new Date().toISOString()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {post.read_time || "5 min read"}
              </div>
            </div>
          </div>

          {Array.isArray(post.blocks) && post.blocks.length > 0 ? (
            <div className="max-w-none">
              {post.blocks.map((block, index) => renderBlock(block, index))}
            </div>
          ) : (
            <div className="prose prose-lg prose-emerald max-w-none prose-headings:font-bold prose-a:text-emerald-600 hover:prose-a:text-emerald-700">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-bold text-neutral-900">Share this article:</span>
            <div className="flex gap-3">
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-blue-400 hover:bg-blue-50 transition-all">
                <Twitter size={18} />
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Facebook size={18} />
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-blue-700 hover:bg-blue-50 transition-all">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
