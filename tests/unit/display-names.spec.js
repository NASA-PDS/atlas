import { test, expect } from '@playwright/test'

import {
    getDisplayName,
    getDisplayNames,
    getShortDisplayName,
} from '../../src/core/constants'

test.describe('display names', () => {
    test('splits existing string mappings into short and long names', () => {
        expect(getDisplayNames('msl')).toEqual({
            short: 'MSL',
            long: 'MSL - Mars Science Laboratory',
        })
    })

    test('uses explicit short and long names', () => {
        expect(getDisplayNames('scalpss').short).toBe('SCALPSS')
        expect(getDisplayNames('scalpss').long).toContain('Plume-Surface')
    })

    test('falls back to the raw key', () => {
        expect(getDisplayNames('unknown_key')).toEqual({
            short: 'unknown_key',
            long: 'unknown_key',
        })
    })

    test('returns short names for glossless mappings', () => {
        expect(getShortDisplayName('phx')).toBe('Phoenix')
        expect(getDisplayName('phx')).toBe('Phoenix')
    })
})
