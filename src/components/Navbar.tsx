import { Link } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import GeminiStatusButton from "./GeminiStatusButton";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../i18n/I18nContext";
import { localizedPath } from "../i18n/locales";

export default function Navbar({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, locale } = useI18n();
  const toLocalized = (path: string) => localizedPath(path, locale);

  const seoToolMenu = [
    {
      label: "Site Audit",
      links: [
        { name: "CoreScan Engine", path: "/tools/corescan" },
        { name: "Technical Audit Tool", path: "/tools/technical" },
        { name: "InfraSEO Analysis", path: "/tools/infra" },
      ],
    },
    {
      label: "On-Page SEO",
      links: [
        { name: "On-Page SEO AI", path: "/tools/on-page" },
        { name: "Content Score", path: "/ai-seo-content-score" },
        { name: "SEO Rewriter", path: "/ai-seo-rewrite-tool" },
        { name: "AI Overview", path: "/ai-overview-optimizer" },
        { name: "SEO Strategy Plan", path: "/tools/strategy-plan" },
        { name: "Schema Generator", path: "/schema-generator" },
      ],
    },
    {
      label: "Off-Page SEO",
      links: [
        { name: "Off-Page SEO AI", path: "/tools/off-page" },
        { name: "Authority Radar", path: "/tools/authority" },
      ],
    },
    {
      label: "Keyword & SERP Tools",
      links: [
        { name: "AI Keyword Ideas", path: "/ai-keyword-ideas-tool" },
        { name: "Google Keyword Rank Checker", path: "/tools/google-keyword-rank-checker" },
        { name: "SERP Comparison Tool", path: "/tools/serp-comparison" },
        { name: "Keyword Cannibalization Checker", path: "/tools/keyword-cannibalization" },
        { name: "SERP Intent Analyzer", path: "/tools/serp-intent-analyzer" },
        { name: "Free SERP Database", path: "/tools/free-serp-database" },
      ],
    },
    {
      label: "Programmatic SEO",
      links: [
        { name: "SEO Statistics", path: "/seo-statistics" },
        { name: "AI SEO Statistics", path: "/ai-seo-statistics" },
        { name: "Link Building Statistics", path: "/link-building-statistics" },
        { name: "Local SEO Statistics", path: "/local-seo-statistics" },
        { name: "Content Marketing Statistics", path: "/content-marketing-statistics" },
        { name: "Google Ranking Statistics", path: "/google-ranking-statistics" },
      ],
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link to={toLocalized("/")} className="flex items-center gap-2 group">
              <img src="/logo.png" alt="InstantSEOScan  AI Powered SEO Audit & Analysis Platform" className="w-8 h-8 rounded-lg group-hover:rotate-12 transition-transform" />
              <span className="text-xl font-bold tracking-tight text-neutral-900">InstantSEOScan</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {user?.role === 'admin' && <GeminiStatusButton />}
            <Link to={toLocalized("/")} className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">{t("nav.home")}</Link>
            <div className="relative group">
              <button className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
                {t("nav.seo_tools")}
                <Menu size={14} />
              </button>
              <div className="absolute top-full left-0 mt-2 w-[22rem] max-h-[70vh] overflow-auto bg-white border border-neutral-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2">
                <div className="space-y-2">
                  {seoToolMenu.map((section) => (
                    <div key={section.label} className="border border-neutral-100 rounded-lg p-2">
                      <div className="px-2 py-1 text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                        {section.label}
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {section.links.map((item) => (
                          <Link
                            key={item.path}
                            to={toLocalized(item.path)}
                            className="p-2 hover:bg-emerald-50 rounded-lg text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Link to={toLocalized("/pricing")} className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">{t("nav.pricing")}</Link>
            <Link to={toLocalized("/blog")} className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">{t("nav.blog")}</Link>
            <LanguageSwitcher />
            {user ? (
              <div className="flex items-center gap-4">
                <Link to={toLocalized("/dashboard")} className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">{t("nav.dashboard")}</Link>
                {user.role === 'admin' && (
                  <Link to={toLocalized("/admin")} className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">{t("nav.admin")}</Link>
                )}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut size={16} />
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <Link
                to={toLocalized("/login?mode=register")}
                className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
              >
                {t("nav.get_started")}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher />
            <button onClick={() => setIsOpen(!isOpen)} className="text-neutral-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-neutral-200 px-4 py-6 space-y-4"
          >
            {user?.role === 'admin' && <GeminiStatusButton />}
            <Link to={toLocalized("/pricing")} className="block text-lg font-medium text-neutral-900" onClick={() => setIsOpen(false)}>{t("nav.pricing")}</Link>
            <Link to={toLocalized("/blog")} className="block text-lg font-medium text-neutral-900" onClick={() => setIsOpen(false)}>{t("nav.blog")}</Link>
            <div className="pt-2 border-t border-neutral-100">
              <div className="text-xs uppercase tracking-widest text-neutral-400 font-bold mb-2">SEO Tools</div>
              <div className="space-y-3 max-h-[50vh] overflow-auto pr-1">
                {seoToolMenu.map((section) => (
                  <div key={section.label} className="border border-neutral-100 rounded-lg p-2">
                    <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">
                      {section.label}
                    </div>
                    <div className="space-y-1">
                      {section.links.map((item) => (
                        <Link
                          key={item.path}
                          to={toLocalized(item.path)}
                          className="block text-sm font-medium text-neutral-900"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {user ? (
              <>
                <Link to={toLocalized("/dashboard")} className="block text-lg font-medium text-neutral-900" onClick={() => setIsOpen(false)}>{t("nav.dashboard")}</Link>
                {user.role === 'admin' && (
                  <Link to={toLocalized("/admin")} className="block text-lg font-medium text-neutral-900" onClick={() => setIsOpen(false)}>{t("nav.admin")}</Link>
                )}
                <button onClick={() => { onLogout(); setIsOpen(false); }} className="block text-lg font-medium text-red-600">{t("nav.logout")}</button>
              </>
            ) : (
              <Link to={toLocalized("/login?mode=register")} className="block w-full text-center bg-emerald-600 text-white py-3 rounded-xl font-medium" onClick={() => setIsOpen(false)}>{t("nav.get_started")}</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
