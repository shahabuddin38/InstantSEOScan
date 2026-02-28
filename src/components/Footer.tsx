import { Link } from "react-router-dom";
import { Search, Github, Twitter, Linkedin, Facebook, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <Search size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-900">InstantSEOScan</span>
            </Link>
            <p className="text-neutral-500 max-w-xs mb-6 leading-relaxed">
              The ultimate SEO audit platform for modern digital teams. Audit, optimize, and rank faster.
            </p>
            <div className="space-y-2 mb-6 text-sm text-neutral-500">
              <p>Email: shahabjan38@gmail.com</p>
              <p>Phone: +923469366699</p>
              <p>Address: Swat, KPK, Pakistan</p>
            </div>
            <div className="flex gap-4">
              <a href="https://www.linkedin.com/in/shahab-uddin-44618324b/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                <Linkedin size={18} />
              </a>
              <a href="https://www.facebook.com/shahab.uddin38" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                <Facebook size={18} />
              </a>
              <a href="https://wa.me/+923469366699" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link to="/pricing" className="text-neutral-500 hover:text-emerald-600 transition-colors">Pricing</Link></li>
              <li><Link to="/dashboard" className="text-neutral-500 hover:text-emerald-600 transition-colors">Features</Link></li>
              <li><Link to="/blog" className="text-neutral-500 hover:text-emerald-600 transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-neutral-500 hover:text-emerald-600 transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-neutral-500 hover:text-emerald-600 transition-colors">Contact</Link></li>
              <li><Link to="/sitemap" className="text-neutral-500 hover:text-emerald-600 transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-neutral-500 hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-neutral-500 hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-400">
            © {new Date().getFullYear()} InstantSEOScan. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-neutral-400">
            <span>Built with ❤️ for SEOs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
