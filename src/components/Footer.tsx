import { Link } from "react-router-dom";
import { Linkedin, Facebook, MessageCircle, Mail, Phone, MapPin, Shield } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../i18n/I18nContext";
import { localizedPath } from "../i18n/locales";

export default function Footer() {
  const { locale } = useI18n();
  const toLocalized = (path: string) => localizedPath(path, locale);

  return (
    <footer className="bg-white border-t border-neutral-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <Link to={toLocalized("/")} className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="InstantSEOScan  AI Powered SEO Audit & Analysis Platform" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold tracking-tight text-neutral-900">InstantSEOScan</span>
            </Link>
            <p className="text-neutral-500 max-w-xs mb-6 leading-relaxed">
              The ultimate SEO audit platform for modern digital teams. Audit, optimize, and rank faster.
            </p>
            <div className="space-y-3 mb-6 text-sm text-neutral-600">
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-emerald-600" />
                <span>shahabjan38@gmail.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-emerald-600" />
                <span>+92 346 9366699</span>
              </p>
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
              <li><Link to={toLocalized("/pricing")} className="text-neutral-500 hover:text-emerald-600 transition-colors">Pricing</Link></li>
              <li><Link to={toLocalized("/dashboard")} className="text-neutral-500 hover:text-emerald-600 transition-colors">Features</Link></li>
              <li><Link to={toLocalized("/blog")} className="text-neutral-500 hover:text-emerald-600 transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to={toLocalized("/about")} className="text-neutral-500 hover:text-emerald-600 transition-colors">About</Link></li>
              <li><Link to={toLocalized("/contact")} className="text-neutral-500 hover:text-emerald-600 transition-colors">Contact</Link></li>
              <li><Link to={toLocalized("/sitemap")} className="text-neutral-500 hover:text-emerald-600 transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-6">Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link to={toLocalized("/privacy")} className="text-neutral-500 hover:text-emerald-600 transition-colors inline-flex items-center gap-2">
                  <Shield size={15} className="text-emerald-600" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li><Link to={toLocalized("/terms")} className="text-neutral-500 hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
              <li className="text-neutral-500 inline-flex items-center gap-2">
                <MapPin size={15} className="text-emerald-600" />
                <span>Swat, KPK, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-400">
            © {new Date().getFullYear()} InstantSEOScan. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <LanguageSwitcher openUp />
            <span>Built with ❤️ for SEOs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
