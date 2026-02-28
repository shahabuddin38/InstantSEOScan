import { Link } from "react-router-dom";
import { Search, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import GeminiStatusButton from "./GeminiStatusButton";

export default function Navbar({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                <Search size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-900">InstantSEOScan</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <GeminiStatusButton />
            <Link to="/" className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Home</Link>
            <div className="relative group">
              <button className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
                SEO TOOL
                <Menu size={14} />
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 grid grid-cols-1 gap-1">
                <Link to="/tools/corescan" className="p-2 hover:bg-emerald-50 rounded-lg text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">CoreScan Engine</Link>
                <Link to="/tools/on-page" className="p-2 hover:bg-emerald-50 rounded-lg text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">On-Page SEO AI</Link>
                <Link to="/tools/off-page" className="p-2 hover:bg-emerald-50 rounded-lg text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Off-Page SEO AI</Link>
                <Link to="/tools/technical" className="p-2 hover:bg-emerald-50 rounded-lg text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Technical Audit</Link>
                <Link to="/tools/infra" className="p-2 hover:bg-emerald-50 rounded-lg text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">InfraSEO Analysis</Link>
                <Link to="/ai-seo-content-score" className="p-2 hover:bg-emerald-50 rounded-lg text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Content Score</Link>
                <Link to="/ai-seo-rewrite-tool" className="p-2 hover:bg-emerald-50 rounded-lg text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">SEO Rewriter</Link>
                <Link to="/ai-keyword-ideas-tool" className="p-2 hover:bg-emerald-50 rounded-lg text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Keyword Ideas</Link>
                <Link to="/ai-overview-optimizer" className="p-2 hover:bg-emerald-50 rounded-lg text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">AI Overview</Link>
                <Link to="/schema-generator" className="p-2 hover:bg-emerald-50 rounded-lg text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Schema Generator</Link>
                <Link to="/tools/authority" className="p-2 hover:bg-emerald-50 rounded-lg text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Authority Radar</Link>
              </div>
            </div>
            <Link to="/pricing" className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Pricing</Link>
            <Link to="/blog" className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Blog</Link>
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Dashboard</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Admin</Link>
                )}
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login?mode=register" 
                className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
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
            <GeminiStatusButton />
            <Link to="/pricing" className="block text-lg font-medium text-neutral-900" onClick={() => setIsOpen(false)}>Pricing</Link>
            <Link to="/blog" className="block text-lg font-medium text-neutral-900" onClick={() => setIsOpen(false)}>Blog</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block text-lg font-medium text-neutral-900" onClick={() => setIsOpen(false)}>Dashboard</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block text-lg font-medium text-neutral-900" onClick={() => setIsOpen(false)}>Admin</Link>
                )}
                <button onClick={() => { onLogout(); setIsOpen(false); }} className="block text-lg font-medium text-red-600">Logout</button>
              </>
            ) : (
              <Link to="/login?mode=register" className="block w-full text-center bg-emerald-600 text-white py-3 rounded-xl font-medium" onClick={() => setIsOpen(false)}>Get Started</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
