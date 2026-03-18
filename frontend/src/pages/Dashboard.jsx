import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Table from "../components/Table";
import Button from "../components/Button";
import { 
  ChartBarIcon,
  DocumentTextIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CogIcon,
  BellIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { 
  ChartBarIcon as ChartBarSolidIcon,
  DocumentTextIcon as DocumentTextSolidIcon,
  PlayIcon as PlaySolidIcon
} from "@heroicons/react/24/solid";

import api from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/executions/stats');
      const data = res.data;
      if (data.success) {
        setStats(data.stats);
      } else {
        setError("Failed to load operational telemetry");
      }
    } catch (err) {
      setError("Network protocol failure");
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = statData => [
    {
      title: "Total Workflows",
      value: statData?.totalWorkflows || "0",
      change: "+2 new",
      changeType: "positive",
      icon: DocumentTextSolidIcon,
      color: "lilac",
      link: "/workflows",
      description: "Active protocol templates"
    },
    {
      title: "In Operation",
      value: statData?.pendingApprovals || "0",
      change: "Active",
      changeType: "positive",
      icon: PlaySolidIcon,
      color: "primary",
      link: "/logs",
      description: "Live execution streams"
    },
    {
      title: "Pending Sync",
      value: statData?.pendingApprovals || "0",
      change: "Critical",
      changeType: "negative",
      icon: ClockIcon,
      color: "accent",
      link: "/approvals",
      description: "Awaiting manual sign-off"
    },
    {
      title: "Protocol Success",
      value: `${statData?.successRate || 0}%`,
      change: "Optimized",
      changeType: "positive",
      icon: ChartBarSolidIcon,
      color: "emerald",
      link: "/audit",
      description: "Last 30 days efficiency"
    },
    {
      title: "Active Nodes",
      value: statData?.totalExecutions || "0",
      change: "Online",
      changeType: "positive",
      icon: UserGroupIcon,
      color: "violet",
      link: "/role-management",
      description: "Total execution cycles"
    },
    {
      title: "Sys Alerts",
      value: "0",
      change: "Nominal",
      changeType: "positive",
      icon: ExclamationTriangleIcon,
      color: "rose",
      link: "/notifications",
      description: "System health status"
    }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      in_progress: "bg-lilac-secondary text-lilac-accent border-lilac-primary/30", 
      pending: "bg-lilac-bg text-lilac-muted border-lilac-border",
      failed: "bg-rose-100 text-rose-800 border-rose-200",
      pending_approval: "bg-amber-100 text-amber-800 border-amber-200"
    };
    
    return (
      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl border ${styles[status] || styles.pending}`}>
        {status?.replace('_', ' ')}
      </span>
    );
  };

  const getColorClasses = (color) => {
    const colors = {
      lilac: "bg-gradient-to-br from-lilac-primary to-lilac-accent",
      primary: "bg-gradient-to-br from-lilac-primary to-lilac-accent",
      accent: "bg-gradient-to-br from-lilac-accent to-[#9c66ff]",
      emerald: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      violet: "bg-gradient-to-br from-[#8a5cf6] to-[#6d28d9]",
      rose: "bg-gradient-to-br from-rose-400 to-rose-600"
    };
    return colors[color] || colors.lilac;
  };

  const getBgColorClasses = (color) => {
    const colors = {
      lilac: "bg-lilac-bg",
      primary: "bg-lilac-bg",
      accent: "bg-lilac-bg",
      emerald: "bg-emerald-50",
      violet: "bg-violet-50",
      rose: "bg-rose-50"
    };
    return colors[color] || colors.lilac;
  };

  const allPages = [
    {
      title: "Workflow Management",
      pages: [
        { name: "Workflow List", path: "/workflows", description: "View and manage all workflows", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
        { name: "Workflow Editor", path: "/workflow-editor", description: "Create and edit workflows", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
        { name: "Step Editor", path: "/step-editor", description: "Configure workflow steps", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
        { name: "Rule Editor", path: "/rule-editor", description: "Define workflow rules", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" }
      ]
    },
    {
      title: "Execution & Monitoring",
      pages: [
        { name: "Execute Workflow", path: "/execute-workflow", description: "Run workflows with custom data", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
        { name: "Execution Logs", path: "/logs", description: "View execution history and logs", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        { name: "Approvals", path: "/approvals", description: "Manage pending approvals", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
        { name: "Notifications", path: "/notifications", description: "View system notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
        { name: "Audit Logs", path: "/audit", description: "View audit trail and history", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }
      ]
    }
  ];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lilac-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-lilac-primary to-lilac-accent rounded-2xl flex items-center justify-center shadow-[0_8px_30px_-4px_rgba(200,162,255,0.4)]">
            <ChartBarIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-lilac-text tracking-tighter uppercase">Operational Hub</h1>
            <p className="text-lilac-muted font-bold mt-1 tracking-wide uppercase text-xs">Real-time workflow telemetry & orchestration</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchStats}
            className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-lilac-border text-lilac-text font-black rounded-xl hover:bg-lilac-bg hover:border-lilac-primary transition-all uppercase tracking-widest text-xs shadow-sm"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => navigate("/workflow-editor")}
            className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-lilac-primary to-lilac-accent text-white font-black rounded-xl shadow-lg hover:opacity-90 transition-all uppercase tracking-widest text-xs"
          >
            <PlusIcon className="w-5 h-5" />
            New Protocol
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {dashboardStats(stats).map((stat, index) => (
          <div 
            key={index} 
            className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-lilac-border hover:shadow-[0_20px_50px_rgba(200,162,255,0.15)] transition-all duration-300 cursor-pointer hover:-translate-y-1 group"
            onClick={() => navigate(stat.link)}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 ${getColorClasses(stat.color)} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                stat.changeType === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-4xl font-black text-lilac-text tracking-tighter">{stat.value}</p>
              <p className="text-[10px] font-black text-lilac-accent mt-2 uppercase tracking-[0.2em]">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Access Matrix */}
        <Card title="PROTOCOL MATRIX" className="lg:col-span-1 border-lilac-border">
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: "Deployment Center", path: "/workflows", icon: DocumentTextIcon, desc: "Manage operational workflows" },
              { label: "Logic Orchestrator", path: "/workflow-editor", icon: CogIcon, desc: "Design complex protocols" },
              { label: "Execution Stream", path: "/logs", icon: PlayIcon, desc: "Monitor live activity" },
              { label: "Approval Portal", path: "/approvals", icon: CheckCircleIcon, desc: "Resolve pending sign-offs" },
              { label: "Telemetry Ledger", path: "/audit", icon: ChartBarIcon, desc: "Historical event analysis" }
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-4 p-4 bg-white/50 border border-lilac-border rounded-xl hover:bg-lilac-bg hover:border-lilac-primary transition-all group text-left"
              >
                <div className="w-12 h-12 bg-lilac-bg rounded-xl flex items-center justify-center text-lilac-primary border border-lilac-border group-hover:scale-110 transition-transform">
                  <action.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-lilac-header uppercase tracking-widest">{action.label}</p>
                  <p className="text-[10px] font-bold text-lilac-muted uppercase opacity-60 m-0">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Live Execution Stream */}
        <Card title="LIVE TELEMETRY STREAM" className="lg:col-span-2 border-lilac-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-lilac-border">
              <thead className="bg-lilac-bg/30">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em]">Protocol ID</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em]">Flow Name</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em]">Current State</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em]">Operator</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lilac-border bg-white/30">
                {(stats?.recentActivity || []).map((exec) => (
                  <tr key={exec.id} className="hover:bg-lilac-bg/50 transition-colors cursor-pointer" onClick={() => navigate(`/logs?id=${exec.id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-black text-lilac-accent">
                      {exec.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-lilac-text uppercase tracking-tight">
                      {exec.workflow_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(exec.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[10px] font-black text-lilac-muted uppercase">
                      {exec.triggered_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[10px] font-bold text-lilac-muted uppercase">
                      {new Date(exec.started_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* System Integrity Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        <Card title="CORE INTEGRITY NET" className="border-lilac-border">
          <div className="space-y-4">
            {[
              { label: "API Protocol", val: "45ms", status: "Nominal", color: "emerald" },
              { label: "Data Synchronizer", val: "Healthy", status: "Active", color: "emerald", pulse: true },
              { label: "Queue Velocity", val: stats?.pendingApprovals || 0, status: "Moderate", color: "lilac" },
              { label: "Error Frequency", val: "0.2%", status: "Safe", color: "emerald" }
            ].map((item, i) => (
              <div key={i} className={`flex items-center justify-between p-4 bg-white/50 border border-lilac-border rounded-xl`}>
                <span className="text-xs font-black text-lilac-text uppercase tracking-widest">{item.label}</span>
                <div className="flex items-center gap-4">
                   <span className={`text-sm font-black text-${item.color}-600`}>{item.val}</span>
                   <div className="flex items-center gap-2">
                     {item.pulse && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>}
                     <span className={`text-[10px] font-black uppercase tracking-widest text-${item.color}-600/60`}>{item.status}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="PROTOCOL EVENT FEED" className="border-lilac-border">
           <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {(stats?.recentActivity || []).slice(0, 5).map((activity, i) => (
                <div key={i} className="flex gap-4 p-4 hover:bg-lilac-bg/50 rounded-xl transition-all border border-transparent hover:border-lilac-border">
                   <div className="w-10 h-10 bg-lilac-bg rounded-lg flex items-center justify-center text-lilac-primary border border-lilac-border shadow-sm">
                      <ClockIcon className="w-5 h-5" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-lilac-text uppercase tracking-widest truncate">{activity.workflow_id} INITIALIZED</p>
                      <p className="text-[10px] font-bold text-lilac-muted uppercase mt-0.5">Transitioned to state: <span className="text-lilac-accent">{activity.status}</span></p>
                      <p className="text-[10px] font-black text-lilac-muted/40 uppercase mt-2">{new Date(activity.started_at).toLocaleString()}</p>
                   </div>
                </div>
              ))}
           </div>
        </Card>
      </div>
    </div>
  );
}
