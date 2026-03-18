class RuleEngine {
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
        `try { 
          return Boolean(${condition}); 
        } catch(e) { 
          if (e instanceof ReferenceError) {
            // If condition references a variable not in 'vars', it would have crashed before reaching here.
            // This inner catch is for runtime issues during evaluation.
            return false;
          }
          throw e; 
        }`
      );

      return evaluator(...vals, contains, startsWith, endsWith);
    } catch (error) {
      if (error instanceof ReferenceError) {
        // Handle cases where 'condition' refers to a variable not present in 'data'
        // We'll retry once by injecting the missing variable as 'undefined'
        const missingVarMatch = error.message.match(/(.+) is not defined/);
        if (missingVarMatch && missingVarMatch[1]) {
          const missingVar = missingVarMatch[1].trim();
          return this.evaluate(condition, { ...data, [missingVar]: undefined });
        }
      }
      console.error(`[RuleEngine] Evaluation failed for condition: "${condition}"`, error.message);
      return false;
    }
  }
}

module.exports = RuleEngine;
