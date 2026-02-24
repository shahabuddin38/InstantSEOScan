import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function About() {
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
            <Link to="/about" className="text-emerald-400 transition">
              About
            </Link>
            <Link to="/contact" className="hover:text-emerald-400 transition">
              Contact
            </Link>
            <Link to="/pricing" className="hover:text-emerald-400 transition">
              Pricing
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">About InstantSEOScan</h1>
          <p className="text-xl text-slate-300">
            Empowering businesses with professional SEO tools and insights
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-slate-700 mb-4">
              InstantSEOScan is dedicated to providing professional-grade SEO tools that are
              accessible to businesses of all sizes. We believe that everyone should have access to
              accurate, real-time SEO data to make informed decisions about their digital presence.
            </p>
            <p className="text-lg text-slate-700">
              Our platform integrates with industry-leading APIs including Semrush, Moz, and others
              to deliver comprehensive keyword research, technical audits, and authority metrics in
              an easy-to-use interface.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">What We Offer</h2>
            <ul className="space-y-4 text-lg text-slate-700">
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-1">✓</span>
                <div>
                  <strong>Keyword Research</strong> - Discover high-value keywords with search volume,
                  difficulty, and CPC data
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-1">✓</span>
                <div>
                  <strong>Technical SEO Audits</strong> - Identify and fix technical issues affecting
                  your rankings
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-1">✓</span>
                <div>
                  <strong>Authority Checker</strong> - Check DA, PA, backlinks, and other key metrics
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-1">✓</span>
                <div>
                  <strong>Bulk Analysis</strong> - Check multiple domains at once for efficiency
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Our Company</h2>
            <div className="bg-slate-50 p-8 rounded-lg space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="text-emerald-500 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-lg">Office Address</h3>
                  <p className="text-slate-700">Shahab Uddin</p>
                  <p className="text-slate-700">Swat, KPK, Pakistan</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="text-emerald-500 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-lg">Phone Number</h3>
                  <p className="text-slate-700">+92 346 9366699</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="text-emerald-500 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-lg">Email Address</h3>
                  <p className="text-slate-700">shahabjan38@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Why SEO Matters</h2>
            <p className="text-lg text-slate-700 mb-4">
              In today's digital landscape, having a strong online presence is crucial for business
              success. Search engine optimization (SEO) ensures that your website is visible to
              potential customers searching for your products and services.
            </p>
            <p className="text-lg text-slate-700">
              Our tools help you understand the competitive landscape, identify opportunities, and
              implement strategies that drive real results. Whether you're a small business owner or
              a marketing professional, InstantSEOScan has the features you need to succeed.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-500 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Get Started?</h3>
          <Link
            to="/register"
            className="inline-block bg-white text-emerald-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold transition"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2026 InstantSEOScan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
