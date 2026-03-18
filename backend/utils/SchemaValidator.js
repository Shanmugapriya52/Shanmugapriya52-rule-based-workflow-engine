/**
 * Simple Schema Validator for Workflow Inputs
 * Supports basic types: number, string, boolean
 * Supports enum: enum("val1","val2",...)
 */
class SchemaValidator {
  /**
   * Validates data against a schema
   * @param {object} schema - { fieldName: "type", ... }
   * @param {object} data - { fieldName: value, ... }
   * @returns {object} { valid: boolean, errors: string[] }
   */
  static validate(schema, data) {
    if (!schema || typeof schema !== 'object') return { valid: true, errors: [] };
    
    const errors = [];
    const inputData = data || {};

    // Helper: Validate a single field
    const validateField = (fieldName, expectedType, actualValue, isRequired, allowedValues) => {
      // Handle required check
      if (actualValue === undefined || actualValue === null || actualValue === '') {
        if (isRequired) {
          errors.push(`Missing required field: "${fieldName}"`);
        }
        return;
      }

      // Handle allowed_values (enum) check
      if (allowedValues && Array.isArray(allowedValues) && allowedValues.length > 0) {
        const filteredAllowed = allowedValues.filter(v => v !== '').map(String);
        if (filteredAllowed.length > 0 && !filteredAllowed.includes(String(actualValue))) {
          errors.push(`Invalid value for "${fieldName}": expected one of [${filteredAllowed.join(', ')}], got "${actualValue}"`);
        }
      }

      const actualType = typeof actualValue;

      // Handle specific types
      switch (expectedType) {
        case 'number':
          if (actualType !== 'number' || isNaN(actualValue)) {
            errors.push(`Type mismatch for "${fieldName}": expected number, got ${actualType}`);
          }
          break;
        case 'boolean':
          if (actualType !== 'boolean') {
            errors.push(`Type mismatch for "${fieldName}": expected boolean, got ${actualType}`);
          }
          break;
        case 'array':
          if (!Array.isArray(actualValue)) {
            errors.push(`Type mismatch for "${fieldName}": expected array, got ${actualType}`);
          }
          break;
        case 'object':
          if (actualType !== 'object' || Array.isArray(actualValue) || actualValue === null) {
            errors.push(`Type mismatch for "${fieldName}": expected object, got ${actualType}`);
          }
          break;
        case 'date':
          // Simplified date validation (expects string or Date object)
          if (actualType !== 'string' && !(actualValue instanceof Date)) {
            errors.push(`Type mismatch for "${fieldName}": expected date string or object, got ${actualType}`);
          } else if (actualType === 'string' && isNaN(Date.parse(actualValue))) {
            errors.push(`Invalid date format for "${fieldName}": "${actualValue}"`);
          }
          break;
        default:
          // Treat string, country, department, priority, etc. as strings
          if (actualType !== 'string' && actualType !== 'number' && actualType !== 'boolean') {
             // If it's not a basic type and we don't recognize it, check if it's meant to be a string
             errors.push(`Type mismatch for "${fieldName}": expected string-like value, got ${actualType}`);
          }
          break;
      }
    };

    // Determine if we are using the new "fields array" structure or the old "flat object" structure
    if (schema.fields && Array.isArray(schema.fields)) {
      // NEW STRUCTURE: { fields: [ { name, type, required, allowed_values }, ... ] }
      for (const field of schema.fields) {
        validateField(field.name, field.type, inputData[field.name], field.required === true, field.allowed_values);
      }
    } else {
      // OLD STRUCTURE: { fieldName: "type" }
      for (const fieldName in schema) {
        const expectedType = schema[fieldName];
        const actualValue = inputData[fieldName];

        // Handle old enum format: enum("val1", "val2")
        let enumValues = null;
        let type = expectedType;
        if (typeof expectedType === 'string' && expectedType.startsWith('enum(')) {
          const enumMatch = expectedType.match(/\((.*)\)/);
          if (enumMatch) {
            enumValues = enumMatch[1].split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'));
            type = 'string';
          }
        }

        validateField(fieldName, type, actualValue, true, enumValues);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = SchemaValidator;
