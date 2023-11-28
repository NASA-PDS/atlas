const parser: ExtendedParser = require('./grammar.pegjs')
import * as PEG from 'pegjs'
import * as _ from 'lodash'
import BaseAutoCompleteHandler from './BaseAutoCompleteHandler'
import ParseTrace from './ParseTrace'
import grammarUtils from './GrammarUtils'
import { HintInfo } from './models/ExtendedCodeMirror'
import Expression from './Expression'
import ParsedError from './ParsedError'

export default class FilterQueryParser {
    autoCompleteHandler: BaseAutoCompleteHandler = null
    lastError: PEG.PegjsError = null

    parseTrace = new ParseTrace()

    constructor(private getAutocompleteValues?: (text: string) => Promise<HintInfo[]>) {
        this.autoCompleteHandler = new BaseAutoCompleteHandler(getAutocompleteValues)
    }

    parse(query: string): Expression[] | ParsedError {
        query = _.trim(query)
        if (_.isEmpty(query)) {
            return []
        }

        try {
            return this.parseQuery(query)
        } catch (ex) {
            ex.isError = true
            return ex
        }
    }

    private parseQuery(query: string) {
        this.parseTrace.clear()
        return parser.parse(query, { parseTrace: this.parseTrace })
    }

    async getSuggestions(query: string): Promise<HintInfo[]> {
        return new Promise(async (resolve, reject) => {
            query = grammarUtils.stripEndWithNonSeparatorCharacters(query)
            query = grammarUtils.removeComments(query)

            if (
                query.trim().length === 0 ||
                grammarUtils.areLastCharactersInThisRegex(query, [
                    'AND[\n ]+',
                    'OR[\n ]+',
                    'NOT[\n ]+',
                    '&&[\n ]+',
                    `\\|\\|[\n ]+`,
                    '![\n]+',
                    'TO[\n ]+',
                ])
            ) {
                // Then we need a category or a (
                const parenHint: HintInfo[] = [{ value: '(', type: 'literal' }]
                resolve(this.autoCompleteHandler.getHintCategories().concat(parenHint))
                return
            } else if (
                grammarUtils.areLastCharactersInThisRegex(query, [`\\([\n ]*`]) &&
                !grammarUtils.areLastCharactersInThisRegex(query, [`:\\([\n ]*`])
            ) {
                // Then just a category
                resolve(this.autoCompleteHandler.getHintCategories())
                return
            } else if (grammarUtils.isLastCharacterWhiteSpace(query)) {
                resolve(
                    _.map(['AND', 'OR', 'NOT', '&&', '||', '!', 'TO'], (f) => {
                        return { value: f, type: 'condition' }
                    })
                )
                return
            } else if (grammarUtils.isLastCharacterThis(query, ':')) {
                const literalHints: HintInfo[] = _.map(
                    ['(', '[', '{', '"', '>', '>=', '<', '<=', '+', '-', '/'],
                    (f) => {
                        return { value: f, type: 'literal' }
                    }
                )
                const hintValues = await this.autoCompleteHandler.getHintValues(
                    grammarUtils.findLastCategory(query)
                )
                resolve(hintValues.concat(literalHints))
                return
            } else if (
                grammarUtils.areLastCharactersInThis(query, [
                    '(',
                    '{',
                    '[',
                    ':>',
                    ':<',
                    ':"',
                    ':<=',
                    ':>=',
                    '+',
                    '-',
                ])
            ) {
                // Then a straight value
                resolve(
                    await this.autoCompleteHandler.getHintValues(
                        grammarUtils.findLastCategory(query)
                    )
                )
                return
            }

            resolve([])
            return
        })
    }

    setAutoCompleteHandler(autoCompleteHandler: BaseAutoCompleteHandler) {
        this.autoCompleteHandler = autoCompleteHandler
    }
}

export interface ExtendedParser extends PEG.Parser {}
