declare class GrammarUtils {
    isSeparator(c: string): boolean;
    isWhiteSpace(c: string): boolean;
    findLastSeparatorIndex(text: string): number;
    findLastCategory(text: string): string;
    needSpaceAfter(char: string): boolean;
    isLastCharacterWhiteSpace(text: string): boolean;
    isLastCharacterThis(text: string, char: string): boolean;
    areLastCharactersInThis(text: string, chars: string[]): boolean;
    areLastCharactersInThisRegex(text: string, regexes: string[]): boolean;
    stripEndWithNonSeparatorCharacters(text: string): string;
    getEndNotSeparatorCharacers(text: string): string;
    removeComments(string: string): string;
}
declare const _default: GrammarUtils;
export default _default;
