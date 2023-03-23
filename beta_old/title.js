///////////////////////////
import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

function loadTitle (scene, render, camera) {
  const loader = new FontLoader()

  loader.load('fonts/Grotesk/Grotesk03_Bold.json', function (font) {
    const message = [
      [')) HAPTIC )( OPTIC ((', 20],
      ['Collection touching my soul', 13]
    ]
    //const message = [["Times of distance", 16], ["2020/2022", 16]];

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

      //material.transparent = true;
      const text = new THREE.Mesh(geometry, material)
      material.blending = THREE.CustomBlending
      material.blendEquation = THREE.AddEquation //default
      material.blendSrc = THREE.OneMinusDstColorFactor //default
      //	material.blendDst = THREE.OneMinusSrcAlphaFactor; //default

      material.transparent = true
      geometry.computeBoundingBox()
      const xMid =
        -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
      geometry.translate(xMid, -30 * i, -200)
      camera.add(text)
      text.renderOrder = 999
      text.material.depthTest = false
      text.material.depthWrite = false
      text.visible = true
      //objects.push ( text );

      // text.position.x = centerOffset;
      //text.position.y = hover;
      // text.position.z = 0;

      // text.rotation.x = 0;
      // text.rotation.y = Math.PI * 2;
    }
  }) //end load function
}

export { loadTitle }
