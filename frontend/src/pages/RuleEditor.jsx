import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";


export default function RuleEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStepId = searchParams.get('stepId');

  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [selectedStep, setSelectedStep] = useState(initialStepId);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newRule, setNewRule] = useState({
    condition: '',
    next_step_id: '',
    priority: 1
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    if (selectedWorkflow) {
      fetchSteps();
    }
  }, [selectedWorkflow]);

  useEffect(() => {
    if (selectedStep && !selectedStep.startsWith('temp-')) {
      fetchRules();
    } else if (selectedStep?.startsWith('temp-')) {
      setRules([]);
    }
  }, [selectedStep]);

  const fetchWorkflows = async () => {
    try {
      const response = await api.get('/workflows');
      const data = response.data;
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSteps = async () => {
    try {
      const response = await api.get(`/workflows/${selectedWorkflow}/steps`);
      const data = response.data;
      setSteps(data.steps || []);
    } catch (error) {
      console.error('Error fetching steps:', error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await api.get(`/steps/${selectedStep}/rules`);
      const data = response.data;
      setRules(data.rules || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const handleAddRule = async () => {
    if (!newRule.condition || !selectedStep) return;

    setSaving(true);
    try {
      const response = await api.post(`/steps/${selectedStep}/rules`, {
        condition: newRule.condition,
        next_step_id: newRule.next_step_id || null,
        priority: newRule.priority
      });

      const data = response.data;
      if (data.success) {
        setRules([...rules, data.rule]);
        setNewRule({
          condition: '',
          next_step_id: '',
          priority: rules.length + 1
        });
        setShowAddRuleForm(false);
      }
    } catch (error) {
      console.error('Error adding rule:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule?.condition === 'DEFAULT') {
      alert('Cannot delete the DEFAULT rule');
      return;
    }

    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await api.delete(`/rules/${ruleId}`);
      if (response.status === 200) {
        setRules(rules.filter(rule => rule.id !== ruleId));
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const moveRule = async (ruleId, direction) => {
    const ruleIndex = rules.findIndex(rule => rule.id === ruleId);
    const targetIndex = direction === 'up' ? ruleIndex - 1 : ruleIndex + 1;

    if (targetIndex < 0 || targetIndex >= rules.length) return;

    const ruleToMove = rules[ruleIndex];
    const targetRule = rules[targetIndex];

    if (ruleToMove.condition === 'DEFAULT' || targetRule.condition === 'DEFAULT') {
      return;
    }

    // Swap priorities
    const updatedRules = [...rules];
    const tempPriority = updatedRules[ruleIndex].priority;
    updatedRules[ruleIndex].priority = updatedRules[targetIndex].priority;
    updatedRules[targetIndex].priority = tempPriority;

    setRules(updatedRules);

    // Update in backend
    try {
      await Promise.all([
        api.put(`/rules/${ruleId}`, { priority: targetRule.priority }),
        api.put(`/rules/${targetRule.id}`, { priority: tempPriority })
      ]);
    } catch (error) {
      console.error('Error updating rule priorities:', error);
    }
  };

  const getRuleIcon = (condition) => {
    if (condition === 'DEFAULT') return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    if (condition.includes('&&') || condition.includes('||')) return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
  };

  const hasIncompleteRouting = (selectedStepId) => {
    if (!selectedStepId || steps.length === 0) return false;
    
    // Find if this is the last step by order
    const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
    const isLastStep = sortedSteps[sortedSteps.length - 1].id === selectedStepId;
    
    if (isLastStep) return false;

    // Check if the DEFAULT rule has a next_step_id
    const defaultRule = rules.find(r => r.condition === 'DEFAULT');
    return !defaultRule || !defaultRule.next_step_id;
  };

  const getRuleType = (condition) => {
    if (condition === 'DEFAULT') return 'default';
    if (condition.includes('&&') || condition.includes('||')) return 'complex';
    return 'simple';
  };

  const getRuleTypeStyles = (type) => {
    switch (type) {
      case 'default':
        return {
          border: 'border-gray-300',
          bg: 'bg-gray-50',
          badge: 'bg-gray-200 text-gray-800'
        };
      case 'complex':
        return {
          border: 'border-yellow-300',
          bg: 'bg-yellow-50',
          badge: 'bg-yellow-200 text-yellow-800'
        };
      default:
        return {
          border: 'border-green-300',
          bg: 'bg-green-50',
          badge: 'bg-green-200 text-green-800'
        };
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/workflows')}
            className="p-2 text-lilac-muted hover:text-lilac-accent hover:bg-lilac-bg rounded-xl transition-colors flex-shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-lilac-text">Rule Editor</h1>
            <p className="text-lilac-muted font-medium mt-1">Configure workflow routing rules</p>
          </div>
        </div>
      </div>

      {/* Workflow and Step Selection */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.1)] p-4 sm:p-6 border border-lilac-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-lilac-text mb-2">
              Workflow
            </label>
            <select
              value={selectedWorkflow || ''}
              onChange={(e) => {
                setSelectedWorkflow(e.target.value);
                setSelectedStep(null);
                setRules([]);
              }}
              className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
            >
              <option value="">Select workflow...</option>
              {workflows.map(workflow => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-lilac-text mb-2">
              Step
            </label>
            <select
              value={selectedStep || ''}
              onChange={(e) => {
                setSelectedStep(e.target.value);
                setRules([]);
              }}
              disabled={!selectedWorkflow}
              className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm disabled:cursor-not-allowed disabled:bg-lilac-bg/80 disabled:opacity-75"
            >
              <option value="">Select step...</option>
              {steps.map(step => (
                <option key={step.id} value={step.id}>
                  {step.name} (Order: {step.order})
                </option>
              ))}
            </select>
            {selectedStep && hasIncompleteRouting(selectedStep) && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-amber-800">
                  <span className="font-bold uppercase tracking-wider">Routing Warning:</span> This step is not yet linked to a subsequent step. It will end the workflow if executed. 
                  Assign a "Next Step" in the DEFAULT rule below.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rules Management */}
      {selectedStep && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-lilac-text">
                Rules for {steps.find(s => s.id === selectedStep)?.name}
              </h2>
              <p className="text-sm font-medium text-lilac-muted mt-1">{rules.length} rule(s) configured</p>
            </div>
            <button
              onClick={() => setShowAddRuleForm(!showAddRuleForm)}
              className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-lilac-primary to-lilac-accent text-white rounded-xl shadow-[0_4px_14px_0_rgba(200,162,255,0.39)] hover:shadow-[0_6px_20px_rgba(167,123,255,0.23)] transition-all transform hover:-translate-y-0.5"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Rule
            </button>
          </div>

          {/* Add Rule Form */}
          {showAddRuleForm && (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.1)] p-4 sm:p-6 border border-lilac-border">
              <h3 className="text-lg font-bold text-lilac-text mb-4">Create New Rule</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-lilac-text mb-2">
                    Condition
                  </label>
                  <textarea
                    value={newRule.condition}
                    onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text placeholder-lilac-muted rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm font-mono text-sm"
                    rows={2}
                    placeholder="e.g., amount > 1000 && priority == 'High'"
                  />
                  <p className="text-xs font-medium text-lilac-muted mt-2">
                    Use JavaScript operators: ==, !=, {'<'}, {'>'}, &&, ||
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-lilac-text mb-2">
                    Next Step
                  </label>
                  <select
                    value={newRule.next_step_id}
                    onChange={(e) => setNewRule({ ...newRule, next_step_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
                  >
                    <option value="">End Workflow</option>
                    {steps.filter(s => s.id !== selectedStep).map(step => (
                      <option key={step.id} value={step.id}>
                        {step.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-lilac-text mb-2">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={newRule.priority}
                    onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
                    min="1"
                  />
                  <p className="text-xs font-medium text-lilac-muted mt-2">Lower = higher priority</p>
                </div>
              </div>

              <div className="mt-5">
                <h4 className="text-sm font-semibold text-lilac-text mb-3">Quick Examples:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'amount > 1000',
                    'priority == "High"',
                    'department == "Finance"',
                    'status == "approved"'
                  ].map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setNewRule({ ...newRule, condition: example })}
                      className="px-4 py-2 bg-lilac-bg text-lilac-text text-sm font-medium rounded-xl hover:bg-lilac-secondary hover:text-lilac-accent transition-colors border border-transparent hover:border-lilac-secondary"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 sm:gap-4">
                <button
                  onClick={() => setShowAddRuleForm(false)}
                  className="px-4 sm:px-5 py-2.5 font-medium text-lilac-text hover:bg-lilac-bg border border-transparent hover:border-lilac-border rounded-xl transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRule}
                  disabled={saving || !newRule.condition}
                  className="px-4 sm:px-5 py-2.5 font-medium bg-gradient-to-r from-lilac-primary to-lilac-accent text-white rounded-xl shadow-[0_4px_14px_0_rgba(200,162,255,0.39)] hover:shadow-[0_6px_20px_rgba(167,123,255,0.23)] disabled:opacity-50 transition-all text-sm sm:text-base transform hover:-translate-y-0.5"
                >
                  {saving ? 'Adding...' : 'Add Rule'}
                </button>
              </div>
            </div>
          )}

          {/* Rules List */}
          {rules.length === 0 ? (
            <div className="bg-lilac-bg/30 rounded-2xl shadow-sm p-12 text-center border-2 border-dashed border-lilac-border">
              <DocumentTextIcon className="w-12 h-12 text-lilac-accent mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-lilac-text mb-2">No rules configured</h3>
              <p className="text-lilac-muted font-medium mb-6">Create your first rule to control workflow routing</p>
              <button
                onClick={() => setShowAddRuleForm(true)}
                className="px-5 py-2.5 font-medium bg-gradient-to-r from-lilac-primary to-lilac-accent text-white rounded-xl shadow-[0_4px_14px_0_rgba(200,162,255,0.39)] hover:shadow-[0_6px_20px_rgba(167,123,255,0.23)] transition-all transform hover:-translate-y-0.5"
              >
                Add First Rule
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {[...rules].sort((a, b) => a.priority - b.priority).map((rule, index) => {
                const ruleType = getRuleType(rule.condition);
                const styles = getRuleTypeStyles(ruleType); // Could map these to lilac analogues if desired, but retaining semantic colors (green, yellow, gray) for rules is often better UX.
                const nextStep = steps.find(s => s.id === rule.next_step_id);
                
                return (
                  <div
                    key={rule.id}
                    className={`border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${styles.border} ${styles.bg}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2.5 bg-white rounded-xl shadow-[0_2px_10px_0_rgba(200,162,255,0.15)] mt-0.5">
                          {getRuleIcon(rule.condition)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm font-bold text-gray-800">
                              Priority {rule.priority}
                            </span>
                            <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${styles.badge} ${styles.border}`}>
                              {ruleType}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">Condition:</span>
                              <code className="text-sm font-mono bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm inline-block text-gray-800 font-semibold break-all">
                                {rule.condition}
                              </code>
                            </div>
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">Next Step:</span>
                              <span className="text-sm font-bold text-gray-800 flex items-center pr-3">
                                {nextStep ? nextStep.name : 'End Workflow'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => moveRule(rule.id, 'up')}
                          disabled={index === 0 || rule.condition === 'DEFAULT'}
                          className="p-1.5 text-gray-500 hover:text-lilac-accent hover:bg-white rounded-lg shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-lilac-border"
                          title="Move Up"
                        >
                          <ArrowUpIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => moveRule(rule.id, 'down')}
                          disabled={index === rules.length - 1 || rule.condition === 'DEFAULT'}
                          className="p-1.5 text-gray-500 hover:text-lilac-accent hover:bg-white rounded-lg shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-lilac-border"
                          title="Move Down"
                        >
                          <ArrowDownIcon className="w-5 h-5" />
                        </button>
                        {rule.condition !== 'DEFAULT' && (
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg shadow-sm transition-colors border border-transparent hover:border-rose-200 mt-2"
                            title="Delete Rule"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!selectedStep && !initialStepId && (
        <div className="bg-lilac-bg/30 rounded-2xl shadow-sm p-12 text-center border-2 border-dashed border-lilac-border mt-6">
          <DocumentTextIcon className="w-12 h-12 text-lilac-accent mx-auto mb-4" />
          <h3 className="text-lg font-bold text-lilac-text mb-2">Select a workflow and step</h3>
          <p className="text-lilac-muted font-medium">Choose a workflow and step to manage routing rules</p>
        </div>
      )}
    </div>
  );
}
