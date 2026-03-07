import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { I18nProvider, useI18n } from "./i18n/I18nContext";
import { SUPPORTED_LOCALES, localizedPath } from "./i18n/locales";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import ApiStatusBanner from "./components/ApiStatusBanner";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
import InstantSEOChatbot from "./components/InstantSEOChatbot";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Sitemap from "./pages/Sitemap";

// Tool Pages
import CoreScan from "./pages/tools/CoreScan";
import InfraSEO from "./pages/tools/InfraSEO";
import ContentScore from "./pages/tools/ContentScore";
import SEORewrite from "./pages/tools/SEORewrite";
import KeywordIdeas from "./pages/tools/KeywordIdeas";
import AIOverview from "./pages/tools/AIOverview";
import SEOStrategyPlan from "./pages/tools/SEOStrategyPlan";
import SchemaGenerator from "./pages/tools/SchemaGenerator";
import AuthorityRadar from "./pages/tools/AuthorityRadar";
import MCPSupport from "./pages/tools/MCPSupport";
import OnPageSEO from "./pages/OnPageSEO";
import OffPageSEO from "./pages/OffPageSEO";
import TechnicalAudit from "./pages/TechnicalAudit";
import { clearActivityHistory } from "./services/activityHistory";

const GoogleKeywordRankChecker = lazy(() => import("./pages/tools/GoogleKeywordRankChecker"));
const SERPComparisonTool = lazy(() => import("./pages/tools/SERPComparisonTool"));
const KeywordCannibalizationChecker = lazy(() => import("./pages/tools/KeywordCannibalizationChecker"));
const SERPIntentAnalyzer = lazy(() => import("./pages/tools/SERPIntentAnalyzer"));
const FreeSerpDatabase = lazy(() => import("./pages/tools/FreeSerpDatabase"));
const SEOStatisticsPage = lazy(() => import("./pages/SEOStatisticsPage"));
const ProgrammaticSEOPage = lazy(() => import("./pages/ProgrammaticSEOPage"));
const EmailOutreachAuto = lazy(() => import("./pages/tools/EmailOutreachAuto"));
const OutreachEngine = lazy(() => import("./pages/OutreachEngine"));

