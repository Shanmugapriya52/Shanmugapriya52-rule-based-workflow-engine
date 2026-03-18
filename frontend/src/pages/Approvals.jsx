import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  CalendarIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export default function Approvals() {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const sampleApprovals = [
      {
        id: 1,
        title: "Expense Report - Q1 Marketing",
        type: "expense",
        requester: "John Smith",
        department: "Marketing",
        amount: "$5,432.50",
        submittedDate: "2026-03-15",
        status: "pending",
        priority: "high",
        description: "Marketing campaign expenses"
      },
      {
        id: 2,
        title: "Leave Request - Sarah Johnson",
        type: "leave",
        requester: "Sarah Johnson",
        department: "Engineering",
        amount: "5 days",
        submittedDate: "2026-03-14",
        status: "pending",
        priority: "medium",
        description: "Annual leave request"
      },
      {
        id: 3,
        title: "Purchase Order - New Laptops",
        type: "purchase",
        requester: "Mike Wilson",
        department: "IT",
        amount: "$12,000.00",
        submittedDate: "2026-03-13",
        status: "approved",
        priority: "high",
        description: "Purchase of laptops"
      }
    ];

    setApprovals(sampleApprovals);
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
      rejected: "bg-rose-100 text-rose-800 border-rose-200"
    };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: "bg-rose-100 text-rose-800 border-rose-200",
      medium: "bg-amber-100 text-amber-800 border-amber-200",
      low: "bg-emerald-100 text-emerald-800 border-emerald-200"
    };
    return `px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border ${styles[priority] || 'bg-lilac-bg text-lilac-muted border-lilac-border'}`;
  };

  const getTypeIcon = (type) => {
    const icons = {
      expense: <DocumentTextIcon className="w-5 h-5"/>,
      leave: <CalendarIcon className="w-5 h-5"/>,
      purchase: <DocumentTextIcon className="w-5 h-5"/>,
      overtime: <ClockIcon className="w-5 h-5"/>
    };
    return <div className="text-lilac-primary">{icons[type] || <DocumentTextIcon className="w-5 h-5"/>}</div>;
  };

  const handleApprove = (id) => {
    setApprovals(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'approved' } : a)
    );
  };

  const handleReject = (id) => {
    setApprovals(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a)
    );
  };

  const filteredApprovals = approvals.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.requester.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === 'all' || a.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8">
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.1)] border border-lilac-border p-6 md:p-8">
        <h1 className="text-2xl md:text-4xl font-black text-lilac-text tracking-tight uppercase">Approval Management</h1>
        <p className="text-lilac-muted font-medium mt-2">Review and manage approval requests across all workflows</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Requests', value: approvals.length, color: 'lilac-primary' },
          { label: 'Pending', value: approvals.filter(a=>a.status==='pending').length, color: 'amber-500' },
          { label: 'Approved', value: approvals.filter(a=>a.status==='approved').length, color: 'emerald-500' },
          { label: 'Rejected', value: approvals.filter(a=>a.status==='rejected').length, color: 'rose-500' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-lilac-border shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] md:text-xs font-black text-lilac-muted uppercase tracking-widest mb-1 md:mb-2">{stat.label}</p>
            <p className={`text-xl md:text-3xl font-black text-lilac-text`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* FILTER */}
      <div className="bg-white/80 backdrop-blur-md border border-lilac-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
              placeholder="Search by title or requester..."
              className="w-full bg-lilac-bg border border-lilac-border rounded-xl px-4 py-3 text-lilac-text font-bold focus:ring-4 focus:ring-lilac-primary/20 focus:border-lilac-primary outline-none transition-all placeholder:text-lilac-muted/50"
            />
          </div>
          <select
            value={filter}
            onChange={(e)=>setFilter(e.target.value)}
            className="bg-lilac-bg border border-lilac-border rounded-xl px-6 py-3 text-lilac-text font-bold focus:ring-4 focus:ring-lilac-primary/20 focus:border-lilac-primary outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white/90 backdrop-blur-sm border border-lilac-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lilac-border">
            <thead className="bg-lilac-bg/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-lilac-muted uppercase tracking-widest">Request Details</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-lilac-muted uppercase tracking-widest">Requester</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-lilac-muted uppercase tracking-widest">Value</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-lilac-muted uppercase tracking-widest">Priority</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-lilac-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-lilac-muted uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lilac-border/50 bg-white/50">
              {filteredApprovals.map(a=>(
                <tr key={a.id} className="hover:bg-lilac-bg/30 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-lilac-bg rounded-xl flex items-center justify-center border border-lilac-border group-hover:border-lilac-primary transition-colors shadow-sm">
                      {getTypeIcon(a.type)}
                    </div>
                    <div>
                      <div className="font-bold text-lilac-text group-hover:text-lilac-primary transition-colors">{a.title}</div>
                      <div className="text-xs text-lilac-muted font-medium mt-0.5">{a.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-lilac-text">{a.requester}</div>
                    <div className="text-[10px] font-black text-lilac-muted uppercase tracking-widest mt-0.5">{a.department}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-lilac-accent">
                    {a.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={getPriorityBadge(a.priority)}>
                      {a.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(a.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                    {a.status==="pending" && (
                      <>
                      <button
                        onClick={()=>handleApprove(a.id)}
                        className="w-9 h-9 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white border border-emerald-100 transition-all shadow-sm"
                        title="Approve"
                      >
                        <CheckCircleIcon className="w-5 h-5"/>
                      </button>
                      <button
                        onClick={()=>handleReject(a.id)}
                        className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white border border-rose-100 transition-all shadow-sm"
                        title="Decline"
                      >
                        <XCircleIcon className="w-5 h-5"/>
                      </button>
                      </>
                    )}
                    <button className="w-9 h-9 flex items-center justify-center bg-lilac-bg text-lilac-accent rounded-xl hover:bg-lilac-primary hover:text-white border border-lilac-border transition-all shadow-sm">
                      <EyeIcon className="w-5 h-5"/>
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}