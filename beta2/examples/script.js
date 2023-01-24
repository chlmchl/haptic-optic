import * as THREE from 'three'

import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
  CSS3DRenderer,
  CSS3DObject
} from 'three/addons/renderers/CSS3DRenderer.js'

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js'
import { DragControls } from 'three/addons/controls/DragControls.js'

import { GetData } from './data/get_data.js'
import { TextureLoader, Vector4 } from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { loadTitle } from './title.js'
import { onWindowResize } from './utils.js'
import { addCredits } from './credits.js'

let container, stats
let camera, scene, titleScene, zCam
let renderer, renderer2, composer, renderPass, bloomPass
let controls, dragControls
let mesh, group
let enableSelection = true

let worldWidth = 256,
  worldDepth = 256
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
  fogNoiseFreq: 0.00012,
  fogNoiseImpact: 0.3
}
let data
let dataArr
let objects = []
let item = []

let reverse = false

const mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster()
const rayOrigin = new THREE.Vector3(),
  camRaycaster = new THREE.Raycaster()

//const frustumSize = 100;
//document.addEventListener( 'mousemove', onDocumentMouseMove );

getData()

setTimeout(() => {
  init()
  animate()
  //createGUI();
  //animate();
}, 500)

export function getData () {
  data = new GetData()
  //console.log(data)
  dataArr = data.GetDataArray()
}

export function init () {
  const aspect = window.innerWidth / window.innerHeight

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(60, aspect, 1, 1500)
  camera.position.z = 200
  scene.add(camera)

  // stats
  stats = new Stats()
  document.body.appendChild(stats.dom)

  //console.log(dataArr)
  group = new THREE.Group()
  scene.add(group)

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  document.querySelector('#webgl').appendChild(renderer.domElement)

  // CSS Renderer
  renderer2 = new CSS3DRenderer()
  renderer2.setSize(window.innerWidth, window.innerHeight)
  //   renderer2.setPixelRatio(window.devicePixelRatio)
  renderer2.domElement.style.position = 'fixed'

  renderer2.domElement.style.top = 0
  document.querySelector('#css').appendChild(renderer2.domElement)

  // drag controls
  dragControls = new DragControls([...objects], camera, renderer2.domElement)
  dragControls.addEventListener('drag', render)
  //dragControls.addEventListener( 'hoveron', render );

  createControls(camera)

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
  //bloomPass.exposure = params.exposure;
  composer.addPass(bloomPass)

  if (typeof TESTING !== 'undefined') {
    for (let i = 0; i < 45; i++) {
      render()
    }
  }

  // event listeners

  window.addEventListener('resize', onWindowResize(camera, renderer2, composer))

  let portrait = window.matchMedia('(orientation: portrait)')

  portrait.addEventListener('change', function (e) {
    onWindowResize(camera, renderer2, composer)
  })

  //screen.orientation.addEventListener("change", onWindowResize(camera, renderer, composer));
  document.addEventListener('click', onClick)

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  //createControls( camera );

  loadTitle(scene, render, camera)

  animate()
  //updateFrustum(camera)

  loadData(scene, render, camera, dataArr)
}

export function animate () {

  const time = Date.now() * 0.00005
  for (let i = 1, l = objects.length; i < l; i++) {
    if (typeof objects[i] === 'object') {
      objects[i].position.y += Math.sin(i / 20 + time) * 0.02
      objects[i].position.x += Math.sin(i / 30 + time) * 0.02
      objects[i].position.z += Math.sin(i / 35 + time) * 0.02
    }
  }

  scene.updateMatrixWorld()
  renderer.render(scene, camera)
  renderer2.render(scene, camera)
  // zCam = camera.position.z;
  // console.log(zCam)
  
  controls.update()
  stats.update()
  requestAnimationFrame(animate)

  //getRaycast();

  //console.log(camera.position.z)
  render()
}

export function loadData (scene, render, camera, dataArr) {
  for (let i = 1; i < dataArr.length; i++) {
    let elementObj = makeElementObject('div', dataArr, i)
    // let img = makeElementObject( 'img', 100, 100 )

    elementObj.css3dObject.element.setAttribute('contenteditable', '')
    elementObj.css3dObject.element.draggable = 'true'

    elementObj.position.x = (Math.random() - 0.5) * window.innerWidth * 5
    elementObj.position.y = (Math.random() - 0.5) * window.innerHeight * 5
    elementObj.position.z = -500 + (Math.random() - 0.5) * 5000

    if (Math.abs(camera.position.z - elementObj.position.z > 1500)) {
      elementObj.css3dObject.element.style.opacity = '0.5'
    }

    // if (
    //   Math.abs(camera.position.z - elementObj.position.z < 200) &&
    //   Math.abs(camera.position.x - elementObj.position.x < 200) &&
    //   Math.abs(camera.position.y - elementObj.position.y < 200)
    // ) {
    //   elementObj.css3dObject.element.credits.p.style.display = 'block'
    // } else {
    //   elementObj.css3dObject.element.credits.p.style.display = 'none'
    // }

    // elementObj.css3dObject.element.img.src = dataArr[i][0]
    // elementObj.css3dObject.element.appendChild( img )

    scene.add(elementObj)
    objects.push(elementObj)
  }
}

