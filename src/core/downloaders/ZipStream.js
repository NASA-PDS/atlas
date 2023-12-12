import axios from 'axios'

import { domain, endpoints, ES_PATHS } from '../constants'
import { getIn, getHeader, getPDSUrl, getRedirectedUrl, getFilename, getExtension } from '../utils'

import ponyfill from '../../external/streamsaver-helpers/ponyfill.min'
import BlobJS from '../../external/streamsaver-helpers/Blob'
import streamsaver from 'streamsaver'
import { ZIP } from '../../external/streamsaver-helpers/zip-stream'

streamsaver.mitm = endpoints.mitm
const { createWriteStream } = streamsaver

const querySize = 500
const scrollTimeout = '3h'

export const ZipStreamCart = (
    statusCallback,
    finishCallback,
    getController,
    productKeys,
    errorCallback
) => {
    return (dispatch, getState) => {
        if (productKeys == null || productKeys.length === 0) productKeys = ['src']

        const state = getState()
        const cart = state.get('cart').toJS()
        const checkedCart = cart.filter((v) => v.checked === true)

        ZipStreamDownload(
            'atlas_zip_download',
            checkedCart,
            statusCallback,
            finishCallback,
            getController,
            productKeys,
            errorCallback
        )
    }
}

//ZipStreamCart()
const ZipStreamDownload = (
    folderName,
    items,
    statusCallback,
    finishCallback,
    getController,
    productKeys,
    errorCallback
) => {
    const fileStream = createWriteStream(`${folderName}.zip`)

    let currentItemIdx = 0
    let lastQueryResult = null
    let files = []
    let filesIdx = null

    // For metrics
    let totalFiles = 0
    let totalProducts = 0
    let currentFiles = 0
    let failures = 0
    let filesAreFrom = null

    items.forEach((item) => {
        totalFiles += (item?.item?.total || 1) * productKeys.length
        totalProducts += item?.item?.total || 1
    })
    const startTime = Date.now()
    let status = {}
    let paused = false

    const pull = async (ctrl) => {
        // Gets executed every time zip.js asks for more data
        if (paused) return

        // We want to iterate over each cart item
        // If the cart item is an individual image, we can just read its data
        // However, if it's a query, we need to perform an initial ES scroll search
        //  and iterate of it to until we get all results.
        // ...and when we get multiple files, we need one pull per file so that they don't
        //  stack up in memory
        const currentItem = items[currentItemIdx]
        if (currentItem == null) {
            // if (done adding all files)
            ctrl.closeWithMetadata()
        } else {
            // If me need the next files
            if (filesIdx == null) {
                // If we're not in the middle of a scroll query
                if (lastQueryResult == null || lastQueryResult?.done === true) {
                    if (
                        currentItem.type === 'query' ||
                        currentItem.type === 'directory' ||
                        currentItem.type === 'regex'
                    ) {
                        lastQueryResult = await getQuery(currentItem.item, null, productKeys)
                        files = lastQueryResult.files
                        filesAreFrom = lastQueryResult
                    } else {
                        files = getImage(currentItem.item, productKeys)
                        filesAreFrom = 'images'
                    }
                } else {
                    // We're in the middle of a scroll query
                    lastQueryResult = await getQuery(currentItem.item, lastQueryResult, productKeys)
                    files = lastQueryResult.files
                    filesAreFrom = lastQueryResult
                }
                // We got next files, so initialize fetching by setting filesIdx from null to 0
                filesIdx = 0
            }
            // Group Failures
            // Skip and recall if something failed
            if (files.length === 0) {
                if (filesAreFrom === 'images') {
                    failures += 1
                } else {
                    failures += filesAreFrom.total - filesAreFrom.completed
                }

                files = []
                filesIdx = null
                currentItemIdx++
                lastQueryResult = null
                pull(ctrl)
                return
            }

            let manualPull = false
            // Stream current file to zip
            let url = files[filesIdx].url

            const name = files[filesIdx].name
            let res = null
            try {
                res = await fetch(url)
            } catch (err) {
                failures += 1
            }

            if (res != null) {
                const stream = () => res.body
                // Main Queueing of next file
                // Files go under a {index}_{type} directory to avoid issues with duplicates. ex. 1_query/, 2_image/
                try {
                    let filepath = `${currentItemIdx}_${currentItem.type}/${name}`
                    if (currentItem.type === 'directory' && files[filesIdx].url) {
                        try {
                            filepath =
                                getFilename(currentItem.item.uri) +
                                files[filesIdx].url.split(currentItem.item.uri)[1]
                        } catch (err) {}
                    }
                    // Make sure we're not trying to add folders as files
                    if (getExtension(filepath).length > 0) {
                        // Write file
                        ctrl.enqueue({ name: filepath, stream })
                    }
                } catch (err) {
                    // Individual failures
                    failures += 1
                }
            }

            filesIdx++

            currentFiles++

            // Status
            status = {
                current: {
                    currentItemIdx: currentItemIdx,
                    percent:
                        lastQueryResult != null
                            ? ((lastQueryResult.completed - querySize + filesIdx) /
                                  lastQueryResult.total) *
                              100
                            : 100,
                    current: lastQueryResult != null ? lastQueryResult.completed + filesIdx : 1,
                    total: lastQueryResult != null ? lastQueryResult.total : 1,
                },
                overall: {
                    percent: (currentFiles / totalFiles) * 100,
                    current: currentFiles,
                    total: totalFiles,
                    totalProducts: totalProducts,
                    buffer: ((currentFiles + files.length - filesIdx) / totalFiles) * 100,
                    elapsedTime: Date.now() - startTime,
                    estimatedTimeRemaining:
                        ((Date.now() - startTime) * totalFiles) / currentFiles -
                        (Date.now() - startTime),
                    failures: failures,
                },
            }
            if (typeof statusCallback === 'function') {
                statusCallback(status)
            }

            // Move to next item
            if (filesAreFrom === 'images') {
                if (filesIdx >= files.length) {
                    // Image finished
                    files = []
                    filesIdx = null
                    lastQueryResult = null
                    currentItemIdx++
                }
            } else {
                if (filesAreFrom.previousCompleted + filesIdx >= filesAreFrom.total) {
                    // Query finished
                    files = []
                    filesIdx = null
                    lastQueryResult = null
                    currentItemIdx++
                } else if (filesIdx >= files.length) {
                    // We're scrolling
                    // So don't increment currentItemIdx and don't reset lastQueryResults
                    files = []
                    filesIdx = null
                }
            }
        }
    }

    const readableZipStream = new ZIP({
        start: (ctrl) => {
            // Add additional functions
            ctrl.pause = () => {
                paused = true
            }
            ctrl.resume = () => {
                if (paused) {
                    paused = false
                    pull(ctrl)
                }
            }
            // Make a metadata files too
            ctrl.closeWithMetadata = () => {
                ctrl.enqueue(getMetadataFile(items, status, productKeys))
                ctrl.close()
            }
            if (typeof getController === 'function') {
                getController(ctrl)
            }

            status = {}
        },
        pull: pull,
    })

    if (window.WritableStream && readableZipStream.pipeTo) {
        // more optimized
        return readableZipStream.pipeTo(fileStream).then(() => {
            if (typeof finishCallback === 'function') {
                finishCallback(false)
            }
        })
    } else {
        // less optimized
        const writer = fileStream.getWriter()
        const reader = readableZipStream.getReader()
        const pump = () =>
            reader
                .read()
                .then((res) => (res.done ? writer.close() : writer.write(res.value).then(pump)))
                .then((res) => {
                    if (res.done) {
                        if (typeof finishCallback === 'function') {
                            finishCallback(false)
                        }
                        return writer.close()
                    } else {
                        return writer.write(res.value).then(pump)
                    }
                })

        pump()
    }
}

