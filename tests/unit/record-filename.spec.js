import { test, expect } from '@playwright/test'

import { parseFilename, resolveFilenameSpec } from '../../src/core/recordPresentation'
import { filenameSpecs } from '../../src/config/filenames'

import mars2020Navcam from '../fixtures/records/mars2020-navcam.json'
import mslPds3 from '../fixtures/records/msl-pds3-mastcam.json'
import mgsMoc from '../fixtures/records/mgs-moc.json'

const m20 = filenameSpecs.mars_2020
const variantsOf = (spec) => (Array.isArray(spec) ? spec : [spec])

const parse = (filename) => parseFilename(filename, m20)
const segment = (parsed, label) => parsed.pieces.find((p) => p.label === label)
const valueOf = (parsed, label) => {
    const piece = segment(parsed, label)
    return piece ? piece.text : null
}
const meaningOf = (parsed, label) => {
    const piece = segment(parsed, label)
    return piece ? piece.meaning : null
}

test.describe('resolveFilenameSpec', () => {
    test('only missions with a spec get one', () => {
        expect(resolveFilenameSpec({ mission: 'mars_2020', pds_standard: 'pds4' })).toBe(m20)
        expect(resolveFilenameSpec({ mission: 'msl', pds_standard: 'pds3' })).toBe(
            filenameSpecs.msl
        )
        expect(resolveFilenameSpec({ mission: 'vgr', pds_standard: 'pds3' })).toBe(null)
        expect(resolveFilenameSpec({})).toBe(null)
    })
})

