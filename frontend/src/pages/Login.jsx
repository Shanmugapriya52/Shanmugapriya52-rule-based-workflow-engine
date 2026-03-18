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

const DEFAULT_ROLES = [
  {
    id: 'admin',
    name: 'admin',
    username: 'admin',
    password: 'admin123',
    icon: <ShieldCheckIcon className="w-8 h-8" />,
    description: 'System-wide mastery'
  },
  {
    id: 'manager',
    name: 'Ops Manager',
    username: 'manager',
    password: 'manager123',
    icon: <UserGroupIcon className="w-8 h-8" />,
    description: 'Squad leadership'
  },
  {
    id: 'finance',
    name: 'Treasure Master',
    username: 'finance',
    password: 'finance123',
    icon: <CurrencyDollarIcon className="w-8 h-8" />,
    description: 'Loot approvals'
  },
  {
    id: 'employee',
    name: 'Field Operative',
    username: 'employee',
    password: 'employee123',
    icon: <BriefcaseIcon className="w-8 h-8" />,
    description: 'Mission execution'
  },
  {
    id: 'ceo',
    name: 'Supreme Leader',
    username: 'ceo',
    password: 'ceo123',
    icon: <StarIcon className="w-8 h-8" />,
    description: 'Galaxy overview'
  }
];

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customRoles, setCustomRoles] = useState([]);

  useEffect(() => {
    const savedRoles = localStorage.getItem('roles');
    if (savedRoles) {
      try {
        setCustomRoles(JSON.parse(savedRoles));
      } catch (e) {
        console.error("Error parsing roles", e);
      }
    }
  }, []);

  const allRoles = [...DEFAULT_ROLES, ...customRoles];

  const detectRole = (username, password) => {
    return allRoles.find(r => r.username === username && r.password === password);
  };

  const getRolePermissions = (roleId) => {
    const permissions = {
      admin: ['manage_system', 'create_workflow', 'delete_workflow', 'view_logs'],
      manager: ['create_workflow', 'approve_workflows'],
      finance: ['approve_financial'],
      employee: ['execute_workflow'],
      ceo: ['view_all']
    };

    return permissions[roleId] || [];
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { username, password });
      const data = response.data;
      
      if (data.success) {
        localStorage.setItem("token", data.token); // Store token if provided
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        // Also store organization_id explicitly if needed, but it's in the user object
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

  const currentRole = detectRole(username, password);

  const renderRoleIcon = (role) => {
    if (!role) return null;
    const defaultRole = DEFAULT_ROLES.find(r => r.id === role.id);
    if (defaultRole) return defaultRole.icon;
    return <UserGroupIcon className="w-5 h-5" />;
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
            {/* ROLE DISPLAY */}
            {currentRole && (
              <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-lilac-primary to-lilac-accent text-white shadow-lg transform hover:scale-[1.02] transition-all cursor-default">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    {renderRoleIcon(currentRole)}
                  </div>
                  <div>
                    <h3 className="font-black text-xl tracking-tight uppercase">
                      {currentRole.name}
                    </h3>
                    <p className="text-xs font-bold opacity-80 uppercase tracking-wider">
                      {currentRole.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

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

            {/* ROLES DISCOVERY */}
            <div className="pt-8 border-t border-lilac-border/50">
              <h3 className="text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] mb-6 text-center">
                Authorized Personnel Only
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {allRoles.slice(0, 3).map(role => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setUsername(role.username);
                      setPassword(role.password);
                    }}
                    className="group border border-lilac-border bg-white/40 p-4 rounded-2xl flex items-center justify-between hover:border-lilac-primary hover:bg-white hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-lilac-muted group-hover:text-lilac-primary transition-colors">
                        {renderRoleIcon(role)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-lilac-text uppercase tracking-widest">
                          {role.name}
                        </p>
                        <p className="text-[9px] font-bold text-lilac-muted italic">
                          {role.description}
                        </p>
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-lilac-bg rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlusIcon className="w-3 h-3 text-lilac-primary" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-12 space-y-4">
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