const PAGE_SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: "InstantSEOScan | AI Powered SEO Audit & Analysis Platform",
    description: "Analyze your website in seconds with InstantSEOScan.com. Get a free SEO audit, technical insights, on-page analysis, and actionable recommendations to improve rankings.",
  },
  "/pricing": {
    title: "SEO Tool Pricing Plans | InstantSEOScan",
    description: "Compare InstantSEOScan pricing plans for freelancers, agencies, and growth teams. Get powerful SEO audits, AI insights, and scalable reporting.",
  },
  "/blog": {
    title: "SEO Blog & Growth Guides | InstantSEOScan",
    description: "Read expert SEO guides, technical optimization tutorials, and AI-driven ranking strategies to grow organic traffic with InstantSEOScan.",
  },
  "/login": {
    title: "Sign In or Create Account | InstantSEOScan",
    description: "Access your InstantSEOScan account to run SEO audits, track website performance, and get AI-powered optimization recommendations.",
  },
  "/dashboard": {
    title: "SEO Dashboard | InstantSEOScan",
    description: "Monitor SEO scores, track issues, and review actionable technical and on-page recommendations from your InstantSEOScan dashboard.",
  },
  "/about": {
    title: "About InstantSEOScan | AI SEO Platform",
    description: "Learn how InstantSEOScan helps businesses improve search visibility with fast technical audits, AI analysis, and practical SEO workflows.",
  },
  "/contact": {
    title: "Contact InstantSEOScan Support",
    description: "Contact InstantSEOScan for product support, sales questions, and partnership inquiries. We help teams improve rankings faster.",
  },
  "/privacy": {
    title: "Privacy Policy | InstantSEOScan",
    description: "Review how InstantSEOScan collects, uses, and protects your information when you use our SEO audit and analysis platform.",
  },
  "/terms": {
    title: "Terms of Service | InstantSEOScan",
    description: "Read the InstantSEOScan terms and conditions for using our AI-powered SEO audit, reporting, and optimization tools.",
  },
  "/sitemap": {
    title: "Sitemap | InstantSEOScan",
    description: "Explore the complete sitemap of InstantSEOScan pages, tools, and resources for SEO auditing and website optimization.",
  },
  "/tools/corescan": {
    title: "CoreScan Technical SEO Auditor | InstantSEOScan",
    description: "Run a comprehensive technical SEO audit to detect crawlability issues, metadata gaps, and indexation risks with CoreScan.",
  },
  "/tools/on-page": {
    title: "On-Page SEO Analyzer | InstantSEOScan",
    description: "Optimize titles, descriptions, headings, keyword usage, and readability with AI-powered on-page SEO recommendations.",
  },
  "/tools/off-page": {
    title: "Off-Page SEO Insights | InstantSEOScan",
    description: "Improve authority signals, backlink strategy, and trust metrics using data-driven off-page SEO insights.",
  },
  "/tools/technical": {
    title: "Technical Audit Tools | InstantSEOScan",
    description: "Audit website performance, accessibility, and technical SEO signals to uncover high-impact ranking improvements.",
  },
  "/tools/infra": {
    title: "Infrastructure SEO Analyzer | InstantSEOScan",
    description: "Evaluate hosting and server-level SEO signals including performance, security, and technical stability factors.",
  },
  "/ai-seo-content-score": {
    title: "AI SEO Content Score Tool | InstantSEOScan",
    description: "Score and improve your content for SEO with AI-driven relevance, readability, and topical authority recommendations.",
  },
  "/ai-seo-rewrite-tool": {
    title: "AI SEO Rewrite Tool | InstantSEOScan",
    description: "Rewrite content for better rankings while preserving meaning, improving clarity, and strengthening keyword coverage.",
  },
  "/ai-keyword-ideas-tool": {
    title: "AI Keyword Ideas Generator | InstantSEOScan",
    description: "Discover high-intent keyword opportunities, semantic variations, and content topics to expand organic visibility.",
  },
  "/ai-overview-optimizer": {
    title: "AI Overview Optimizer | InstantSEOScan",
    description: "Optimize structured summaries and AI-ready content blocks to improve discoverability in modern search experiences.",
  },
  "/tools/strategy-plan": {
    title: "SEO Strategy Planner | InstantSEOScan",
    description: "Build a practical SEO roadmap with clear priorities across technical SEO, content optimization, and authority growth.",
  },
  "/schema-generator": {
    title: "Schema Markup Generator | InstantSEOScan",
    description: "Generate valid JSON-LD schema markup to enhance rich results eligibility and improve search appearance.",
  },
  "/tools/authority": {
    title: "Authority Radar | InstantSEOScan",
    description: "Track authority signals and competitive SEO position to make smarter decisions for long-term organic growth.",
  },
  "/tools/mcp": {
    title: "MCP SEO Support Tools | InstantSEOScan",
    description: "Use model-context SEO support tooling for advanced analysis workflows and technical optimization tasks.",
  },
  "/tools/google-keyword-rank-checker": {
    title: "Google Keyword Rank Checker | InstantSEOScan",
    description: "Check Google rankings, competitors, keyword difficulty, SERP overlap, and traffic potential.",
  },
  "/tools/serp-comparison": {
    title: "SERP Comparison Tool | InstantSEOScan",
    description: "Compare two keywords, detect SERP overlap, and pick the right content targeting strategy.",
  },
  "/tools/keyword-cannibalization": {
    title: "Keyword Cannibalization Checker | InstantSEOScan",
    description: "Identify competing pages for the same keyword and fix cannibalization fast.",
  },
  "/tools/serp-intent-analyzer": {
    title: "SERP Intent Analyzer | InstantSEOScan",
    description: "Detect search intent and top result content patterns for better ranking pages.",
  },
  "/tools/free-serp-database": {
    title: "Free SERP Database | InstantSEOScan",
    description: "Explore top Google results with title, description, backlinks, traffic, and word count estimates.",
  },
  "/tools/email-outreach-auto": {
    title: "AI Email Outreach Personalization | InstantSEOScan",
    description: "Instantly generate highly personalized cold SEO outreach emails with actionable audit results using Claude.",
  },
  "/seo-statistics": {
    title: "SEO Statistics 2026 | InstantSEOScan",
    description: "150+ SEO statistics with citation copy and auto-updating data snapshots.",
  },
  "/ai-seo-statistics": {
    title: "AI SEO Statistics 2026 | InstantSEOScan",
    description: "Latest AI SEO statistics for GEO, AI Overviews, and search visibility planning.",
  },
  "/link-building-statistics": {
    title: "Link Building Statistics 2026 | InstantSEOScan",
    description: "Updated link building statistics to improve authority and organic growth strategy.",
  },
  "/local-seo-statistics": {
    title: "Local SEO Statistics 2026 | InstantSEOScan",
    description: "Key local SEO statistics for map pack rankings and location-based organic traffic.",
  },
  "/content-marketing-statistics": {
    title: "Content Marketing Statistics 2026 | InstantSEOScan",
    description: "Content marketing statistics for ranking growth, engagement, and conversion impact.",
  },
  "/google-ranking-statistics": {
    title: "Google Ranking Statistics 2026 | InstantSEOScan",
    description: "Google ranking statistics to benchmark SEO performance and improve SERP position.",
  },
  "/admin": {
    title: "Admin Panel | InstantSEOScan",
    description: "Manage users, usage, content, and platform settings from the InstantSEOScan administration panel.",
  },
  "/outreach": {
    title: "AI Growth Engine & CRM | InstantSEOScan",
    description: "Discover SEO leads at scale, generate automated audit reports, and deploy personalized AI cold outreach emails.",
  },
};

