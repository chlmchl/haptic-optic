import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const rayOrigin = new THREE.Vector3(), camRaycaster = new THREE.Raycaster();

export function addCredits( dataArr, mesh, camera, texture ) {

    const font = new FontLoader();
    font.load( 'fonts/Grotesk/Grotesk03_Bold.json', function (font) {
        const credits = dataArr[2] + ", " + dataArr[1] + " (" + dataArr[3] + ") ";
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
        } );

        const material = new THREE.MeshBasicMaterial( { color: 0x000 } );
        const fontMesh = new THREE.Mesh( geometry, material );
        fontMesh.position.set(-texture.image.width/2, (-texture.image.height/2)-75, 10)
        mesh.add(fontMesh);
        fontMesh.visible = true;        
    } );
}

export function addCreditsV2(objects, i, camera, scene, dataArr) {
    
    rayOrigin.x = objects[i].position.x, rayOrigin.y = objects[i].position.y, rayOrigin.z = objects[i].position.z;
	//console.log(rayOrigin);
	const direction = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
	direction.normalize();
    //console.log(direction.distanceTo(rayOrigin))

    if(direction.distanceTo(rayOrigin) < 150) {
        console.log(dataArr[i])

        const font = new FontLoader();
        //console.log(objects);
        for(let i=0; i < dataArr.length; i++) {
            font.load( 'fonts/Grotesk/Grotesk03_Bold.json', function (font) {
             
                const credits = dataArr[i][2] + ", " + dataArr[i][1] + " (" + dataArr[i][3] + ") ";
                const geometry = new TextGeometry(credits, {
                    font: font,
                    size: 14,
                    height: 5,
                    curveSegments: 12,
                    bevelEnabled: false,
                    bevelThickness: 0,
                    bevelSize: 0,
                    bevelOffset: 0,
                    bevelSegments: 0
                } );
                const material = new THREE.MeshBasicMaterial( { color: 0x000 } );
                const fontMesh = new THREE.Mesh( geometry, material );
                fontMesh.position.set(-texture.image.width/2, (-texture.image.height/2)-75, 10)
                scene.add(fontMesh);
                fontMesh.visible = true;

            // geometry.computeBoundingBox();
            // const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
            // geometry.translate( xMid, 0, -200 );
            // camera.add( fontMesh );
            // fontMesh.renderOrder = 999;
            // fontMesh.material.depthTest = false;
            // fontMesh.material.depthWrite = false;

            // var frustum = new THREE.Frustum();
            // var projScreenMatrix = new THREE.Matrix4();
            // projScreenMatrix.multiplyMatrices( camerab.projectionMatrix, camerab.matrixWorldInverse );
                    
            // frustum.setFromProjectionMatrix( camerab.projectionMatrix );
                
            // if(frustum.containsPoint( mesh.position )){
                
            //     fontMesh.visible = true;
                
            // }else {
            //     fontMesh.visible = false;
            // };
            
            
            } );
        }
    }
 }
