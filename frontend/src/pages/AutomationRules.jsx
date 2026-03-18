import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { automationEngine } from "../services/NotificationService";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  PlayIcon,
  StopIcon,
  BellIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import api from "../api/axios";

export default function AutomationRules() {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [testMode, setTestMode] = useState(false);

  // Automation rule templates
  const ruleTemplates = [
    {
      name: "New User Welcome",
      description: "Send welcome notification when new user registers",
      trigger: "user_created",
      conditions: [
        { field: "user.role", operator: "equals", value: "employee" }
      ],
      actions: [
        {
          type: "send_notification",
          title: "Welcome to Workflow Pro!",
          message: "Hi {{user.name}}, welcome to our workflow management system!",
          recipients: "trigger_user",
          notification_type: "info"
        },
        {
          type: "create_page",
          page_type: "onboarding",
          template_id: "user_onboarding",
          recipients: "trigger_user"
        }
      ]
    },
    {
      name: "Workflow Approval Required",
      description: "Notify managers when workflow needs approval",
      trigger: "workflow_submitted",
      conditions: [
        { field: "workflow.requires_approval", operator: "equals", value: true }
      ],
      actions: [
        {
          type: "send_notification",
          title: "Approval Required",
          message: "Workflow '{{workflow.name}}' from {{user.name}} needs your approval",
          recipients: "role_based",
          notification_type: "approval"
        }
      ]
    },
    {
      name: "Task Overdue Alert",
      description: "Alert when tasks are overdue",
      trigger: "task_due",
      conditions: [
        { field: "task.status", operator: "equals", value: "pending" },
        { field: "task.due_date", operator: "less_than", value: "now" }
      ],
      actions: [
        {
          type: "send_notification",
          title: "Task Overdue",
          message: "Task '{{task.title}}' is overdue. Please take action.",
          recipients: "trigger_user",
          notification_type: "alert",
          priority: "high"
        }
      ]
    },
    {
      name: "Monthly Report Generation",
      description: "Generate and send monthly performance reports",
      trigger: "scheduled",
      conditions: [
        { field: "schedule.type", operator: "equals", value: "monthly" },
        { field: "schedule.day", operator: "equals", value: 1 }
      ],
      actions: [
        {
          type: "create_page",
          page_type: "report",
          template_id: "monthly_performance",
          recipients: "role_based"
        },
        {
          type: "send_notification",
          title: "Monthly Report Ready",
          message: "Your monthly performance report is now available",
          recipients: "role_based",
          notification_type: "info"
        }
      ]
    }
  ];

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const response = await api.get('/automation-rules');
      setRules(response.data);
    } catch (error) {
      console.error('Failed to load rules:', error);
    }
  };

  const saveRule = async () => {
    if (!editingRule.name || !editingRule.trigger) {
      alert('Please fill in all required fields');
      return;
    }

    const isExisting = editingRule._id;
    try {
      let response;
      if (isExisting) {
        response = await api.put(`/automation-rules/${editingRule._id}`, editingRule);
      } else {
        response = await api.post('/automation-rules', editingRule);
      }
      
      const savedRule = response.data;
      if (!isExisting) {
        setRules([savedRule, ...rules]);
      } else {
        setRules(rules.map(r => r._id === savedRule._id ? savedRule : r));
      }
      
      setShowCreateModal(false);
      setEditingRule(null);
      alert('Automation rule saved successfully!');
    } catch (error) {
      console.error('Failed to save rule:', error);
      alert('Failed to save rule');
    }
  };

  const deleteRule = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) {
      return;
    }

    try {
      await api.delete(`/automation-rules/${ruleId}`);
      setRules(rules.filter(r => r._id !== ruleId));
      alert('Automation rule deleted successfully!');
    } catch (error) {
      console.error('Failed to delete rule:', error);
      alert('Failed to delete rule');
    }
  };

  const toggleRule = async (ruleId) => {
    const rule = rules.find(r => r._id === ruleId);
    const updatedRule = { ...rule, enabled: !rule.enabled };

    try {
      await api.put(`/automation-rules/${ruleId}`, updatedRule);
      setRules(rules.map(r => r._id === ruleId ? updatedRule : r));
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const testRule = (rule) => {
    setTestMode(true);
    
    // Simulate test event
    const testEvent = {
      type: rule.trigger,
      data: {
        user: { name: 'Test User', id: 'test-user', role: 'employee' },
        workflow: { name: 'Test Workflow', requires_approval: true },
        task: { title: 'Test Task', status: 'pending', due_date: new Date(Date.now() - 86400000).toISOString() },
        timestamp: new Date().toISOString()
      }
    };

    automationEngine.executeAutomation(testEvent)
      .then(() => {
        alert('Test executed successfully! Check notifications for results.');
        setTestMode(false);
      })
      .catch(error => {
        console.error('Test failed:', error);
        alert('Test failed. Check console for details.');
        setTestMode(false);
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-lilac-border/50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-3 bg-white border border-lilac-border text-lilac-muted rounded-2xl hover:border-lilac-primary hover:text-lilac-primary hover:shadow-lg transition-all"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-lilac-primary/10 text-lilac-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-lilac-primary/20">
              <CogIcon className="w-3 h-3 mr-2" />
              Logic Orchestration
            </div>
            <h1 className="text-4xl font-black text-lilac-text tracking-tighter uppercase">
              Automation<span className="text-lilac-primary">Rules</span>
            </h1>
            <p className="text-lilac-muted font-bold mt-2 uppercase tracking-widest text-[10px] opacity-70 italic">
              Autonomous Protocol Configuration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTestMode(!testMode)}
            className={`flex items-center px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border ${
              testMode 
                ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' 
                : 'bg-white text-lilac-muted border-lilac-border hover:border-lilac-primary hover:text-lilac-primary'
            }`}
          >
            {testMode ? (
              <>
                <StopIcon className="w-4 h-4 mr-2" />
                Isolation Active
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4 mr-2" />
                Diagnostics
              </>
            )}
          </button>
          <button
            onClick={() => createRule()}
            className="group relative px-8 py-4 bg-lilac-text text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-lilac-primary/20 hover:-translate-y-1 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-lilac-primary to-lilac-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative z-10 flex items-center">
              <PlusIcon className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              New Protocol
            </span>
          </button>
        </div>
      </div>

      {/* Rule Templates */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-lilac-text uppercase tracking-tight">Rapid Deployment Matrix</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ruleTemplates.map((template) => (
            <div key={template.name} className="group bg-white/60 backdrop-blur-md border border-lilac-border p-6 rounded-[2rem] hover:border-lilac-primary hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-lilac-bg rounded-2xl flex items-center justify-center text-lilac-primary mb-4 group-hover:scale-110 transition-transform">
                <DocumentTextIcon className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lilac-text uppercase tracking-tight mb-2">{template.name}</h3>
              <p className="text-[10px] font-bold text-lilac-muted leading-relaxed uppercase opacity-70 mb-6">{template.description}</p>
              <button
                onClick={() => createRule(template)}
                className="w-full py-3 bg-lilac-bg text-lilac-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-lilac-primary hover:text-white transition-all shadow-sm"
              >
                Sync Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Rules */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-lilac-text uppercase tracking-tight">Active Pulse Engine</h2>
        <div className="bg-white/40 backdrop-blur-xl border border-lilac-border rounded-[2.5rem] shadow-2xl overflow-hidden">
          {rules.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-lilac-bg rounded-[2rem] flex items-center justify-center text-lilac-muted mx-auto mb-6">
                <CogIcon className="w-10 h-10 animate-spin-slow" />
              </div>
              <p className="text-lilac-text font-black uppercase tracking-widest text-sm">Engine Idling</p>
              <p className="text-[10px] font-bold text-lilac-muted uppercase italic tracking-widest mt-2">Initialize your first protocol to begin</p>
            </div>
          ) : (
            <div className="divide-y divide-lilac-border/30">
              {rules.map((rule) => (
                <div key={rule.id} className="group p-8 hover:bg-lilac-bg/20 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-black text-lilac-text uppercase tracking-tight">{rule.name}</h3>
                        {rule.enabled ? (
                          <span className="inline-flex items-center px-3 py-1 text-[9px] font-black text-emerald-700 bg-emerald-100 rounded-full border border-emerald-200 uppercase tracking-widest">
                            <CheckCircleIcon className="w-3 h-3 mr-2" />
                            Operational
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 text-[9px] font-black text-rose-700 bg-rose-100 rounded-full border border-rose-200 uppercase tracking-widest">
                            <StopIcon className="w-3 h-3 mr-2" />
                            Stationary
                          </span>
                        )}
                        {testMode && (
                          <span className="inline-flex items-center px-3 py-1 text-[9px] font-black text-amber-700 bg-amber-100 rounded-full border border-amber-200 uppercase tracking-widest shadow-sm">
                            <ExclamationTriangleIcon className="w-3 h-3 mr-2" />
                            Diagnostic Trace
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-lilac-muted uppercase leading-relaxed tracking-wider italic opacity-70 max-w-2xl">{rule.description}</p>
                      <div className="flex flex-wrap items-center gap-6 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-lilac-muted uppercase tracking-widest opacity-50">Pulse Trigger:</span>
                          <code className="bg-lilac-text text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-sm tracking-widest">{rule.trigger}</code>
                        </div>
                        <div className="h-4 w-[1px] bg-lilac-border"></div>
                        <span className="text-[9px] font-black text-lilac-text uppercase tracking-widest">{rule.conditions.length} Logical Gates</span>
                        <div className="h-4 w-[1px] bg-lilac-border"></div>
                        <span className="text-[9px] font-black text-lilac-text uppercase tracking-widest">{rule.actions.length} Action Nodes</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-8">
                      <button
                        onClick={() => testRule(rule)}
                        disabled={!testMode}
                        className="p-3 bg-white border border-lilac-border text-lilac-muted rounded-2xl hover:border-emerald-500 hover:text-emerald-500 hover:shadow-lg transition-all disabled:opacity-30"
                        title="Pulse Test"
                      >
                        <PlayIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`p-3 border rounded-2xl transition-all hover:shadow-lg ${
                          rule.enabled 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' 
                            : 'bg-white border-lilac-border text-lilac-muted hover:border-lilac-primary hover:text-lilac-primary'
                        }`}
                        title={rule.enabled ? 'Deactivate' : 'Activate'}
                      >
                        {rule.enabled ? <CheckCircleIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingRule(rule);
                          setShowCreateModal(true);
                        }}
                        className="p-3 bg-white border border-lilac-border text-lilac-muted rounded-2xl hover:border-lilac-primary hover:text-lilac-primary hover:shadow-lg transition-all"
                        title="Modify Code"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-3 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white hover:shadow-lg transition-all"
                        title="Purge Protocol"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-lilac-text/40 backdrop-blur-xl flex items-center justify-center z-50 p-6">
          <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-3xl font-black text-lilac-text uppercase tracking-tighter">
                    {editingRule._id ? 'Modify' : 'Initialize'} <span className="text-lilac-primary">Protocol</span>
                  </h3>
                  <p className="text-[10px] font-bold text-lilac-muted mt-2 uppercase tracking-widest italic opacity-70">Define autonomous logic bridge</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingRule(null);
                  }}
                  className="p-4 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-90"
                >
                  <PlusIcon className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">Protocol Identifier</label>
                  <input
                    type="text"
                    value={editingRule.name}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    className="w-full px-5 py-5 bg-white border border-lilac-border rounded-[1.5rem] focus:ring-8 focus:ring-lilac-primary/5 focus:border-lilac-primary outline-none transition-all font-bold text-lilac-text placeholder:text-lilac-muted/30"
                    placeholder="e.g., Security Uplink Welcome"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">Instruction Set</label>
                  <textarea
                    value={editingRule.description}
                    onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                    className="w-full px-5 py-5 bg-white border border-lilac-border rounded-[1.5rem] focus:ring-8 focus:ring-lilac-primary/5 focus:border-lilac-primary outline-none transition-all font-bold text-lilac-text placeholder:text-lilac-muted/30 min-h-[120px]"
                    placeholder="Describe the operational logic flow..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">Activation Trigger</label>
                    <div className="relative group">
                       <select
                        value={editingRule.trigger}
                        onChange={(e) => setEditingRule({ ...editingRule, trigger: e.target.value })}
                        className="w-full px-5 py-5 bg-white border border-lilac-border rounded-[1.5rem] focus:ring-8 focus:ring-lilac-primary/5 focus:border-lilac-primary outline-none transition-all font-black uppercase text-xs text-lilac-text appearance-none"
                      >
                        <option value="">Select Pulse Trigger...</option>
                        <option value="user_created">User Entry</option>
                        <option value="workflow_submitted">Logic Submission</option>
                        <option value="task_due">Temporal Milestone</option>
                        <option value="scheduled">Periodic Pulse</option>
                        <option value="data_changed">State Mutation</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-lilac-muted">
                        <CogIcon className="w-5 h-5 animate-spin-slow" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Preview */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">Execution Node Hooks</label>
                  <div className="grid grid-cols-1 gap-3">
                    {editingRule.actions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between p-5 bg-lilac-bg/50 border border-lilac-border rounded-2xl group hover:border-lilac-primary transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-lg text-lilac-primary shadow-sm group-hover:scale-110 transition-transform">
                            {action.type === 'send_notification' && <BellIcon className="w-5 h-5" />}
                            {action.type === 'create_page' && <DocumentTextIcon className="w-5 h-5" />}
                            {action.type === 'trigger_workflow' && <CogIcon className="w-5 h-5" />}
                          </div>
                          <span className="text-[10px] font-black text-lilac-text uppercase tracking-widest">{action.type.replace('_', ' ')}</span>
                        </div>
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500 opacity-50" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-12">
                <button
                  onClick={saveRule}
                  className="flex-1 group relative py-5 bg-lilac-text text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:shadow-lilac-text/20 hover:-translate-y-1 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-lilac-primary to-lilac-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative z-10">Commit Protocol</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingRule(null);
                  }}
                  className="px-10 py-5 bg-white border border-lilac-border text-lilac-muted rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-lilac-bg transition-colors"
                >
                  Abort
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
