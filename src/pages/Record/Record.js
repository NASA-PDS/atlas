import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import axios from 'axios'

import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import useMediaQuery from '@mui/material/useMediaQuery'
import { makeStyles } from '@mui/styles'

import { searchRecordByURI, setRecordData } from '../../core/redux/actions/actions'
import { ES_PATHS, domain, endpoints } from '../../core/constants'
import { getIn, getHeader } from '../../core/utils'

import Title from './Title/Title'
import Content from './Content/Content'
import Footer from './Footer/Footer'

const useStyles = makeStyles((theme) => ({
    Record: {
        width: '100%',
        height: '100%',
        color: theme.palette.text.primary,
    },
}))

const Record = (props) => {
    const { width } = props
    const c = useStyles()

    const location = useLocation()
    const dispatch = useDispatch()

    const [versions, setVersions] = useState([])
    const [activeVersion, setActiveVersion] = useState(null)

    const recordData = useSelector((state) => {
        return state.get('recordData').toJS()
    })

    useEffect(() => {
        if (Object.keys(recordData).length === 0) dispatch(searchRecordByURI())
        // On unmount
        return () => {
            dispatch(setRecordData({}))
        }
    }, [])

    useEffect(() => {
        dispatch(searchRecordByURI())
    }, [location.href])

    // Query for different product versions
    useEffect(() => {
        const pds_standard = getIn(recordData, ES_PATHS.pds_standard)

        // Query Versions (Current PDS4 specific)
        if (pds_standard === 'pds4') {
            const lidvid = getIn(recordData, ES_PATHS.pds4_label.lidvid)
            if (lidvid) {
                let [lid, vid] = lidvid.split('::')
                lid = lid
                    .replaceAll('/', '\\/')
                    .replaceAll(':', '\\:')
                    .replace(/\.[^/.]+$/, '')
                const dsl = {
                    query: {
                        bool: {
                            must: [
                                {
                                    regexp: {
                                        [ES_PATHS.pds4_label.lidvid.join('.')]: {
                                            value: `${lid}.*`,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    _source: ['uri', ES_PATHS.pds4_label.lidvid.join('.')],
                }

                axios
                    .post(`${domain}${endpoints.search}`, dsl, getHeader())
                    .then((response) => {
                        const nextVersions = []
                        if (response?.data?.hits?.hits?.[0] != null) {
                            response.data.hits.hits.forEach((r) => {
                                if (r._source?.pds4_label?.lidvid != null) {
                                    let [rlid, rvid] = r._source.pds4_label.lidvid.split('::')
                                    nextVersions.push({
                                        uri: r._source.uri,
                                        name: r._source.uri.split('/').pop(),
                                        version: `Version ${rvid}`,
                                        versionRaw: rvid,
                                        versionNum: parseFloat(rvid),
                                    })
                                }
                            })
                            nextVersions.sort(function (a, b) {
                                return b.versionNum - a.versionNum
                            })
                        }

                        if (nextVersions.length > 0) {
                            const [flid, fvid] = lidvid.split('::')
                            for (let i = 0; i < nextVersions.length; i++) {
                                if (nextVersions[i].versionRaw == fvid) {
                                    setActiveVersion(i)
                                    break
                                }
                            }
                        }

                        setVersions(nextVersions)
                    })
                    .catch((err) => {
                        setVersions([])
                    })
            } else {
                setVersions([])
            }
        } else {
            setVersions([])
        }
    }, [JSON.stringify(recordData)])

    return (
        <div className={c.Record}>
            <Title recordData={recordData} versions={versions} activeVersion={activeVersion} />
            <Content recordData={recordData} versions={versions} activeVersion={activeVersion} />
            {/*<Footer />*/}
        </div>
    )
}

Record.propTypes = {}

export default Record
