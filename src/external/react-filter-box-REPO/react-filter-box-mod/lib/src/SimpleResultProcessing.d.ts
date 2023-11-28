import BaseResultProcessing from "./BaseResultProcessing";
import { Option } from "./GridDataAutoCompleteHandler";
export default class SimpleResultProcessing extends BaseResultProcessing {
    protected options?: Option[];
    constructor(options?: Option[]);
    tryToGetFieldCategory(fieldOrLabel: string): string;
    filter(row: any, fieldOrLabel: string, operator: string, value: string): boolean;
}
