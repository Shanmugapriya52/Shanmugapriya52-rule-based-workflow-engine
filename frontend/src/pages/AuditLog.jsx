import { useState, useEffect } from "react";
import { format } from "date-fns";

import api from "../api/axios";

const STATUS_COLORS = {
  completed:       "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed:          "bg-rose-100 text-rose-800 border-rose-200",
  canceled:        "bg-gray-100 text-gray-600 border-gray-200",
  in_progress:     "bg-lilac-secondary text-lilac-accent border-lilac-primary/30",
  pending_approval:"bg-amber-100 text-amber-800 border-amber-200",
  pending:         "bg-lilac-bg text-lilac-muted border-lilac-border",
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 20 };
        if (statusFilter) params.status = statusFilter;
        
        const response = await api.get('/executions', { params });
        const data = response.data;
        
        // API returns { executions, pagination } (success field added later but check both)
        const execList = data.executions || [];
        const formattedLogs = execList.map(ex => ({
          id: ex.id,
          workflow: ex.workflow_name || ex.workflow_id,
          triggered_by: ex.triggered_by,
          status: ex.status,
          started: ex.started_at ? format(new Date(ex.started_at), 'yyyy-MM-dd HH:mm') : 'N/A',
          duration: ex.ended_at
            ? `${Math.floor((new Date(ex.ended_at) - new Date(ex.started_at)) / 1000)}s`
            : 'Running',
          steps: ex.logs?.length ?? 0
        }));
        setLogs(formattedLogs);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Audit fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page, statusFilter]);

  const statuses = ['', 'completed', 'failed', 'canceled', 'in_progress', 'pending_approval', 'pending'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-8 border-b border-lilac-border/50">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-lilac-primary/10 text-lilac-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-lilac-primary/20">
          Audit Trace
        </div>
        <h1 className="text-4xl font-black text-lilac-text tracking-tighter uppercase">
          Historical<span className="text-lilac-primary">Ledger</span>
        </h1>
        <p className="text-lilac-muted font-bold mt-2 uppercase tracking-widest text-[10px] opacity-70 italic">
          Immutable execution records & system activity
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {statuses.map(s => (
          <button
            key={s || 'all'}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border transition-all shadow-sm
              ${statusFilter === s
                ? 'bg-lilac-text text-white border-lilac-text shadow-lg translate-y-[-2px]'
                : 'bg-white text-lilac-muted border-lilac-border hover:border-lilac-primary hover:text-lilac-text hover:bg-lilac-bg/50'
              }`}
          >
            {s ? s.replace(/_/g, ' ') : 'Total Scan'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/60 backdrop-blur-xl border border-lilac-border rounded-[2.5rem] shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 border-4 border-lilac-secondary border-t-lilac-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lilac-text font-black uppercase tracking-widest text-xs animate-pulse">Scanning Archive...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-lilac-muted font-black uppercase tracking-widest text-xs">Ledger Clear</p>
            <p className="text-[10px] font-bold text-lilac-muted uppercase italic tracking-widest mt-2">No execution records found matching your query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-lilac-bg/30">
                  {['Execution Pointer', 'Logic Chain', 'Initiator', 'Protocol State', 'Nodes', 'Clock-In', 'Delta Time'].map(h => (
                    <th key={h} className="px-8 py-5 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] border-b border-lilac-border/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-lilac-border/30">
                {logs.map(log => (
                  <tr key={log.id} className="group hover:bg-lilac-bg/30 transition-colors">
                    <td className="px-8 py-6 font-mono text-[10px] font-bold text-lilac-text opacity-70 tracking-widest group-hover:opacity-100">{log.id.slice(0, 16)}…</td>
                    <td className="px-8 py-6 text-sm font-black text-lilac-text uppercase tracking-tight">{log.workflow}</td>
                    <td className="px-8 py-6 text-xs font-bold text-lilac-muted uppercase italic">{log.triggered_by}</td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${STATUS_COLORS[log.status] || 'bg-lilac-bg text-lilac-muted border-lilac-border'}`}>
                        {log.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black text-lilac-text">{log.steps} Nodes</td>
                    <td className="px-8 py-6 text-[10px] font-bold text-lilac-muted whitespace-nowrap opacity-70 group-hover:opacity-100">{log.started}</td>
                    <td className="px-8 py-6 text-[10px] font-black text-lilac-text">{log.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6 text-sm font-medium text-lilac-muted">
          <span>Page <strong className="text-lilac-text">{pagination.page}</strong> of <strong className="text-lilac-text">{pagination.pages}</strong> ({pagination.total} records)</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2 border border-lilac-border bg-white text-lilac-text font-bold rounded-xl hover:bg-lilac-bg hover:text-lilac-accent hover:border-lilac-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-5 py-2 border border-lilac-border bg-white text-lilac-text font-bold rounded-xl hover:bg-lilac-bg hover:text-lilac-accent hover:border-lilac-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}