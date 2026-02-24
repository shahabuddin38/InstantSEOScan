import { Link } from 'react-router-dom';

export default function Terms() {
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
              Terms
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto prose max-w-none">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-slate-600 mb-8">Last updated: February 25, 2026</p>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
              <p className="text-slate-700 mb-4">
                These Terms of Service constitute a legal agreement between you ("User," "you," or "your")
                and InstantSEOScan ("Company," "we," "us," or "our"). By accessing or using our platform,
                you agree to be bound by these terms. If you do not agree to any part of these terms, you
                may not use our service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">2. Intellectual Property Rights</h2>
              <p className="text-slate-700 mb-4">
                The Platform and its entire contents, features, and functionality (including but not limited
                to all information, software, text, displays, images, video, and audio) are owned by the
                Company, its licensors, or other providers of such material and are protected by United
                States and international copyright, trademark, and other intellectual property laws.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
              <p className="text-slate-700 mb-4">
                You agree not to use the Platform for any unlawful purpose or in any way that could damage,
                disable, or impair it. You further agree not to attempt to gain unauthorized access to any
                portion of the Platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">4. Limitation of Liability</h2>
              <p className="text-slate-700 mb-4">
                To the fullest extent permitted by law, in no event shall the Company be LIABLE for any
                indirect, incidental, special, consequential, or punitive damages resulting from your use
                or inability to use the Platform or any services provided.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">5. Subscription and Payment</h2>
              <p className="text-slate-700 mb-4">
                Your subscription will automatically renew unless you cancel it. You are responsible for
                all charges incurred. The Company reserves the right to change pricing with 30 days' notice.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">6. Termination</h2>
              <p className="text-slate-700 mb-4">
                The Company may terminate or suspend your account immediately, without prior notice or
                liability, for any reason whatsoever, including if you breach these Terms of Service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">7. Changes to Terms</h2>
              <p className="text-slate-700 mb-4">
                The Company reserves the right to modify these Terms at any time. Your continued use of the
                Platform following the posting of revised Terms means that you accept and agree to the
                changes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">8. Governing Law</h2>
              <p className="text-slate-700 mb-4">
                These Terms of Service and any separate agreements we may enter into with you are governed
                by and construed in accordance with the laws of Pakistan.
              </p>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 p-8 rounded-lg mt-12">
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="text-slate-700">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-slate-700 mt-4">
                Email: shahabjan38@gmail.com<br />
                Phone: +92 346 9366699
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
