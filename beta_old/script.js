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

let stats
let camera, scene

let renderer, composer, bloomPass
let controls, dragControls
let group, groupCredit
let enableSelection = true

let prevCameraX = 0
let prevCameraY = 0
let prevCameraZ = 0
let deltaX = 0
let deltaY = 0
let deltaZ = 0
let count = 0
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
let dataArr
let objects = []
let items = []
let textCredit = []
let title = false

// variables
let title1,
  title2,
  title3,
  credit1,
  d1,
  d2,
  zSpeed,
  pSpeed,
  initialWidth,
  initialDepth,
  onMobile

const mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster()

const camRay = new THREE.Raycaster()
const ray = new THREE.Vector3()
getDevice()
getData()

async function getData () {
  dataArr = await GetData()
  //console.log(dataArr)
  setTimeout(() => {
    if(dataArr.length > 0){
      init()
    }
  }, 1000)
}

function getDevice () {
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    // true for mobile device
    console.log('onMobile')
    onMobile = true
    title1 = 9
    title2 = 7
    title3 = 6
    credit1 = 32
    d1 = 900
    d2 = 200
    zSpeed = 0.1
    pSpeed = 0.1
    initialWidth = 8
    initialDepth = 4000
  } else {
    // false for not mobile device
    onMobile = false
    title1 = 16
    title2 = 14
    title3 = 12
    credit1 = 32
    d1 = 1000
    d2 = 200
    zSpeed = 0.2
    pSpeed = 1
    initialWidth = 4
    initialDepth = 3000
  }
}

async function init () {
  const aspect = window.innerWidth / window.innerHeight

  camera = new THREE.PerspectiveCamera(60, aspect, 1, 4000)
  camera.position.z = 4000

  scene = new THREE.Scene()
  scene.add(camera)

  ray.x = 0
  ray.y = 0
  ray.z = 0

  // stats
  stats = new Stats()
  //document.body.appendChild(stats.dom)

  // console.log(dataArr)
  group = new THREE.Group()
  scene.add(group)

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.querySelector('#webgl').appendChild(renderer.domElement)

  // fog
  scene.background = new THREE.Color(0xffffff)
  // scene.background = new THREE.Color(fogParams.fogHorizonColor)
  // scene.fog = new THREE.FogExp2(fogParams.fogHorizonColor, fogParams.fogDensity)

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
    [')) HAPTIC )( OPTIC ((', title1],
    ['Touching Collection', title2],
    ['2020/2022', title3]
  ]

  setTimeout(() => {
    let message = message1
    loadTitle(camera, message)
  }, 10000)

  // launch functions

  addInstancedMesh(scene, dataArr)
}

function loadTitle (camera, message) {
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
      const yMid =
        0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y)
      geometry.translate(xMid, -30 * i + 30, -200)

      camera.add(text)

      text.renderOrder = 999
      text.material.depthTest = false
      text.material.depthWrite = false
      text.isMesh = true
      setTimeout(() => {
        text.isMesh = false
        title = false
      }, 7000)
    }
  }) //end load function
}

// load and display data

