// dispatch() these
import axios from 'axios'

import { domain, endpoints, ES_PATHS } from '../constants'
import { getHeader, getPDSUrl, getFilename, getIn } from '../utils'

import fileSaver from 'file-saver'

// ======================= CSV =======================
const CSV_FILE_MAX_ROWS = 500000

let CSVRows = []

export const CSVCart = (statusCallback, finishCallback, setOnStop, productKeys, datestamp) => {
    return (dispatch, getState) => {
        if (productKeys == null || productKeys.length === 0) productKeys = ['src']

        const state = getState()
        const cart = state.get('cart').toJS()
        const checkedCart = cart.filter((v) => v.checked === true)
        const startTime = Date.now()

        const tasks = []

        CSVRows = ['filename,size,uri,download_url\n']

        checkedCart.forEach((d) => {
            tasks.push(async () => {
                d.type === 'query' || d.type === 'directory' || d.type === 'regex'
                    ? await CSVQuery(
                          d.item,
                          productKeys,
                          d.type === 'directory',
                          datestamp,
                          statusCallback,
                          finishCallback,
                          setOnStop,
                          startTime
                      )
                    : CSVImage(d.item, productKeys, datestamp, statusCallback)
            })
        })

        const callTasks = async () => {
            for (const task of tasks) {
                await task()
            }
            createCSVFile(datestamp, finishCallback)
        }

        callTasks()
    }
}

const CSVQuery = (
    item,
    productKeys,
    keepFolderStructure,
    datestamp,
    statusCallback,
    finishCallback,
    setOnStop,
    startTime
) => {
    return new Promise((resolve, reject) => {
        let totalReceived = 0
        let dsl = {
            query: item.query,
            size: 5000,
            sort: [{ ['uri']: 'desc', [ES_PATHS.release_id.join('.')]: 'desc' }],
            _source: [
                'uri',
                ES_PATHS.release_id.join('.'),
                ES_PATHS.related.join('.'),
                ES_PATHS.archive.fs_type.join('.'),
            ],
        }
        let stopped = false

        setOnStop(() => () => {
            stopped = true
        })

        sendStatus(
            statusCallback,
            null,
            null,
            null,
            null,
            (totalReceived / item.total) * 100,
            totalReceived,
            item.total,
            item.total,
            0,
            Date.now() - startTime,
            ((Date.now() - startTime) * item.total) / totalReceived - (Date.now() - startTime),
            0
        )

        if (keepFolderStructure === true) productKeys = ['src']

        const filter_path = 'filter_path=hits.hits._source,hits.total,_scroll_id'

        axios
            .post(`${domain}${endpoints.search}?scroll=1m&${filter_path}`, dsl, getHeader())
            .then((res) => scroll(res))
            .then((s) => {
                resolve()
            })
            .catch((err) => {
                console.error('ES Download Error')
                console.dir(err)
            })

        const scroll = (res) => {
            if (stopped === true || !res?.data?.hits) {
                if (typeof finishCallback === 'function') {
                    finishCallback(false)
                }
                reject()
                return
            }

            totalReceived += res.data.hits.hits.length
            sendStatus(
                statusCallback,
                null,
                null,
                null,
                null,
                (totalReceived / item.total) * 100,
                totalReceived,
                item.total,
                item.total,
                0,
                Date.now() - startTime,
                ((Date.now() - startTime) * item.total) / totalReceived - (Date.now() - startTime),
                0
            )
            res.data.hits.hits.forEach((r) => {
                productKeys.forEach((key) => {
                    let path
                    if (key === 'src') path = getIn(r._source, ES_PATHS.source)
                    else path = getIn(r._source, ES_PATHS.related.concat([key, 'uri']))
                    const size = getIn(r._source, ES_PATHS.related.concat([key, 'size']), null)
                    if (path) {
                        // Do no try downloading dirs
                        // Make sure a . exists in the final part
                        const fs_type = getIn(r._source, ES_PATHS.archive.fs_type)
                        if (fs_type == null) {
                            const pathSplit = path.split('/')
                            if (pathSplit[pathSplit.length - 1].indexOf('.') == null) return
                        } else if (fs_type === 'directory') return

                        const release_id = getIn(r._source, ES_PATHS.release_id)
                        let filename = getFilename(path)

                        let filepath = ''
                        if (keepFolderStructure) {
                            const splitUri = item.uri.split('/')
                            filepath =
                                splitUri[splitUri.length - 1] +
                                path.replace(item.uri, '').replace(filename, '')
                        }

                        const pdsUri = getPDSUrl(path, release_id)
                        if (filename && pdsUri)
                            CSVRows.push(`${filename},${size},${path},${pdsUri}\n`)
                    }
                })
            })
            if (CSVRows.length >= CSV_FILE_MAX_ROWS) createCSVFile(datestamp)

            if (totalReceived < item.total) {
                return axios
                    .post(
                        `${domain}${endpoints.scroll}?&${filter_path}`,
                        {
                            scroll: '1m',
                            scroll_id: res.data._scroll_id,
                        },
                        getHeader()
                    )
                    .then((response) => {
                        return scroll(response)
                    })
                    .catch((err) => {
                        console.log(err)
                        reject(err)
                    })
            }
        }
    })
}
const CSVImage = (item, productKeys, datestamp, statusCallback) => {
    productKeys.forEach((key, idx) => {
        let path
        if (key === 'src') path = item.uri
        else path = getIn(item.related, [key, 'uri'])
        const size = getIn(item.related, [key, 'size'], null)

        if (path) {
            const filename = getFilename(path)
            const pdsUri = getPDSUrl(path, item.release_id)
            if (filename && pdsUri) CSVRows.push(`${filename},${size},${path},${pdsUri}\n`)
        }

        sendStatus(
            statusCallback,
            idx,
            (idx / productKeys.length) * 100,
            idx,
            productKeys.length,
            (idx / productKeys.length) * 100,
            idx,
            productKeys.length,
            productKeys.length
        )
    })
    return
}

const createCSVFile = (datestamp, finishCallback) => {
    if (CSVRows.length == 0) {
        alert('Please select products to download.')
        return
    }

    let CSVStr = CSVRows.join('')
    CSVRows = []

    // Windows treats the % character as EOL in batch files, so need to escape it
    if (window.navigator.userAgent.indexOf('Windows') !== -1) CSVStr = CSVStr.replace(/%/g, '%%')

    const blob = new Blob([CSVStr], { type: 'text/plain;charset=utf-8' })
    fileSaver.saveAs(blob, `pdsimg-atlas_${datestamp}.csv`, { autoBom: false })

    if (typeof finishCallback === 'function') {
        finishCallback(false)
    }
}

const sendStatus = (cb, ccii, cp, cc, ct, op, oc, ot, otp, ob, oet, oetr, of1) => {
    // Status
    const status = {
        current: {
            currentItemIdx: ccii != null ? ccii : 0,
            percent: cp != null ? cp : 100,
            current: cc != null ? cc : 0,
            total: ct != null ? ct : 1,
        },
        overall: {
            percent: op != null ? op : 100,
            current: oc != null ? oc : 0,
            total: ot != null ? ot : 1,
            totalProducts: otp != null ? otp : 1,
            buffer: ob != null ? ob : 0,
            elapsedTime: oet != null ? oet : 0,
            estimatedTimeRemaining: oetr != null ? oetr : 0,
            failures: of1 != null ? of1 : 0,
        },
    }
    if (typeof cb === 'function') {
        cb(status)
    }
}
