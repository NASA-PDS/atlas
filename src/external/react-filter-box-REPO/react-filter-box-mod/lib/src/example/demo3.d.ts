import * as React from 'react';
import "fixed-data-table/dist/fixed-data-table.min.css";
import { AutoCompleteOption, Expression, GridDataAutoCompleteHandler } from "../ReactFilterBox";
import 'react-day-picker/lib/style.css';
declare class CustomAutoComplete extends GridDataAutoCompleteHandler {
    needOperators(parsedCategory: string): string[];
    needValues(parsedCategory: string, parsedOperator: string): any[];
}
export default class Demo3 extends React.Component<any, any> {
    options: AutoCompleteOption[];
    customAutoComplete: CustomAutoComplete;
    constructor(props: any);
    customRenderCompletionItem(self: any, data: any, registerAndGetPickFunc: any): JSX.Element;
    onParseOk(expressions: Expression[]): void;
    render(): JSX.Element;
}
export {};
