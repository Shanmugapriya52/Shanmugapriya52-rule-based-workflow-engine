import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  PlayIcon, 
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import api from "../api/axios";

// Preset options keyed by field name (case-insensitive match)
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

// Preset options keyed by field type (for new preset-typed fields)
const TYPE_PRESETS = {
  country: NAME_PRESETS.country,
  department: NAME_PRESETS.department,
  priority: NAME_PRESETS.priority
};

// Get options for a field — checks name first, then type, then allowed_values
// Number fields always get a plain input, never a dropdown
const getOptions = (field) => {
  // 1. Manual allowed_values — specific to this workflow/step
  if (field.type !== 'number' && field.allowed_values && field.allowed_values.filter(v => v !== '').length > 0) {
    return field.allowed_values.filter(v => v !== '');
  }

  const nameLower = (field.name || '').toLowerCase().trim();
  // 2. Name-based preset (e.g. field named 'country' even if type is 'string')
  if (NAME_PRESETS[nameLower]) return NAME_PRESETS[nameLower];
  // 3. Type-based preset (e.g. type === 'country')
  if (TYPE_PRESETS[field.type]) return TYPE_PRESETS[field.type];
  
  return null;
};

export default function ExecuteWorkflow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('workflowId');

  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [inputSchema, setInputSchema] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    if (workflowId && workflows.length > 0) {
      const workflow = workflows.find(w => w.id === workflowId);
      if (workflow) {
        setSelectedWorkflow(workflow);
        setInputSchema(workflow?.input_schema?.fields || []);
        setFormData({});
      }
    }
  }, [workflowId, workflows]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workflows');
      const data = response.data;
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const validateForm = () => {
    const errors = {};
    inputSchema.forEach(field => {
      if (field.required && (formData[field.name] === undefined || formData[field.name] === '')) {
        errors[field.name] = `"${field.name}" is required`;
      }
      // No strict allowed_values enforcement — dropdowns already constrain the choice
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      alert('Please fill in all required fields:\n' + Object.values(errors).join('\n'));
      return;
    }

    if (!selectedWorkflow) {
      alert('Please select a workflow');
      return;
    }

    setExecuting(true);
    try {
      const response = await api.post(`/workflows/${selectedWorkflow.id}/execute`, {
        data: formData,
        triggered_by: JSON.parse(localStorage.getItem('currentUser') || '{}').username || 'anonymous'
      });

      const result = response.data;

      if (result.success) {
        alert(`Workflow execution started!\nExecution ID: ${result.execution.id}`);
        navigate('/logs');
      } else {
        alert(`Failed to start execution: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to start workflow execution: ${errorMessage}`);
    } finally {
      setExecuting(false);
    }
  };

  const renderInputField = (field) => {
    const value = formData[field.name] ?? '';
    const options = getOptions(field);

    // Any field with options (by name, type, or allowed_values) → dropdown
    if (options) {
      return (
        <select
          value={value}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          required={field.required}
        >
          <option value="">Select {field.name}...</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    switch (field.type) {
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.name, Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            placeholder={field.description || `Enter ${field.name}`}
            required={field.required}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={field.name} checked={value === true}
                onChange={() => handleInputChange(field.name, true)}
                className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">True</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={field.name} checked={value === false}
                onChange={() => handleInputChange(field.name, false)}
                className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">False</span>
            </label>
          </div>
        );

      case 'date':
        return (
          <input type="date" value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            required={field.required} />
        );

      case 'array':
        return (
          <textarea
            value={Array.isArray(value) ? value.join('\n') : value}
            onChange={(e) => handleInputChange(field.name, e.target.value.split('\n').filter(i => i.trim()))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            placeholder={`Enter ${field.name} (one item per line)`}
            rows={4} required={field.required} />
        );

      case 'object':
        return (
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => {
              try { handleInputChange(field.name, JSON.parse(e.target.value)); }
              catch { handleInputChange(field.name, e.target.value); }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 font-mono text-sm"
            placeholder={`Enter ${field.name} as JSON`}
            rows={6} required={field.required} />
        );

      default:
        return (
          <input type="text" value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            placeholder={field.description || `Enter ${field.name}`}
            required={field.required} />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/workflows')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Execute Workflow</h1>
          <p className="text-gray-600">Run a workflow with custom input data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Workflow</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Workflows</label>
              <select
                value={selectedWorkflow?.id || ''}
                onChange={(e) => {
                  const workflow = workflows.find(w => w.id === e.target.value) || null;
                  setSelectedWorkflow(workflow);
                  setInputSchema(workflow?.input_schema?.fields || []);
                  setFormData({});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
              >
                <option value="">Choose a workflow...</option>
                {workflows.filter(w => w.is_active).map(wf => (
                  <option key={wf.id} value={wf.id}>{wf.name} (v{wf.version})</option>
                ))}
              </select>
            </div>

            {selectedWorkflow && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Name:</span> {selectedWorkflow.name}</p>
                  <p><span className="font-medium">Version:</span> {selectedWorkflow.version}</p>
                  <p><span className="font-medium">Description:</span> {selectedWorkflow.description || 'No description'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Input Data</h2>
              {selectedWorkflow && (
                <p className="text-sm text-gray-600 mt-1">
                  Fill in the required data to execute "{selectedWorkflow.name}"
                </p>
              )}
            </div>

            {!selectedWorkflow ? (
              <div className="p-6 text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Please select a workflow to execute</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                {inputSchema.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">This workflow doesn't require any input data</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {inputSchema.map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.name}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.description && (
                          <p className="text-xs text-gray-500 mb-2">{field.description}</p>
                        )}
                        {renderInputField(field)}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex items-center justify-end space-x-4">
                  <button type="button"
                    onClick={() => { setSelectedWorkflow(null); setInputSchema([]); setFormData({}); }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    Clear
                  </button>
                  <button type="submit" disabled={executing}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 shadow-md transition-all">
                    <PlayIcon className="w-4 h-4 mr-2" />
                    {executing ? 'Executing...' : 'Execute Workflow'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
