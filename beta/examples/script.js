import * as THREE from 'three'

import Stats from 'three/addons/libs/stats.module.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

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
let textCredit = []

let reverse = false

const mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster()

getData()

setTimeout(() => {
  init()
  animate()
}, 500)

export function getData () {
  data = new GetData()
  dataArr = data.GetDataArray()
}

export function init () {
  const aspect = window.innerWidth / window.innerHeight

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(60, aspect, 1, 1400)


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

  // fog
  scene.background  = new THREE.Color(
    fogParams.fogHorizonColor
  )
   scene.fog = new THREE.FogExp2(
    fogParams.fogHorizonColor,
    fogParams.fogDensity
  )



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
  dragControls = new DragControls([...objects], camera, renderer.domElement)
  dragControls.addEventListener('drag', render)
  createControls(camera)

  // launch functions
  loadTitle(scene, render, camera)
  animate()
  loadData(scene, render, camera, dataArr)
}

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

      const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        wireframe: false
      })

      const mesh = new THREE.Mesh(geometry, material)

      mesh.position.x = (Math.random() - 0.5) * window.innerWidth * 0.8
      mesh.position.y = (Math.random() - 0.5) * window.innerHeight * 0.8
      mesh.position.z = 100 + (Math.random() - 0.5) * 1000

      if (texture.image.width > 2000) {
        mesh.scale.x =
          mesh.scale.y =
          
            0.055
      } else if (600 < texture.image.width < 1500) {
        mesh.scale.x =
          mesh.scale.y =
          
            0.065 
      } else {
        mesh.scale.x =
          mesh.scale.y =
         
            1
      }
      scene.add(mesh)

      /////// ADD CREDITS
      const font = new FontLoader()

      font.load('fonts/Grotesk/Grotesk03_Bold.json', function (font) {
        const credits =
          dataArr[i][2] + ', ' + dataArr[i][1] + ' (' + dataArr[i][3] + ') '
        const geometry = new TextGeometry(credits, {
          font: font,
          size: 48,
          height: 0,
          curveSegments: 12,
          bevelEnabled: false,
          bevelThickness: 0,
          bevelSize: 0,
          bevelOffset: 0,
          bevelSegments: 0
        })

        const material = new THREE.MeshBasicMaterial({ color: 0xFF0000 })
        const fontMesh = new THREE.Mesh(geometry, material)
        fontMesh.position.set(
          -texture.image.width / 2,
          -texture.image.height / 2 - 75,
          0
        )
        //fontMesh.isMesh = true
        //fontMesh.visible = true;
        // fontMesh.isObject3D = true
        fontMesh.name='data['+i+']'
        mesh.add(fontMesh)
        
      

        objects.push(mesh)
        textCredit.push(fontMesh)

      })
    })
  }
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
  
}

export function createControls (camera) {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableRotate = false
  controls.enablePan = true
  controls.enableZoom = true
  controls.zoomSpeed = 1
  controls.panSpeed = 1
  controls.maxDistance = 1850
  controls.enableDamping = true
  controls.dampingFactor = 0.0075
  controls.keys = ['KeyA', 'KeyS', 'KeyD']
}

/////// ANIMATE

export function animate () {
  const time = Date.now() * 0.00005
  for (let i = 1, l = objects.length; i < l; i += 2) {
    if (typeof objects[i] !== undefined) {
      objects[i].position.y += Math.sin(i / 20 + time) * 0.02
      objects[i].position.x += Math.sin(i / 30 + time) * 0.02
      objects[i].position.z += Math.sin(i / 35 + time) * 0.0   
      
      if (scene.getObjectByName("data["+i+"]") !== undefined) {        
        if((Math.abs(objects[i].position.z) - Math.abs(camera.position.z)) < -200) {
          textCredit[i].isMesh = false
          console.log("of")
        } else {
          textCredit[i].isMesh = true
          console.log("turningon")
        }
      }
      console.log(objects[i].position.z - camera.position.z)
    }
  }

 // console.log(objects.length, textCredit.length)
  //console.log(textCredit[2])
// console.log(scene.children[2])

  controls.update()
  stats.update()
  requestAnimationFrame(animate)

  render()
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