function Layout({ user, children }: { user: any, children: React.ReactNode }) {
  const location = useLocation();
  const publicPages = ['/', '/pricing', '/blog', '/about', '/contact', '/privacy', '/terms', '/sitemap', '/login'];

  // Strip locale prefix for public page checking
  const pathParts = location.pathname.split("/");
  const firstSeg = pathParts[1];
  const isLocalePrefixed = SUPPORTED_LOCALES.includes(firstSeg as any) && firstSeg !== "en";
  const effectivePath = isLocalePrefixed ? "/" + pathParts.slice(2).join("/") : location.pathname;

  const isPublicPage = publicPages.includes(effectivePath) || effectivePath.startsWith('/blog/');

  const showSidebar = user && !isPublicPage && !effectivePath.startsWith('/admin');

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {showSidebar && <Sidebar />}
      <div className="flex-1 w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}

function AppRoutes({ user, setUser, handleLogout }: { user: any; setUser: any; handleLogout: () => void }) {
  const allRoutes = (
    <>
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/login" element={<Login onLogin={setUser} />} />
      <Route
        path="/dashboard"
        element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
      />
      <Route path="/report/:id" element={<Report />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/sitemap" element={<Sitemap />} />

      {/* Tool Routes */}
      <Route path="/tools/corescan" element={user ? <CoreScan /> : <Navigate to="/login" />} />
      <Route path="/tools/on-page" element={user ? <OnPageSEO /> : <Navigate to="/login" />} />
      <Route path="/tools/off-page" element={user ? <OffPageSEO /> : <Navigate to="/login" />} />
      <Route path="/tools/technical" element={user ? <TechnicalAudit /> : <Navigate to="/login" />} />
      <Route path="/tools/infra" element={user ? <InfraSEO /> : <Navigate to="/login" />} />
      <Route path="/ai-seo-content-score" element={user ? <ContentScore /> : <Navigate to="/login" />} />
      <Route path="/ai-seo-rewrite-tool" element={user ? <SEORewrite /> : <Navigate to="/login" />} />
      <Route path="/ai-keyword-ideas-tool" element={user ? <KeywordIdeas /> : <Navigate to="/login" />} />
      <Route path="/ai-overview-optimizer" element={user ? <AIOverview /> : <Navigate to="/login" />} />
      <Route path="/tools/strategy-plan" element={user ? <SEOStrategyPlan /> : <Navigate to="/login" />} />
      <Route path="/schema-generator" element={user ? <SchemaGenerator /> : <Navigate to="/login" />} />
      <Route path="/tools/authority" element={user ? <AuthorityRadar /> : <Navigate to="/login" />} />
      <Route path="/tools/mcp" element={user ? <MCPSupport /> : <Navigate to="/login" />} />
      <Route path="/tools/google-keyword-rank-checker" element={user ? <GoogleKeywordRankChecker /> : <Navigate to="/login" />} />
      <Route path="/tools/serp-comparison" element={user ? <SERPComparisonTool /> : <Navigate to="/login" />} />
      <Route path="/tools/keyword-cannibalization" element={user ? <KeywordCannibalizationChecker /> : <Navigate to="/login" />} />
      <Route path="/tools/serp-intent-analyzer" element={user ? <SERPIntentAnalyzer /> : <Navigate to="/login" />} />
      <Route path="/tools/free-serp-database" element={user ? <FreeSerpDatabase /> : <Navigate to="/login" />} />
      <Route path="/tools/email-outreach-auto" element={user ? <EmailOutreachAuto /> : <Navigate to="/login" />} />

      <Route path="/seo-statistics" element={<SEOStatisticsPage />} />
      <Route path="/ai-seo-statistics" element={<SEOStatisticsPage />} />
      <Route path="/link-building-statistics" element={<SEOStatisticsPage />} />
      <Route path="/local-seo-statistics" element={<SEOStatisticsPage />} />
      <Route path="/content-marketing-statistics" element={<SEOStatisticsPage />} />
      <Route path="/google-ranking-statistics" element={<SEOStatisticsPage />} />

      <Route path="/compare/:pair" element={<ProgrammaticSEOPage />} />
      <Route path="/keyword-data/:keyword" element={<ProgrammaticSEOPage />} />
      <Route path="/serp-analysis/:keyword" element={<ProgrammaticSEOPage />} />
      <Route path="/ranking/:keyword" element={<ProgrammaticSEOPage />} />

      <Route
        path="/admin"
        element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />}
      />
      <Route
        path="/adminaceess"
        element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />}
      />
      <Route
        path="/outreach"
        element={user?.role === 'admin' ? <OutreachEngine /> : <Navigate to="/" />}
      />
    </>
  );

  return (
    <Suspense fallback={<div className="p-8 text-sm text-neutral-500">Loading...</div>}>
      <Routes>
        {/* Default locale (en) — no prefix */}
        {allRoutes}
        {/* Locale-prefixed routes */}
        <Route path="/:locale/*" element={
          <Routes>
            {allRoutes}
          </Routes>
        } />
      </Routes>
    </Suspense>
  );
}

