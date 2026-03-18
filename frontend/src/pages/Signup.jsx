import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BuildingOfficeIcon, 
  UserIcon, 
  KeyIcon, 
  AtSymbolIcon,
  SparklesIcon,
  ArrowLongRightIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

import api from "../api/axios";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    organizationName: '',
    username: '',
    email: '',
    password: ''
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/signup', formData);
      const data = response.data;

      if (data.success) {
        // Automatically route to login after successful signup
        alert("Organization Hub Created! Please login to initialize.");
        navigate('/login');
      } else {
        setError(data.message || "Onboarding failed. Verify your inputs.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Infrastructure offline. Verification aborted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3FF] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-300/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lilac-primary/20 rounded-full blur-[120px]"></div>

      <div className="max-w-2xl w-full relative z-10 grid grid-cols-1 md:grid-cols-2 bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white overflow-hidden">
        
        {/* Left Side: Info */}
        <div className="p-10 bg-gradient-to-br from-lilac-primary to-lilac-accent text-white flex flex-col justify-between">
            <div className="space-y-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <SparklesIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight leading-none">Initialize your Hub.</h2>
                <p className="text-xs font-bold leading-relaxed opacity-80 uppercase tracking-widest">Launch a private automation domain for your company in seconds. Total isolation. Total control.</p>
            </div>
            
            <div className="space-y-4 pt-10 border-t border-white/20">
                <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">1</div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Brand your organization</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">2</div>
                    <span className="text-[10px] font-black uppercase tracking-widest">instantiate admin identity</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">3</div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Execute workflow logic</span>
                </div>
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-10">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-lilac-muted uppercase tracking-[0.3em]">Protocol Signup</h3>
                <button onClick={() => navigate('/')} className="text-lilac-primary font-black text-[10px] uppercase tracking-widest hover:underline">Exit</button>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-lilac-muted uppercase tracking-widest ml-1">Entity Name</label>
                    <div className="relative">
                        <BuildingOfficeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lilac-muted" />
                        <input 
                            type="text" 
                            required
                            placeholder="Org Name..."
                            value={formData.organizationName}
                            onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                            className="w-full pl-12 pr-4 py-3.5 bg-lilac-bg/30 border border-lilac-border rounded-xl focus:border-lilac-primary outline-none transition-all font-bold text-xs"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black text-lilac-muted uppercase tracking-widest ml-1">Admin Handle</label>
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lilac-muted" />
                        <input 
                            type="text" 
                            required
                            placeholder="Username..."
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="w-full pl-12 pr-4 py-3.5 bg-lilac-bg/30 border border-lilac-border rounded-xl focus:border-lilac-primary outline-none transition-all font-bold text-xs"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black text-lilac-muted uppercase tracking-widest ml-1">Comms Endpoint</label>
                    <div className="relative">
                        <AtSymbolIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lilac-muted" />
                        <input 
                            type="email" 
                            required
                            placeholder="Email..."
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full pl-12 pr-4 py-3.5 bg-lilac-bg/30 border border-lilac-border rounded-xl focus:border-lilac-primary outline-none transition-all font-bold text-xs"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black text-lilac-muted uppercase tracking-widest ml-1">Security Key</label>
                    <div className="relative">
                        <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lilac-muted" />
                        <input 
                            type="password" 
                            required
                            placeholder="Password..."
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full pl-12 pr-4 py-3.5 bg-lilac-bg/30 border border-lilac-border rounded-xl focus:border-lilac-primary outline-none transition-all font-bold text-xs"
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-center gap-2">
                        <ExclamationCircleIcon className="w-4 h-4 text-rose-500" />
                        <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider">{error}</span>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 mt-4 bg-lilac-text text-white rounded-xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg hover:shadow-lilac-primary/20 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    <span>{loading ? "instantiating..." : "Execute Onboarding"}</span>
                    {!loading && <ArrowLongRightIcon className="w-4 h-4" />}
                </button>

                <p className="text-[9px] font-black text-center text-lilac-muted uppercase tracking-widest pt-4">
                    Already have a hub? <button type="button" onClick={() => navigate('/login')} className="text-lilac-primary hover:underline">Activate Session</button>
                </p>
            </form>
        </div>

      </div>
    </div>
  );
}
