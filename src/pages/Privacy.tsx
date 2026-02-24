import { Link } from 'react-router-dom';

export default function Privacy() {
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
            <Link to="#" className="text-emerald-400 transition">
              Privacy
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto prose max-w-none">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-slate-600 mb-8">Last updated: February 25, 2026</p>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-slate-700 mb-4">
                InstantSEOScan ("Company," "we," "us," "our," or "the Platform") is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you visit our website and use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <p className="text-slate-700 mb-4">We may collect information about you in a variety of ways:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Personal Information:</strong> Name, email address, phone number, billing address</li>
                <li><strong>Account Information:</strong> Username, password, subscription details</li>
                <li><strong>Usage Data:</strong> How you interact with our platform, features used, time spent</li>
                <li><strong>Technical Information:</strong> IP address, browser type, device information</li>
                <li><strong>Analytics Data:</strong> Information about your use of our services</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-slate-700 mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Provide and maintain our services</li>
                <li>Process transactions and send related information</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Monitor and analyze usage and trends</li>
                <li>Detect and prevent fraud and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">4. Sharing of Information</h2>
              <p className="text-slate-700 mb-4">
                We do not share your personal information with third parties except in the following cases:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>With service providers who assist us in operating our website and conducting our business</li>
                <li>When required by law or legal process</li>
                <li>To protect the rights, privacy, safety, or property of the Company, users, or the public</li>
                <li>In connection with any merger, sale, or acquisition of our business</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
              <p className="text-slate-700 mb-4">
                We implement appropriate technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction. However, no
                method of transmission over the Internet or electronic storage is completely secure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
              <p className="text-slate-700 mb-4">
                Depending on your location, you may have the following rights regarding your personal
                information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate personal information</li>
                <li>The right to delete your personal information</li>
                <li>The right to restrict processing of your information</li>
                <li>The right to data portability</li>
                <li>The right to opt-out of certain processing</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">7. Cookies</h2>
              <p className="text-slate-700 mb-4">
                Our website and services may use cookies and similar tracking technologies to enhance your
                experience, remember your preferences, and understand how you use our platform. You can
                control cookie settings through your browser.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
              <p className="text-slate-700 mb-4">
                Our services are not intended for users under the age of 13. We do not knowingly collect
                personal information from children under 13. If we become aware that we have collected
                information from a child under 13, we will delete such information promptly.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">9. Changes to This Privacy Policy</h2>
              <p className="text-slate-700 mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices,
                technology, legal requirements, or other factors. We will notify you of any material changes
                by posting the new Privacy Policy on our website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
              <p className="text-slate-700 mb-4">
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="bg-slate-50 p-6 rounded-lg text-slate-700">
                <p><strong>InstantSEOScan</strong></p>
                <p>Email: shahabjan38@gmail.com</p>
                <p>Phone: +92 346 9366699</p>
                <p>Address: Swat, KPK, Pakistan</p>
              </div>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 p-8 rounded-lg mt-12">
              <h3 className="text-xl font-bold mb-4">Your Privacy Matters</h3>
              <p className="text-slate-700">
                We respect your privacy and are committed to being transparent about our practices. If you
                have any concerns about how we handle your information, please don't hesitate to contact us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-6 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2026 InstantSEOScan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
