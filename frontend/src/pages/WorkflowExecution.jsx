import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlayIcon, StopIcon, ArrowPathIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ruleEngine, schemaValidator } from "../services/RuleEngine";
import api from "../api/axios";

const NAME_PRESETS = {
  country: [
    "United States", "US", "USA", "UK", "Canada", "Australia", "Germany", "France", "India",
    "Japan", "China", "Brazil", "Mexico", "Singapore", "UAE", "South Africa",
    "Netherlands", "Sweden", "Norway", "Spain", "Italy", "South Korea"
  ],
  department: [
    "Human Resources", "Finance", "Engineering", "Marketing", "Sales",
    "Operations", "Legal", "Procurement", "IT", "Customer Support",
    "Product", "Design", "Research & Development", "Administration"
  ],
  priority: ["Low", "Medium", "High", "Critical"]
};

const getOptions = (field) => {
  const nameLower = (field.name || '').toLowerCase().trim();
  if (NAME_PRESETS[nameLower]) return NAME_PRESETS[nameLower];
  if (NAME_PRESETS[field.type]) return NAME_PRESETS[field.type];
  // Skip allowed_values for number fields — they should always be numeric inputs
  if (field.type !== 'number' && field.allowed_values && field.allowed_values.filter(v => v !== '').length > 0) {
    return field.allowed_values.filter(v => v !== '');
  }
  return null;
};

const PRESET_VALUES = {
  country: [
    "USA", "UK", "Canada", "Australia", "Germany", "France", "India",
    "Japan", "China", "Brazil", "Mexico", "Singapore", "UAE", "South Africa",
    "Netherlands", "Sweden", "Norway", "Spain", "Italy", "South Korea"
  ],
  department: [
    "Human Resources", "Finance", "Engineering", "Marketing", "Sales",
    "Operations", "Legal", "Procurement", "IT", "Customer Support",
    "Product", "Design", "Research & Development", "Administration"
  ],
  priority: ["Low", "Medium", "High", "Critical"]
};