test.describe('parseFilename', () => {
    test('splits a real Navcam RDR into its SIS fields', () => {
        const parsed = parse('NRM_0818_0739564747_023IDM_N0391469VCE_16000_0A02LLJ02.IMG')
        expect(valueOf(parsed, 'Instrument')).toBe('NR')
        expect(meaningOf(parsed, 'Instrument')).toBe('Navcam Right')
        expect(meaningOf(parsed, 'Color / filter')).toBe('Grayscale (monochrome / panchromatic)')
        expect(meaningOf(parsed, 'Special processing')).toBe('Nominal processing')
        expect(valueOf(parsed, 'Sol')).toBe('0818')
        expect(meaningOf(parsed, 'Sol')).toBe('Sol 818')
        expect(meaningOf(parsed, 'Venue')).toBe('Flight (surface or cruise)')
        expect(meaningOf(parsed, 'Spacecraft clock')).toBe('SCLK 739564747 seconds')
        expect(meaningOf(parsed, 'Milliseconds')).toBe('23 ms')
        expect(valueOf(parsed, 'Product type')).toBe('IDM')
        expect(meaningOf(parsed, 'Product type')).toBe('Miscellaneous — Index Depth Map')
        expect(meaningOf(parsed, 'Thumbnail')).toContain('not a thumbnail')
        expect(meaningOf(parsed, 'Site')).toBe('Site 39')
        expect(meaningOf(parsed, 'Drive')).toBe('Drive 1469')
        expect(valueOf(parsed, 'Sequence ID')).toBe('VCE_16000')
        expect(valueOf(parsed, 'Camera specific')).toBe('_0A0')
        expect(meaningOf(parsed, 'Downsample')).toBe('4×4 downsampled')
        expect(meaningOf(parsed, 'Compression')).toBe('Lossless LOCO')
        expect(meaningOf(parsed, 'Producer')).toBe('JPL (IDS/MIPL)')
        expect(meaningOf(parsed, 'Version')).toBe('Version 2')
        expect(meaningOf(parsed, 'Extension')).toBe('VICAR image with an attached ODL label')
    })

    test('the pieces reassemble into the original filename', () => {
        const filename = 'ZL0_0673_0761234567_123EBY_N0301234ZCAM03456_1100LMA03.IMG'
        const parsed = parse(filename)
        expect(parsed.pieces.map((p) => p.text).join('')).toBe(filename)
        // The extension dot sits between segments and carries no label.
        expect(parsed.pieces.filter((p) => p.label == null).map((p) => p.text)).toEqual(['.'])
    })

    test('decodes a Mastcam-Z EDR, filter and producer included', () => {
        const parsed = parse('ZR2_0453_0700000000_000ECM_N0260000ZCAM01234_0340I3A01.IMG')
        expect(meaningOf(parsed, 'Instrument')).toBe('Mastcam-Z Right')
        expect(meaningOf(parsed, 'Color / filter')).toContain('Mastcam-Z filter 2')
        expect(meaningOf(parsed, 'Product type')).toContain('original companded image')
        expect(meaningOf(parsed, 'Compression')).toBe('ICER, 3 bits per pixel')
        expect(meaningOf(parsed, 'Producer')).toBe('ASU — Mastcam-Z team')
    })

    test('decodes a linearized product and a JPEG quality level', () => {
        const parsed = parse('NLF_0818_0739564747_023RASLN0391469NCAM00500_0A0505J01.IMG')
        expect(meaningOf(parsed, 'Color / filter')).toBe('RGB, all three bands')
        expect(meaningOf(parsed, 'Geometry')).toContain('Linearized')
        expect(meaningOf(parsed, 'Compression')).toBe('JPEG quality level 5')
    })

    test('unknown codes keep their label but claim no meaning', () => {
        const parsed = parse('QQM_0818_0739564747_023QQQ_N0391469VCE_16000_0A02LLJ02.IMG')
        expect(valueOf(parsed, 'Instrument')).toBe('QQ')
        expect(meaningOf(parsed, 'Instrument')).toBe(null)
        expect(meaningOf(parsed, 'Product type')).toBe(null)
        expect(segment(parsed, 'Instrument').description).toContain('Camera that acquired')
    })

    test('product type codes carry a short paragraph of their own', () => {
        const paragraph = (filename) => segment(parse(filename), 'Product type').description
        // Radiometric, XYZ and colour codes each explain their own family.
        expect(paragraph('NRF_0368_0699599710_551RAD_N0110108NCAM00600_0A00LLJ01.IMG')).toContain(
            'Radiometric RDRs convert raw DN into physical units'
        )
        expect(paragraph('NRM_0818_0739564747_023XYZ_N0391469VCE_16000_0A02LLJ02.IMG')).toContain(
            'three-dimensional position'
        )
        expect(paragraph('ZL0_0673_0761234567_123DWG_N0301234ZCAM03456_1100LMA03.IMG')).toContain(
            'the raw-DN member of the set'
        )
        // Each paragraph ends on the SIS facts for that code.
        expect(paragraph('NRF_0368_0699599710_551RAD_N0110108NCAM00600_0A00LLJ01.IMG')).toContain(
            'PDS processing level calibrated; derived image type IMAGE'
        )
        // An unlisted code falls back to the segment's own description.
        expect(paragraph('NRM_0818_0739564747_023QQQ_N0391469VCE_16000_0A02LLJ02.IMG')).toContain(
            'What kind of product this is'
        )
    })

    test('out-of-range fields decode as such', () => {
        const parsed = parse('NRM______0739564747_023IDM_N_______VCE_16000_0A02LLJ__.IMG')
        expect(meaningOf(parsed, 'Sol')).toBe('Out of range')
        expect(meaningOf(parsed, 'Site')).toBe('Out of range')
        expect(meaningOf(parsed, 'Drive')).toBe('Out of range')
        expect(meaningOf(parsed, 'Version')).toBe('Out of range')
    })

    test('names outside the single-frame convention fall back to plain text', () => {
        // Mosaic and terrain products use their own conventions.
        expect(parse('SOL_0818_1_0_0_RAS_N_0391469_XYZ_A01.IMG')).toBe(null)
        expect(parse('NRM_0818_0739564747_023IDM_N0391469VCE_16000_0A02LLJ02')).toBe(null)
        expect(parse('nrm_0818_0739564747_023idm_n0391469vce_16000_0a02llj02.img')).toBe(null)
        expect(parse('')).toBe(null)
        expect(parse(undefined)).toBe(null)
    })

    test('unsupported missions and filenames render as plain text', () => {
        const forRecord = (record) =>
            parseFilename(
                record.gather.pds_archive.file_name,
                resolveFilenameSpec({
                    mission: record.gather.common.mission,
                    pds_standard: record.gather.pds_archive.pds_standard,
                })
            )
        expect(resolveFilenameSpec({ mission: 'not_a_mission' })).toBe(null)
        expect(parseFilename('anything.img', null)).toBe(null)
        expect(forRecord(mgsMoc)).not.toBe(null)
        expect(forRecord(mslPds3)).not.toBe(null)
        expect(forRecord(mars2020Navcam)).not.toBe(null)
    })
})

