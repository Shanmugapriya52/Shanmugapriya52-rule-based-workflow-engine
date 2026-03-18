import { useNavigate } from "react-router-dom";
import { 
  CheckCircleIcon, 
  ArrowRightIcon, 
  SparklesIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F3FF] relative overflow-hidden flex flex-col items-center justify-center p-6 bg-welcome-pattern">
      {/* Dynamic Animated Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-lilac-primary/20 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-lilac-accent/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '3s' }}></div>

      <div className="max-w-6xl w-full relative z-10 flex flex-col items-center">
        {/* Floating Logo / Brand */}
        <div className="mb-12 animate-bounce-slow">
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(200,162,255,0.4)] border border-lilac-border flex items-center justify-center">
                <CpuChipIcon className="w-12 h-12 text-lilac-primary" />
            </div>
        </div>

        <div className="text-center mb-16 space-y-4">
          <h1 className="text-6xl md:text-8xl font-black text-lilac-text tracking-tighter uppercase leading-none">
            Workflow<span className="text-lilac-primary">OS</span>
          </h1>
          <p className="text-xl md:text-2xl font-black text-lilac-accent tracking-[0.2em] uppercase italic opacity-80 decoration-lilac-primary underline-offset-8 underline">
            The Multi-Tenant Automation Engine
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 w-full px-4">
            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 shadow-xl hover:scale-105 transition-transform duration-500">
                <ShieldCheckIcon className="w-10 h-10 text-lilac-primary mb-6" />
                <h3 className="text-lg font-black text-lilac-text uppercase mb-3">Enterprise Isolation</h3>
                <p className="text-xs font-bold text-lilac-muted leading-relaxed uppercase tracking-wider">Secure and separate operational environments for your organization's sensitive data and proprietary processes.</p>
            </div>
            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 shadow-xl hover:scale-105 transition-transform duration-500 delay-75">
                <SparklesIcon className="w-10 h-10 text-pink-400 mb-6" />
                <h3 className="text-lg font-black text-lilac-text uppercase mb-3">Workflow Intelligence</h3>
                <p className="text-xs font-bold text-lilac-muted leading-relaxed uppercase tracking-wider">Advanced logic engines designed to streamline complex business workflows and maximize team efficiency.</p>
            </div>
            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 shadow-xl hover:scale-105 transition-transform duration-500 delay-150">
                <UserGroupIcon className="w-10 h-10 text-emerald-400 mb-6" />
                <h3 className="text-lg font-black text-lilac-text uppercase mb-3">Scalable Governance</h3>
                <p className="text-xs font-bold text-lilac-muted leading-relaxed uppercase tracking-wider">Granular role-based access control and comprehensive audit trails for organization-wide oversight.</p>
            </div>
        </div>

        {/* Action Center */}
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl px-4 scale-110">
          <button 
            onClick={() => navigate('/login')}
            className="flex-1 py-6 bg-lilac-text text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-lilac-primary hover:-translate-y-2 transition-all duration-300 flex items-center justify-center gap-4"
          >
            <span>Initialize Session</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => navigate('/signup')}
            className="flex-1 py-6 bg-white text-lilac-primary border-4 border-lilac-primary/20 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:border-lilac-primary hover:-translate-y-2 transition-all duration-300 flex items-center justify-center gap-4 group"
          >
            <SparklesIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Create Hub</span>
          </button>
        </div>

        {/* Minimal Footer */}
        <div className="mt-24 pb-12 flex flex-col items-center gap-4 opacity-40">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-lilac-bg border border-lilac-border rounded-full">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-[9px] font-black text-lilac-text uppercase tracking-widest">Global Protocol 10.2 Online</span>
            </div>
            <p className="text-[8px] font-black text-lilac-muted tracking-[0.5em] uppercase">Built for Autonomous High-Efficiency Execution</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
