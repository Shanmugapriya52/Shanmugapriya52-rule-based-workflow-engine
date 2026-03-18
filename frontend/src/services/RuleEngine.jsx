/**
 * Rule Engine for Halleyx Challenge
 * Evaluates rule conditions against workflow data
 */
export class RuleEngine {
  /**
   * Evaluates a rule condition against provided data.
   * @param {string} condition - The JS condition to evaluate (e.g., 'amount > 100 && country == "USA"')
   * @param {object} data - The workflow input data
   * @returns {boolean}
   */
  static evaluate(condition, data = {}) {
    // DEFAULT rule always matches if reached
    if (!condition || condition === "DEFAULT" || condition.toUpperCase() === "DEFAULT") return true;

    try {
      // Extract variables used in condition to prevent ReferenceErrors
      // Provide defaults for common data fields if they're missing in 'data'
      const vars = Object.keys(data);
      const vals = Object.values(data);
      
      // Helper: Safely handle null/undefined fields for string operations
      const safeStr = (field) => (field === null || field === undefined ? "" : String(field));

      // Inject requested helper functions
      const contains = (field, val) => safeStr(field).includes(val);
      const startsWith = (field, val) => safeStr(field).startsWith(val);
      const endsWith = (field, val) => safeStr(field).endsWith(val);

      // Create a secure(ish) evaluation context
      // Note: In production, a proper expression parser (like jexl or expr-eval) is preferred
      const evaluator = new Function(
        ...vars,
        'contains', 'startsWith', 'endsWith',
        `try { return Boolean(${condition}); } catch(e) { return false; }`
      );

      return evaluator(...vals, contains, startsWith, endsWith);
    } catch (error) {
      console.error(`[RuleEngine] Evaluation failed for condition: "${condition}"`, error.message);
      return false;
    }
  }
}

// Schema Validator for workflow input validation
export class SchemaValidator {
  validate(data, schema) {
    const errors = [];

    if (!schema || !schema.fields) {
      return { valid: true, errors: [] };
    }

    // Check required fields
    schema.fields.forEach(field => {
      const value = data[field.name];

      // Required field validation
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field.name} is required`);
        return;
      }

      // Skip validation if field is not provided and not required
      if (value === undefined || value === null || value === '') {
        return;
      }

      // Type validation
      if (field.type && !this.validateType(value, field.type)) {
        errors.push(`${field.name} must be of type ${field.type}`);
        return;
      }

      // Allowed values validation — only when there are actual values to check against
      if (field.allowed_values && field.allowed_values.length > 0 && !field.allowed_values.includes(value)) {
        errors.push(`${field.name} must be one of: ${field.allowed_values.join(', ')}`);
        return;
      }

      // Number range validation
      if (field.type === 'number') {
        if (field.min !== undefined && value < field.min) {
          errors.push(`${field.name} must be at least ${field.min}`);
        }
        if (field.max !== undefined && value > field.max) {
          errors.push(`${field.name} must be at most ${field.max}`);
        }
      }

      // String length validation
      if (field.type === 'string') {
        if (field.min_length !== undefined && value.length < field.min_length) {
          errors.push(`${field.name} must be at least ${field.min_length} characters`);
        }
        if (field.max_length !== undefined && value.length > field.max_length) {
          errors.push(`${field.name} must be at most ${field.max_length} characters`);
        }
      }

      // Array validation
      if (field.type === 'array') {
        if (!Array.isArray(value)) {
          errors.push(`${field.name} must be an array`);
        } else if (field.min_items !== undefined && value.length < field.min_items) {
          errors.push(`${field.name} must have at least ${field.min_items} items`);
        } else if (field.max_items !== undefined && value.length > field.max_items) {
          errors.push(`${field.name} must have at most ${field.max_items} items`);
        }
      }

      // Object validation
      if (field.type === 'object') {
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push(`${field.name} must be an object`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        // Accept both number and numeric strings (e.g. '1000' from text input)
        return (typeof value === 'number' && !isNaN(value)) ||
               (typeof value === 'string' && !isNaN(parseFloat(value)) && value.trim() !== '');
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && !Array.isArray(value) && value !== null;
      // Preset types store as strings
      case 'country':
      case 'department':
      case 'priority':
        return typeof value === 'string';
      default:
        return true;
    }
  }
}

// Export singleton instances
export const ruleEngine = new RuleEngine();
export const schemaValidator = new SchemaValidator();
