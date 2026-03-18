import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PlusIcon, 
  PlayIcon, 
  DocumentTextIcon, 
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import api from "../../api/axios";
import ActivityFeed from "../../components/ActivityFeed";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [myWorkflows, setMyWorkflows] = useState([]);
  const [myExecutions, setMyExecutions] = useState([]);
  const [stats, setStats] = useState({
    totalExecutions: 0,
    pendingApprovals: 0,
    completedTasks: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      // Fetch workflows (employee can see active workflows)
      const workflowsResponse = await api.get('/workflows');
      const workflowsData = workflowsResponse.data;
      setMyWorkflows(workflowsData.workflows?.filter(w => w.is_active) || []);

      // Fetch executions for current user
      const executionsResponse = await api.get('/executions');
      const executionsData = executionsResponse.data;
      
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userExecutions = executionsData.executions?.filter(e => e.triggered_by === storedUser.username) || [];
      setMyExecutions(userExecutions);

      // Calculate stats
      const totalExecutions = userExecutions.length;
      const pendingApprovals = userExecutions.filter(e => e.status === 'in_progress').length;
      const completedTasks = userExecutions.filter(e => e.status === 'completed').length;
      const successRate = totalExecutions > 0 ? (completedTasks / totalExecutions * 100).toFixed(1) : 0;

      setStats({
        totalExecutions,
        pendingApprovals,
        completedTasks,
        successRate
      });
    } catch (error) {
      console.error('Error fetching employee data:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your workflow executions and tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              <PlayIcon className="w-6 h-6 text-gray-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Executions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalExecutions}</p>
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
              <CheckCircleIcon className="w-6 h-6 text-gray-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gray-200 rounded-lg">
              <BellIcon className="w-6 h-6 text-gray-800" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/execute-workflow')}
            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900 rounded-lg hover:from-gray-500 hover:to-gray-600"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            Execute Workflow
          </button>
          <button
            onClick={() => navigate('/logs')}
            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900 rounded-lg hover:from-gray-500 hover:to-gray-600"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            View Executions
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <BellIcon className="w-5 h-5 mr-2" />
            Notifications
          </button>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow h-[400px] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">My Recent Executions</h2>
                        <button
                            onClick={() => navigate('/logs')}
                            className="text-lilac-primary hover:text-lilac-accent text-sm font-medium"
                        >
                            View All
                        </button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {myExecutions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No executions yet</p>
                            <button
                                onClick={() => navigate('/execute-workflow')}
                                className="inline-flex items-center px-4 py-2 bg-lilac-primary text-white rounded-lg hover:bg-lilac-accent"
                            >
                                <PlayIcon className="w-4 h-4 mr-2" />
                                Execute Your First Workflow
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myExecutions.slice(0, 5).map((execution) => (
                                <div key={execution.id} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {execution.workflow_name || 'Unknown Workflow'}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(execution.status)}
                                            {getStatusBadge(execution.status)}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        <p>Execution ID: {execution.id}</p>
                                        <p>Started: {formatDate(execution.started_at)}</p>
                                    </div>
                                    <div className="mt-2">
                                        <button
                                            onClick={() => navigate(`/logs?id=${execution.id}`)}
                                            className="flex items-center text-lilac-primary hover:text-lilac-accent text-sm"
                                        >
                                            <DocumentTextIcon className="w-4 h-4 mr-1" />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow h-[400px]">
                <ActivityFeed />
            </div>
        </div>
      </div>
    </div>
  );
}
