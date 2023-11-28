import { mergeFields } from './utils'

describe('mergeFields', () => {
    it('merges simply', () => {
        const currentFields = [
            { key: 'A', doc_count: 10 },
            { key: 'B', doc_count: 5 },
        ]
        const returnedFields = [
            { key: 'A', doc_count: 10 },
            { key: 'B', doc_count: 1 },
        ]
        const merged = mergeFields(currentFields, returnedFields)
        expect(merged).toStrictEqual(returnedFields)
    })

    it('removes inactive current fields', () => {
        const currentFields = [
            { key: 'A', doc_count: 10 },
            { key: 'B', doc_count: 5 },
            { key: 'C', doc_count: 2 },
        ]
        const returnedFields = [
            { key: 'A', doc_count: 10 },
            { key: 'B', doc_count: 1 },
        ]
        const merged = mergeFields(currentFields, returnedFields)
        expect(merged).toStrictEqual(returnedFields)
    })

    it('does not remove active current fields but set them to 0 count', () => {
        const currentFields = [
            { key: 'A', doc_count: 10 },
            { key: 'B', doc_count: 5 },
            { key: 'C', doc_count: 2, active: true },
        ]
        const returnedFields = [
            { key: 'A', doc_count: 10 },
            { key: 'B', doc_count: 1 },
        ]
        const merged = mergeFields(currentFields, returnedFields)
        expect(merged).toStrictEqual([
            { key: 'A', doc_count: 10 },
            { key: 'B', doc_count: 1 },
            { key: 'C', doc_count: 0, active: true },
        ])
    })

    it('does not remove any properties from current fields', () => {
        const currentFields = [
            { key: 'A', doc_count: 10, testing: 't' },
            { key: 'B', doc_count: 5, additional: 200 },
            { key: 'C', doc_count: 2, active: true, keys: { like: 'this' } },
        ]
        const returnedFields = [
            { key: 'A', doc_count: 10 },
            { key: 'B', doc_count: 1 },
        ]
        const merged = mergeFields(currentFields, returnedFields)
        expect(merged).toStrictEqual([
            { key: 'A', doc_count: 10, testing: 't' },
            { key: 'B', doc_count: 1, additional: 200 },
            { key: 'C', doc_count: 0, active: true, keys: { like: 'this' } },
        ])
    })

    it('returns the returned fields if there are no current fields', () => {
        const currentFields = null
        const returnedFields = [
            { key: 'A', doc_count: 10 },
            { key: 'B', doc_count: 1 },
        ]
        const merged = mergeFields(currentFields, returnedFields)
        expect(merged).toStrictEqual(returnedFields)
    })
})