function makeElementObject (type, dataArr, i) {
  const obj = new THREE.Object3D()
  ///

  const texture = new TextureLoader()
  texture.load(dataArr[i][0], function (texture) {
    const geometry = new THREE.PlaneGeometry(
      texture.image.width,
      texture.image.height,
      30,
      30
    )
    //const texture1 = new THREE.MeshBasicMaterial({ map: texture });
    const uniforms = { texture1: { value: texture } }

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader').textContent,
      wireframe: false
    })

    mesh = new THREE.Mesh(geometry, material)
    
    mesh.position.x = (Math.random() - 0.5) * window.innerWidth * 0.8
      mesh.position.y = (Math.random() - 0.5) * window.innerHeight * 0.8
      mesh.position.z = 100 + (Math.random() - 0.5) * 1000

      if (texture.image.width > 1500) {
        mesh.scale.x =
          mesh.scale.y =
          mesh.scale.z =
            0.035 + Math.random() * 0.005
      } else if (600 < texture.image.width < 1500) {
        mesh.scale.x =
          mesh.scale.y =
          mesh.scale.z =
            0.065 + Math.random() * 0.05
      } else {
        mesh.scale.x =
          mesh.scale.y =
          mesh.scale.z =
            0.085 + Math.random() * 0.05
      }
      scene.add(mesh)
      item.push(mesh)
  })

  //////

  // const image = document.createElement('img')
  // image.src = dataArr[i][0]

  // element.appendChild(image)


  // if (image.style.width > 1500) {
  //   image.style.width = '700px'
  // } else if (600 < image.style.width < 1500) {
  //   image.style.width = '600px'
  // } else {
  //   image.style.width = '800px'
  // }

  // element.style.width = image.style.width + 'px'
  // element.style.height = image.style.height + 'px'
  // element.style.background = color.getStyle();

  const credits = document.createElement('div')
  const author = document.createElement('p')
  const title = document.createElement('p')
  const date = document.createElement('p')
  author.textContent = dataArr[i][2]
  title.textContent = dataArr[i][1]
  date.textContent = dataArr[i][3]

  credits.appendChild(author, title, date)
  element.appendChild(credits)

  var css3dObject = new CSS3DObject(element)
  obj.css3dObject = css3dObject
  obj.add(css3dObject)

  // // make an invisible plane for the DOM element to chop
  // // clip a WebGL geometry with it.
  // var material = new THREE.MeshPhongMaterial({
  //   opacity: 0.15,
  //   color: new THREE.Color(/*color*/ 0xff0000),
  //   blending: THREE.NoBlending,
  //   side: THREE.DoubleSide
  // })
  // var geometry = new THREE.BoxGeometry(
  //   element.style.width,
  //   element.style.height,
  //   1
  // )
  // var mesh = new THREE.Mesh(geometry, material)
  // mesh.castShadow = true
  // mesh.receiveShadow = true
  // obj.lightShadowMesh = mesh
  // obj.add(mesh)

  return obj
}

export function onKeyDown (event) {
  enableSelection = event.keyCode === 16 ? true : false
}

export function onKeyUp () {
  enableSelection = false
}

export function onClick (event) {
  //console.log('click')
  event.preventDefault()

  if (enableSelection === true) {
    const draggableObjects = dragControls.getObjects()
    draggableObjects.length = 0

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(mouse, camera)

    const intersections = raycaster.intersectObjects(objects, true)

    if (intersections.length > 0) {
      const object = intersections[0].object

      scene.attach(object)

      dragControls.transformGroup = true
      draggableObjects.push(group)
    }

    if (group.children.length === 0) {
      dragControls.transformGroup = false
      draggableObjects.push(...objects)
    }
  }

  render()
}

export function createControls (camera) {
  controls = new OrbitControls(camera, renderer2.domElement)
  controls.enableRotate = false
  controls.enablePan = true
  controls.enableZoom = true
  controls.zoomSpeed = 1
  controls.panSpeed = 1.5
  controls.maxDistance = 1850
  controls.enableDamping = true
  controls.dampingFactor = 0.0075
  controls.keys = ['KeyA', 'KeyS', 'KeyD']
}

export function render () {
  let deltaTime = clock.getDelta()

  controls.update(deltaTime)

  if (params.enable) {
    composer.render()
  } else {
    renderer.render(scene)
    renderer2.render(scene)
  }
}
