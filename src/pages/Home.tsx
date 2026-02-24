import { Link } from 'react-router-dom';
import { Search, Zap, BarChart3, CheckCircle2, ArrowRight, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-slate-900 text-white py-4 px-6 sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-400">InstantSEOScan</h1>
          <div className="flex gap-6 items-center">
            <Link to="/" className="hover:text-emerald-400 transition">
              Home
            </Link>
            <Link to="/about" className="hover:text-emerald-400 transition">
              About
            </Link>
            <Link to="/contact" className="hover:text-emerald-400 transition">
              Contact
            </Link>
            <Link to="/pricing" className="hover:text-emerald-400 transition">
              Pricing
            </Link>
            <Link
              to="/login"
              className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 rounded-lg transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Comprehensive SEO Tools for Your Website
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Analyze, optimize, and rank better with our advanced SEO platform. Get real-time insights,
            keyword research, technical audits, and authority metrics.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link
              to="/pricing"
              className="border-2 border-emerald-400 hover:bg-emerald-400/10 text-emerald-400 px-8 py-3 rounded-lg font-semibold transition"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-16">Powerful Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
              <Search className="text-emerald-500 mb-4" size={40} />
              <h4 className="text-xl font-bold mb-3">Keyword Research</h4>
              <p className="text-slate-600">
                Find high-value keywords with search volume, difficulty, and CPC data powered by Semrush API.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
              <BarChart3 className="text-emerald-500 mb-4" size={40} />
              <h4 className="text-xl font-bold mb-3">Site Audit</h4>
              <p className="text-slate-600">
                Comprehensive technical SEO audits to identify and fix issues affecting your rankings.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
              <Zap className="text-emerald-500 mb-4" size={40} />
              <h4 className="text-xl font-bold mb-3">Authority Checker</h4>
              <p className="text-slate-600">
                Check Domain Authority, Page Authority, backlinks, and more using Moz and Ahrefs data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-16">Why Choose InstantSEOScan?</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              'Real-time SEO data from industry-leading APIs',
              'Easy-to-use interface for all skill levels',
              'Comprehensive technical SEO audit reports',
              'Bulk domain authority checking',
              'Detailed keyword research insights',
              'Admin panel for team management'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={24} />
                <p className="text-lg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-500 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Improve Your SEO?</h3>
          <p className="text-xl mb-8">
            Start with our free trial and see the difference professional SEO tools can make.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-emerald-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold transition"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-white font-bold mb-4">InstantSEOScan</h4>
            <p className="text-sm">Professional SEO tools for modern marketers and agencies.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/pricing" className="hover:text-emerald-400 transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition">
                  Features
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="hover:text-emerald-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-emerald-400 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 text-center text-sm">
          <p>&copy; 2026 InstantSEOScan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