function addInstancedMesh (scene, dataArr) {
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
        wireframe: false,
        transparent: true,
        opacity: 1
      })
      geometry.computeBoundingBox()
      geometry.needsUpdate = true
      const mesh = new THREE.Mesh(geometry, material)

      mesh.position.x = (Math.random() - 0.5) * window.innerWidth * initialWidth
      mesh.position.y =
        (Math.random() - 0.5) * window.innerHeight * initialWidth
      mesh.position.z = 1000 + (Math.random() - 0.5) * initialDepth
      mesh.scale.x = mesh.scale.y = 0.5
      // mesh.renderOrder = 1

      scene.add(mesh)

      /////// ADD CREDITS
      const font = new FontLoader()

      font.load('fonts/Grotesk/Grotesk03_Bold.json', function (font) {
        let credits
        /* break dataArr[i][3] into a new line every 3 words */

        // dataArr[i][1] = dataArr[i][1].split(' ')
        // let line = ''
        // for (let j = 0; j < dataArr[i][1].length; j++) {
        //   line += dataArr[i][1][j] + ' '

        //   if (j % 7 === 1 && dataArr[i][1].length > 10) {
        //     line += '\n'
        //   }
        // }

        // dataArr[i][4] = dataArr[i][4].split(' ')
        //   let line2 = ''
        //   for (let j = 0; j < dataArr[i][4].length; j++) {
        //     line2 += dataArr[i][4][j] + ' '

        //     if (j % 7 === 1 && dataArr[i][4].length > 10) {
        //       line2 += '\n'
        //     }
        //   }
        //console.log(dataArr[i][2])
        if (dataArr[i][4] === 'undefined') {
          dataArr[i][4] = ''
        }

        if (dataArr[i][2].length < 2) {
          credits =
            dataArr[i][1] + ' \n' + dataArr[i][3] + ' \n' + dataArr[i][4]
          console.log('wo')
        } else if (dataArr[i][2].length <= 2 && dataArr[i][1].length <= 2) {
          credits = dataArr[i][3] + dataArr[i][4]
          console.log('w')
        } else {
          credits =
            dataArr[i][2] +
            '\n' +
            dataArr[i][1] +
            ' \n' +
            dataArr[i][3] +
            ' \n' +
            dataArr[i][4]
          console.log('dezdazé')
        }
        console.log(credits)

        //console.log(line)

        const geometry = new TextGeometry(credits, {
          font: font,
          size: credit1,
          height: 1,
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
        geometry.computeBoundingBox()

        const bgGeometry = new THREE.PlaneGeometry(
          geometry.boundingBox.max.x - geometry.boundingBox.min.x + 100,
          geometry.boundingBox.max.y - geometry.boundingBox.min.y + 100,
          30,
          30
        )
        const bgMaterial = new THREE.MeshBasicMaterial({ color: 0xd6d6d6 })
        const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial)
        bgGeometry.computeBoundingBox()
        //bgMaterial.transparent =true

        const xMid =
          -0.5 *
          (bgMesh.geometry.boundingBox.max.x -
            bgMesh.geometry.boundingBox.min.x)
        const yMid =
          0.5 *
          (bgMesh.geometry.boundingBox.max.y -
            bgMesh.geometry.boundingBox.min.y)
        // geometry.translate(xMid, 0, -500)

        bgMesh.position.set(
          texture.image.width - texture.image.width / 2 - 50,
          -texture.image.height / 2 - 50,
          50
        )

        fontMesh.geometry.translate(xMid + 40, yMid - 60, 1)

        fontMesh.isMesh = false
        bgMesh.isMesh = false
        bgMesh.add(fontMesh)
        mesh.name = bgMesh.name = 'data[' + i + ']'

        fontMesh.layers.enable()
        bgMesh.layers.enable(1)
        mesh.layers.enable(1)
        // addCredits.push(fontMesh)
        textCredit.push(bgMesh)
        //textCredit.push(fontMesh)

        // const xMid =
        //   -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
        // geometry.translate(xMid, 0, -500)

        // fontMesh.material.depthTest = false
        // fontMesh.material.depthWrite = false

        mesh.add(bgMesh)
        objects.push([mesh, bgMesh])
        items.push(mesh)
        //items.push(bgMesh)
        items.push(fontMesh)
      })
    })
  }

  animate()
}

function onKeyDown (event) {
  enableSelection = event.keyCode === 16 ? true : false
}

function onKeyUp () {
  enableSelection = false
}

function onClick (event) {
  event.preventDefault()
  if (title === false) {
    if (enableSelection === true) {
      const draggableObjects = dragControls.getObjects()
      draggableObjects.length = 0

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      raycaster.layers.set(1)

      const intersections = raycaster.intersectObjects(items, true)
      const intersectionsCredits = raycaster.intersectObjects(textCredit, true)
      camRay.setFromCamera(ray, camera)
      camRay.layers.set(1)

      // calculate objects intersecting the picking ray
      const intersects = camRay.intersectObjects(items, true)

      if (intersections.length > 0) {
        const object = intersections[0].object
        object.parent.attach(object)

        dragControls.transformGroup = true
        draggableObjects.push(group)

        if (intersects.length > 0 && intersects[0].distance < 3000) {
          if (object.children[0].children[0] !== undefined) {
            object.children[0].isMesh = !object.children[0].isMesh
            object.children[0].children[0].isMesh =!object.children[0].children[0].isMesh
          } else {
            object.isMesh = !object.isMesh
            object.children[0].isMesh = !object.children[0].isMesh
          }
        } 
        // console.log(count)
      }

      if (intersectionsCredits.length > 0) {
        const object = intersectionsCredits[0].object
        // object.children[0].isMesh = !object.children[0].isMesh
        // object.children[0].children[0].isMesh = !object.children[0].children[0].isMesh
        object.parent.attach(object)

        dragControls.transformGroup = true
        draggableObjects.push(groupCredit)
      }

      if (group.children.length === 0) {
        dragControls.transformGroup = false
        draggableObjects.push(...items)
      }
    }
  }
}

