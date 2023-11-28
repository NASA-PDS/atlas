import * as _ from 'lodash'
import * as PEG from 'pegjs'

import { ExtendedParser } from './FilterQueryParser'
import { HintInfo } from './models/ExtendedCodeMirror'
import ParseTrace from './ParseTrace'

export default class BaseAutoCompleteHandler {
    getAutocompleteValues: (text: string) => Promise<HintInfo[]> = null

    constructor(private getAutocompleteValuesFunc?: (text: string) => Promise<HintInfo[]>) {
        this.getAutocompleteValues = getAutocompleteValuesFunc
    }

    quote(text: string) {
        if (/\s/g.test(text)) {
            return `"${text}"`
        }

        return text
    }

    buildDefaultObjOrGetOriginal(value: string | Object, type: string): HintInfo {
        if (_.isString(value)) {
            return {
                value: this.quote(value),
                type: type,
            }
        }

        return {
            value: value,
            type: type,
        }
    }

    getHintCategories(): HintInfo[] {
        return _.map(this.needCategories(), (f) => {
            return this.buildDefaultObjOrGetOriginal(f, 'category')
        })
    }

    async getHintValues(lastCategory: string): Promise<HintInfo[]> {
        return new Promise(async (resolve, reject) => {
            if (this.getAutocompleteValues && lastCategory) {
                const values = await this.getAutocompleteValues(lastCategory)
                resolve(values)
                return
            }
            resolve([])
            return
            /*
            return _.map(
                this.needValues(parseTrace.getLastCategory(), parseTrace.getLastOperator()),
                (f) => {
                    return this.buildDefaultObjOrGetOriginal(f, 'value')
                }
            )
            */
        })
    }

    handleParseError(
        parser: ExtendedParser,
        parseTrace: ParseTrace,
        error: PEG.PegjsError
    ): HintInfo[] {
        var trace = parseTrace
        return _.flatMap(error.expected, (f: PEG.ExpectedItem) => {
            var result: HintInfo[] = []

            if (f.type == 'literal') {
                result = _.map([(f as any).text || f.value], (f) => {
                    return { value: f, type: 'literal' }
                })
            }
            if (f.type == 'other') {
                var lastTokenType = trace.getLastTokenType() || 'value'

                if (lastTokenType == 'value') {
                    result = _.map(this.needCategories(), (f) => {
                        return this.buildDefaultObjOrGetOriginal(f, 'category')
                    })
                }

                if (lastTokenType == 'category') {
                    result = _.map(this.needOperators(trace.getLastCategory()), (f) => {
                        return this.buildDefaultObjOrGetOriginal(f, 'operator')
                    })
                }

                if (lastTokenType == 'operator') {
                    result = _.map(
                        this.needValues(trace.getLastCategory(), trace.getLastOperator()),
                        (f) => {
                            return this.buildDefaultObjOrGetOriginal(f, 'value')
                        }
                    )
                }
            }

            return result
        })
    }

    hasCategory(category: string): boolean {
        return false
    }

    hasOperator(category: string, operator: string): boolean {
        return false
    }

    needCategories(): string[] {
        return []
    }

    needOperators(lastOperator: string): string[] {
        return []
    }

    needValues(lastCategory: string, lastOperator: string): string[] {
        return []
    }
}
