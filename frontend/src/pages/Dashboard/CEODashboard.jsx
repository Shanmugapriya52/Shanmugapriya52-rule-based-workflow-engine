import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import api from "../../api/axios";
import ActivityFeed from "../../components/ActivityFeed";

export default function CEODashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    pendingApprovals: 0,
    monthlyRevenue: "$---",
    efficiency: "---",
    criticalIssues: 0
  });
  const [highLevelApprovals, setHighLevelApprovals] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    fetchCEOData();
  }, []);

  const fetchCEOData = async () => {
    try {
      setLoading(true);
      const [workflowsRes, executionsRes] = await Promise.all([
        api.get('/workflows'),
        api.get('/executions')
      ]);

      const workflows = workflowsRes.data.workflows || [];
      const executions = executionsRes.data.executions || [];

      const activeWorkflows = workflows.filter(w => w.is_active).length;
      const pendingApprovals = executions.filter(e => e.status === 'pending_approval' || e.status === 'in_progress').length;
      const failedExecutions = executions.filter(e => e.status === 'failed').length;

      setStats({
        totalWorkflows: workflows.length,
        activeWorkflows: activeWorkflows,
        pendingApprovals: pendingApprovals,
        monthlyRevenue: "$1.2M", // Mock business metric
        efficiency: "92%",       // Mock business metric
        criticalIssues: failedExecutions
      });

      // Show high level approvals (all pending approvals for CEO view)
      const formattedApprovals = executions
        .filter(e => e.status === 'pending_approval' || e.status === 'in_progress')
        .slice(0, 5)
        .map(e => ({
          id: e.id,
          title: e.workflow_name || "Workflow Action Required",
          department: e.input_data?.department || "Operations",
          requestedBy: e.triggered_by,
          amount: e.input_data?.amount || "N/A",
          priority: e.input_data?.priority || "High",
          submittedAt: new Date(e.started_at).toLocaleString(),
          deadline: "Upcoming",
          impact: "Medium",
          description: `Strategic execution of ${e.workflow_name}`
        }));

      setHighLevelApprovals(formattedApprovals);
    } catch (error) {
      console.error('Error fetching CEO data:', error);
    } finally {
      setLoading(false);
    }
  };


  const getPriorityBadge = (priority) => {
    const colors = {
      Low: "bg-gray-100 text-gray-900",
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

  const getImpactBadge = (impact) => {
    const colors = {
      Low: "bg-gray-100 text-gray-900",
      Medium: "bg-gray-100 text-gray-900",
      High: "bg-red-100 text-red-800",
      "Very High": "bg-gray-200 text-red-900"
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[impact] || colors.Medium}`}>
        {impact}
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
          <h1 className="text-2xl font-bold text-gray-800">CEO Dashboard</h1>
          <p className="text-gray-600 mt-1">High-level overview and strategic approvals</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {currentUser?.role || "CEO"}
          </span>
          <span className="text-sm text-gray-600">
            {currentUser?.username}
          </span>
        </div>
      </div>

      {/* Executive Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalWorkflows}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-gray-700 mt-1">{stats.activeWorkflows}</p>
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
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-700 mt-1">{stats.monthlyRevenue}</p>
            </div>
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1c0 1.11-.89 2-2 2m0-4V2m0 1c0 1.11-.89 2-2 2m0-4V2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Efficiency</p>
              <p className="text-2xl font-bold text-gray-700 mt-1">{stats.efficiency}</p>
            </div>
            <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0a2 2 0 012 2v6a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.criticalIssues}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828L8.586-8.586z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* High-Level Approvals */}
      <Card title="High-Level Approvals">
        <div className="space-y-4">
          {highLevelApprovals.map((approval) => (
            <div key={approval.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{approval.title}</h3>
                    <div className="flex gap-2">
                      {getPriorityBadge(approval.priority)}
                      {getImpactBadge(approval.impact)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{approval.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium text-gray-800 ml-1">{approval.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Requested by:</span>
                      <span className="font-medium text-gray-800 ml-1">{approval.requestedBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-green-600 ml-1">{approval.amount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-medium text-gray-800 ml-1">{approval.submittedAt}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Deadline:</span>
                      <span className={`font-medium ml-1 ${
                        approval.deadline === 'Today' ? 'text-red-600' : 'text-gray-800'
                      }`}>
                        {approval.deadline}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => console.log('CEO Approve:', approval.id)}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => console.log('CEO Reject:', approval.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => console.log('CEO Request Info:', approval.id)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Executive Actions */}
          <Card title="Executive Actions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => navigate("/approvals")} className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828L8.586-8.586z" />
                </svg>
                All Approvals
              </Button>
              
              <Button onClick={() => navigate("/audit")} variant="outline" className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Audit Logs
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
