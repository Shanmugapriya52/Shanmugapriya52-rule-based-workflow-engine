import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Card from "../components/Card";
import Table from "../components/Table";
import Button from "../components/Button";
import {
  ChartBarIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PlusIcon,
  ServerIcon,
  CpuChipIcon,
  BellIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import ActivityFeed from "../components/ActivityFeed";

export default function DynamicDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setUser(storedUser);
    fetchTelemetry();
  }, []);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const res = await api.get('/executions/stats');
      const data = res.data;
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Telemetry link failure");
    } finally {
      setLoading(false);
    }
  };

  const roleConfigs = {
    admin: {
      title: "SYSTEM OVERWATCH",
      subtitle: "Root administrative control & global orchestration",
      widgets: ["totalWorkflows", "activeWorkflows", "totalExecutions", "successRate"],
      actions: [
        { label: "New Protocol", path: "/workflow-editor", icon: PlusIcon, variant: "primary" },
        { label: "Role Authority", path: "/role-management", icon: UserGroupIcon, variant: "outline" },
        { label: "System Config", path: "/settings", icon: ServerIcon, variant: "outline" }
      ]
    },
    manager: {
      title: "OPERATIONAL HUB",
      subtitle: "Departmental workflow management & approval oversight",
      widgets: ["pendingApprovals", "activeWorkflows", "successRate"],
      actions: [
        { label: "Pending Sync", path: "/approvals", icon: CheckCircleIcon, variant: "primary" },
        { label: "Execution Logs", path: "/logs", icon: DocumentTextIcon, variant: "outline" }
      ]
    },
    developer: {
      title: "LOGIC FORGE",
      subtitle: "Protocol design & execution stream analysis",
      widgets: ["totalWorkflows", "totalExecutions", "successRate"],
      actions: [
        { label: "Forge Protocol", path: "/workflow-editor", icon: CpuChipIcon, variant: "primary" },
        { label: "Execute Stream", path: "/execute-workflow", icon: PlayIcon, variant: "outline" }
      ]
    },
    employee: {
      title: "OPERATIVE HUB",
      subtitle: "Active mission execution & temporal tracking",
      widgets: ["totalWorkflows", "totalExecutions", "successRate"],
      actions: [
        { label: "Execution Stream", path: "/execute-workflow", icon: PlayIcon, variant: "primary" },
        { label: "Signal Stream", path: "/notifications", icon: BellIcon, variant: "outline" }
      ]
    },
    finance: {
      title: "TREASURY MASTERY",
      subtitle: "Fiscal protocol oversight & capital gates",
      widgets: ["pendingApprovals", "totalWorkflows", "successRate"],
      actions: [
        { label: "Loot Approvals", path: "/approvals", icon: CheckCircleIcon, variant: "primary" },
        { label: "Audit Ledger", path: "/audit", icon: DocumentTextIcon, variant: "outline" }
      ]
    },
    ceo: {
      title: "GALAXY OVERVIEW",
      subtitle: "Supreme strategic telemetry & empire status",
      widgets: ["totalWorkflows", "activeWorkflows", "totalExecutions", "successRate"],
      actions: [
        { label: "Operation Pulse", path: "/logs", icon: ChartBarIcon, variant: "primary" },
        { label: "Audit Ledger", path: "/audit", icon: DocumentTextIcon, variant: "outline" }
      ]
    }
  };

  const config = roleConfigs[user?.role?.toLowerCase()] || roleConfigs.manager;

  const getStatConfig = (key) => {
    const map = {
      totalWorkflows: { label: "Nodes Registered", val: stats?.totalWorkflows || 0, icon: DocumentTextIcon, color: "lilac" },
      activeWorkflows: { label: "Active Streams", val: stats?.activeWorkflows || 0, icon: PlayIcon, color: "emerald" },
      totalExecutions: { label: "Total Cycles", val: stats?.totalExecutions || 0, icon: ServerIcon, color: "violet" },
      pendingApprovals: { label: "Manual Gates", val: stats?.pendingApprovals || 0, icon: ClockIcon, color: "rose" },
      successRate: { label: "Protocol Integrity", val: `${stats?.successRate || 0}%`, icon: ShieldCheckIcon, color: "emerald" }
    };
    return map[key];
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lilac-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-6">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-lilac-border pb-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-lilac-text tracking-tighter uppercase leading-none">
            {config.title}
          </h1>
          <p className="text-lilac-accent font-black mt-3 tracking-[0.3em] uppercase text-[10px] md:text-xs">
            {config.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-lilac-bg rounded-xl border border-lilac-border shadow-sm">
              <span className="text-[10px] font-black text-lilac-muted uppercase tracking-widest mr-2">Auth:</span>
              <span className="text-[10px] font-black text-lilac-primary uppercase tracking-widest">{user?.role || 'Guest'}</span>
           </div>
           <button onClick={fetchTelemetry} className="p-3 bg-white border-2 border-lilac-border rounded-xl hover:border-lilac-primary transition-all shadow-sm group">
              <ArrowPathIcon className={`w-5 h-5 text-lilac-text group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      {/* Dynamic Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {config.widgets.map((key, i) => {
          const s = getStatConfig(key);
          return (
            <div key={i} className="bg-white/80 backdrop-blur-md border-2 border-lilac-border rounded-3xl p-8 hover:border-lilac-primary hover:shadow-[0_20px_60px_rgba(200,162,255,0.2)] transition-all group">
              <div className={`w-14 h-14 bg-gradient-to-br from-lilac-primary to-lilac-accent rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                <s.icon className="w-7 h-7" />
              </div>
              <p className="text-5xl font-black text-lilac-text tracking-tighter mb-2">{s.val}</p>
              <p className="text-[10px] font-black text-lilac-muted uppercase tracking-[0.25em]">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Dynamic Action Matrix */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xs font-black text-lilac-muted uppercase tracking-[0.4em] mb-4 ml-2">Quick Command Matrix</h2>
          <div className="grid grid-cols-1 gap-4">
            {config.actions.map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all group ${
                  action.variant === 'primary' 
                    ? 'bg-gradient-to-r from-lilac-primary to-lilac-accent border-transparent text-white shadow-xl hover:opacity-90' 
                    : 'bg-white border-lilac-border text-lilac-text hover:border-lilac-primary'
                }`}
              >
                <div className="flex items-center gap-4">
                  <action.icon className={`w-6 h-6 ${action.variant === 'primary' ? 'text-white' : 'text-lilac-primary'}`} />
                  <span className="text-xs font-black uppercase tracking-widest">{action.label}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="9 5l7 7-7 7"/></svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Ledger & Activity Feed */}
        <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-5 gap-10">
            <div className="xl:col-span-3">
                <h2 className="text-xs font-black text-lilac-muted uppercase tracking-[0.4em] mb-4 ml-2">Recent Execution Ledger</h2>
                <div className="bg-white/50 backdrop-blur-sm border-2 border-lilac-border rounded-3xl overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-lilac-border">
                    <thead className="bg-lilac-bg/50">
                        <tr>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.25em]">Process ID</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.25em]">Integrity Status</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.25em]">Temporal Sync</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-lilac-border">
                        {(stats?.recentActivity || []).slice(0, 8).map((exec) => (
                        <tr key={exec.id} className="hover:bg-lilac-bg/20 transition-colors cursor-pointer" onClick={() => navigate(`/logs?id=${exec.id}`)}>
                            <td className="px-8 py-5 whitespace-nowrap text-xs font-mono font-black text-lilac-accent">
                            {exec.id.slice(0, 8)}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                            <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border-2 ${
                                exec.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                exec.status === 'failed' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                                {exec.status}
                            </span>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-[10px] font-black text-lilac-muted/60 uppercase">
                            {new Date(exec.started_at).toLocaleTimeString()}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                    {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                    <div className="p-20 text-center">
                        <p className="text-[10px] font-black text-lilac-muted uppercase tracking-[0.3em]">No operational data available in stream</p>
                    </div>
                    )}
                </div>
            </div>

            <div className="xl:col-span-2">
                <h2 className="text-xs font-black text-lilac-muted uppercase tracking-[0.4em] mb-4 ml-2">Recent Interactions</h2>
                <div className="h-[400px]">
                    <ActivityFeed />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
