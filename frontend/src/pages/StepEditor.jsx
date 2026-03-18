import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  DocumentTextIcon, 
  PencilIcon, 
  FunnelIcon, 
  TrashIcon 
} from "@heroicons/react/24/outline";

export default function StepEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('workflowId');
  
  const [workflow, setWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [saving, setSaving] = useState(false);

  const [newStep, setNewStep] = useState({
    name: '',
    step_type: 'task',
    order: 1,
    metadata: {}
  });

  const stepTypes = [
    { value: 'task', label: 'Task', description: 'Execute automated or manual tasks' },
    { value: 'approval', label: 'Approval', description: 'Require user approval' },
    { value: 'notification', label: 'Notification', description: 'Send alerts or messages' }
  ];

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
    } else {
      navigate('/');
      return;
    }

    fetchUsers();
    if (workflowId && workflowId !== 'new') {
      fetchWorkflowData();
    } else {
      setLoading(false);
    }
  }, [workflowId, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/workflows/${workflowId}`);
      const data = response.data;
      if (data.success) {
        setWorkflow(data.workflow);
        setSteps(data.workflow.steps || []);
      }
    } catch (error) {
      console.error('Error fetching workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = async () => {
    if (!newStep.name) return;

    setSaving(true);
    try {
      const response = await api.post(`/workflows/${workflowId}/steps`, {
        name: newStep.name,
        step_type: newStep.step_type,
        order: steps.length + 1,
        metadata: newStep.step_type === 'approval' 
          ? { assignee_email: '', instructions: '' }
          : newStep.step_type === 'notification'
          ? { notification_channel: 'email', template: '', recipients: [] }
          : { task_type: 'manual', description: '' }
      });

      const data = response.data;
      if (data.success) {
        setSteps([...steps, data.step]);
        setNewStep({
          name: '',
          step_type: 'task',
          order: steps.length + 2,
          metadata: {}
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding step:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = async (stepId) => {
    if (!confirm('Are you sure you want to delete this step?')) return;

    try {
      const response = await api.delete(`/steps/${stepId}`);
      if (response.status === 200) {
        setSteps(steps.filter(step => step.id !== stepId));
        if (editingStep === stepId) {
          setEditingStep(null);
        }
      }
    } catch (error) {
      console.error('Error deleting step:', error);
    }
  };

  const handleUpdateStep = async (stepId, updates) => {
    try {
      const response = await api.put(`/steps/${stepId}`, updates);
      const data = response.data;
      if (data.success) {
        setSteps(steps.map(step => 
          step.id === stepId ? data.step : step
        ));
      }
    } catch (error) {
      console.error('Error updating step:', error);
    }
  };

  const getStepTypeLabel = (type) => {
    const stepType = stepTypes.find(t => t.value === type);
    return stepType?.label || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.inactive;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lilac-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (workflowId && workflowId !== 'new') {
                navigate(`/workflow-editor?id=${workflowId}`);
              } else {
                navigate('/workflows');
              }
            }}
            className="p-2 text-lilac-muted hover:text-lilac-accent hover:bg-lilac-bg rounded-xl transition-colors flex-shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-lilac-text">Step Editor</h1>
            <p className="text-lilac-muted font-medium mt-1">
              {workflow ? `Workflow: ${workflow.name}` : 'Configure workflow steps'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-lilac-primary to-lilac-accent text-white rounded-xl shadow-[0_4px_14px_0_rgba(200,162,255,0.39)] hover:shadow-[0_6px_20px_rgba(167,123,255,0.23)] transition-all transform hover:-translate-y-0.5"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Step
        </button>
      </div>

      {/* Add Step Form */}
      {showAddForm && (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.1)] p-4 sm:p-6 border border-lilac-border">
          <h3 className="text-lg font-bold text-lilac-text mb-4">Add New Step</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-lilac-text mb-2">Step Name</label>
              <input
                type="text"
                value={newStep.name}
                onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text placeholder-lilac-muted rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary text-sm shadow-sm transition-all"
                placeholder="e.g., Review Request"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-lilac-text mb-2">Step Type</label>
              <select
                value={newStep.step_type}
                onChange={(e) => setNewStep({ ...newStep, step_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary text-sm shadow-sm transition-all"
              >
                {stepTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 sm:gap-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 sm:px-5 py-2.5 font-medium text-lilac-text hover:bg-lilac-bg border border-transparent hover:border-lilac-border rounded-xl transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleAddStep}
              disabled={saving || !newStep.name}
              className="px-4 sm:px-5 py-2.5 font-medium bg-gradient-to-r from-lilac-primary to-lilac-accent text-white rounded-xl shadow-[0_4px_14px_0_rgba(200,162,255,0.39)] hover:shadow-[0_6px_20px_rgba(167,123,255,0.23)] disabled:opacity-50 transition-all text-sm sm:text-base transform hover:-translate-y-0.5"
            >
              {saving ? 'Adding...' : 'Add Step'}
            </button>
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-4">
        {steps.length === 0 ? (
          <div className="bg-lilac-bg/30 rounded-2xl shadow-sm p-12 text-center border-2 border-dashed border-lilac-border">
            <DocumentTextIcon className="w-12 h-12 text-lilac-accent mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-lilac-text mb-2">No steps yet</h3>
            <p className="text-lilac-muted font-medium mb-6">Add your first workflow step to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-5 py-2.5 font-medium bg-gradient-to-r from-lilac-primary to-lilac-accent text-white rounded-xl shadow-[0_4px_14px_0_rgba(200,162,255,0.39)] hover:shadow-[0_6px_20px_rgba(167,123,255,0.23)] transition-all transform hover:-translate-y-0.5"
            >
              Add First Step
            </button>
          </div>
        ) : (
          [...steps].sort((a, b) => a.order - b.order).map((step, index) => (
            <div key={step.id} className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(200,162,255,0.1)] border border-lilac-border overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(167,123,255,0.2)] hover:border-lilac-secondary transition-all">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-lilac-primary to-lilac-accent text-white rounded-xl flex items-center justify-center font-bold shadow-[0_4px_14px_0_rgba(200,162,255,0.39)]">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      {editingStep === step.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            defaultValue={step.name}
                            onBlur={(e) => {
                              handleUpdateStep(step.id, { name: e.target.value });
                              setEditingStep(null);
                            }}
                            className="text-lg font-bold text-lilac-text px-3 py-1.5 border border-lilac-primary rounded-xl focus:ring-2 focus:ring-lilac-primary/50 w-full shadow-sm"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-lilac-text">{step.name}</h3>
                            <span className="px-3 py-1 bg-lilac-secondary text-lilac-text text-xs font-semibold rounded-full border border-lilac-border">
                              {getStepTypeLabel(step.step_type)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-lilac-muted mt-1.5 flex items-center">
                            Order: {step.order} <span className="mx-2">•</span> {step.rules?.length || 0} rules
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingStep(editingStep === step.id ? null : step.id)}
                      className="p-2 text-lilac-muted hover:text-lilac-accent hover:bg-lilac-bg rounded-xl transition-colors"
                      title="Edit Name"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/rule-editor?stepId=${step.id}`)}
                      className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                      title="Manage Rules"
                    >
                      <FunnelIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStep(step.id)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Step"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Step Configuration */}
                <div className="mt-5 pt-5 border-t border-lilac-border">
                  <h4 className="text-sm font-bold text-lilac-text mb-4">Configuration Settings</h4>
                  
                  {step.step_type === 'approval' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-lilac-text mb-2">Specific Assignee</label>
                        <select
                          value={step.metadata?.assignee_id || ''}
                          onChange={(e) => {
                            const selectedUser = users.find(u => u._id === e.target.value);
                            handleUpdateStep(step.id, { 
                              metadata: { 
                                ...step.metadata, 
                                assignee_id: e.target.value,
                                assignee_name: selectedUser ? (selectedUser.displayName || selectedUser.username) : '',
                                assignee_email: selectedUser ? (selectedUser.email || '') : '',
                                target_role: '' // Clear target role if specific user is selected
                              }
                            });
                          }}
                          className="w-full px-4 py-2 bg-white border border-lilac-border text-lilac-text rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
                        >
                          <option value="">None (Broadcast to Role)</option>
                          {users.map(u => (
                            <option key={u._id} value={u._id}>
                              {u.displayName || u.username} ({u.role})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-lilac-text mb-2">Target Role (Broadcast)</label>
                        <select
                          disabled={!!step.metadata?.assignee_id}
                          value={step.metadata?.target_role || ''}
                          onChange={(e) => handleUpdateStep(step.id, { 
                            metadata: { ...step.metadata, target_role: e.target.value }
                          })}
                          className="w-full px-4 py-2 bg-white border border-lilac-border text-lilac-text rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm disabled:cursor-not-allowed disabled:bg-lilac-bg/80 disabled:opacity-75"
                        >
                          <option value="">Select Role</option>
                          <option value="Manager">Managers</option>
                          <option value="Finance">Finance</option>
                          <option value="CEO">CEO</option>
                          <option value="Developer">Developers</option>
                          <option value="admin">Admins</option>
                        </select>
                        {step.metadata?.assignee_id && (
                          <p className="text-xs font-medium text-lilac-muted mt-2">Role broadcast disabled when specific user is set</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-lilac-text mb-2">Instructions</label>
                        <input
                          type="text"
                          value={step.metadata?.instructions || ''}
                          onChange={(e) => handleUpdateStep(step.id, { 
                            metadata: { ...step.metadata, instructions: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text placeholder-lilac-muted rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
                          placeholder="Review and approve the request"
                        />
                      </div>
                    </div>
                  )}

                {step.step_type === 'notification' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-lilac-text mb-2">Channel</label>
                      <select
                        value={step.metadata?.notification_channel || 'email'}
                        onChange={(e) => handleUpdateStep(step.id, { 
                          metadata: { ...step.metadata, notification_channel: e.target.value }
                        })}
                        className="w-full px-4 py-2 bg-white border border-lilac-border text-lilac-text rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
                      >
                        <option value="email">Email</option>
                        <option value="slack">Slack</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-lilac-text mb-2">Recipients (comma-separated)</label>
                      <input
                        type="text"
                        value={(step.metadata?.recipients || []).join(', ')}
                        onChange={(e) => handleUpdateStep(step.id, { 
                          metadata: { ...step.metadata, recipients: e.target.value.split(',').map(r => r.trim()).filter(r => r) }
                        })}
                        className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text placeholder-lilac-muted rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
                        placeholder="user1@example.com, user2@example.com"
                      />
                    </div>
                  </div>
                )}

                {step.step_type === 'task' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-lilac-text mb-2">Task Type</label>
                      <select
                        value={step.metadata?.task_type || 'manual'}
                        onChange={(e) => handleUpdateStep(step.id, { 
                          metadata: { ...step.metadata, task_type: e.target.value }
                        })}
                        className="w-full px-4 py-2 bg-white border border-lilac-border text-lilac-text rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
                      >
                        <option value="manual">Manual</option>
                        <option value="automated">Automated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-lilac-text mb-2">Description</label>
                      <input
                        type="text"
                        value={step.metadata?.description || ''}
                        onChange={(e) => handleUpdateStep(step.id, { 
                          metadata: { ...step.metadata, description: e.target.value }
                        })}
                        className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text placeholder-lilac-muted rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
                        placeholder="Task description"
                      />
                    </div>
                    {step.metadata?.task_type === 'manual' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                        <div>
                          <label className="block text-sm font-semibold text-lilac-text mb-2">Specific Assignee</label>
                          <select
                            value={step.metadata?.assignee_id || ''}
                            onChange={(e) => {
                              const selectedUser = users.find(u => u._id === e.target.value);
                              handleUpdateStep(step.id, { 
                                metadata: { 
                                  ...step.metadata, 
                                  assignee_id: e.target.value,
                                  assignee_name: selectedUser ? (selectedUser.displayName || selectedUser.username) : '',
                                  assignee_email: selectedUser ? (selectedUser.email || '') : '',
                                  target_role: ''
                                }
                              });
                            }}
                            className="w-full px-4 py-2 bg-white border border-lilac-border text-lilac-text rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
                          >
                            <option value="">None (Broadcast to Role)</option>
                            {users.map(u => (
                              <option key={u._id} value={u._id}>
                                {u.displayName || u.username} ({u.role})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-lilac-text mb-2">Target Role (Broadcast)</label>
                          <select
                            disabled={!!step.metadata?.assignee_id}
                            value={step.metadata?.target_role || ''}
                            onChange={(e) => handleUpdateStep(step.id, { 
                              metadata: { ...step.metadata, target_role: e.target.value }
                            })}
                            className="w-full px-4 py-2 bg-white border border-lilac-border text-lilac-text rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm disabled:cursor-not-allowed disabled:bg-lilac-bg/80 disabled:opacity-75"
                          >
                            <option value="">Select Role</option>
                            <option value="Manager">Managers</option>
                            <option value="Finance">Finance</option>
                            <option value="CEO">CEO</option>
                            <option value="Developer">Developers</option>
                            <option value="admin">Admins</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Rules Preview */}
              {step.rules && step.rules.length > 0 && (
                <div className="mt-5 pt-5 border-t border-lilac-border">
                  <div className="flex items-center gap-2 mb-3">
                    <FunnelIcon className="w-4 h-4 text-lilac-accent" />
                    <span className="text-sm font-bold text-lilac-text">Routing Rules</span>
                    <span className="text-xs font-semibold text-lilac-muted">({step.rules.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {step.rules.map((rule, idx) => (
                      <span key={rule.id || idx} className="px-3 py-1.5 bg-lilac-secondary/40 text-lilac-text font-medium text-xs rounded-xl border border-lilac-border">
                        {rule.condition === 'DEFAULT' ? 'Default Routing' : rule.condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}
