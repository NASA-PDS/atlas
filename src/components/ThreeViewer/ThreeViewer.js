import React, { useEffect, useState, useRef } from 'react'
import OpenSeadragon from 'openseadragon'
import PropTypes from 'prop-types'

import clsx from 'clsx'

import { makeStyles } from '@mui/styles'
import Paper from '@mui/material/Paper'

import { getExtension, getPDSUrl, getRedirectedUrl } from '../../core/utils'
import { IMAGE_EXTENSIONS } from '../../core/constants'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import './Three.css'

let objloader

const useStyles = makeStyles((theme) => ({
    ThreeViewer: {
        width: '100%',
        height: '100%',
        background: theme.palette.swatches.grey.grey50,
        position: 'relative',
    },
    ThreeContainer: {
        width: '100% !important',
        height: '100% !important',
    },
    loading: {
        textAlign: 'center',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        opacity: 1,
        transition: 'opacity 0.6s ease-out',
    },
    paper: {
        'position': 'absolute',
        'top': '50%',
        'left': '50%',
        'width': '170px',
        'height': '48px',
        'transform': 'translateX(-50%) translateY(-50%)',
        'background': theme.palette.accent.main,
        'fontSize': '16px',
        'color': theme.palette.text.secondary,
        'paddingBottom': theme.spacing(0.5),
        'pointerEvents': 'none',
        'transition': 'opacity 1s ease-out',
        '& > div': {
            padding: `${theme.spacing(4)} ${theme.spacing(6)}`,
        },
    },
}))

const ThreeViewer = ({ url, release_id, supplemental, settings }) => {
    const c = useStyles()

    supplemental = supplemental || []

    const canvas = useRef()
    const loading = useRef()
    const paperRef = useRef()

    useEffect(() => {
        let mounted = true
        let resize

        const makeSceneWithModel = async () => {
            let errored = false

            const renderer = new THREE.WebGLRenderer({ canvas: canvas.current })
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.setSize(canvas.current.offsetWidth, canvas.current.offsetHeight)
            renderer.setClearColor(0x17171b)

            const fov = 45
            const aspect = canvas.current.offsetWidth / canvas.current.offsetHeight
            const near = 0.01
            const far = 1000
            const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
            camera.position.set(0, 5, 0)

            const controls = new OrbitControls(camera, canvas.current)
            controls.target.set(0, 0, 0)
            controls.update()

            const scene = new THREE.Scene()

            const grid = new THREE.GridHelper(64, 32, 0x464649, 0x2e2e32)
            scene.add(grid)

            //Light
            const light = new THREE.AmbientLight(0xffffff)
            scene.add(light)

            const manager = new THREE.LoadingManager()
            manager.onProgress = function (item, loaded, total) {
                return
            }

            let textureUrl
            supplemental.forEach((s) => {
                if (IMAGE_EXTENSIONS.includes(getExtension(s), true)) textureUrl = s
            })
            textureUrl = await getRedirectedUrl(getPDSUrl(textureUrl, release_id)).catch((err) => {
                loading.current.innerHTML = `ERROR`
                errored = true
            })
            if (errored) return

            const textureLoader = new THREE.TextureLoader(manager)
            const texture = textureLoader.load(textureUrl)
            texture.magFilter = THREE.NearestFilter
            texture.minFilter = THREE.LinearMipMapLinearFilter

            //Model
            const onProgress = function (xhr) {
                if (xhr.lengthComputable) {
                    const percentComplete = (xhr.loaded / xhr.total) * 100
                    loading.current.style.opacity = 1
                    loading.current.innerHTML = `LOADING ${Math.round(percentComplete, 2)}%`
                    if (percentComplete >= 99) {
                        loading.current.style.opacity = 0
                        paperRef.current.style.opacity = 0
                    }
                } else {
                    loading.current.style.opacity = 0
                    paperRef.current.style.opacity = 0
                }
            }
            const onError = function (xhr) {
                console.log('error', xhr)
            }
            const loader = new OBJLoader(manager)

            url = await getRedirectedUrl(url).catch((err) => {
                loading.current.innerHTML = `ERROR`
                errored = true
            })
            if (errored) return

            loader.load(
                url,
                function (object) {
                    let model = object
                    model.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.material.map = texture
                        }
                    })
                    model.rotation.x = Math.PI / 2

                    // Center obj bbox to world center
                    const box = new THREE.Box3().setFromObject(model)
                    const size = box.getSize(new THREE.Vector3()).length()
                    const center = box.getCenter(new THREE.Vector3())

                    model.position.x += model.position.x - center.x
                    model.position.y += model.position.y - center.y
                    model.position.z += model.position.z - center.z

                    camera.position.set(0, size * 1.3, 0)
                    camera.lookAt(center)

                    controls.update()

                    scene.add(model)
                },
                onProgress,
                onError
            )

            resize = () => {
                if (renderer != undefined) {
                    camera.aspect = canvas.current.offsetWidth / canvas.current.offsetHeight
                    camera.updateProjectionMatrix()
                    renderer.setSize(canvas.current.offsetWidth, canvas.current.offsetHeight)
                }
            }
            window.addEventListener('resize', resize)

            const render = () => {
                renderer.render(scene, camera)
                controls.update()
                if (mounted) requestAnimationFrame(render)
            }

            requestAnimationFrame(render)
        }

        makeSceneWithModel().catch(console.error)

        return () => {
            mounted = false
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <div className={c.ThreeViewer}>
            <canvas id="three" className={c.ThreeContainer} ref={canvas}></canvas>
            <Paper className={c.paper} elevation={2} ref={paperRef}>
                <div className={c.loading} ref={loading}></div>
            </Paper>
        </div>
    )
}

ThreeViewer.propTypes = {}

export default ThreeViewer
