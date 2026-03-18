import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UserIcon, 
  UserGroupIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  StarIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

import api from "../api/axios";

const allRoles = []; // Place for custom roles if needed later

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { username, password });
      const data = response.data;
      
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Network error during session initialization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3FF] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lilac-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lilac-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-md w-full relative z-10">
        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-6 shadow-[0_20px_50px_rgba(200,162,255,0.3)] border border-lilac-border group hover:scale-110 transition-transform duration-500">
            <BuildingOfficeIcon className="w-10 h-10 text-lilac-primary group-hover:rotate-12 transition-transform"/>
          </div>
          <h1 className="text-4xl font-black text-lilac-text tracking-tighter uppercase mb-2">
            Workflow<span className="text-lilac-primary">OS</span>
          </h1>
          <p className="text-lilac-muted font-bold uppercase tracking-widest text-[10px] opacity-70 italic">
            Unified Automation Infrastructure
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(200,162,255,0.2)] overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-lilac-primary via-lilac-accent to-lilac-primary animate-gradient-x"></div>
          
          <form onSubmit={handleLogin} className="p-10 space-y-8">

            <div className="space-y-6">
              {/* USERNAME */}
              <div>
                <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] mb-2 px-1">
                  Operative Identity
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lilac-muted group-focus-within:text-lilac-primary transition-colors">
                    <UserIcon className="w-5 h-5"/>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username..."
                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-lilac-border rounded-2xl outline-none focus:ring-4 focus:ring-lilac-primary/10 focus:border-lilac-primary transition-all font-bold text-lilac-text placeholder:text-lilac-muted/40"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] mb-2 px-1">
                  Security Protocol
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lilac-muted group-focus-within:text-lilac-primary transition-colors">
                    <ShieldCheckIcon className="w-5 h-5"/>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Passcode..."
                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-lilac-border rounded-2xl outline-none focus:ring-4 focus:ring-lilac-primary/10 focus:border-lilac-primary transition-all font-bold text-lilac-text placeholder:text-lilac-muted/40"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl flex items-center shadow-sm">
                <ExclamationTriangleIcon className="w-5 h-5 mr-3 flex-shrink-0"/>
                <span className="text-xs font-black uppercase tracking-wider">{error}</span>
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-5 bg-lilac-text text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-[0_20px_40px_-10px_rgba(58,46,79,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(58,46,79,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-lilac-primary to-lilac-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10">{loading ? "Synchronizing..." : "Initialize Session"}</span>
            </button>

            {/* NEW COMPANY SIGNUP */}
            <div className="text-center pt-2">
              <p className="text-[10px] font-black text-lilac-muted uppercase tracking-widest">
                New Company? <button type="button" onClick={() => navigate('/signup')} className="text-lilac-primary hover:underline ml-1 font-bold">Launch New Domain</button>
              </p>
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-12 space-y-4 pb-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/50 border border-lilac-border rounded-full shadow-sm">
            <CheckCircleIcon className="w-4 h-4 mr-2 text-emerald-500"/>
            <span className="text-[9px] font-black text-lilac-text uppercase tracking-widest">High Security Subsystem Active</span>
          </div>
          <p className="text-[10px] font-black text-lilac-muted/60 uppercase tracking-[0.4em]">
            © MMXXV Workflow OS • Protocol 9.4
          </p>
        </div>
      </div>
    </div>
  );
}