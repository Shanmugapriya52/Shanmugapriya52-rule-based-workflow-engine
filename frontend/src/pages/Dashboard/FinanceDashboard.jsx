import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import api from "../../api/axios";
import ActivityFeed from "../../components/ActivityFeed";

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBudget: "$---",
    spentBudget: "$---",
    pendingApprovals: 0,
    approvedToday: 0,
    avgProcessingTime: "---",
    budgetUtilization: "---"
  });
  const [financialApprovals, setFinancialApprovals] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      // Fetch executions to calculate stats and show approvals
      const response = await api.get('/executions');
      const executions = response.data.executions || [];
      
      // Filter for finance approvals
      // In this system, we can look for step_results or current_step_id
      // For now, let's filter executions that are in 'in_progress' or 'pending_approval'
      // and have a step matching finance (mock logic for now since we don't have a perfect filter yet)
      const pending = executions.filter(e => e.status === 'in_progress' || e.status === 'pending_approval');
      
      // Calculate real stats from executions
      const approvedExecutions = executions.filter(e => e.status === 'completed');
      const today = new Date().toISOString().split('T')[0];
      const approvedTodayCount = approvedExecutions.filter(e => e.ended_at && e.ended_at.startsWith(today)).length;

      setStats({
        totalBudget: "$250,000", // Keep some as mock if no backend equivalent
        spentBudget: "$45,000",
        pendingApprovals: pending.length,
        approvedToday: approvedTodayCount,
        avgProcessingTime: "1.2 days",
        budgetUtilization: "18%"
      });

      // Transform executions to approval format
      const formattedApprovals = pending.map(e => ({
        id: e.id,
        title: e.workflow_name || "Workflow Execution",
        amount: e.input_data?.amount || "N/A",
        department: e.input_data?.department || "N/A",
        requestedBy: e.triggered_by,
        priority: e.input_data?.priority || "Medium",
        submittedAt: new Date(e.started_at).toLocaleString(),
        status: e.status === 'pending_approval' ? 'pending' : 'processing',
        description: `Execution for ${e.workflow_name}`
      }));

      setFinancialApprovals(formattedApprovals);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-gray-100 text-gray-900",
      rejected: "bg-red-100 text-red-800",
      processing: "bg-gray-100 text-gray-900"
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.pending}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      Low: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800",
      High: "bg-orange-100 text-orange-800",
      Critical: "bg-red-100 text-red-800"
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority] || colors.Medium}`}>
        {priority}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lilac-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Finance Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage financial approvals and budgets</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-medium">
            {currentUser?.role || "Finance"}
          </span>
          <span className="text-sm text-gray-600">
            {currentUser?.username}
          </span>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalBudget}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1c0 1.11-.89 2-2 2m0-4V2m0 1c0 1.11-.89 2-2 2m0-4V2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Spent Budget</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.spentBudget}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.414 2.414A2 2 0 015.828 5.586L9 16h2l2.828-2.828A2 2 0 0118.172 5H5a2 2 0 00-2-2V5a2 2 0 00-2-2h2.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
              <p className="text-2xl font-bold text-gray-700 mt-1">{stats.budgetUtilization}</p>
            </div>
            <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pendingApprovals}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3v4m0 4h-3m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Today</p>
              <p className="text-2xl font-bold text-gray-700 mt-1">{stats.approvedToday}</p>
            </div>
            <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
              <p className="text-2xl font-bold text-gray-700 mt-1">{stats.avgProcessingTime}</p>
            </div>
            <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3v4m0 4h-3m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Financial Approvals */}
      <Card title="Financial Approvals">
        <div className="space-y-4">
          {financialApprovals.map((approval) => (
            <div key={approval.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{approval.title}</h3>
                    <div className="flex gap-2">
                      {getStatusBadge(approval.status)}
                      {getPriorityBadge(approval.priority)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{approval.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Requested by:</span>
                      <span className="font-medium text-gray-800 ml-1">{approval.requestedBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium text-gray-800 ml-1">{approval.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-green-600 ml-1">{approval.amount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-medium text-gray-800 ml-1">{approval.submittedAt}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {approval.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => console.log('Approve financial request:', approval.id)}
                        className="bg-gray-500 hover:bg-gray-600"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => console.log('Reject financial request:', approval.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {approval.status === 'approved' && (
                    <span className="text-sm text-green-600 font-medium">Approved</span>
                  )}
                  {approval.status === 'rejected' && (
                    <span className="text-sm text-red-600 font-medium">Rejected</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => navigate("/approvals")} className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828L8.586-8.586z" />
                </svg>
                View All Approvals
              </Button>
              
              <Button onClick={() => navigate("/logs")} variant="outline" className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Audit Logs
              </Button>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1 h-[400px]">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
