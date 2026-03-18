import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  EyeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BellIcon,
  UserGroupIcon,
  CogIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  StarIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";


export default function DashboardBuilder() {
  const navigate = useNavigate();
  const [targetUsers, setTargetUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dashboardConfig, setDashboardConfig] = useState(null);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [editingAction, setEditingAction] = useState(null);

  // Widget types
  const widgetTypes = [
    { 
      id: 'stats', 
      name: 'Statistics Card', 
      icon: <ChartBarIcon className="w-5 h-5" />,
      description: 'Display key metrics and statistics',
      defaultConfig: { title: 'Total Workflows', key: 'total_workflows' }
    },
    { 
      id: 'chart', 
      name: 'Chart', 
      icon: <ChartBarIcon className="w-5 h-5" />,
      description: 'Visualize data with charts',
      defaultConfig: { type: 'bar', title: 'Performance', dataSource: 'executions' }
    },
    { 
      id: 'table', 
      name: 'Data Table', 
      icon: <DocumentTextIcon className="w-5 h-5" />,
      description: 'Display tabular data',
      defaultConfig: { title: 'Recent Items', columns: ['name', 'status', 'date'] }
    },
    { 
      id: 'alert', 
      name: 'Alert Card', 
      icon: <ExclamationTriangleIcon className="w-5 h-5" />,
      description: 'Show important alerts or notifications',
      defaultConfig: { type: 'warning', title: 'System Alert', message: 'Important information' }
    },
    { 
      id: 'progress', 
      name: 'Progress Bar', 
      icon: <ChartBarIcon className="w-5 h-5" />,
      description: 'Show progress towards goals',
      defaultConfig: { title: 'Completion Rate', target: 100, current: 75 }
    }
  ];

  // Action types
  const actionTypes = [
    { 
      id: 'navigation', 
      name: 'Navigation', 
      icon: <EyeIcon className="w-5 h-5" />,
      description: 'Navigate to another page',
      defaultConfig: { label: 'View Details', path: '/workflows' }
    },
    { 
      id: 'create', 
      name: 'Create Item', 
      icon: <PlusIcon className="w-5 h-5" />,
      description: 'Create new item',
      defaultConfig: { label: 'Create Workflow', path: '/workflow-editor' }
    },
    { 
      id: 'execute', 
      name: 'Execute Action', 
      icon: <ArrowPathIcon className="w-5 h-5" />,
      description: 'Execute workflow or process',
      defaultConfig: { label: 'Run Workflow', action: 'execute' }
    },
    { 
      id: 'approve', 
      name: 'Approval', 
      icon: <CheckCircleIcon className="w-5 h-5" />,
      description: 'Approve or reject items',
      defaultConfig: { label: 'Approve Request', action: 'approve' }
    },
    { 
      id: 'report', 
      name: 'Generate Report', 
      icon: <ChartBarIcon className="w-5 h-5" />,
      description: 'Generate reports',
      defaultConfig: { label: 'View Report', path: '/reports' }
    }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setTargetUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadDashboardConfig = async (userId) => {
    try {
      const response = await api.get(`/dashboard-configs/${userId}`);
      let config = response.data;

      if (config) {
        setDashboardConfig(config);
      } else {
        // Create default dashboard if none exists
        const user = targetUsers.find(u => u._id === userId);
        const defaultConfig = {
          title: `${user?.username || 'User'}'s Dashboard`,
          layout: 'grid',
          widgets: [],
          quickActions: [],
          permissions: [],
          theme: 'default',
          created_at: new Date().toISOString()
        };
        setDashboardConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error loading dashboard config:', error);
      // Fallback for 404/not found
      const user = targetUsers.find(u => u._id === userId);
      const defaultConfig = {
        title: `${user?.username || 'User'}'s Dashboard`,
        layout: 'grid',
        widgets: [],
        quickActions: [],
        permissions: [],
        theme: 'default',
        created_at: new Date().toISOString()
      };
      setDashboardConfig(defaultConfig);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    loadDashboardConfig(user._id);
  };

  const saveDashboardConfig = async () => {
    if (!selectedUser || !dashboardConfig) return;

    try {
      const response = await api.post('/dashboard-configs', {
        ...dashboardConfig,
        user_id: selectedUser._id,
        updated_at: new Date().toISOString()
      });

      if (response.status === 200 || response.status === 201) {
        alert('Dashboard configuration saved successfully!');
      } else {
        alert('Failed to save dashboard configuration');
      }
    } catch (error) {
      console.error('Error saving dashboard config:', error);
      alert('Error saving dashboard configuration');
    }
  };

  const addWidget = (widgetType) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType.id,
      ...widgetType.defaultConfig,
      position: { x: 0, y: 0, width: 4, height: 2 }
    };

    setDashboardConfig({
      ...dashboardConfig,
      widgets: [...(dashboardConfig.widgets || []), newWidget]
    });

    setShowWidgetModal(false);
    setEditingWidget(null);
  };

  const updateWidget = (widgetId, updates) => {
    setDashboardConfig({
      ...dashboardConfig,
      widgets: dashboardConfig.widgets.map(w => 
        w.id === widgetId ? { ...w, ...updates } : w
      )
    });
  };

  const deleteWidget = (widgetId) => {
    setDashboardConfig({
      ...dashboardConfig,
      widgets: dashboardConfig.widgets.filter(w => w.id !== widgetId)
    });
  };

  const addAction = (actionType) => {
    const newAction = {
      id: `action-${Date.now()}`,
      type: actionType.id,
      ...actionType.defaultConfig
    };

    setDashboardConfig({
      ...dashboardConfig,
      quickActions: [...(dashboardConfig.quickActions || []), newAction]
    });

    setShowActionModal(false);
    setEditingAction(null);
  };

  const updateAction = (actionId, updates) => {
    setDashboardConfig({
      ...dashboardConfig,
      quickActions: dashboardConfig.quickActions.map(a => 
        a.id === actionId ? { ...a, ...updates } : a
      )
    });
  };

  const deleteAction = (actionId) => {
    setDashboardConfig({
      ...dashboardConfig,
      quickActions: dashboardConfig.quickActions.filter(a => a.id !== actionId)
    });
  };


  const deleteRole = (roleId) => {
    // Role deletion no longer handled here as we focus on users
  };

  const renderWidgetPreview = (widget) => {
    switch (widget.type) {
      case 'stats':
        return (
          <div className="bg-lilac-bg/50 rounded-2xl p-4 border border-lilac-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-lilac-muted">{widget.title}</p>
                <p className="text-2xl font-black text-lilac-text mt-1">0</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-lilac-primary to-lilac-accent rounded-xl flex items-center justify-center shadow-md">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      case 'chart':
        return (
          <div className="bg-lilac-bg/50 rounded-2xl p-4 border border-lilac-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-lilac-muted mb-3">{widget.title}</h3>
            <div className="h-32 bg-gradient-to-br from-lilac-bg to-lilac-secondary/30 rounded-xl flex items-center justify-center border border-lilac-border/30">
              <ChartBarIcon className="w-10 h-10 text-lilac-primary opacity-50" />
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="bg-white/50 rounded-2xl p-4 border border-lilac-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-lilac-muted mb-3">{widget.title}</h3>
            <div className="overflow-hidden rounded-xl border border-lilac-border">
              <table className="min-w-full text-xs">
                <thead className="bg-lilac-bg/50">
                  <tr>
                    {widget.columns?.map(col => (
                      <th key={col} className="px-3 py-2 text-left text-xs font-bold text-lilac-text uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-lilac-border">
                  <tr>
                    <td colSpan={widget.columns?.length || 3} className="px-3 py-4 text-center text-lilac-muted font-medium italic">
                      No data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'alert':
        return (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md mr-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-800">{widget.title}</h3>
                <p className="text-xs font-medium text-rose-700 mt-0.5">{widget.message}</p>
              </div>
            </div>
          </div>
        );
      case 'progress':
        return (
          <div className="bg-white/50 rounded-2xl p-4 border border-lilac-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-lilac-muted mb-3">{widget.title}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-lilac-text uppercase">Overall Progress</span>
                <span className="text-lg font-black text-lilac-accent leading-none">{widget.current || 0}%</span>
              </div>
              <div className="w-full bg-lilac-border/30 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-lilac-primary to-lilac-accent h-full rounded-full shadow-[0_0_12px_rgba(200,162,255,0.4)]" 
                  style={{ width: `${widget.current || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white/50 rounded-2xl p-4 border border-lilac-border">
            <p className="text-lilac-muted font-medium">Unknown widget type</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.1)] border border-lilac-border p-6 md:p-8">
        <h1 className="text-2xl md:text-4xl font-black text-lilac-text tracking-tight uppercase">Dashboard Builder</h1>
        <p className="text-lilac-muted font-medium mt-2">Create custom dashboards for each user role</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-lilac-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-lilac-text flex items-center">
                 <UserGroupIcon className="w-6 h-6 mr-2 text-lilac-primary" />
                 Select User
              </h2>
              <button
                onClick={() => navigate('/role-management')}
                className="flex items-center px-3 py-1.5 bg-lilac-secondary text-lilac-accent border border-lilac-primary/30 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-lilac-bg transition-all"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Manage
              </button>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {targetUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group ${
                    selectedUser?._id === user._id
                      ? 'border-lilac-primary bg-lilac-secondary text-lilac-accent shadow-md'
                      : 'border-lilac-border hover:border-lilac-primary bg-lilac-bg/30 text-lilac-text hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
                        selectedUser?._id === user._id ? 'bg-white text-lilac-primary' : 'bg-white text-lilac-muted group-hover:text-lilac-primary'
                      }`}>
                        <UserGroupIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-bold text-sm block">{user.username}</span>
                        <div className={`text-xs font-bold uppercase tracking-widest mt-0.5 ${
                          selectedUser?._id === user._id ? 'text-lilac-accent/70' : 'text-lilac-muted'
                        }`}>{user.role}</div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedUser && (
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => setShowWidgetModal(true)}
                  className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-lilac-primary to-lilac-accent text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(200,162,255,0.39)] hover:opacity-90 transition-all"
                >
                  <PlusIcon className="w-5 h-5 mr-3" />
                  Add Widget
                </button>
                <button
                  onClick={() => setShowActionModal(true)}
                  className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-lilac-primary to-lilac-accent text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(200,162,255,0.39)] hover:opacity-90 transition-all"
                >
                  <PlusIcon className="w-5 h-5 mr-3" />
                  Add Action
                </button>
                <button
                  onClick={saveDashboardConfig}
                  className="w-full flex items-center justify-center px-6 py-3 bg-lilac-secondary text-lilac-accent border border-lilac-primary/30 font-bold rounded-xl hover:bg-lilac-bg transition-all"
                >
                  <ArrowPathIcon className="w-5 h-5 mr-3" />
                  Save Changes
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center justify-center px-6 py-3 border border-lilac-border text-lilac-text font-bold rounded-xl hover:bg-lilac-bg transition-all"
                >
                  <EyeIcon className="w-5 h-5 mr-3" />
                  Live Preview
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Configuration */}
        <div className="lg:col-span-2">
          {selectedUser && dashboardConfig ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-lilac-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-lilac-border">
                <h2 className="text-xl font-black text-lilac-text tracking-tight uppercase">
                  {selectedUser.username}'s Layout
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-lilac-bg text-lilac-accent text-xs font-black uppercase tracking-widest rounded-xl border border-lilac-border">
                    {dashboardConfig.widgets?.length || 0} Widgets
                  </span>
                  <span className="px-3 py-1.5 bg-lilac-bg text-lilac-accent text-xs font-black uppercase tracking-widest rounded-xl border border-lilac-border">
                    {dashboardConfig.quickActions?.length || 0} Actions
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800">
                  {selectedUser.username}'s Dashboard Configuration
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">
                    {dashboardConfig.widgets?.length || 0} widgets
                  </span>
                  <span className="text-sm text-slate-600">
                    {dashboardConfig.quickActions?.length || 0} actions
                  </span>
                </div>
              </div>

              {/* Dashboard Settings */}
              <div className="mb-8 p-6 bg-lilac-bg/30 border border-lilac-border rounded-2xl group focus-within:border-lilac-primary transition-colors">
                <label className="block text-xs font-black text-lilac-muted uppercase tracking-widest mb-3">
                  Dashboard Title
                </label>
                <div className="relative">
                   <input
                    type="text"
                    value={dashboardConfig.title || ''}
                    onChange={(e) => setDashboardConfig({
                      ...dashboardConfig,
                      title: e.target.value
                    })}
                    className="w-full px-4 py-3 bg-white border border-lilac-border rounded-xl text-lilac-text font-bold focus:ring-4 focus:ring-lilac-primary/20 focus:border-lilac-primary outline-none transition-all placeholder:text-lilac-muted/50"
                    placeholder="Enter dashboard title"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                     <PencilIcon className="w-5 h-5 text-lilac-primary" />
                  </div>
                </div>
              </div>

              {/* Widgets Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-lilac-text mb-6 flex items-center">
                  <ChartBarIcon className="w-6 h-6 mr-3 text-lilac-primary" />
                  Widgets
                </h3>
                {dashboardConfig.widgets?.length === 0 ? (
                  <div className="text-center py-12 bg-lilac-bg/20 border border-dashed border-lilac-border rounded-2xl">
                    <DocumentTextIcon className="w-16 h-16 text-lilac-muted/30 mx-auto mb-4" />
                    <p className="text-lilac-text font-bold uppercase tracking-widest text-sm">No widgets added yet</p>
                    <p className="text-xs text-lilac-muted mt-2 font-medium">Click "Add Widget" to populate your dashboard</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {dashboardConfig.widgets.map((widget) => (
                      <div key={widget.id} className="bg-white/50 border border-lilac-border rounded-2xl p-6 hover:border-lilac-primary hover:shadow-lg transition-all group">
                        <div className="flex items-center justify-between mb-5">
                          <h4 className="font-black text-lilac-text tracking-tight uppercase">{widget.title || 'Untitled Widget'}</h4>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setEditingWidget(widget)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-lilac-bg text-lilac-accent hover:bg-lilac-primary hover:text-white border border-lilac-border transition-all"
                              title="Edit widget"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteWidget(widget.id)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100 transition-all"
                              title="Delete widget"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="group-hover:opacity-90 transition-opacity">
                          {renderWidgetPreview(widget)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Section */}
              <div>
                <h3 className="text-lg font-bold text-lilac-text mb-6 flex items-center">
                  <CogIcon className="w-6 h-6 mr-3 text-lilac-primary" />
                  Quick Actions
                </h3>
                {dashboardConfig.quickActions?.length === 0 ? (
                  <div className="text-center py-12 bg-lilac-bg/20 border border-dashed border-lilac-border rounded-2xl">
                    <CogIcon className="w-16 h-16 text-lilac-muted/30 mx-auto mb-4" />
                    <p className="text-lilac-text font-bold uppercase tracking-widest text-sm">No actions added yet</p>
                    <p className="text-xs text-lilac-muted mt-2 font-medium">Click "Add Action" to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dashboardConfig.quickActions.map((action) => (
                      <div key={action.id} className="bg-white/50 border border-lilac-border rounded-2xl p-5 hover:border-lilac-primary hover:shadow-lg transition-all group">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-black text-lilac-text tracking-tight uppercase">{action.label || 'Untitled Action'}</h4>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditingAction(action)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-lilac-bg text-lilac-accent hover:bg-lilac-primary hover:text-white transition-all"
                              title="Edit action"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAction(action.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                              title="Delete action"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl border border-lilac-border">
                          <div className="w-10 h-10 bg-gradient-to-br from-lilac-primary to-lilac-accent rounded-xl flex items-center justify-center shadow-md">
                            <PlusIcon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs font-bold text-lilac-accent truncate uppercase tracking-widest">{action.path || action.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-lilac-border p-16 text-center">
              <div className="w-24 h-24 bg-lilac-bg rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-lilac-border animate-bounce-slow">
                 <UserGroupIcon className="w-12 h-12 text-lilac-primary" />
              </div>
              <h3 className="text-xl font-black text-lilac-text uppercase tracking-tight mb-2">Configure Layout</h3>
              <p className="text-lilac-muted font-medium max-w-xs mx-auto">Choose a user from the left panel to begin personalizing their dashboard experience.</p>
            </div>
          )}
        </div>
      </div>

      {/* Widget Modal */}
      {showWidgetModal && (
        <div className="fixed inset-0 bg-lilac-text/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl w-full border border-lilac-border relative">
            <button
              onClick={() => setShowWidgetModal(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-lilac-bg text-lilac-muted hover:text-lilac-text transition-colors border border-lilac-border"
            >
              <PlusIcon className="w-6 h-6 rotate-45" />
            </button>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-lilac-text uppercase tracking-tight">Add Widget</h3>
              <p className="text-lilac-muted font-medium mt-1">Select a component to add to the dashboard</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {widgetTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => addWidget(type)}
                  className="p-5 bg-white border border-lilac-border rounded-2xl hover:border-lilac-primary hover:bg-lilac-bg transition-all duration-300 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-lilac-primary to-lilac-accent rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                      {type.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-lilac-text tracking-tight uppercase text-sm">{type.name}</h4>
                      <p className="text-xs text-lilac-muted mt-1 leading-relaxed font-medium">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-lilac-text/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl w-full border border-lilac-border relative">
            <button
              onClick={() => setShowActionModal(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-lilac-bg text-lilac-muted hover:text-lilac-text transition-colors border border-lilac-border"
            >
              <PlusIcon className="w-6 h-6 rotate-45" />
            </button>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-lilac-text uppercase tracking-tight">Add Quick Action</h3>
              <p className="text-lilac-muted font-medium mt-1">Select an action shortcut for this user</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {actionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => addAction(type)}
                  className="p-5 bg-white border border-lilac-border rounded-2xl hover:border-lilac-primary hover:bg-lilac-bg transition-all duration-300 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-lilac-primary to-lilac-accent rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                      {type.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-lilac-text tracking-tight uppercase text-sm">{type.name}</h4>
                      <p className="text-xs text-lilac-muted mt-1 leading-relaxed font-medium">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