function createControls (camera) {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableRotate = false
  controls.enablePan = true
  controls.enableZoom = true
  controls.zoomSpeed = zSpeed
  controls.minDistance = 0
  controls.panSpeed = pSpeed
  controls.enableDamping = true
  controls.dampingFactor = 0.0075
}

/////// ANIMATE

function animate () {
  const time = performance.now() * 0.0005

  for (let i = 1, l = objects.length; i < l; i++) {
    let object = objects[i][0]
    object.position.y += Math.sin((i + time) / 20) * 0.06
    object.position.x += Math.sin((i + time) / 30) * 0.06
    object.position.z += Math.sin((i + time) / 35) * 0.06
  }
  checkCameraPos()
  // if (title === false && onMobile === false) {
  //   test()
  // }

  controls.update()
  stats.update()

  render()
  requestAnimationFrame(animate)
}

function checkCameraPos () {
  deltaX += camera.position.x - prevCameraX
  deltaY += camera.position.y - prevCameraY
  deltaZ += camera.position.z - prevCameraZ

  prevCameraX = camera.position.x
  prevCameraY = camera.position.y
  prevCameraZ = camera.position.z

  if (Math.abs(deltaX) > window.innerWidth) {
    addObjects()
    deltaX = 0
  }
  if (Math.abs(deltaY) > window.innerHeight * 1.5) {
    addObjects()
    deltaY = 0
  }
  if (Math.abs(deltaZ) > 5000) {
    addObjects()
    deltaZ = 0
  }
}

function test () {
  camRay.setFromCamera(ray, camera)
  camRay.layers.set(1)
  // calculate objects intersecting the picking ray
  const intersects = camRay.intersectObjects(items, true)

  if (
    intersects.length > 0 &&
    d2 < intersects[0].distance &&
    intersects[0].distance < d1
  ) {
    const object = intersects[0].object
    for (let i = 0; i < textCredit.length; i++) {
      if (object.name != textCredit[i].name) {
        textCredit[i].isMesh = false
        textCredit[i].children[0].isMesh = false
      } else {
        // credit = textCredit[i].name
        textCredit[i].isMesh = true
        textCredit[i].children[0].isMesh = true
      }
    }
  } else {
    for (let i = 0; i < textCredit.length; i++) {
      textCredit[i].isMesh = false
      textCredit[i].children[0].isMesh = false
    }
  }
}

const frustum = new THREE.Frustum()
const cameraViewProjectionMatrix = new THREE.Matrix4()

// clone the objects and add them to the scene
function addObjects () {
  for (var i = 0; i < 15; i++) {
    const randomObj = Math.floor(Math.random() * objects.length)
    var clonedObject = objects[randomObj][0].clone()
    scene.add(clonedObject)

    clonedObject.position.set(
      camera.position.x + (Math.random() - 0.5) * window.innerWidth * 6,
      camera.position.y + (Math.random() - 0.5) * window.innerHeight * 2,
      camera.position.z + (Math.random() - 0.5) * 10000
    )
    clonedObject.children[0].isMesh = false
    clonedObject.children[0].children[0].isMesh = false
    items.push(clonedObject)
    clonedObject.name = 'clonedData['
    const index = items.indexOf(clonedObject)
    objects.push([clonedObject, clonedObject.children[0]])
    //set the name of the cloned object and its text to clonedData[index]
    clonedObject.name = 'clonedData[' + index + ']'
    clonedObject.children[0].name = 'clonedData[' + index + ']'
    textCredit.push(clonedObject.children[0])
  }
}

function updateFrustumCulling () {
  cameraViewProjectionMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  )
  frustum.setFromProjectionMatrix(cameraViewProjectionMatrix)

  for (let i = 0; i < scene.children.length; i++) {
    const mesh = scene.children[i]
    if (mesh.type === 'Mesh') {
      mesh.visible = frustum.intersectsObject(mesh)
    }
  }
}

/////// RENDER
function render () {
  updateFrustumCulling()
  // console.log(
  //   scene.children.length + ' : ' + scene.children.filter(c => c.visible).length
  // )
  let deltaTime = clock.getDelta()

  controls.update(deltaTime)

  if (params.enable) {
    composer.render()
  } else {
    renderer.render(scene)
  }
}
