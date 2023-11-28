import BaseAutoCompleteHandler from './BaseAutoCompleteHandler';
import Expression from './Expression';
import { HintInfo } from './models/ExtendedCodeMirror';
export default class GridDataAutoCompleteHandler extends BaseAutoCompleteHandler {
    protected data: any[];
    protected options?: Option[];
    private getAutocompleteValuesFunction?;
    parseResult: Expression[];
    categories: string[];
    cache: any;
    constructor(data: any[], options?: Option[], getAutocompleteValuesFunction?: (text: string) => Promise<HintInfo[]>);
    hasCategory(category: string): boolean;
    hasOperator(category: string, operator: string): boolean;
    needCategories(): string[];
    needOperators(parsedCategory: string): string[];
    needValues(parsedCategory: string, parsedOperator: string): any[];
}
export interface Option {
    columnField: string;
    columnText?: string;
    type: string;
    customOperatorFunc?: (category: string) => string[];
    customValuesFunc?: (category: string, operator: string) => string[];
}