const getQuery = (item, previousResult, productKeys) => {
    return new Promise((resolve, reject) => {
        //Get total count
        let totalCount = 0
        productKeys.forEach((key) => {
            if (key === 'src') totalCount += item.total
            else if (item.related[key]) totalCount += item.related[key].count
        })

        // Query
        let dsl = {
            query: item.query,
            size: querySize,
            sort: [{ ['uri']: 'desc', [ES_PATHS.release_id.join('.')]: 'desc' }],
            _source: ['uri', ES_PATHS.release_id.join('.'), ES_PATHS.related.join('.')],
        }

        const filter_path = 'filter_path=hits.hits._source,hits.total,_scroll_id'

        if (previousResult == null) {
            axios
                .post(
                    `${domain}${endpoints.search}?scroll=${scrollTimeout}&${filter_path}`,
                    dsl,
                    getHeader()
                )
                .then((res) => processResponse(res))
                .catch((err) => {
                    console.error('ES ZIP Download Error')
                    console.dir(err)
                })
        } else {
            axios
                .post(
                    `${domain}${endpoints.scroll}?&${filter_path}`,
                    {
                        scroll: scrollTimeout,
                        scroll_id: previousResult.scrollId,
                    },
                    getHeader()
                )
                .then((res) => {
                    processResponse(res)
                })
                .catch((err) => {
                    console.error('ES ZIP Scroll Download Error')
                    console.dir(err)
                    resolve({
                        files: [],
                    })
                })
        }

        const urisDownloaded = []

        const processResponse = (res) => {
            const result = {
                files: [],
                previousCompleted: previousResult != null ? previousResult.completed || 0 : 0,
                completed: previousResult != null ? previousResult.completed || 0 : 0,
                total: totalCount,
                scrollId: res.data._scroll_id,
                done: false,
                failed: false,
            }
            if (!res?.data?.hits?.hits) {
                result.done = true
                result.failed = true
                resolve(result)
                return
            }

            res.data.hits.hits.forEach((r) => {
                productKeys.forEach((key) => {
                    let path
                    if (key === 'src') path = getIn(r._source, ES_PATHS.source)
                    else path = getIn(r._source, ES_PATHS.related.concat([key, 'uri']))

                    // We are sorting by uri and release_id and then only download the first instance of the uri
                    // This is a workaround because collapse does not work with scroll.
                    if (path && urisDownloaded.indexOf(path) == -1) {
                        urisDownloaded.push(path)
                        // Remove first uri just to save on a bit of memory. We proably won't have more than 1k releases for a mission
                        if (urisDownloaded.length > 1000) urisDownloaded.shift()
                        const release_id = getIn(r._source, ES_PATHS.release_id)
                        const name = getFilename(path)
                        const url = getPDSUrl(path, release_id)
                        if (name && url) result.files.push({ name, url })
                    }
                })
            })

            result.completed += result.files.length

            if (result.completed >= result.total) result.done = true

            resolve(result)
            return
        }
    })
}
const getImage = (item, productKeys) => {
    const images = []
    productKeys.forEach((key) => {
        let path
        if (key === 'src') path = item.uri
        else path = getIn(item.related, [key, 'uri'])
        if (path) {
            const name = getFilename(path)
            const url = getPDSUrl(path, item.release_id)
            if (name && url) images.push({ name, url })
        }
    })
    return images
}

