import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from API by slug
    // For now, we use mock data matching the blog list
    const mockPosts = [
      { 
        id: 1, 
        title: "10 Technical SEO Mistakes That Are Killing Your Rankings", 
        slug: "technical-seo-mistakes", 
        content: `
# 10 Technical SEO Mistakes That Are Killing Your Rankings

Technical SEO is the foundation of any successful search strategy. If search engines can't crawl, render, and index your pages correctly, all your content and link-building efforts will be in vain.

Here are the top 10 technical SEO mistakes you need to avoid:

## 1. Blocking Search Engines in robots.txt
It sounds obvious, but you'd be surprised how often a stray \`Disallow: /\` makes it to production. Always double-check your robots.txt file.

## 2. Slow Page Speed
Core Web Vitals are a ranking factor. If your site takes more than 3 seconds to load, you are losing traffic and rankings. Optimize images, minify CSS/JS, and use a CDN.

## 3. Improper Use of Canonical Tags
Duplicate content can confuse search engines. Use canonical tags to point to the master version of a page.

## 4. Broken Links (404s)
Internal and external broken links create a poor user experience and waste crawl budget.

## 5. Missing XML Sitemaps
Sitemaps help search engines discover your content faster. Ensure your sitemap is up-to-date and submitted to Google Search Console.

## Conclusion
Fixing these technical issues will provide a solid foundation for your SEO efforts. Use our CoreScan Engine to identify these problems automatically.
        `, 
        author: "SEO Expert", 
        created_at: "2024-03-20",
        read_time: "5 min read",
        category: "Technical SEO"
      },
      { 
        id: 2, 
        title: "The Future of Search: How AI is Changing Everything", 
        slug: "future-of-search-ai", 
        content: `
# The Future of Search: How AI is Changing Everything

Artificial Intelligence is fundamentally altering how search engines understand queries and rank content. From Google's SGE (Search Generative Experience) to AI-driven content creation, the landscape is shifting rapidly.

## The Rise of SGE
Google's Search Generative Experience aims to answer user queries directly in the SERP using generative AI. This means zero-click searches will likely increase for informational queries.

## How to Adapt
To survive in an AI-first search world, your content must offer unique perspectives, deep expertise, and first-hand experience (the 'E' in E-E-A-T).

## AI Content Generation
While AI can help scale content production, relying solely on unedited AI content is risky. Search engines are getting better at identifying low-quality, mass-produced text.

Embrace AI as an assistant, not a replacement for human creativity and expertise.
        `, 
        author: "AI Researcher", 
        created_at: "2024-03-18",
        read_time: "8 min read",
        category: "AI & Search"
      },
      { 
        id: 3, 
        title: "How to Build a Backlink Strategy from Scratch", 
        slug: "backlink-strategy-guide", 
        content: `
# How to Build a Backlink Strategy from Scratch

Backlinks remain one of the top ranking factors in Google's algorithm. But how do you build them if you're starting from zero?

## 1. Create Linkable Assets
People link to great content. Create original research, comprehensive guides, or free tools that naturally attract links.

## 2. Guest Posting
Reach out to authoritative blogs in your niche and offer to write high-quality guest posts. Ensure the site has genuine traffic and engagement.

## 3. Broken Link Building
Find broken links on relevant websites and suggest your content as a replacement. It's a win-win: you get a link, and they fix a broken page.

## 4. Digital PR
Create newsworthy content and pitch it to journalists and industry publications.

Building authority takes time, but a consistent, quality-focused approach will yield long-term results.
        `, 
        author: "Link Builder", 
        created_at: "2024-03-15",
        read_time: "6 min read",
        category: "Off-Page SEO"
      },
    ];

    const foundPost = mockPosts.find(p => p.slug === slug);
    setPost(foundPost);
    setLoading(false);
  }, [slug]);

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
              {post.category}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500 border-b border-neutral-100 pb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                  <User size={14} />
                </div>
                <span className="font-medium text-neutral-900">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {post.read_time}
              </div>
            </div>
          </div>

          <div className="prose prose-lg prose-emerald max-w-none prose-headings:font-bold prose-a:text-emerald-600 hover:prose-a:text-emerald-700">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

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
