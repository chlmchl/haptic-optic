import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

const rayOrigin = new THREE.Vector3(),
  camRaycaster = new THREE.Raycaster()
let fontMesh = new THREE.Mesh()

export function addCredits (dataArr, mesh, camera, texture) {
    // camera.add(cam);
  const font = new FontLoader()
  font.load('fonts/Grotesk/Grotesk03_Bold.json', function (font) {
    const credits = dataArr[2] + ', ' + dataArr[1] + ' (' + dataArr[3] + ') '
    const geometry = new TextGeometry(credits, {
      font: font,
      size: 48,
      height: 5,
      curveSegments: 12,
      bevelEnabled: false,
      bevelThickness: 0,
      bevelSize: 0,
      bevelOffset: 0,
      bevelSegments: 0
    })

    const material = new THREE.MeshBasicMaterial({ color: 0x000 })
    fontMesh = new THREE.Mesh(geometry, material)
    fontMesh.position.set(
      -texture.image.width / 2,
      -texture.image.height / 2 - 75,
      10
    )
    mesh.add(fontMesh)
    updateFrustum(camera, mesh, font)
  })
}

 export function updateFrustum (camera, mesh, fontMesh ) {
    var frustum = new THREE.Frustum()
    var projScreenMatrix = new THREE.Matrix4()
    projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    )

    frustum.setFromProjectionMatrix(camera.projectionMatrix)

    // while (true) {
        if (frustum.containsPoint(mesh.position)) {
          fontMesh.visible = true
        } else {
          fontMesh.visible = false
        }
  
        // requestAnimationFrame(updateFrustum)
    //   }
 }

// export function addCreditsV2 (objects, i, camera, scene, dataArr) {
//   ;(rayOrigin.x = objects[i].position.x),
//     (rayOrigin.y = objects[i].position.y),
//     (rayOrigin.z = objects[i].position.z)
//   //console.log(rayOrigin);
//   const direction = new THREE.Vector3(
//     camera.position.x,
//     camera.position.y,
//     camera.position.z
//   )
//   direction.normalize()
//   //console.log(direction.distanceTo(rayOrigin))

//   if (direction.distanceTo(rayOrigin) < 150) {
//     console.log(dataArr[i])
