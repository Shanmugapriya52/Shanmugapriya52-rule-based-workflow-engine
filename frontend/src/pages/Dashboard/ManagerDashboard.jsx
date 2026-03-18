import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PlusIcon, 
  PlayIcon, 
  DocumentTextIcon, 
  PencilIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import api from "../../api/axios";
import ActivityFeed from "../../components/ActivityFeed";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    pendingApprovals: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      // Fetch workflows
      const workflowsResponse = await api.get('/workflows');
      const workflowsData = workflowsResponse.data;
      setWorkflows(workflowsData.workflows || []);

      // Fetch executions
      const executionsResponse = await api.get('/executions');
      const executionsData = executionsResponse.data;
      setExecutions(executionsData.executions || []);

      // Calculate stats
      const totalWorkflows = workflowsData.workflows?.length || 0;
      const activeWorkflows = workflowsData.workflows?.filter(w => w.is_active).length || 0;
      const pendingApprovals = executionsData.executions?.filter(e => e.status === 'in_progress').length || 0;
      const completedExecutions = executionsData.executions?.filter(e => e.status === 'completed').length || 0;
      const totalExecutions = executionsData.executions?.length || 0;
      const successRate = totalExecutions > 0 ? (completedExecutions / totalExecutions * 100).toFixed(1) : 0;

      setStats({
        totalWorkflows,
        activeWorkflows,
        pendingApprovals,
        successRate
      });
    } catch (error) {
      console.error('Error fetching manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "failed":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case "in_progress":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      pending: "bg-gray-100 text-gray-800"
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.pending}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage workflows and monitor team performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gray-200 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-gray-800" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWorkflows}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-gray-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeWorkflows}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-gray-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/workflow-editor')}
            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900 rounded-lg hover:from-gray-500 hover:to-gray-600"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Workflow
          </button>
          <button
            onClick={() => navigate('/execute-workflow')}
            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900 rounded-lg hover:from-gray-500 hover:to-gray-600"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            Execute Workflow
          </button>
          <button
            onClick={() => navigate('/approvals')}
            className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Approvals
          </button>
          <button
            onClick={() => navigate('/logs')}
            className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            View Logs
          </button>
        </div>
      </div>

      {/* Recent Activity Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow h-[500px] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Workflows</h2>
              <button
                onClick={() => navigate('/workflows')}
                className="text-lilac-primary hover:text-lilac-accent text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            {workflows.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No workflows created yet</p>
                <button
                  onClick={() => navigate('/workflow-editor')}
                  className="inline-flex items-center px-4 py-2 bg-lilac-primary text-white rounded-lg hover:bg-lilac-accent"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Workflow
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {workflows.slice(0, 8).map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{workflow.name}</h3>
                      <p className="text-xs text-gray-500">v{workflow.version}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/workflow-editor?id=${workflow.id}`)}
                        className="p-1 text-lilac-primary hover:text-lilac-accent"
                        title="Edit Workflow"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/execute-workflow?workflowId=${workflow.id}`)}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                        title="Execute Workflow"
                      >
                        <PlayIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow h-[500px]">
           <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
