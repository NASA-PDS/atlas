import * as _ from 'lodash'
class GrammarUtils {
    isSeparator(c: string) {
        return [' ', '\r', '\n', '\t', ':', '.', '(', ')', '[', ']', '{', '}'].indexOf(c) != -1
    }

    isWhiteSpace(c: string) {
        return c == ' ' || c == '\r' || c == '\n' || c == '\t'
    }

    findLastSeparatorIndex(text: string) {
        return _.findLastIndex(text, (f) => this.isSeparator(f))
    }

    findLastCategory(text: string) {
        if (text == null) return text
        // the gory kind -- not the kitty kind
        const cats = text.match(/[\w.]+(?=:)/g)
        if (cats && cats.length > 0) return cats[cats.length - 1]
        return null
    }

    needSpaceAfter(char: string) {
        // everything except for
        return (
            ['(', '[', '{', ':', '.', '"', '>', '>=', '<', '<=', '+', '-', '/', '\\'].indexOf(
                char
            ) === -1
        )
    }

    isLastCharacterWhiteSpace(text: string) {
        return !!text && this.isWhiteSpace(text[text.length - 1])
    }

    isLastCharacterThis(text: string, char: string) {
        return !!text && char === text[text.length - 1]
    }

    areLastCharactersInThis(text: string, chars: string[]) {
        if (text == null) return false
        for (let i = 0; i < chars.length; i++) {
            const len = chars[i].length
            const t = text.slice(-len)
            if (t === chars[i]) return true
        }
        return false
    }
    areLastCharactersInThisRegex(text: string, regexes: string[]) {
        if (text == null) return false
        for (let i = 0; i < regexes.length; i++) {
            if (text.match(new RegExp(`${regexes[i]}$`, 'i'))) return true
        }
        return false
    }

    stripEndWithNonSeparatorCharacters(text: string) {
        if (!text) return text

        if (this.isSeparator(text[text.length - 1])) {
            return text
        }

        var index = this.findLastSeparatorIndex(text)
        if (index < 0) return ''
        return text.substr(0, index + 1)
    }

    getEndNotSeparatorCharacers(text: string) {
        if (!text) return text

        if (this.isSeparator(text[text.length - 1])) {
            return ''
        }

        var index = this.findLastSeparatorIndex(text)
        if (index < 0) return text

        return text.substr(index + 1)
    }

    // From https://stackoverflow.com/a/59094308
    removeComments(string: string) {
        if (string == null) return ''
        //Takes a string of code, not an actual function.
        return string.replace(/\/\*[\s\S]*?\*\/|\/\/.*|\#.*/g, ''); //Strip comments
    }
}

export default new GrammarUtils()
