import { Mail, MessageSquare, MapPin, Send } from "lucide-react";

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-3xl mx-auto text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Get in Touch</h1>
        <p className="text-xl text-neutral-600">Have questions? We're here to help you grow your organic traffic.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-12">
          <div className="flex gap-6">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-neutral-500 mb-2">For general inquiries and support:</p>
              <a href="mailto:support@instantseoscan.com" className="text-emerald-600 font-bold hover:underline">support@instantseoscan.com</a>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Live Chat</h3>
              <p className="text-neutral-500 mb-4">Available Mon-Fri, 9am - 5pm EST.</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all">
                Start Chat
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Our Office</h3>
              <p className="text-neutral-500">
                123 SEO Way, Suite 400<br />
                San Francisco, CA 94103
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-xl">
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Full Name</label>
                <input type="text" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Email Address</label>
                <input type="email" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="john@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Subject</label>
              <input type="text" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="How can we help?" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Message</label>
              <textarea rows={5} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="Your message here..."></textarea>
            </div>
            <button className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
              Send Message
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
