import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function AuthorityRadar() {
  return (
    <div className="flex bg-neutral-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 max-w-7xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-8">
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm max-w-3xl mx-auto mt-12">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction size={48} className="text-emerald-600" />
          </div>
          <h1 className="text-4xl font-black text-neutral-900 mb-4 tracking-tight">Authority Radar</h1>
          <p className="text-xl text-neutral-500 mb-8">
            Advanced Domain Authority (DA), Page Authority (PA), and Spam Score tracking are coming soon.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-600 rounded-full text-sm font-bold uppercase tracking-widest">
            In Development
          </div>
        </div>
      </div>
    </div>
  );
}
