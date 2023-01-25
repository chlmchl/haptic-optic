import * as THREE from 'three'

import Stats from 'three/addons/libs/stats.module.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js'
import { DragControls } from 'three/addons/controls/DragControls.js'

import { GetData } from './data/get_data.js'
import { TextureLoader } from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { onWindowResize } from './utils.js'
import { AdditiveAnimationBlendMode, MeshBasicMaterial } from '../build/three.module.js'

let container, stats
let camera, scene
const frustumSize = 250

let renderer, composer, composer2, renderPass, bloomPass
let controls, dragControls
let mesh, group
let enableSelection = true

let clock = new THREE.Clock()

let afterimagePass

const params = {
  enable: true,
  exposure: 0,
  bloomStrength: 0.15,
  bloomThreshold: 0.65,
  bloomRadius: 0
}
const fogParams = {
  fogNearColor: 0xffffff,
  fogHorizonColor: 0xffffff,
  fogDensity: 0.00005,
  fogNoiseSpeed: 50,
  fogNoiseFreq: 0.0012,
  fogNoiseImpact: 0.3
}
let data
let dataArr
let objects = []
let items = []
let textCredit = []
let title = true
let noTitle = false

let reverse = false

const mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster()

const camRay = new THREE.Raycaster()
const ray = new THREE.Vector3()
let direction = new THREE.Vector3()

getData()

setTimeout(() => {
  init()
  animate()
}, 800)

export function getData () {
  data = new GetData()
  dataArr = data.GetDataArray()
}

export function init () {
  const aspect = window.innerWidth / window.innerHeight

  camera = new THREE.PerspectiveCamera(60, aspect, 1, 4000)
  camera.position.z = 200

  scene = new THREE.Scene()
  scene.add(camera)

  ray.x = 0
  ray.y = 0
  ray.z = 0
  camera.add(ray)

  // stats
  stats = new Stats()
  document.body.appendChild(stats.dom)

  // console.log(dataArr)
  group = new THREE.Group()
  scene.add(group)

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.querySelector('#webgl').appendChild(renderer.domElement)

  // fog
  scene.background = new THREE.Color(fogParams.fogHorizonColor)
  scene.fog = new THREE.FogExp2(fogParams.fogHorizonColor, fogParams.fogDensity)

  // postprocessing
  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  afterimagePass = new AfterimagePass()
  composer.addPass(afterimagePass)

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  )
  bloomPass.threshold = params.bloomThreshold
  bloomPass.strength = params.bloomStrength
  bloomPass.radius = params.bloomRadius
  composer.addPass(bloomPass)

  if (typeof TESTING !== 'undefined') {
    for (let i = 0; i < 45; i++) {
      render()
    }
  }

  // event listeners
  window.addEventListener('resize', onWindowResize(camera, renderer, composer))
  let portrait = window.matchMedia('(orientation: portrait)')
  portrait.addEventListener('change', function (e) {
    onWindowResize(camera, renderer, composer)
  })
  document.addEventListener('click', onClick)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  // drag controls
  dragControls = new DragControls([...items], camera, renderer.domElement)
  dragControls.addEventListener('drag', render)
  createControls(camera)

  const message1 = [
    [')) HAPTIC )( OPTIC ((', 20],
    ['Collection touching my soul', 13]
  ]

  const message2 = [
    ['Times of distance', 16],
    ['2020/2022', 16]
  ]

  let message = message1
  loadTitle(camera, message, message1, message2, title)

  setTimeout(() => {
    message= message2
    loadTitle(camera, message, message1, message2, title);
  }, 10000);
  


  // launch functions

 
  loadData(scene, render, camera, dataArr)
}

function loadTitle (camera, message, message1, message2, title) {
  const loader = new FontLoader()
  loader.load('fonts/Grotesk/Grotesk03_Bold.json', function (font) {
    for (let i = 0; i < message.length; i++) {
      const geometry = new TextGeometry(message[i][0], {
        font: font,
        size: message[i][1],
        height: 0,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 0,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 0
      })
      const material = new THREE.MeshBasicMaterial({ color: 0xefefef })
      const text = new THREE.Mesh(geometry, material)

      material.blending = THREE.CustomBlending
      material.blendEquation = THREE.AddEquation //default
      material.blendSrc = THREE.OneMinusDstColorFactor //default
      material.transparent = true

      geometry.computeBoundingBox()
      const xMid =
        -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
      geometry.translate(xMid, -30 * i, -200)

      camera.add(text)

      text.renderOrder = 999
      text.material.depthTest = false
      text.material.depthWrite = false
      text.isMesh = title
      setTimeout(() => {
        text.isMesh = false
        
      }, 5000);
    }
  }) //end load function
}
setTimeout(() => {
  function loadTitle (camera, message, message1, message2, title) {
    const loader = new FontLoader()
    loader.load('fonts/Grotesk/Grotesk03_Bold.json', function (font) {
      for (let i = 0; i < message.length; i++) {
        const geometry = new TextGeometry(message[i][0], {
          font: font,
          size: message[i][1],
          height: 0,
          curveSegments: 12,
          bevelEnabled: false,
          bevelThickness: 0,
          bevelSize: 0,
          bevelOffset: 0,
          bevelSegments: 0
        })
        const material = new THREE.MeshBasicMaterial({ color: 0xefefef })
        const text = new THREE.Mesh(geometry, material)

        material.blending = THREE.CustomBlending
        material.blendEquation = THREE.AddEquation //default
        material.blendSrc = THREE.OneMinusDstColorFactor //default
        material.transparent = true

        geometry.computeBoundingBox()
        const xMid =
          -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
        geometry.translate(xMid, -30 * i, -200)

        camera.add(text)

        text.renderOrder = 999
        text.material.depthTest = false
        text.material.depthWrite = false
        text.isMesh = title
        setTimeout(() => {
          text.isMesh = false
        }, 5000);
      }
    }) //end load function
  }
}, 5000);

