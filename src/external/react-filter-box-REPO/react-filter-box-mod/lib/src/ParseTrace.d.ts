export default class ParseTrace {
    private arr;
    constructor();
    push(item: TraceItem): void;
    clear(): void;
    getLastOperator(): string;
    getLastCategory(): string;
    getLastTokenType(): string;
    pushOperator(operator: string): void;
    pushCategory(category: string): void;
    pushValue(value: string): void;
}
interface TraceItem {
    type: string;
    value: string;
}
export {};
