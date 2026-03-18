import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ClockIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

import api from "../api/axios";

export default function ExecutionLogs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const executionId = searchParams.get('id');

  const [executions, setExecutions] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    workflow: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchExecutions();
  }, []);

  useEffect(() => {
    if (executionId) {
      fetchExecutionDetails(executionId);
    }
  }, [executionId]);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/executions');
      setExecutions(response.data.executions || []);
    } catch (error) {
      console.error('Error fetching executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutionDetails = async (id) => {
    try {
      const response = await api.get(`/executions/${id}`);
      if (response.data.success) {
        setSelectedExecution(response.data.execution);
      }
    } catch (error) {
      console.error('Error fetching execution details:', error);
    }
  };

  const handleDeleteExecution = async (id) => {
    if (!confirm('Are you sure you want to delete this execution log? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/executions/${id}`);
      if (response.data.success) {
        alert('Execution deleted successfully');
        if (selectedExecution) {
          setSelectedExecution(null);
          navigate('/logs');
        }
        fetchExecutions();
      }
    } catch (error) {
      console.error('Error deleting execution:', error);
      alert('Failed to delete execution');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
      case "failed":
        return <ExclamationCircleIcon className="w-5 h-5 text-rose-500" />;
      case "in_progress":
        return <ClockIcon className="w-5 h-5 text-lilac-primary" />;
      default:
        return <ClockIcon className="w-5 h-5 text-lilac-muted" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: "bg-emerald-100/80 text-emerald-800 border-emerald-200",
      failed: "bg-rose-100/80 text-rose-800 border-rose-200",
      in_progress: "bg-lilac-secondary/80 text-lilac-accent border-lilac-primary/30",
      pending_approval: "bg-amber-100/80 text-amber-800 border-amber-200",
      pending: "bg-lilac-bg text-lilac-muted border-lilac-border"
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xl border ${colors[status] || colors.pending}`}>
        {status?.replace('_', ' ')}
      </span>
    );
  };

  const formatDuration = (ms) => {
    if (!ms || ms < 0) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const filteredExecutions = executions.filter(execution => {
    if (filter.status && execution.status !== filter.status) return false;
    if (filter.workflow && !execution.workflow_id?.toLowerCase().includes(filter.workflow.toLowerCase())) return false;
    if (filter.dateFrom && new Date(execution.started_at) < new Date(filter.dateFrom)) return false;
    if (filter.dateTo && new Date(execution.started_at) > new Date(filter.dateTo)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lilac-primary"></div>
      </div>
    );
  }

  // Execution Detail View
  if (selectedExecution || executionId) {
    const execution = selectedExecution;
    
    if (!execution) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-lilac-border/50">
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setSelectedExecution(null);
                navigate('/logs');
              }}
              className="p-3 bg-white border border-lilac-border text-lilac-muted rounded-2xl hover:border-lilac-primary hover:text-lilac-primary hover:shadow-lg transition-all"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleDeleteExecution(execution.id)}
              className="p-3 bg-white border border-rose-100 text-rose-500 rounded-2xl hover:bg-rose-50 hover:border-rose-300 hover:shadow-lg transition-all"
              title="Delete Execution"
            >
              <TrashIcon className="w-6 h-6" />
            </button>
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-lilac-primary/10 text-lilac-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-lilac-primary/20">
                Data Stream Analysis
              </div>
              <h1 className="text-4xl font-black text-lilac-text tracking-tighter uppercase">
                Execution<span className="text-lilac-primary">Telemetry</span>
              </h1>
              <p className="font-mono text-[10px] text-lilac-muted mt-2 uppercase tracking-widest opacity-70">
                Pointer: {execution.id}
              </p>
            </div>
          </div>
        </div>

        {/* Execution Summary */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.1)] p-5 sm:p-7 border border-lilac-border">
          <h2 className="text-lg font-bold text-lilac-text mb-5">Summary</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-lilac-bg/50 p-4 rounded-xl border border-lilac-border/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-lilac-muted mb-1">Workflow ID</p>
              <p className="font-medium text-lilac-text truncate">{execution.workflow_id}</p>
              <p className="text-xs font-bold text-lilac-accent mt-1">Version {execution.workflow_version}</p>
            </div>
            <div className="bg-lilac-bg/50 p-4 rounded-xl border border-lilac-border/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-lilac-muted mb-1">Status</p>
              <div className="flex items-center mt-1">
                {getStatusBadge(execution.status)}
              </div>
            </div>
            <div className="bg-lilac-bg/50 p-4 rounded-xl border border-lilac-border/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-lilac-muted mb-1">Triggered By</p>
              <p className="font-medium text-lilac-text py-1">{execution.triggered_by}</p>
            </div>
            <div className="bg-lilac-bg/50 p-4 rounded-xl border border-lilac-border/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-lilac-muted mb-1">Duration</p>
              <p className="font-medium text-lilac-text py-1">
                {execution.ended_at 
                  ? formatDuration(new Date(execution.ended_at) - new Date(execution.started_at))
                  : 'In Progress'
                }
              </p>
            </div>
          </div>

          {/* Input Data */}
          {execution.data && Object.keys(execution.data).length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-lilac-text mb-3">Input Data</h3>
              <div className="bg-lilac-bg/40 p-5 rounded-2xl border border-lilac-border">
                <pre className="text-sm font-mono text-lilac-text overflow-auto max-h-48">
                  {JSON.stringify(execution.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Step Logs */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.1)] border border-lilac-border overflow-hidden">
          <div className="px-6 py-5 border-b border-lilac-border bg-lilac-bg/30">
            <h2 className="text-lg font-bold text-lilac-text">Execution Logs</h2>
          </div>
          
          {(!execution.logs || execution.logs.length === 0) ? (
            <div className="p-12 text-center bg-lilac-bg/10">
              <DocumentTextIcon className="w-12 h-12 text-lilac-muted mx-auto mb-3 opacity-50" />
              <p className="text-lilac-muted font-medium">No detailed logs available for this execution.</p>
            </div>
          ) : (
            <div className="divide-y divide-lilac-border">
              {execution.logs.map((log, index) => (
                <div key={index} className="p-6 hover:bg-lilac-bg/20 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-lilac-text">
                        {log.step_name || `Step ${index + 1}`}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-wider text-lilac-accent mt-1">{log.step_type || 'task'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       {getStatusBadge(log.status)}
                    </div>
                  </div>

                  {log.error_message && (
                    <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl shadow-sm">
                      <p className="text-sm font-medium text-rose-700">{log.error_message}</p>
                    </div>
                  )}

                  <div className="text-sm font-medium text-lilac-muted flex items-center flex-wrap gap-4 mt-2">
                    <span className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-lilac-border shadow-sm">
                      <ClockIcon className="w-4 h-4 mr-1.5 opacity-70" />Started: {formatDate(log.started_at)}
                    </span>
                    {log.ended_at && (
                      <span className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-lilac-border shadow-sm">
                        <CheckCircleIcon className="w-4 h-4 mr-1.5 opacity-70 text-emerald-500" />Ended: {formatDate(log.ended_at)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Execution List View
  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-lilac-border/50">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-lilac-primary/10 text-lilac-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-lilac-primary/20">
            Runtime History
          </div>
          <h1 className="text-4xl font-black text-lilac-text tracking-tighter uppercase">
            Execution<span className="text-lilac-primary">Logs</span>
          </h1>
          <p className="text-lilac-muted font-bold mt-2 uppercase tracking-widest text-[10px] opacity-70 italic">
            Serialized event stream of system operations
          </p>
        </div>
        <button
          onClick={fetchExecutions}
          className="group relative px-6 py-4 bg-white border border-lilac-border text-lilac-text rounded-2xl font-black uppercase tracking-widest text-xs hover:border-lilac-primary hover:text-lilac-primary transition-all shadow-sm"
        >
          <span className="flex items-center">
            <ArrowPathIcon className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Synchronize
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-xl border border-lilac-border p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-black text-lilac-text uppercase tracking-tight">Diagnostic Filters</h2>
          <button
            onClick={() => setFilter({ status: '', workflow: '', dateFrom: '', dateTo: '' })}
            className="text-[10px] font-black text-lilac-accent hover:text-lilac-primary uppercase tracking-[0.2em] transition-colors"
          >
            Reset Matrix
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Protocol State', type: 'select', value: filter.status, key: 'status', options: [
              { val: '', label: 'All States' },
              { val: 'completed', label: 'Completed' },
              { val: 'failed', label: 'Failed' },
              { val: 'in_progress', label: 'In Progress' },
              { val: 'pending_approval', label: 'Approval Wait' }
            ]},
            { label: 'Logic Fragment', type: 'text', value: filter.workflow, key: 'workflow', placeholder: 'ID search...' },
            { label: 'Initial Bound', type: 'date', value: filter.dateFrom, key: 'dateFrom' },
            { label: 'Final Bound', type: 'date', value: filter.dateTo, key: 'dateTo' }
          ].map((f) => (
            <div key={f.key} className="space-y-2">
              <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">{f.label}</label>
              {f.type === 'select' ? (
                <select
                  value={f.value}
                  onChange={(e) => setFilter({ ...filter, [f.key]: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-lilac-border rounded-xl focus:ring-4 focus:ring-lilac-primary/10 focus:border-lilac-primary outline-none transition-all font-bold text-lilac-text text-xs"
                >
                  {f.options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                </select>
              ) : (
                <input
                  type={f.type}
                  value={f.value}
                  onChange={(e) => setFilter({ ...filter, [f.key]: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-lilac-border rounded-xl focus:ring-4 focus:ring-lilac-primary/10 focus:border-lilac-primary outline-none transition-all font-bold text-lilac-text text-xs placeholder:text-lilac-muted/30"
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Executions Table */}
      <div className="bg-white/40 backdrop-blur-xl border border-lilac-border rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-lilac-border/50 flex items-center justify-between bg-white/40">
          <h2 className="text-xl font-black text-lilac-text uppercase tracking-tight">Serialized Streams</h2>
          <div className="flex items-center space-x-2 px-3 py-1 bg-lilac-secondary/30 rounded-full border border-lilac-primary/10 text-lilac-accent">
            <DocumentTextIcon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{filteredExecutions.length} Events Logged</span>
          </div>
        </div>
        
        {filteredExecutions.length === 0 ? (
          <div className="py-24 text-center">
            <DocumentTextIcon className="w-16 h-16 text-lilac-muted mx-auto mb-6 opacity-30" />
            <p className="text-lilac-text font-black uppercase tracking-widest text-xs">Void Trace</p>
            <p className="text-[10px] font-bold text-lilac-muted uppercase italic tracking-widest mt-2">No executions found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-lilac-bg/30">
                  {['Event Pointer', 'Logic Fragment', 'Current State', 'Sync Time', 'Directives'].map((h) => (
                    <th key={h} className="px-8 py-5 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] border-b border-lilac-border/50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-lilac-border/30">
                {filteredExecutions.map((execution) => (
                  <tr key={execution.id} className="group hover:bg-lilac-bg/20 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap font-mono text-[10px] font-bold text-lilac-muted tracking-widest group-hover:text-lilac-text">
                      {execution.id.slice(0, 8)}...
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-black text-lilac-text uppercase tracking-tight">{execution.workflow_id}</div>
                      <div className="text-[9px] font-black text-lilac-accent uppercase mt-1">Revision {execution.workflow_version}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {getStatusBadge(execution.status)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-[10px] font-bold text-lilac-muted uppercase opacity-70 group-hover:opacity-100">
                      {formatDate(execution.started_at)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/logs?id=${execution.id}`)}
                        className="group/btn px-4 py-2 bg-lilac-bg text-lilac-primary rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-lilac-primary hover:text-white transition-all shadow-sm flex items-center"
                      >
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        Access Data
                      </button>
                      <button
                        onClick={() => handleDeleteExecution(execution.id)}
                        className="p-2 ml-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Execution"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