function LocaleUrlSync() {
  const { locale } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const firstSeg = location.pathname.split("/")[1];
    const hasLocalePrefix = SUPPORTED_LOCALES.includes(firstSeg as any) && firstSeg !== "en";
    const preferredLocale = localStorage.getItem("preferredLocale");
    const shouldKeepUnprefixedEnglish = preferredLocale === "en";

    if (locale !== "en" && !hasLocalePrefix && !shouldKeepUnprefixedEnglish) {
      navigate(`${localizedPath(location.pathname, locale)}${location.search}${location.hash}`, { replace: true });
    }
  }, [locale, location.pathname, location.search, location.hash, navigate]);

  return null;
}

function SeoMetaManager() {
  const location = useLocation();

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const firstSeg = pathParts[1];
    const isLocalePrefixed = SUPPORTED_LOCALES.includes(firstSeg as any) && firstSeg !== "en";
    const effectivePath = isLocalePrefixed ? `/${pathParts.slice(2).join("/")}` : location.pathname;

    const normalizedPath = effectivePath || "/";
    const isBlogPost = normalizedPath.startsWith("/blog/");
    const isReport = normalizedPath.startsWith("/report/");

    const seo = isBlogPost
      ? {
        title: "SEO Blog Post | InstantSEOScan",
        description: "Read in-depth SEO insights, practical optimization tactics, and ranking strategies from InstantSEOScan experts.",
      }
      : isReport
        ? {
          title: "SEO Audit Report | InstantSEOScan",
          description: "Review your detailed SEO audit report with technical findings, on-page opportunities, and clear next actions.",
        }
        : PAGE_SEO[normalizedPath] || PAGE_SEO["/"];

    document.title = seo.title;

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = seo.description;

    const canonicalHref = `${window.location.origin}${location.pathname}`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalHref;

    const upsert = (selector: string, attr: "name" | "property", value: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, selector.includes("property=") ? selector.match(/"([^"]+)"/)?.[1] || "" : selector.match(/"([^"]+)"/)?.[1] || "");
        document.head.appendChild(element);
      }
      element.content = value;
    };

    upsert('meta[property="og:title"]', "property", seo.title);
    upsert('meta[property="og:description"]', "property", seo.description);
    upsert('meta[property="og:url"]', "property", canonicalHref);
    upsert('meta[name="twitter:title"]', "name", seo.title);
    upsert('meta[name="twitter:description"]', "name", seo.description);
  }, [location.pathname]);

  return null;
}

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearActivityHistory();
    setUser(null);
  };

  return (
    <Router>
      <I18nProvider>
        <LocaleUrlSync />
        <SeoMetaManager />
        <ScrollToTop />
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
          <Navbar user={user} onLogout={handleLogout} />
          <ApiStatusBanner />
          <main className="pt-16 flex-1">
            <Layout user={user}>
              <AppRoutes user={user} setUser={setUser} handleLogout={handleLogout} />
            </Layout>
          </main>
          <Footer />
          <InstantSEOChatbot />
          <ScrollToTopButton />
        </div>
      </I18nProvider>
    </Router>
  );
}
