// dispatch() these
import axios from 'axios'

import { domain, endpoints, ES_PATHS } from '../constants'
import { getHeader, getPDSUrl, getFilename, getIn } from '../utils'

import fileSaver from 'file-saver'

// ======================= TXT =======================
const TXT_FILE_MAX_ROWS = 500000

let TXTRows = []

export const TXTCart = (productKeys, datestamp) => {
    return (dispatch, getState) => {
        if (productKeys == null || productKeys.length === 0) productKeys = ['src']

        const state = getState()
        const cart = state.get('cart').toJS()
        const checkedCart = cart.filter((v) => v.checked === true)

        const tasks = []

        TXTRows = []

        checkedCart.forEach((d) => {
            tasks.push(async () => {
                d.type === 'query' || d.type === 'directory' || d.type === 'regex'
                    ? await TXTQuery(d.item, productKeys, d.type === 'directory', datestamp)
                    : TXTImage(d.item, productKeys, datestamp)
            })
        })

        const callTasks = async () => {
            for (const task of tasks) {
                await task()
            }
            createTXTFile(datestamp)
        }

        callTasks()
    }
}

const TXTQuery = (item, productKeys, keepFolderStructure, datestamp) => {
    return new Promise((resolve, reject) => {
        let totalReceived = 0
        let dsl = {
            query: item.query,
            size: 10000,
            _source: ['uri', ES_PATHS.related.join('.')],
        }

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
            if (!res?.data?.hits) {
                reject()
                return
            }

            totalReceived += res.data.hits.hits.length
            res.data.hits.hits.forEach((r) => {
                productKeys.forEach((key) => {
                    let path
                    if (key === 'src') path = getIn(r._source, ES_PATHS.source)
                    else path = getIn(r._source, ES_PATHS.related.concat([key, 'uri']))
                    if (path) {
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
                        if (filename && pdsUri) TXTRows.push(`${pdsUri}\n`)
                    }
                })
            })
            if (TXTRows.length > TXT_FILE_MAX_ROWS) createTXTFile(datestamp)

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
const TXTImage = (item, productKeys, datestamp) => {
    productKeys.forEach((key) => {
        let path
        if (key === 'src') path = item.uri
        else path = getIn(item.related, [key, 'uri'])
        if (path) {
            const filename = getFilename(path)
            const pdsUri = getPDSUrl(path, item.release_id)
            if (filename && pdsUri) TXTRows.push(`${pdsUri}\n`)
        }
    })
    return
}

const createTXTFile = (datestamp) => {
    if (TXTRows.length == 0) {
        alert('Nothing to download.')
        return
    }

    let TXTStr = TXTRows.join('')
    TXTRows = []

    // Windows treats the % character as EOL in batch files, so need to escape it
    if (window.navigator.userAgent.indexOf('Windows') !== -1) TXTStr = TXTStr.replace(/%/g, '%%')

    const blob = new Blob([TXTStr], { type: 'text/plain;charset=utf-8' })
    fileSaver.saveAs(blob, `pdsimg-atlas_${datestamp}.txt`, true)
}
