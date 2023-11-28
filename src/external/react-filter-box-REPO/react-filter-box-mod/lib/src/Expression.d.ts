interface Expression {
    conditionType?: 'AND' | 'OR' | 'NOT' | '&&' | '||' | '!';
    category?: string;
    operator?: string;
    value?: string;
    expressions?: Expression[];
}
export default Expression;
