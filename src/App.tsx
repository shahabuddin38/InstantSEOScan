import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Search, Link as LinkIcon, BarChart, CreditCard, Menu, X, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Audit from './pages/Audit';
import Keyword from './pages/Keyword';
import Authority from './pages/Authority';
import Pricing from './pages/Pricing';
import Admin from './pages/Admin';

// App Layout Component  
function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setIsAdmin(userData.isAdmin || false);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Site Audit', path: '/app/audit', icon: Search },
    { name: 'Keyword Research', path: '/app/keyword', icon: BarChart },
    { name: 'Authority Checker', path: '/app/authority', icon: LinkIcon },
    { name: 'Pricing', path: '/app/pricing', icon: CreditCard },
    ...(isAdmin ? [{ name: 'Admin', path: '/app/admin', icon: Settings }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-emerald-400">InstantSEOScan</h1>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto w-full bg-slate-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Protected App Pages */}
        <Route
          path="/app"
          element={
            localStorage.getItem('token') ? (
              <AppLayout>
                <Dashboard />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/app/audit"
          element={
            localStorage.getItem('token') ? (
              <AppLayout>
                <Audit />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/app/keyword"
          element={
            localStorage.getItem('token') ? (
              <AppLayout>
                <Keyword />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/app/authority"
          element={
            localStorage.getItem('token') ? (
              <AppLayout>
                <Authority />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/app/pricing"
          element={
            localStorage.getItem('token') ? (
              <AppLayout>
                <Pricing />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/app/admin"
          element={
            localStorage.getItem('token') ? (
              <AppLayout>
                <Admin />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
