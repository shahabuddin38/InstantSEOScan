import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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

function Layout({ user, children }: { user: any, children: React.ReactNode }) {
  const location = useLocation();
  const publicPages = ['/', '/pricing', '/blog', '/about', '/contact', '/privacy', '/terms', '/sitemap', '/login'];

  // Strip locale prefix for public page checking
  const pathParts = location.pathname.split("/");
  const firstSeg = pathParts[1];
  const isLocalePrefixed = SUPPORTED_LOCALES.includes(firstSeg as any) && firstSeg !== "en";
  const effectivePath = isLocalePrefixed ? "/" + pathParts.slice(2).join("/") : location.pathname;

  const isPublicPage = publicPages.includes(effectivePath) || effectivePath.startsWith('/blog/');

  const showSidebar = user && !isPublicPage;

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

      <Route
        path="/admin"
        element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />}
      />
      <Route
        path="/adminaceess"
        element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />}
      />
    </>
  );

  return (
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
  );
}

function LocaleUrlSync() {
  const { locale } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const firstSeg = location.pathname.split("/")[1];
    const hasLocalePrefix = SUPPORTED_LOCALES.includes(firstSeg as any) && firstSeg !== "en";

    if (locale !== "en" && !hasLocalePrefix) {
      navigate(`${localizedPath(location.pathname, locale)}${location.search}${location.hash}`, { replace: true });
    }
  }, [locale, location.pathname, location.search, location.hash, navigate]);

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
    setUser(null);
  };

  return (
    <Router>
      <I18nProvider>
        <LocaleUrlSync />
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
