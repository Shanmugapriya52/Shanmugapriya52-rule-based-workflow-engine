import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon,
  PlayIcon,
  TrashIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

import api from "../api/axios";

export default function WorkflowList() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    fetchWorkflows();
  }, [searchTerm, statusFilter, pagination.page]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      };

      const response = await api.get('/workflows', { params });
      const data = response.data;
      
      setWorkflows(data.workflows || []);
      setPagination(prev => ({
        ...prev,
        ...data.pagination
      }));
    } catch (error) {
      console.error('Signal scan failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workflowId) => {
    if (!confirm('ARCHIVE PROTOCOL: Are you sure you want to decommission this workflow node?')) {
      return;
    }

    try {
      await api.delete(`/workflows/${workflowId}`);
      fetchWorkflows();
    } catch (error) {
      console.error('Error decommissioning node:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
       year: 'numeric',
       month: 'short',
       day: 'numeric'
    });
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border-2 ${
        isActive 
          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
          : 'bg-rose-50 text-rose-600 border-rose-100'
      }`}>
        {isActive ? 'Active' : 'Offline'}
      </span>
    );
  };

  if (loading && workflows.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lilac-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-lilac-border pb-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-lilac-primary to-lilac-accent rounded-2xl flex items-center justify-center shadow-lg">
            <CpuChipIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-lilac-text tracking-tighter uppercase leading-none">DEPLOYMENT CENTER</h1>
            <p className="text-lilac-accent font-black mt-3 tracking-[0.3em] uppercase text-[10px] md:text-xs">Protocol library & node orchestration</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate('/workflow-editor')}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-lilac-primary to-lilac-accent text-white font-black rounded-xl shadow-xl hover:opacity-90 transition-all uppercase tracking-widest text-xs"
          >
            <PlusIcon className="w-5 h-5" />
            Forge Protocol
          </button>
        )}
      </div>

      {/* Filter Matrix */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border-2 border-lilac-border p-8 shadow-sm scale-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] ml-1">Search Logic</label>
            <div className="relative group">
              <MagnifyingGlassIcon className={`w-5 h-5 text-lilac-muted absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-lilac-primary`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 w-full px-5 py-4 bg-white border-2 border-lilac-border rounded-2xl focus:border-lilac-primary text-sm font-bold text-lilac-text placeholder-lilac-muted transition-all outline-none"
                placeholder="Find protocol by signature..."
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] ml-1">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-5 py-4 bg-white border-2 border-lilac-border rounded-2xl focus:border-lilac-primary text-sm font-bold text-lilac-text transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="all">Global Stream</option>
              <option value="active">Operational Nodes</option>
              <option value="inactive">Archived Nodes</option>
            </select>
          </div>

          <div className="flex items-end flex-col justify-end gap-3">
             <div className="text-[10px] font-black text-lilac-muted uppercase tracking-widest bg-lilac-bg px-4 py-2 rounded-lg border border-lilac-border">
                Total Nodes: {pagination.total}
             </div>
             <button
               onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
               className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-lilac-border text-lilac-text font-black rounded-2xl hover:bg-lilac-bg transition-all uppercase tracking-widest text-[10px] w-full md:w-auto"
             >
               <ArrowPathIcon className="w-4 h-4" />
               Reset Search
             </button>
          </div>
        </div>
      </div>

      {/* Protocol Ledger */}
      <div className="bg-white border-2 border-lilac-border rounded-3xl overflow-hidden shadow-sm">
        {workflows.length === 0 ? (
          <div className="text-center py-24 bg-lilac-bg/20">
            <DocumentTextIcon className="w-20 h-20 text-lilac-muted/30 mx-auto mb-6" />
            <p className="text-xs font-black text-lilac-muted uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">
              {searchTerm || statusFilter !== 'all' 
                ? 'No matching protocols detected in current stream sector.' 
                : 'Protocol library is empty. Initiative forge to begin.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-lilac-border/50">
              <thead className="bg-lilac-bg/50">
                <tr>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.3em]">Protocol Identity</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.3em] hidden sm:table-cell">Logic Summary</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.3em]">Revision</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.3em]">State</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.3em] hidden md:table-cell">Registered At</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-lilac-muted uppercase tracking-[0.3em]">Operations</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-lilac-border/30">
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-lilac-bg/30 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                       <p className="text-sm font-black text-lilac-text uppercase tracking-tight">{workflow.name}</p>
                       <p className="text-[9px] font-mono font-black text-lilac-accent/50 mt-1">{workflow.id.slice(0, 8)}</p>
                    </td>

                    <td className="px-8 py-6 text-[11px] font-bold text-lilac-muted uppercase leading-relaxed max-w-xs truncate hidden sm:table-cell">
                      {workflow.description || 'Global Protocol Node'}
                    </td>

                    <td className="px-8 py-6 whitespace-nowrap">
                       <span className="text-[10px] font-black text-lilac-primary bg-lilac-bg px-2 py-0.5 rounded border border-lilac-border">V{workflow.version}</span>
                    </td>

                    <td className="px-8 py-6 whitespace-nowrap">
                      {getStatusBadge(workflow.is_active)}
                    </td>

                    <td className="px-8 py-6 whitespace-nowrap text-[10px] font-black text-lilac-muted/60 uppercase hidden md:table-cell">
                      {formatDate(workflow.created_at)}
                    </td>

                    <td className="px-8 py-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 px-4 py-2 bg-lilac-bg/20 rounded-2xl border border-lilac-border/30 opacity-60 group-hover:opacity-100 transition-opacity">
                        {isAdmin && (
                          <button
                            onClick={() => navigate(`/workflow-editor?id=${workflow.id}`)}
                            className="p-2 text-lilac-muted hover:text-lilac-primary transition-colors flex items-center gap-1 group/btn"
                            title="Quick Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase tracking-tighter hidden group-hover/btn:inline">Edit</span>
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/step-editor?workflowId=${workflow.id}`)}
                          className="p-2 text-lilac-muted hover:text-lilac-accent transition-colors flex items-center gap-1 group/btn"
                          title="Steps Configuration"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span className="text-[8px] font-black uppercase tracking-tighter hidden group-hover/btn:inline">Steps</span>
                        </button>

                        {isAdmin && (
                          <div className="w-px h-4 bg-lilac-border/50 mx-1"></div>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => navigate(`/execute-workflow?workflow_id=${workflow.id}`)}
                            className="p-2 bg-gradient-to-br from-lilac-primary to-lilac-accent text-white rounded-lg shadow-sm hover:scale-110 transition-all flex items-center gap-1"
                            title="Instant Launch"
                          >
                            <PlayIcon className="w-4 h-4 fill-white/20" />
                            <span className="text-[8px] font-black uppercase tracking-tighter">Run</span>
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(workflow.id)}
                            className="p-2 text-rose-300 hover:text-rose-500 transition-colors"
                            title="Decommission"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Command */}
      {pagination.pages > 1 && (
         <div className="flex items-center justify-center gap-4 py-8">
            <button 
               disabled={pagination.page <= 1}
               onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
               className="p-3 border-2 border-lilac-border rounded-xl disabled:opacity-30 hover:border-lilac-primary transition-all text-lilac-text"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <span className="text-[10px] font-black text-lilac-muted uppercase tracking-[0.4em]">Sector {pagination.page} / {pagination.pages}</span>
            <button 
               disabled={pagination.page >= pagination.pages}
               onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
               className="p-3 border-2 border-lilac-border rounded-xl disabled:opacity-30 hover:border-lilac-primary transition-all text-lilac-text"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
            </button>
         </div>
      )}
    </div>
  );
}