import { useState } from "react";
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { ruleEngine } from "../services/RuleEngine";

export default function StepRuleEditor({ stepId, rules, steps, onRulesChange }) {
  const [newRule, setNewRule] = useState({
    condition: "",
    next_step_id: "",
    priority: rules.length + 1
  });

  const addRule = () => {
    if (!newRule.condition.trim() || !newRule.next_step_id) {
      alert("Please fill in condition and next step");
      return;
    }

    const validation = ruleEngine.validateRuleSyntax(newRule.condition);
    if (!validation.valid) {
      alert(`Invalid rule syntax: ${validation.error}`);
      return;
    }

    const rule = {
      id: `rule-${Date.now()}`,
      ...newRule,
      priority: rules.length + 1
    };

    onRulesChange([...rules, rule]);
    setNewRule({ condition: "", next_step_id: "", priority: rules.length + 2 });
  };

  const updateRule = (ruleId, updates) => {
    onRulesChange(rules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const deleteRule = (ruleId) => {
    const updatedRules = rules.filter(rule => rule.id !== ruleId);
    const reorderedRules = updatedRules.map((rule, index) => ({
      ...rule,
      priority: index + 1
    }));
    onRulesChange(reorderedRules);
  };

  const moveRule = (ruleId, direction) => {
    const index = rules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rules.length) return;

    const updatedRules = [...rules];
    [updatedRules[index], updatedRules[newIndex]] = [updatedRules[newIndex], updatedRules[index]];
    
    updatedRules.forEach((rule, idx) => {
      rule.priority = idx + 1;
    });

    onRulesChange(updatedRules);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Step Rules</h3>
      
      <div className="mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Step</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...rules].sort((a, b) => a.priority - b.priority).map((rule, index) => (
                <tr key={rule.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <span>{rule.priority}</span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveRule(rule.id, "up")}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ArrowUpIcon className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveRule(rule.id, "down")}
                          disabled={index === rules.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ArrowDownIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="text"
                      value={rule.condition}
                      onChange={(e) => updateRule(rule.id, { condition: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder='e.g., amount > 100 && country == "US"'
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <select
                      value={rule.next_step_id || ""}
                      onChange={(e) => updateRule(rule.id, { next_step_id: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select next step...</option>
                      <option value="null">End Workflow</option>
                      {steps.filter(step => step.id !== stepId).map(step => (
                        <option key={step.id} value={step.id}>
                          {step.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Add New Rule</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <input
              type="text"
              value={newRule.condition}
              onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='e.g., amount > 100 && country == "US"'
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Step</label>
            <select
              value={newRule.next_step_id}
              onChange={(e) => setNewRule({ ...newRule, next_step_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select next step...</option>
              <option value="null">End Workflow</option>
              {steps.filter(step => step.id !== stepId).map(step => (
                <option key={step.id} value={step.id}>
                  {step.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={addRule}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Rule
            </button>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Supported Operators:</strong> ==, !=, &lt;, &gt;, &lt;=, &gt;=, &amp;&amp; (AND), || (OR)<br/>
            <strong>Functions:</strong> contains(field, "value"), startsWith(field, "prefix"), endsWith(field, "suffix")<br/>
            <strong>DEFAULT:</strong> Use "DEFAULT" as condition for fallback rule
          </p>
        </div>
      </div>
    </div>
  );
}