export default function WorkflowExecution() {
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [execution, setExecution] = useState(null);
  const [inputData, setInputData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow();
    }
  }, [workflowId]);

  const loadWorkflow = async () => {
    try {
      const response = await api.get(`/workflows/${workflowId}`);
      const data = response.data;
      
      if (data.success) {
        setWorkflow(data.workflow);
        // Initialize input data with empty values
        const initialData = {};
        if (data.workflow.input_schema) {
          data.workflow.input_schema.fields?.forEach(field => {
            initialData[field.name] = field.type === "boolean" ? false : "";
          });
        }
        setInputData(initialData);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load workflow");
    }
  };

  const validateInput = () => {
    if (!workflow?.input_schema?.fields) return true;

    const errors = [];
    workflow.input_schema.fields.forEach(field => {
      const value = inputData[field.name];
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`"${field.name}" is required`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }
    return true;
  };

  const startExecution = async () => {
    if (!validateInput()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/workflows/${workflowId}/execute`, {
        data: inputData,
        triggered_by: (() => {
          try { return JSON.parse(localStorage.getItem('currentUser') || '{}').username || 'admin'; }
          catch { return 'admin'; }
        })()
      });
      
      const data = response.data;
      
      if (data.success) {
        setExecution(data.execution);
        // Start polling for updates
        pollExecutionStatus(data.execution.id);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to start execution");
    } finally {
      setLoading(false);
    }
  };

  const pollExecutionStatus = async (executionId) => {
    const poll = async () => {
      try {
        const response = await api.get(`/executions/${executionId}`);
        const data = response.data;
        
        if (data.success) {
          setExecution(data.execution);
          
          // Stop polling only on terminal states — keep polling on pending_approval so UI updates
          if (data.execution.status === "completed" || data.execution.status === "failed" || data.execution.status === "canceled") {
            return;
          }
          
          // Continue polling
          setTimeout(poll, 2000);
        }
      } catch (err) {
        console.error("Failed to poll execution status:", err);
      }
    };
    
    poll();
  };

  const cancelExecution = async () => {
    if (!execution) return;
    
    try {
      const response = await api.post(`/executions/${execution.id}/cancel`);
      const data = response.data;
      
      if (data.success) {
        setExecution(data.execution);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to cancel execution");
    }
  };

  const retryExecution = async () => {
    if (!execution) return;
    
    try {
      const response = await api.post(`/executions/${execution.id}/retry`);
      const data = response.data;
      
      if (data.success) {
        setExecution(data.execution);
        // Start polling for updates
        pollExecutionStatus(data.execution.id);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to retry execution");
    }
  };

  const handleInputChange = (fieldName, value) => {
    setInputData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setError(null);
  };

  const renderInputField = (field) => {
    const value = inputData[field.name] || "";
    const options = getOptions(field);

    // Any field with options renders as a dropdown
    if (options) {
      return (
        <select
          value={value}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
          required={field.required}
        >
          <option value="">Select {field.label || field.name}...</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    switch (field.type) {
      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value) || "")}
            className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text placeholder-lilac-muted rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
            placeholder={field.placeholder || `Enter ${field.label || field.name}`}
            required={field.required}
            min={field.min}
            max={field.max}
          />
        );

      case "boolean":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="w-5 h-5 text-lilac-primary border-lilac-border rounded focus:ring-lilac-primary/40 bg-white"
            />
            <label className="ml-3 text-sm font-medium text-lilac-text">
              {field.label || field.name}
            </label>
          </div>
        );

      case "array":
        return (
          <textarea
            value={Array.isArray(value) ? value.join("\n") : value}
            onChange={(e) => handleInputChange(field.name, e.target.value.split("\n").filter(v => v.trim()))}
            className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text placeholder-lilac-muted rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
            placeholder={field.placeholder || `Enter ${field.label || field.name} (one per line)`}
            rows={3}
          />
        );

      case "object":
        return (
          <textarea
            value={typeof value === "object" ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => {
              try {
                handleInputChange(field.name, JSON.parse(e.target.value));
              } catch {
                handleInputChange(field.name, e.target.value);
              }
            }}
            className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text placeholder-lilac-muted rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm font-mono text-sm"
            placeholder={field.placeholder || `Enter ${field.label || field.name} as JSON`}
            rows={4}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-lilac-border text-lilac-text placeholder-lilac-muted rounded-xl focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all shadow-sm"
            placeholder={field.placeholder || `Enter ${field.label || field.name}`}
            required={field.required}
          />
        );
    }
  };

  const getCurrentStep = () => {
    if (!execution || !workflow) return null;
    return workflow.steps?.find(step => step.id === execution.current_step_id);
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime) return "N/A";
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end - start) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  const completeStep = async (stepId, action) => {
    setLoading(true);
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    try {
      const response = await api.post(`/executions/${execution.id}/complete-step`, {
        step_id: stepId,
        action: action,
        approver_username: currentUser.username || currentUser._id || 'admin'
      });
      
      if (response.data.success) {
        pollExecutionStatus(execution.id);
      } else {
        setError(response.data.message || response.data.error || 'Action failed');
      }
    } catch (err) {
      setError("Failed to complete step");
    } finally {
      setLoading(false);
    }
  };

  if (!workflow) {
    return (
      <div className="min-h-screen bg-lilac-bg flex items-center justify-center relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lilac-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lilac-accent/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="text-center bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.2)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lilac-primary mx-auto mb-4"></div>
          <p className="text-lilac-muted font-medium">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lilac-bg relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lilac-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lilac-accent/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/workflows")}
            className="flex items-center text-lilac-muted hover:text-lilac-accent hover:bg-white/50 px-3 py-2 rounded-xl transition-all mb-4 w-fit"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Workflows</span>
          </button>
          
          <h1 className="text-3xl font-bold text-lilac-text">Workflow Execution</h1>
          <p className="text-lilac-accent font-medium mt-2 text-lg">{workflow.name}</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl shadow-sm flex items-center">
            <p className="text-rose-800 font-medium">{error}</p>
          </div>
        )}

        {/* Input Form */}
        {!execution && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.15)] border border-lilac-border p-8 mb-6">
            <h2 className="text-xl font-bold text-lilac-text mb-6">Input Data</h2>
            
            {workflow.input_schema?.fields?.length > 0 ? (
              <div className="space-y-5 flex flex-col items-center">
                {workflow.input_schema.fields.map((field) => (
                  <div key={field.name} className="w-full">
                    <label className="block text-sm font-semibold text-lilac-text mb-2">
                      {field.label || field.name}
                      {field.required && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                    {renderInputField(field)}
                    {field.description && (
                      <p className="text-xs font-medium text-lilac-muted mt-2">{field.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-lilac-bg/40 rounded-2xl p-8 text-center border-2 border-dashed border-lilac-border">
                <p className="text-lilac-muted font-medium">No input fields required for this workflow.</p>
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={startExecution}
                disabled={loading}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-lilac-primary to-lilac-accent text-white rounded-xl shadow-[0_4px_14px_0_rgba(200,162,255,0.39)] hover:shadow-[0_6px_20px_rgba(167,123,255,0.23)] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Start Execution
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Execution Status */}
        {execution && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.15)] border border-lilac-border p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-lilac-text">Execution Status</h2>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-xl text-sm font-bold uppercase tracking-wider ${
                  execution.status === "completed" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                  execution.status === "failed" ? "bg-rose-100 text-rose-800 border-rose-200" :
                  execution.status === "canceled" ? "bg-gray-100 text-gray-800 border-gray-200" :
                  "bg-lilac-secondary text-lilac-accent border-lilac-primary/30"
                } border`}>
                  {execution.status.replace('_', ' ')}
                </span>
                {execution.status === "in_progress" && (
                  <button
                    onClick={cancelExecution}
                    className="flex items-center px-4 py-1.5 bg-rose-50 text-rose-600 font-semibold rounded-xl hover:bg-rose-100 border border-transparent hover:border-rose-200 transition-colors"
                  >
                    <StopIcon className="w-4 h-4 mr-1.5" />
                    Cancel
                  </button>
                )}
                {execution.status === "failed" && (
                  <button
                    onClick={retryExecution}
                    className="flex items-center px-4 py-1.5 bg-lilac-bg text-lilac-accent font-semibold rounded-xl hover:bg-lilac-secondary hover:text-lilac-text border border-transparent hover:border-lilac-border transition-colors shadow-sm"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-1.5" />
                    Retry
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6">
              <div className="bg-lilac-bg/50 p-4 rounded-2xl border border-lilac-border/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-lilac-muted mb-1">Execution ID</p>
                <p className="font-mono text-sm font-bold text-lilac-text truncate" title={execution.id} >{execution.id.slice(0, 8)}...</p>
              </div>
              <div className="bg-lilac-bg/50 p-4 rounded-2xl border border-lilac-border/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-lilac-muted mb-1">Duration</p>
                <p className="text-sm font-bold text-lilac-text pb-0.5">{formatDuration(execution.started_at, execution.ended_at)}</p>
              </div>
              <div className="bg-lilac-bg/50 p-4 rounded-2xl border border-lilac-border/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-lilac-muted mb-1">Retries</p>
                <p className="text-sm font-bold text-lilac-text pb-0.5">{execution.retries}</p>
              </div>
              <div className="bg-lilac-bg/50 p-4 rounded-2xl border border-lilac-border/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-lilac-muted mb-1">Triggered By</p>
                <p className="text-sm font-bold text-lilac-text pb-0.5">{execution.triggered_by}</p>
              </div>
            </div>

            {/* Current Step — shown for in_progress AND pending_approval */}
            {(execution.status === "in_progress" || execution.status === "pending_approval") && execution.current_step_id && (
              <div className="mb-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-amber-800">
                      <span className="uppercase tracking-wide text-xs opacity-75 mr-2">Waiting for action:</span> 
                      {getCurrentStep()?.name || execution.current_step_id}
                    </p>
                    <p className="text-xs font-medium text-amber-700 mt-2">Notification has been sent. Check the Approvals page or task manager.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Execution Logs */}
        {execution && execution.logs && execution.logs.length > 0 && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.15)] border border-lilac-border p-6 sm:p-8">
            <h2 className="text-xl font-bold text-lilac-text mb-6">Execution Logs</h2>
            <div className="space-y-4">
              {execution.logs.map((log, index) => (
                <div key={index} className="border-l-4 border-lilac-primary pl-5 py-3 bg-lilac-bg/20 rounded-r-2xl shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <span className="font-bold text-lilac-text text-lg">{log.step_name}</span>
                    <span className="text-sm font-medium text-lilac-muted mt-1 sm:mt-0">
                      {new Date(log.started_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-lilac-muted bg-white px-2.5 py-1 rounded-lg border border-lilac-border shadow-sm">Type: {log.step_type}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-sm ${
                      log.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      log.status === "failed" ? "bg-rose-50 text-rose-700 border-rose-200" :
                      "bg-white text-lilac-text border-lilac-border"
                    }`}>Status: {log.status}</span>
                  </div>
                  {log.evaluated_rules && log.evaluated_rules.length > 0 && (
                    <div className="mt-3 bg-white p-4 rounded-xl border border-lilac-border/50 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-lilac-text mb-2">Rule Evaluations:</p>
                      {log.evaluated_rules.map((ruleEval, ruleIndex) => (
                        <div key={ruleIndex} className="text-sm font-medium text-lilac-text ml-2 mb-1 flex items-center gap-2">
                          <span className={ruleEval.matched ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                            {ruleEval.matched ? "✓" : "✗"}
                          </span>
                          <span className="font-mono bg-lilac-bg/50 px-2 py-0.5 rounded text-xs">{ruleEval.condition}</span> 
                          <span className="text-lilac-muted">→</span> 
                          <span className={`font-bold text-xs ${ruleEval.matched ? "text-emerald-600" : "text-rose-600"}`}>{ruleEval.matched ? "TRUE" : "FALSE"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {log.selected_next_step && (
                    <p className="text-sm font-bold text-lilac-text mt-3 bg-white inline-block px-3 py-1.5 rounded-lg border border-lilac-border shadow-sm">
                      <span className="text-lilac-muted font-semibold uppercase tracking-wider text-xs mr-2">Next Step:</span> 
                      {log.selected_next_step}
                    </p>
                  )}
                  {log.error_message && (
                    <p className="text-sm font-bold text-rose-600 mt-3 bg-rose-50 inline-block px-3 py-1.5 rounded-lg border border-rose-200 shadow-sm">Error: {log.error_message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
