import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent | any) => {
    e.preventDefault();
    // In a real app, this would send an email
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

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
            <Link to="/contact" className="text-emerald-400 transition">
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
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-slate-300">
            Have questions? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Send us a Message</h2>
            {submitted ? (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h3>
                <p className="text-slate-700">
                  We've received your message and will get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
            <div className="space-y-8">
              <div className="bg-slate-50 p-8 rounded-lg">
                <div className="flex items-start gap-4 mb-6">
                  <Mail className="text-emerald-500 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Email</h3>
                    <p className="text-slate-700">shahabjan38@gmail.com</p>
                    <p className="text-slate-600 text-sm mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <Phone className="text-emerald-500 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Phone</h3>
                    <p className="text-slate-700">+92 346 9366699</p>
                    <p className="text-slate-600 text-sm mt-1">Mon-Fri, 9am-5pm PKT</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="text-emerald-500 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Address</h3>
                    <p className="text-slate-700">Shahab Uddin</p>
                    <p className="text-slate-700">Swat, KPK, Pakistan</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-200 p-8 rounded-lg">
                <h3 className="font-bold text-lg mb-4">Sales Sales Support</h3>
                <p className="text-slate-700 mb-4">
                  Interested in learning more about our plans? Our sales team can help you find the
                  perfect solution for your needs.
                </p>
                <Link
                  to="/pricing"
                  className="text-emerald-600 font-semibold hover:text-emerald-700 transition"
                >
                  View Pricing Plans →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-2">How do I get started?</h3>
              <p className="text-slate-700">
                Simply sign up for an account on our platform. After admin approval, you'll have access
                to all the tools based on your chosen plan.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-slate-700">
                Yes! You can upgrade or downgrade your subscription at any time. The admin can also
                manage your subscription from the admin panel.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-2">Do you offer a free trial?</h3>
              <p className="text-slate-700">
                Yes, we offer a free trial period. Contact us for details on how to get started with a trial.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-700">
                We accept all major credit cards and other payment methods. Contact our sales team for
                specific details.
              </p>
            </div>
          </div>
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