test.describe('missions with several conventions', () => {
    const decode = (mission, filename) => {
        const parsed = parseFilename(filename, filenameSpecs[mission])
        return {
            title: parsed && parsed.title,
            value: (label) => valueOf(parsed, label),
            meaning: (label) => meaningOf(parsed, label),
        }
    }

    test('an msl single-frame RDR decodes to its SIS fields', () => {
        const msl = decode('msl', 'MLF_628039357RAD_S0772786MCAM13654D1.IMG')
        expect(msl.title).toContain('single-frame')
        expect(msl.meaning('Instrument')).toBe('Mastcam Left')
        expect(msl.meaning('Spacecraft clock')).toBe('SCLK 628039357 seconds')
        expect(msl.value('Product type')).toBe('RAD')
        expect(msl.meaning('Site')).toBe('Site 77')
        expect(msl.meaning('Drive')).toBe('Drive 2786')
        expect(msl.meaning('Version')).toBe('Version 1')
    })

    test('a mer single-frame RDR decodes to its SIS fields', () => {
        // Lower case, as the MER archive writes them.
        const mer = decode('mer', '1p580940096mrdd2fcp2391l2m1.img')
        expect(mer.title).toContain('single-frame')
        expect(mer.meaning('Rover')).toContain('Opportunity')
        expect(mer.meaning('Instrument')).toBe('Pancam')
        expect(mer.meaning('Product type')).toContain('MIPLRAD rad-corrected')
        expect(mer.meaning('Sequence category')).toContain('remote sensing')
        expect(mer.value('Sequence number')).toBe('2391')
        expect(mer.meaning('Camera eye')).toBe('Left camera eye')
        expect(mer.meaning('Producer')).toContain('MIPL')
    })

    test('a mer terrain mesh uses the variable-length convention', () => {
        const mesh = decode('mer', '1mesh_4621x_rfnp_203_ffl_0_v2.ht')
        expect(mesh.title).toContain('terrain mesh')
        expect(mesh.value('Ending sol')).toBe('4621x')
        expect(mesh.meaning('Ending sol')).toContain('last of several')
        expect(mesh.meaning('Instruments')).toContain('several instruments')
        expect(mesh.meaning('Ending site')).toBe('Site 203')
        expect(mesh.meaning('Input product type')).toContain('full-frame')
        expect(mesh.meaning('Version')).toBe('Version 2')
        expect(mesh.meaning('Extension')).toContain('Height map')
    })

    test('a junocam rdr decodes its filter combination and orbit', () => {
        const juno = decode('juno', 'JNCR_2016217_01C03914_V01.IMG')
        expect(juno.meaning('Product type')).toContain('RDR')
        expect(juno.meaning('Year')).toBe('Year 2016')
        expect(juno.meaning('Day of year')).toBe('Day of year 217')
        expect(juno.meaning('Orbit')).toBe('Orbit 1')
        expect(juno.meaning('Filter combination')).toContain('Three-colour')
        expect(juno.meaning('Version')).toBe('Version 1')
    })

    test('an lcross product decodes instrument, level and time stamp', () => {
        const lcro = decode('lcro', 'LCROSS_NIR2_CAL_20090622162539823.IMG')
        expect(lcro.meaning('Instrument')).toBe('Near infrared camera 2')
        expect(lcro.meaning('Processing level')).toContain('Calibrated')
        expect(lcro.meaning('Year')).toBe('Year 2009')
        expect(lcro.meaning('Millisecond')).toBe('Millisecond 823')
    })

    test('a scalpss frame decodes its capture, frame, camera and rendition', () => {
        const scalpss = decode('scalpss', 'cap093_frame004_sfl0-std.tif')
        expect(scalpss.meaning('Capture number')).toBe('Capture 93')
        expect(scalpss.meaning('Frame number')).toBe('Frame 4')
        expect(scalpss.meaning('Camera')).toContain('Short Focal Length camera 0')
        expect(scalpss.meaning('Image type')).toContain('full resolution')
        expect(scalpss.meaning('Extension')).toContain('TIFF')
        const label = decode('scalpss', 'cap004_frame120_lfl1-low_res.tif.xml')
        expect(label.meaning('Camera')).toContain('Long Focal Length camera 1')
        expect(label.meaning('Image type')).toContain('16× binned')
        expect(label.meaning('Extension')).toContain('label')
        expect(parseFilename('cap004_frame120_lfl1.tif', filenameSpecs.scalpss)).toBe(null)
    })

    test('a lunar orbiter frame decodes its orbiter and subframe', () => {
        const lo = decode('lo', 'FRAME_3101_H2.IMG')
        expect(lo.meaning('Orbiter')).toBe('Lunar Orbiter III')
        expect(lo.meaning('Frame number')).toBe('Image 101')
        expect(lo.meaning('Resolution')).toContain('High resolution subframe 2')
    })

    test('a galileo ssi redr decodes its clock counts', () => {
        const go = decode('go', '8345r.img')
        expect(go.meaning('MOD91 count')).toBe('MOD91 45')
        expect(go.meaning('Product type')).toContain('REDR')
    })

    test('an lro lamp edr decodes its class and version', () => {
        const lro = decode('lro', 'LAMP_ENG_0426782095_02.fit')
        expect(lro.meaning('Product class')).toContain('Engineering')
        expect(lro.meaning('Version')).toBe('Version 2')
        expect(lro.meaning('Extension')).toContain('FITS')
    })

    test('a name matching none of a mission\u2019s conventions stays plain text', () => {
        expect(parseFilename('1mesh_4621x_rfnp.tar.gz', filenameSpecs.mer)).toBe(null)
        expect(parseFilename('MLF_628039357RAD.txt', filenameSpecs.msl)).toBe(null)
    })
})

