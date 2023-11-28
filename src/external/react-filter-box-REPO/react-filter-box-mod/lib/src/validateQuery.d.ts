import Expression from './Expression';
import BaseAutoCompleteHandler from './BaseAutoCompleteHandler';
interface ValidationResult {
    isValid: boolean;
    message?: string;
}
declare const validateQuery: (parsedQuery: Expression[], autoCompleteHandler: BaseAutoCompleteHandler) => ValidationResult;
export default validateQuery;
export { ValidationResult };