// load and display data

export function loadData (scene, render, camera, dataArr) {
  for (let i = 1; i < dataArr.length; i++) {
    const texture = new TextureLoader()
    /////// DISPLAY IMAGE
    texture.load(dataArr[i][0], function (texture) {
      const geometry = new THREE.PlaneGeometry(
        texture.image.width,
        texture.image.height,
        30,
        30
      )
      const uniforms = { texture1: { value: texture } }
      //const material = new MeshBasicMaterial({map: texture})
      const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        wireframe: false
      })
      geometry.computeBoundingBox()
      const mesh = new THREE.Mesh(geometry, material)

      mesh.position.x = (Math.random() - 0.5) * window.innerWidth * 5
      mesh.position.y = (Math.random() - 0.5) * window.innerHeight * 5
      mesh.position.z = 100 + (Math.random() - 0.5) * 3000

      mesh.scale.x = mesh.scale.y = 0.5

      scene.add(mesh)

      /////// ADD CREDITS
      const font = new FontLoader()

      font.load('fonts/Grotesk/Grotesk03_Bold.json', function (font) {
        const credits =
          dataArr[i][2] + '\n' + dataArr[i][1] + ' \n(' + dataArr[i][3] + ') '
        const geometry = new TextGeometry(credits, {
          font: font,
          size: 68,
          height: 0,
          curveSegments: 12,
          bevelEnabled: false,
          bevelThickness: 0,
          bevelSize: 0,
          bevelOffset: 0,
          bevelSegments: 0
        })

        const material = new THREE.MeshBasicMaterial({ color: 0xefefef })
        const fontMesh = new THREE.Mesh(geometry, material)
        material.blending = THREE.CustomBlending
        material.blendEquation = THREE.AddEquation //default
        material.blendSrc = THREE.OneMinusDstColorFactor //default

        material.transparent = true
        // fontMesh.position.set(
        //   -texture.image.width / 2,
        //   -texture.image.height / 2,
        //   150
        // )
        fontMesh.isMesh = false
        mesh.name = fontMesh.name = 'data[' + i + ']'
        textCredit.push(fontMesh)

        geometry.computeBoundingBox()
        const xMid =
          -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
        geometry.translate(xMid, 0, -500)
        fontMesh.renderOrder = 999
        fontMesh.material.depthTest = false
        fontMesh.material.depthWrite = false

        mesh.add(fontMesh)
        objects.push([mesh, fontMesh])
        items.push(mesh)
      })
    })
  }

  animate()
}

export function onKeyDown (event) {
  enableSelection = event.keyCode === 16 ? true : false
}

export function onKeyUp () {
  enableSelection = false
}

export function onClick (event) {
  event.preventDefault()
  title = false
  if (enableSelection === true) {
    const draggableObjects = dragControls.getObjects()
    draggableObjects.length = 0

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(mouse, camera)

    const intersections = raycaster.intersectObjects(items, true)

    if (intersections.length > 0) {
      const object = intersections[0].object

      scene.attach(object)

      dragControls.transformGroup = true
      draggableObjects.push(group)
    }

    if (group.children.length === 0) {
      dragControls.transformGroup = false
      draggableObjects.push(...items)
    }
  }
  render()
}

export function createControls (camera) {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableRotate = false
  controls.enablePan = true
  controls.enableZoom = true
  controls.zoomSpeed = 1
  controls.panSpeed = 1
  controls.enableDamping = true
  controls.dampingFactor = 0.0075
  controls.keys = ['KeyA', 'KeyS', 'KeyD']
}

/////// ANIMATE

export function animate () {
  const time = Date.now() * 0.0005

  for (let i = 1, l = objects.length; i < l; i++) {
    objects[i][0].position.y += Math.sin(i / 20 + time) * 0.02
    objects[i][0].position.x += Math.sin(i / 30 + time) * 0.02
    objects[i][0].position.z += Math.sin(i / 35 + time) * 0.02
  }

  setTimeout(() => {
    test()
  }, 100)

  controls.update()
  stats.update()
  requestAnimationFrame(animate)

  render()
}

function test () {
  camRay.setFromCamera(ray, camera)

  // calculate objects intersecting the picking ray
  const intersects = camRay.intersectObjects(items, true)

  if (intersects.length > 0 && intersects[0].distance < 800) {
    const object = intersects[0].object
    // console.log(intersects[0].distance)
    //console.log(object.name)
    for (let i = 0; i < textCredit.length; i++) {
      if (object.name != textCredit[i].name) {
        textCredit[i].isMesh = false
      } else {
        // credit = textCredit[i].name
        textCredit[i].isMesh = true
      }
    }
  } else {
    for (let i = 0; i < textCredit.length; i++) {
      textCredit[i].isMesh = false
    }
  }
}

/////// RENDER
export function render () {
  let deltaTime = clock.getDelta()

  controls.update(deltaTime)

  if (params.enable) {
    composer.render()
  } else {
    renderer.render(scene)
  }
}