const eachVariant = (visit) =>
    Object.keys(filenameSpecs).forEach((key) =>
        variantsOf(filenameSpecs[key]).forEach((spec) =>
            visit(spec, `${key} — ${spec.title || 'untitled'}`)
        )
    )

test.describe('filename spec config', () => {
    test('every variant is titled and references its SIS', () => {
        eachVariant((spec, key) => {
            expect(spec.title, key).toBeTruthy()
            expect(spec.reference, key).toContain('SIS')
            expect(spec.match, key).toBeTruthy()
        })
    })

    test('segments are ordered, non-overlapping and fully labelled', () => {
        eachVariant((spec, key) => {
            expect(spec.segments.length).toBeGreaterThan(0)
            let cursor = 0
            spec.segments.forEach((s) => {
                expect(s.label, `${key} segment at ${s.start}`).toBeTruthy()
                expect(s.description, `${key} ${s.label}`).toBeTruthy()
                // Variable-length conventions place their fields by capture
                // group instead of by character position.
                if (s.group != null) {
                    expect(s.group, `${key} ${s.label}`).toBeGreaterThan(cursor)
                    cursor = s.group
                    return
                }
                expect(s.start, `${key} ${s.label}`).toBeGreaterThan(cursor)
                expect(s.length).toBeGreaterThan(0)
                cursor = s.start - 1 + s.length
            })
        })
    })

    test('neighbouring segments never share a colour', () => {
        eachVariant((spec, key) => {
            spec.segments.forEach((s, i) => {
                if (i === 0) return
                expect(s.color, `${key} ${spec.segments[i - 1].label} / ${s.label}`).not.toBe(
                    spec.segments[i - 1].color
                )
            })
        })
    })

    test('no code is claimed twice within a segment', () => {
        eachVariant((spec) => {
            spec.segments.forEach((s) => {
                const seen = new Set(Object.keys(s.values || {}))
                ;(s.valueGroups || []).forEach((group) => {
                    group.codes.split(/\s+/).forEach((code) => {
                        expect(seen.has(code), `${s.label} ${code}`).toBe(false)
                        seen.add(code)
                    })
                })
            })
        })
    })
})
