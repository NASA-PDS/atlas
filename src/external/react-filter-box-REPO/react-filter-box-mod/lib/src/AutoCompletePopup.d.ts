import * as CodeMirror from 'codemirror';
import { HintResult, HintOptions, ExtendedCodeMirror, Completion, HintInfo } from './models/ExtendedCodeMirror';
import * as React from 'react';
export default class AutoCompletePopup {
    private cm;
    private needAutoCompletevalues;
    doc: CodeMirror.Doc;
    hintOptions: HintOptions;
    completionShow: boolean;
    appendSpace: boolean;
    customRenderCompletionItem: (self: HintResult, data: Completion, registerAndGetPickFunc: () => PickFunc) => React.ReactElement<any>;
    pick: (cm: ExtendedCodeMirror, self: HintResult, data: Completion) => string;
    constructor(cm: ExtendedCodeMirror, needAutoCompletevalues: (text: string) => Promise<HintInfo[]>);
    private processText;
    private onPick;
    private renderHintElement;
    private manualPick;
    private buildCompletionObj;
    private findLastSeparatorPositionWithEditor;
    show(): Promise<{}>;
    private createHintOption;
}
interface PickFunc {
    (): void;
}
export {};
