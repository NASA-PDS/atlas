import * as React from 'react';
import "fixed-data-table/dist/fixed-data-table.min.css";
import { AutoCompleteOption, Expression } from "../ReactFilterBox";
export default class Demo1 extends React.Component<any, any> {
    options: AutoCompleteOption[];
    constructor(props: any);
    onParseOk(expressions: Expression[]): void;
    render(): JSX.Element;
}
