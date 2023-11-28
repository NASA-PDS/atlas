import * as React from 'react';
import "fixed-data-table/dist/fixed-data-table.min.css";
import { AutoCompleteOption, Expression, GridDataAutoCompleteHandler } from "../ReactFilterBox";
declare class CustomAutoComplete extends GridDataAutoCompleteHandler {
    needOperators(parsedCategory: string): string[];
}
export default class Demo2 extends React.Component<any, any> {
    options: AutoCompleteOption[];
    customAutoComplete: CustomAutoComplete;
    constructor(props: any);
    customRenderCompletionItem(self: any, data: any, pick: any): JSX.Element;
    onParseOk(expressions: Expression[]): void;
    render(): JSX.Element;
}
export {};
