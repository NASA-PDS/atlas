import * as PEG from 'pegjs';
import BaseAutoCompleteHandler from './BaseAutoCompleteHandler';
import ParseTrace from './ParseTrace';
import { HintInfo } from './models/ExtendedCodeMirror';
import Expression from './Expression';
import ParsedError from './ParsedError';
export default class FilterQueryParser {
    private getAutocompleteValues?;
    autoCompleteHandler: BaseAutoCompleteHandler;
    lastError: PEG.PegjsError;
    parseTrace: ParseTrace;
    constructor(getAutocompleteValues?: (text: string) => Promise<HintInfo[]>);
    parse(query: string): Expression[] | ParsedError;
    private parseQuery;
    getSuggestions(query: string): Promise<HintInfo[]>;
    setAutoCompleteHandler(autoCompleteHandler: BaseAutoCompleteHandler): void;
}
export interface ExtendedParser extends PEG.Parser {
}
