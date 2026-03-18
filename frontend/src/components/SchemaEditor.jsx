import React, { useState, useEffect } from "react";
import Input from "./Input";
import Button from "./Button";
import Card from "./Card";

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

const PRESET_TYPES = ["country", "department", "priority"];

export default function SchemaEditor({ schema, onChange }) {
  const [fields, setFields] = useState(schema?.fields || []);

  const fieldTypes = [
    { value: "string", label: "String" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Boolean" },
    { value: "date", label: "Date" },
    { value: "array", label: "Array" },
    { value: "object", label: "Object" },
    { value: "country", label: "Country (Preset)" },
    { value: "department", label: "Department (Preset)" },
    { value: "priority", label: "Priority (Preset)" }
  ];

  const addField = () => {
    const newField = {
      id: Date.now().toString(),
      name: "",
      type: "string",
      required: false,
      description: "",
      allowed_values: [],
      default_value: ""
    };
    setFields([...fields, newField]);
  };

  const updateField = (fieldId, updates) => {
    // When field type changes to a preset, auto-set allowed_values
    if (updates.type && PRESET_TYPES.includes(updates.type)) {
      updates.allowed_values = PRESET_VALUES[updates.type];
    } else if (updates.type && !PRESET_TYPES.includes(updates.type)) {
      // If switching away from a preset, clear allowed_values
      const existingField = fields.find(f => f.id === fieldId);
      if (existingField && PRESET_TYPES.includes(existingField.type)) {
        updates.allowed_values = [];
      }
    }
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const removeField = (fieldId) => {
    setFields(fields.filter(field => field.id !== fieldId));
  };

  const addAllowedValue = (fieldId) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      updateField(fieldId, {
        allowed_values: [...field.allowed_values, ""]
      });
    }
  };

  const updateAllowedValue = (fieldId, index, value) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const newValues = [...field.allowed_values];
      newValues[index] = value;
      updateField(fieldId, { allowed_values: newValues });
    }
  };

  const removeAllowedValue = (fieldId, index) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      updateField(fieldId, {
        allowed_values: field.allowed_values.filter((_, i) => i !== index)
      });
    }
  };

  useEffect(() => {
    if (onChange) {
      onChange({ fields });
    }
  }, [fields]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Input Schema</h3>
        <Button onClick={addField} size="sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 sm:py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-600 text-sm sm:text-base">No fields defined yet. Add your first field to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="border-l-4 border-l-blue-600">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">Field {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(field.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Field Name"
                    placeholder="e.g., amount, country, department"
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Type
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value })}
                    >
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Default Value"
                    placeholder="Optional default value"
                    value={field.default_value}
                    onChange={(e) => updateField(field.id, { default_value: e.target.value })}
                  />

                  <div className="flex items-center gap-3 pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-gray-700">Required</span>
                    </label>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm resize-none"
                      rows={2}
                      placeholder="Describe this field..."
                      value={field.description}
                      onChange={(e) => updateField(field.id, { description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Preset type preview */}
                {PRESET_TYPES.includes(field.type) && (
                  <div className="sm:col-span-2 mt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        Preset — {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Will render as a dropdown with {PRESET_VALUES[field.type].length} predefined options
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      {PRESET_VALUES[field.type].map(v => (
                        <span key={v} className="px-2 py-0.5 bg-white border border-gray-300 text-gray-700 text-xs rounded">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual allowed values for plain string/number */}
                {(field.type === "string" || field.type === "number") && (
                  <div className="sm:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Allowed Values (Optional)
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addAllowedValue(field.id)}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Value
                      </Button>
                    </div>
                    {field.allowed_values.length > 0 ? (
                      <div className="space-y-2">
                        {field.allowed_values.map((value, valueIndex) => (
                          <div key={valueIndex} className="flex gap-2">
                            <Input
                              placeholder="Enter allowed value"
                              value={value}
                              onChange={(e) => updateAllowedValue(field.id, valueIndex, e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAllowedValue(field.id, valueIndex)}
                              className="text-red-600 flex-shrink-0"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">No allowed values specified. Any value will be accepted.</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
