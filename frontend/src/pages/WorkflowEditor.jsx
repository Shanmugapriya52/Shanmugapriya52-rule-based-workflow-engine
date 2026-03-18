import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import SchemaEditor from "../components/SchemaEditor";

export default function WorkflowEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get("id");
  const isEditing = !!workflowId;

  const [workflow, setWorkflow] = useState({
    name: "",
    description: "",
    version: 1,
    is_active: true,
    input_schema: { type: "object", fields: [] },
    start_step_id: null
  });

  const [steps, setSteps] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [stepRules, setStepRules] = useState({});
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Basic RBAC check
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        navigate('/dashboard');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Load existing workflow if editing
  useEffect(() => {
    if (isEditing) {
      loadWorkflow(workflowId);
    }
  }, [workflowId, isEditing]);

  const loadWorkflow = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/workflows/${id}`);
      const data = response.data;
      
      if (data.success) {
        const wf = data.workflow;
        setWorkflow({
          name: wf.name,
          description: wf.description,
          version: wf.version,
          is_active: wf.is_active,
          input_schema: wf.input_schema || { type: "object", fields: [] },
          start_step_id: wf.start_step_id
        });
        setSteps(wf.steps || []);
      } else {
        setError("Failed to load workflow");
      }
    } catch (err) {
      setError("Error loading workflow: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowChange = (field, value) => {
    setWorkflow(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSchemaChange = (schema) => {
    setWorkflow(prev => ({
      ...prev,
      input_schema: schema
    }));
  };

  const addStep = () => {
    const newStep = {
      id: `temp-${Date.now()}`,
      name: "",
      step_type: "task",
      order: steps.length + 1,
      metadata: {}
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (stepId, updates) => {
    setSteps(prevSteps => prevSteps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const removeStep = (stepId) => {
    setSteps(prevSteps => prevSteps.filter(step => step.id !== stepId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // 1. Save workflow
      const workflowPayload = {
        name: workflow.name,
        description: workflow.description,
        input_schema: workflow.input_schema,
        start_step_id: steps.length > 0 ? steps[0].id : null
      };

      let savedWorkflowId = workflowId;

      if (isEditing) {
        // Update existing workflow
        const response = await api.put(`/workflows/${workflowId}`, workflowPayload);
        const data = response.data;
        if (data.success) {
          savedWorkflowId = data.workflow.id;
        } else {
          throw new Error(data.message || "Failed to update workflow");
        }
      } else {
        // Create new workflow
        const response = await api.post(`/workflows`, workflowPayload);
        const data = response.data;
        if (data.success) {
          savedWorkflowId = data.workflow.id;
        } else {
          throw new Error(data.message || "Failed to create workflow");
        }
      }

      // 2. Save steps
      let firstStepPermanentId = null;
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepPayload = {
          name: step.name || `Step ${step.order}`,
          step_type: step.step_type,
          order: step.order,
          metadata: step.metadata || {}
        };

        if (step.id.startsWith("temp-")) {
          // Create new step
          const response = await api.post(`/workflows/${savedWorkflowId}/steps`, stepPayload);
          const data = response.data;
          if (data.success && i === 0) {
            firstStepPermanentId = data.step.id;
          }
        } else {
          // Update existing step
          await api.put(`/steps/${step.id}`, stepPayload);
          if (i === 0) firstStepPermanentId = step.id;
        }
      }

      // 3. Sync start_step_id if it changed
      if (firstStepPermanentId) {
        await api.put(`/workflows/${savedWorkflowId}`, { start_step_id: firstStepPermanentId });
      }

      navigate("/workflows");
    } catch (err) {
      setError("Error saving workflow: " + err.message);
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    // For now, same as save but could be modified later
    handleSubmit({ preventDefault: () => {} });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-lilac-text">
            {isEditing ? "Edit Workflow" : "Create Workflow"}
          </h1>
          <p className="text-lilac-muted mt-1 font-medium">
            {isEditing ? "Update your workflow configuration" : "Design and configure workflow processes"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate("/workflows")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Save Workflow"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl shadow-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Workflow Name"
              placeholder="e.g., Expense Approval"
              value={workflow.name}
              onChange={(e) => handleWorkflowChange("name", e.target.value)}
              required
              helperText="Unique name for this workflow"
            />

            <div>
              <label className="block text-sm font-semibold text-lilac-text mb-2">
                Status
              </label>
              <select
                className="w-full bg-white border border-lilac-border text-lilac-text rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all"
                value={workflow.is_active ? "active" : "inactive"}
                onChange={(e) => handleWorkflowChange("is_active", e.target.value === "active")}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-lilac-text mb-2">
                Description
              </label>
              <textarea
                className="w-full bg-white border border-lilac-border text-lilac-text placeholder-lilac-muted rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all"
                rows={3}
                placeholder="Describe what this workflow does..."
                value={workflow.description}
                onChange={(e) => handleWorkflowChange("description", e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Input Schema */}
        <Card>
          <SchemaEditor 
            schema={workflow.input_schema}
            onChange={handleSchemaChange}
          />
        </Card>

        {/* Workflow Steps */}
        <Card title="Workflow Steps">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-lilac-muted">
                Define the sequence of steps in your workflow
              </p>
              <Button onClick={addStep} size="sm" type="button" className="bg-lilac-primary hover:bg-lilac-accent text-white border-0 shadow-sm transition-all shadow-lilac-primary/30">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                Add Step
              </Button>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-lilac-border rounded-2xl bg-lilac-bg/30">
                <p className="text-lilac-muted font-medium">No steps defined yet. Click "Add Step" to get started.</p>
              </div>
            ) : (
              steps.map((step, index) => (
                <div key={step.id} className="border border-lilac-border bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-lilac-secondary transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-lilac-primary to-lilac-accent text-white rounded-full flex items-center justify-center font-bold text-sm shadow-[0_2px_10px_0_rgba(200,162,255,0.4)]">
                        {index + 1}
                      </div>
                      <h4 className="font-semibold text-lilac-text text-lg">
                        {step.name || `Step ${index + 1}`}
                      </h4>
                    </div>
                    <div className="flex gap-2">
                       <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        className="text-lilac-primary border-lilac-primary hover:bg-lilac-bg hover:text-lilac-accent transition-colors"
                        onClick={async () => {
                          if (step.id.startsWith('temp-') || !isEditing) {
                            if (confirm('Workflow needs to be saved before editing step details. Save now?')) {
                              await handleSubmit({ preventDefault: () => {} });
                            }
                          } else {
                            navigate(`/step-editor?workflowId=${workflowId}&stepId=${step.id}`);
                          }
                        }}
                      >
                        Edit Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        className="text-amber-500 border-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        onClick={() => navigate(`/rule-editor?stepId=${step.id}`)}
                      >
                        Rules
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => removeStep(step.id)}
                        className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <Input
                      label="Step Name"
                      placeholder="e.g., Review Request"
                      value={step.name}
                      onChange={(e) => updateStep(step.id, { name: e.target.value })}
                    />

                    <div>
                      <label className="block text-sm font-semibold text-lilac-text mb-2">
                        Step Type
                      </label>
                      <select
                        className="w-full bg-white border border-lilac-border text-lilac-text rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-lilac-primary/40 focus:border-lilac-primary transition-all"
                        value={step.step_type}
                        onChange={(e) => updateStep(step.id, { step_type: e.target.value })}
                      >
                        <option value="task">Task</option>
                        <option value="approval">Approval</option>
                        <option value="notification">Notification</option>
                      </select>
                    </div>

                    <Input
                      label="Order"
                      type="number"
                      value={step.order}
                      onChange={(e) => updateStep(step.id, { order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-lilac-border">
          <Button variant="outline" type="button" onClick={() => navigate("/workflows")} className="border-lilac-border text-lilac-text hover:bg-lilac-bg">
            Cancel
          </Button>
          <Button variant="outline" type="button" onClick={handleSaveDraft} disabled={saving} className="border-lilac-primary text-lilac-primary hover:bg-lilac-primary hover:text-white">
            Save Draft
          </Button>
          <Button type="submit" disabled={saving} className="bg-gradient-to-r from-lilac-primary to-lilac-accent text-white border-0 shadow-md">
            {saving ? "Saving..." : "Save Workflow"}
          </Button>
        </div>
      </form>
    </div>
  );
}
