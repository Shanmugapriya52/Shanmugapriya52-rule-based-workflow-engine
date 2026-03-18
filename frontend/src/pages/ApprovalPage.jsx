import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  InformationCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  Cog6ToothIcon as CogIcon
} from "@heroicons/react/24/outline";

import api from "../api/axios";

export default function ApprovalPage() {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setUser(storedUser);
    fetchApprovals(storedUser);
  }, []);

  const fetchApprovals = async (currentUser) => {
    try {
      setLoading(true);
      const params = {};
      if (currentUser?._id && currentUser._id !== "null") params.userId = currentUser._id;
      if (currentUser?.username) params.username = currentUser.username;

      const res = await api.get('/executions/my-approvals', { params });
      const data = res.data;
      if (data.success) {
        setApprovals(data.executions || []);
      }
    } catch (err) {
      console.error("Failed to fetch approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (executionId, stepId, action) => {
    try {
      setProcessing(executionId);
      const res = await api.post(`/executions/${executionId}/complete-step`, {
        step_id: stepId,
        action: action,
        approver_username: user?.username || "unknown",
        data: { approved_at: new Date().toISOString() }
      });

      const data = res.data;
      if (data.success) {
        fetchApprovals(user);
      }
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setProcessing(null);
    }
  };

  if (loading && approvals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lilac-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-lilac-border pb-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-lilac-primary to-lilac-accent rounded-2xl flex items-center justify-center shadow-lg">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-lilac-text tracking-tighter uppercase leading-none">PULSE ENGINE</h1>
            <p className="text-lilac-accent font-black mt-3 tracking-[0.3em] uppercase text-[10px] md:text-xs">Action synchronization & manual overrides</p>
          </div>
        </div>
        <button 
          onClick={() => fetchApprovals(user)}
          className="p-3 bg-white border-2 border-lilac-border rounded-xl hover:border-lilac-primary transition-all group shadow-sm text-xs font-black uppercase tracking-widest flex items-center gap-2"
        >
          <ArrowPathIcon className={`w-5 h-5 text-lilac-text group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white border-2 border-lilac-border rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-lilac-bg rounded-xl flex items-center justify-center text-lilac-primary"><ClockIcon className="w-7 h-7" /></div>
            <div>
               <p className="text-2xl font-black text-lilac-text">{approvals.length}</p>
               <p className="text-[10px] font-black text-lilac-muted uppercase tracking-widest">Pending Syncs</p>
            </div>
         </div>
         <div className="bg-white border-2 border-lilac-border rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500"><CheckCircleIcon className="w-7 h-7" /></div>
            <div>
               <p className="text-2xl font-black text-lilac-text">Stable</p>
               <p className="text-[10px] font-black text-lilac-muted uppercase tracking-widest">System Integrity</p>
            </div>
         </div>
         <div className="bg-white border-2 border-lilac-border rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-lilac-bg rounded-xl flex items-center justify-center text-lilac-primary"><CpuChipIcon className="w-7 h-7" /></div>
            <div>
               <p className="text-2xl font-black text-lilac-text">{user?.role?.toUpperCase() || 'NONE'}</p>
               <p className="text-[10px] font-black text-lilac-muted uppercase tracking-widest">Access Protocol</p>
            </div>
         </div>
      </div>

      {/* Approval Cards */}
      <div className="space-y-6">
        {approvals.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-lilac-border rounded-3xl p-20 text-center">
            <InformationCircleIcon className="w-16 h-16 text-lilac-muted/30 mx-auto mb-4" />
            <p className="text-xs font-black text-lilac-muted uppercase tracking-[0.2em]">No operational gates requiring sync</p>
          </div>
        ) : (
          approvals.map((approval) => (
            <div key={approval.id} className="bg-white border-2 border-lilac-border rounded-3xl overflow-hidden shadow-sm hover:border-lilac-primary transition-all group">
              <div className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="px-3 py-1 bg-lilac-bg text-lilac-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-lilac-border">
                          {approval.current_step_type}
                       </span>
                       <span className="text-[10px] font-black text-lilac-muted uppercase tracking-widest opacity-50">
                          {approval.id.slice(0, 8)}
                       </span>
                    </div>
                    <h3 className="text-2xl font-black text-lilac-text uppercase tracking-tight">
                       {approval.workflow_name}
                    </h3>
                    <p className="text-xs font-bold text-lilac-accent uppercase tracking-widest mt-1 italic">
                       Step: {approval.current_step_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      disabled={processing === approval.id}
                      onClick={() => handleAction(approval.id, approval.current_step_id, 'reject')}
                      className="px-6 py-3 border-2 border-rose-200 text-rose-600 font-black rounded-xl hover:bg-rose-50 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2 disabled:opacity-50"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Reject Code
                    </button>
                    <button 
                      disabled={processing === approval.id}
                      onClick={() => handleAction(approval.id, approval.current_step_id, 'approve')}
                      className="px-8 py-3 bg-gradient-to-r from-lilac-primary to-lilac-accent text-white font-black rounded-xl shadow-lg hover:opacity-90 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Authorize
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-lilac-bg/30 p-6 rounded-2xl border border-lilac-border">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-lilac-muted uppercase tracking-widest border-b border-lilac-border pb-2">Payload Metadata</h4>
                    <pre className="text-[10px] font-mono text-lilac-text bg-white/50 p-4 rounded-xl border border-lilac-border overflow-x-auto max-h-[150px] custom-scrollbar">
                      {JSON.stringify(approval.data, null, 2)}
                    </pre>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-lilac-muted uppercase tracking-widest border-b border-lilac-border pb-2">Process Instructions</h4>
                    <div className="bg-white/50 p-4 rounded-xl border border-lilac-border min-h-[120px]">
                       <p className="text-xs font-bold text-lilac-text uppercase leading-relaxed">
                          {approval.current_step_instructions || "No custom instructions available for this protocol."}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-lilac-border/50">
                   <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-lilac-muted" />
                      <span className="text-[10px] font-black text-lilac-muted uppercase tracking-widest">
                         Triggered: {new Date(approval.started_at).toLocaleString()}
                      </span>
                   </div>
                   <div className="flex items-center gap-2">
                      <InformationCircleIcon className="w-4 h-4 text-lilac-muted" />
                      <span className="text-[10px] font-black text-lilac-muted uppercase tracking-widest">
                         By: {approval.triggered_by}
                      </span>
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}