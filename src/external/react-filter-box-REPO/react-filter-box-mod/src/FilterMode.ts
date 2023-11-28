import * as CodeMirror from 'codemirror'

CodeMirror.defineMode<ModeState>('filter-mode', function (
    config: CodeMirror.EditorConfiguration,
    modeOptions?: any
) {
    function isEmpty(char: string) {
        return char == ' ' || char == '\r' || char == '\n' || char == '\t'
    }

    return {
        startState: function (): ModeState {
            return {
                inString: false,
                inComment: false,
                fieldState: FieldStates.category,
            }
        },
        token: function (stream: CodeMirror.StringStream, state: ModeState): string {
            // Single-line comments
            if (!state.inComment && stream.match('/*')) {
                state.inComment = true
            }
            // Multi-line comments
            if (state.inComment) {
                if (stream.skipTo('*/')) {
                    // End multi-line comment found on this line
                    stream.next()
                    stream.next()
                    // Skip
                    state.inComment = false // Clear flag
                } else {
                    stream.skipToEnd() // Rest of line is comment
                }
                return 'comment' // Token style
            }
            if (stream.match('//', true, true) || stream.match('#', true, true)) {
                stream.skipToEnd()
                return 'comment'
            }

            if (stream.match(/[\w.]+(?=:)/, true)) {
                return 'category'
            }

            if (stream.peek() == ':') {
                stream.next()
                return 'operator'
            }
            if (
                stream.match('>', true, true) ||
                stream.match('=', true, true) ||
                stream.match('<', true, true)
            ) {
                return 'operator'
            }

            if (['(', ')'].indexOf(stream.peek()) != -1) {
                stream.next()
                return 'bracket'
            }
            if (['[', ']', '{', '}'].indexOf(stream.peek()) != -1) {
                stream.next()
                return 'range'
            }

            if (stream.match('NOT', true, true) || stream.match('!', true, true)) {
                return 'condition-not'
            }
            if (
                stream.match('AND', true, true) ||
                stream.match('OR', true, true) ||
                stream.match('&&', true, true) ||
                stream.match('||', true, true) ||
                stream.match('TO', true, true)
            ) {
                return 'condition'
            }

            if (isEmpty(stream.peek())) {
                stream.eatSpace()
                return null
            }

            // If a string starts here
            if (!state.inString && stream.peek() == '"') {
                stream.next() // Skip quote
                state.inString = true // Update state
            }

            if (state.inString) {
                if (stream.skipTo('"')) {
                    // Quote found on this line
                    stream.next()
                    // Skip quote
                    state.inString = false // Clear flag
                } else {
                    stream.skipToEnd() // Rest of line is string
                }
                return 'value' // Token style
            }

            stream.eatWhile(/[^\r\n\t\s\(\)\[\]\{\}]+/)
            return 'value'
        },
    }
})

class FieldStates {
    static none = 'none'
    static category = 'category'
    static operator = 'operator'
    static value = 'value'
    static comment = 'comment'
    static bracket = 'bracket'
    static range = 'range'
    static condition = 'condition'
    static conditionNot = 'condition-not'
}

interface ModeState {
    inString: boolean
    inComment: boolean
    fieldState: FieldStates
}