const getMetadataFile = (items, status, productKeys) => {
    return {
        name: 'metadata.json',
        stream() {
            const formattedItems = {}
            items.forEach((item, idx) => {
                const formattedItem = JSON.parse(JSON.stringify(item))
                formattedItem.index = idx
                formattedItem.directory = `${idx}_${formattedItem.type}`
                if (formattedItem.item.images) {
                    formattedItem.item.previewImages = formattedItem.item.images
                    delete formattedItem.item.images
                }
                if (formattedItem.item.related) {
                    const relatedKeys = Object.keys(formattedItem.item.related)
                    relatedKeys.forEach((key) => {
                        if (!productKeys.includes(key)) delete formattedItem.item.related[key]
                    })
                }
                delete formattedItem.checked
                delete formattedItem.time
                formattedItems[formattedItem.directory] = formattedItem
            })

            const formattedStatus = {
                percentComplete: status?.overall?.percent,
                filesDownloaded: status?.overall?.current,
                totalFiles: status?.overall?.total,
                totalProducts: status?.overall?.totalProducts,
                failures: status?.overall?.failures,
                elapsedTimeMs: status?.overall?.elapsedTime,
                finishDate: new Date(),
                filesChosen: productKeys,
            }

            return new ReadableStream({
                start(ctrl) {
                    ctrl.enqueue(
                        new TextEncoder().encode(
                            JSON.stringify(
                                {
                                    app: {
                                        name: 'Atlas 4',
                                        page: 'Cart',
                                        owner: 'PDS-IMG',
                                    },
                                    license: {},
                                    status: formattedStatus,
                                    downloads: {
                                        description:
                                            "Items downloaded from PDS-IMG Atlas 4. Adjacent directory names correspond to 'items' indices.",
                                        items: formattedItems,
                                    },
                                },
                                null,
                                2
                            )
                        )
                    )
                    ctrl.close()
                },
            })
        },
    }
}

export const streamDownloadFile = async (url, filename) => {
    const fileStream = createWriteStream(filename)

    url = await getRedirectedUrl(url).catch((err) => {})

    fetch(url)
        .then((res) => {
            const readableStream = res.body

            // more optimized
            if (window.WritableStream && readableStream.pipeTo) {
                return readableStream
                    .pipeTo(fileStream)
                    .then(() => {
                        /*done*/
                    })
                    .catch((err) => {})
            }

            window.writer = fileStream.getWriter()

            const reader = res.body.getReader()
            const pump = () =>
                reader
                    .read()
                    .then((res) => (res.done ? writer.close() : writer.write(res.value).then(pump)))

            pump()
        })
        .catch((err) => {})
}
