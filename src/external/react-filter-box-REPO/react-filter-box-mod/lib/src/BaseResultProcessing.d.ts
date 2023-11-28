import Expression from "./Expression";
export default class BaseResultProcessing {
    process<T>(data: T[], parsedResult: Expression[]): T[];
    predicateSingle(item: any, parsedResult: Expression): boolean;
    predicate(item: any, parsedResult: Expression | Expression[]): boolean;
    filter(row: any, field: string, operator: string, value: string): boolean;
}
