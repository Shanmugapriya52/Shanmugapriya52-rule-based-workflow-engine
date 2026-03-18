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
  ArrowLeftIcon,
  CpuChipIcon,
  Cog6ToothIcon as CogIcon
} from "@heroicons/react/24/outline";


export default function RuleEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStepId = searchParams.get('stepId');

  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRuleFormFor, setShowAddRuleFormFor] = useState(null); // stepId
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
      fetchStepsAndRules();
    }
  }, [selectedWorkflow]);

  // Handle deep linking to specific step
  useEffect(() => {
    if (steps.length > 0 && initialStepId) {
      setTimeout(() => {
        const element = document.getElementById(`step-${initialStepId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [steps, initialStepId]);

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

  const fetchStepsAndRules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/workflows/${selectedWorkflow}/steps`);
      const stepsData = response.data.steps || [];
      
      // Fetch rules for all steps in parallel
      const stepsWithRules = await Promise.all(stepsData.map(async (step) => {
        try {
          const ruleRes = await api.get(`/steps/${step.id}/rules`);
          return { ...step, rules: ruleRes.data.rules || [] };
        } catch (err) {
          console.error(`Error fetching rules for step ${step.id}:`, err);
          return { ...step, rules: [] };
        }
      }));

      setSteps(stepsWithRules);
    } catch (error) {
      console.error('Error fetching steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (stepId) => {
    if (!newRule.condition || !stepId) return;

    setSaving(true);
    try {
      const response = await api.post(`/steps/${stepId}/rules`, {
        condition: newRule.condition,
        next_step_id: newRule.next_step_id || null,
        priority: newRule.priority
      });

      const data = response.data;
      if (data.success) {
        setSteps(steps.map(s => 
          s.id === stepId ? { ...s, rules: [...s.rules, data.rule] } : s
        ));
        setNewRule({
          condition: '',
          next_step_id: '',
          priority: 1
        });
        setShowAddRuleFormFor(null);
      }
    } catch (error) {
      console.error('Error adding rule:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (stepId, ruleId) => {
    const step = steps.find(s => s.id === stepId);
    const rule = step?.rules.find(r => r.id === ruleId);
    
    if (rule?.condition === 'DEFAULT') {
      alert('Cannot delete the DEFAULT rule');
      return;
    }

    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await api.delete(`/rules/${ruleId}`);
      if (response.status === 200) {
        setSteps(steps.map(s => 
          s.id === stepId ? { ...s, rules: s.rules.filter(r => r.id !== ruleId) } : s
        ));
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const moveRule = async (stepId, ruleId, direction) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    
    const step = steps[stepIndex];
    const rules = [...step.rules].sort((a, b) => a.priority - b.priority);
    const ruleIndex = rules.findIndex(rule => rule.id === ruleId);
    const targetIndex = direction === 'up' ? ruleIndex - 1 : ruleIndex + 1;

    if (targetIndex < 0 || targetIndex >= rules.length) return;

    const ruleToMove = rules[ruleIndex];
    const targetRule = rules[targetIndex];

    if (ruleToMove.condition === 'DEFAULT' || targetRule.condition === 'DEFAULT') {
      return;
    }

    // Swap priorities
    const tempPriority = ruleToMove.priority;
    ruleToMove.priority = targetRule.priority;
    targetRule.priority = tempPriority;

    // Local update
    const updatedSteps = [...steps];
    updatedSteps[stepIndex] = { ...step, rules: [...rules] };
    setSteps(updatedSteps);

    // Backend update
    try {
      await Promise.all([
        api.put(`/rules/${ruleId}`, { priority: ruleToMove.priority }),
        api.put(`/rules/${targetRule.id}`, { priority: targetRule.priority })
      ]);
    } catch (error) {
      console.error('Error updating rule priorities:', error);
      // Revert if needed or fetch fresh data
      fetchStepsAndRules();
    }
  };

  const getRuleIcon = (condition) => {
    if (condition === 'DEFAULT') return <InformationCircleIcon className="w-5 h-5 text-gray-400" />;
    if (condition.includes('&&') || condition.includes('||')) return <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />;
    return <CheckCircleIcon className="w-5 h-5 text-emerald-400" />;
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
          border: 'border-slate-200',
          bg: 'bg-slate-50/50',
          badge: 'bg-slate-100 text-slate-600 border-slate-200'
        };
      case 'complex':
        return {
          border: 'border-amber-100',
          bg: 'bg-amber-50/30',
          badge: 'bg-amber-100 text-amber-700 border-amber-200'
        };
      default:
        return {
          border: 'border-emerald-100',
          bg: 'bg-emerald-50/30',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
    }
  };

  if (loading && workflows.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lilac-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/workflows')}
            className="p-3 bg-white border-2 border-lilac-border rounded-xl text-lilac-text hover:border-lilac-primary transition-all shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-lilac-text tracking-tighter uppercase leading-none">RULE ARCHITECT</h1>
            <p className="text-lilac-accent font-black mt-3 tracking-[0.3em] uppercase text-[10px]">Logical routing & conditional execution</p>
          </div>
        </div>
      </div>

      {/* Workflow Selection */}
      <div className="bg-white border-2 border-lilac-border rounded-3xl p-8 shadow-sm">
        <div className="max-w-xl">
          <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] mb-3">
            Target Workflow
          </label>
          <select
            value={selectedWorkflow || ''}
            onChange={(e) => setSelectedWorkflow(e.target.value)}
            className="w-full px-6 py-4 bg-lilac-bg border-2 border-lilac-border text-lilac-text font-bold rounded-2xl focus:ring-0 focus:border-lilac-primary transition-all shadow-inner appearance-none custom-select"
          >
            <option value="">Select workflow protocol...</option>
            {workflows.map(workflow => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Steps and Rules List */}
      {selectedWorkflow && (
        <div className="space-y-12">
          {steps.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-lilac-border rounded-[3rem] p-24 text-center">
               <DocumentTextIcon className="w-16 h-16 text-lilac-muted/30 mx-auto mb-6" />
               <p className="text-sm font-black text-lilac-muted uppercase tracking-[0.3em]">No steps defined for this protocol</p>
            </div>
          ) : (
            steps.map((step) => (
              <div key={step.id} id={`step-${step.id}`} className="relative pt-8 first:pt-0">
                {/* Step Header */}
                <div className="flex items-center gap-4 mb-6">
                   <div className="px-5 py-2 bg-lilac-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg h-fit">
                      Step {step.order}
                   </div>
                   <h2 className="text-2xl font-black text-lilac-text uppercase tracking-tight">{step.name}</h2>
                   <div className="h-px flex-1 bg-lilac-border/50"></div>
                   <button
                     onClick={() => {
                        setShowAddRuleFormFor(showAddRuleFormFor === step.id ? null : step.id);
                        setNewRule({ condition: '', next_step_id: '', priority: (step.rules?.length || 0) + 1 });
                     }}
                     className="px-6 py-2 bg-white border-2 border-lilac-border text-lilac-text font-black rounded-xl hover:border-lilac-primary transition-all uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm"
                   >
                     <PlusIcon className="w-4 h-4" />
                     New Rule
                   </button>
                </div>

                {/* Add Rule Form (Inline) */}
                {showAddRuleFormFor === step.id && (
                  <div className="mb-8 bg-white border-2 border-lilac-primary rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-lilac-primary/5 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative">
                      <h3 className="text-xl font-black text-lilac-text uppercase tracking-tight mb-6 flex items-center gap-3">
                         <div className="w-2 h-8 bg-lilac-primary rounded-full"></div>
                         Configure Logic Bridge
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="md:col-span-2">
                           <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-widest mb-3">Logical Condition</label>
                           <textarea
                             value={newRule.condition}
                             onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                             className="w-full px-6 py-4 bg-lilac-bg border-2 border-lilac-border text-lilac-text font-mono text-sm rounded-2xl focus:border-lilac-primary transition-all"
                             rows={2}
                             placeholder="e.g., amount > 5000 && type == 'Urgent'"
                           />
                           <div className="mt-4 flex flex-wrap gap-2">
                              {['amount > 1000', 'priority == "High"', 'status == "approved"'].map(ex => (
                                 <button key={ex} onClick={() => setNewRule({...newRule, condition: ex})} className="px-3 py-1 bg-white border border-lilac-border rounded-lg text-[10px] font-bold text-lilac-accent hover:border-lilac-primary transition-all">
                                    {ex}
                                 </button>
                              ))}
                           </div>
                         </div>
                         <div>
                           <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-widest mb-3">Transmission Target</label>
                           <select
                             value={newRule.next_step_id}
                             onChange={(e) => setNewRule({ ...newRule, next_step_id: e.target.value })}
                             className="w-full px-6 py-4 bg-lilac-bg border-2 border-lilac-border text-lilac-text font-bold rounded-2x appearance-none rounded-2xl"
                           >
                             <option value="">DECOMMISSION WORKFLOW</option>
                             {steps.filter(s => s.id !== step.id).map(s => (
                               <option key={s.id} value={s.id}>{s.name} (Step {s.order})</option>
                             ))}
                           </select>
                         </div>
                         <div>
                           <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-widest mb-3">Execution Priority</label>
                           <input
                             type="number"
                             value={newRule.priority}
                             onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) || 1 })}
                             className="w-full px-6 py-4 bg-lilac-bg border-2 border-lilac-border text-lilac-text font-bold rounded-2xl"
                             min="1"
                           />
                         </div>
                      </div>
                      <div className="mt-8 flex justify-end gap-4">
                         <button onClick={() => setShowAddRuleFormFor(null)} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-lilac-muted hover:text-lilac-text">Cancel</button>
                         <button
                           onClick={() => handleAddRule(step.id)}
                           disabled={saving || !newRule.condition}
                           className="px-10 py-4 bg-lilac-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
                         >
                           {saving ? 'Synchronizing...' : 'Deploy Rule'}
                         </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rules Cards for this step */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {step.rules?.length === 0 ? (
                    <div className="md:col-span-2 p-8 bg-lilac-bg/20 rounded-3xl border-2 border-dashed border-lilac-border text-center">
                       <p className="text-[10px] font-black text-lilac-muted uppercase tracking-widest">No active logic gates for this step</p>
                    </div>
                  ) : (
                    [...step.rules].sort((a, b) => a.priority - b.priority).map((rule, idx) => {
                      const ruleType = getRuleType(rule.condition);
                      const styles = getRuleTypeStyles(ruleType);
                      const nextStep = steps.find(s => s.id === rule.next_step_id);

                      return (
                        <div key={rule.id} className={`group bg-white border-2 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all ${styles.border} flex flex-col justify-between`}>
                           <div>
                              <div className="flex justify-between items-start mb-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white border-2 border-lilac-border rounded-xl flex items-center justify-center shadow-sm">
                                       {getRuleIcon(rule.condition)}
                                    </div>
                                    <div>
                                       <div className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${styles.badge}`}>
                                          {ruleType}
                                       </div>
                                       <p className="text-[10px] font-black text-lilac-text mt-1 uppercase tracking-tighter">Priority {rule.priority}</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-1">
                                    <button 
                                      disabled={idx === 0 || rule.condition === 'DEFAULT'}
                                      onClick={() => moveRule(step.id, rule.id, 'up')}
                                      className="p-1.5 hover:bg-lilac-bg rounded-lg text-lilac-muted hover:text-lilac-primary transition-colors disabled:opacity-0"
                                    ><ArrowUpIcon className="w-4 h-4" /></button>
                                    <button 
                                      disabled={idx === step.rules.length - 1 || rule.condition === 'DEFAULT'}
                                      onClick={() => moveRule(step.id, rule.id, 'down')}
                                      className="p-1.5 hover:bg-lilac-bg rounded-lg text-lilac-muted hover:text-lilac-primary transition-colors disabled:opacity-0"
                                    ><ArrowDownIcon className="w-4 h-4" /></button>
                                 </div>
                              </div>

                              <div className="space-y-4">
                                 <div>
                                    <span className="text-[8px] font-black text-lilac-muted uppercase tracking-[0.2em] block mb-1">Condition</span>
                                    <div className="bg-lilac-bg p-4 rounded-xl border-2 border-lilac-border font-mono text-[11px] text-lilac-text break-all">
                                       {rule.condition}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <span className="text-[8px] font-black text-lilac-muted uppercase tracking-[0.2em]">Redirect →</span>
                                    <span className="text-[10px] font-black text-lilac-accent uppercase">
                                       {nextStep ? `${nextStep.name} (Step ${nextStep.order})` : 'Decommission'}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           {rule.condition !== 'DEFAULT' && (
                              <div className="mt-8 flex justify-end">
                                 <button
                                   onClick={() => handleDeleteRule(step.id, rule.id)}
                                   className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                 >
                                    <TrashIcon className="w-5 h-5" />
                                 </button>
                              </div>
                           )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!selectedWorkflow && (
        <div className="bg-lilac-bg/20 border-2 border-dashed border-lilac-border rounded-[3rem] p-24 text-center">
           <CpuChipIcon className="w-16 h-16 text-lilac-muted/30 mx-auto mb-6" />
           <p className="text-sm font-black text-lilac-muted uppercase tracking-[0.3em]">Select a protocol to initialize matrix</p>
        </div>
      )}
    </div>
  );
}
