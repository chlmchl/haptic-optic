import * as THREE from 'three';


			import Stats from 'three/addons/libs/stats.module.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

            import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
			import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
			import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
			
			import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
            import { DragControls } from 'three/addons/controls/DragControls.js';
            
            import { GetData } from './data/get_data.js';
            import { TextureLoader, Vector4 } from 'three';
			import { FontLoader } from 'three/addons/loaders/FontLoader.js';
			import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
			import { loadTitle } from './title.js';
			import { onWindowResize } from './utils.js';
			import { addCredits, addCreditsV2 } from './credits.js';
			

            let container, stats;
			let camera, scene, titleScene, zCam;
            let renderer, composer, renderPass, bloomPass;
            let controls, dragControls;
            let mesh, group;
            let enableSelection = true;

            let worldWidth = 256, worldDepth = 256;
            let clock = new THREE.Clock();

            let afterimagePass;

            const params = {
                enable: true,
				exposure: 0,
				bloomStrength: 0.15,
				bloomThreshold: 0.65,
				bloomRadius: 0
            };
			const fogParams = {
                fogNearColor: 0xffffff,
                fogHorizonColor: 0xffffff,
                fogDensity: 0.00005,
                fogNoiseSpeed: 50,
                fogNoiseFreq: .00012,
                fogNoiseImpact: .3
            }
            let data;
            let dataArr;
            let objects = [] 

			let reverse = false

            const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();
			const rayOrigin = new THREE.Vector3(), camRaycaster = new THREE.Raycaster();

			//const frustumSize = 100;
            //document.addEventListener( 'mousemove', onDocumentMouseMove );
			
            getData();
            
			setTimeout(() => {
                init();
				update();
			    //createGUI();
				//animate();
            }, 500)

            export function getData() {
                data = new GetData()
				//console.log(data)
                dataArr = data.GetDataArray();
            }

			export function init() {
                container = document.createElement( 'div' ); 
				container.classList.add("canvas")
                document.body.appendChild( container );

				const aspect = window.innerWidth / window.innerHeight;

				scene = new THREE.Scene();

				camera = new THREE.PerspectiveCamera( 60, aspect, 1, 1500 );
				camera.position.z = 200
				scene.add( camera );

				// stats
				stats = new Stats();
				document.body.appendChild( stats.dom );

               //console.log(dataArr)
                group = new THREE.Group();
                scene.add( group );
				
				 
				// renderer
				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				
				container.appendChild( renderer.domElement );
                
				// drag controls
                dragControls = new DragControls( [ ... objects ], camera, renderer.domElement );
				dragControls.addEventListener( 'drag', render );
                //dragControls.addEventListener( 'hoveron', render );

				createControls( camera );

				// fog

				scene.background = new THREE.Color(fogParams.fogHorizonColor);
				scene.fog = new THREE.FogExp2(fogParams.fogHorizonColor, fogParams.fogDensity);

				
				// postprocessing

				composer = new EffectComposer( renderer );
				composer.addPass( new RenderPass( scene, camera ) );

				afterimagePass = new AfterimagePass();
				composer.addPass( afterimagePass );

				bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
				bloomPass.threshold = params.bloomThreshold;
				bloomPass.strength = params.bloomStrength;
				bloomPass.radius = params.bloomRadius;
				//bloomPass.exposure = params.exposure;
				composer.addPass( bloomPass )

				if ( typeof TESTING !== 'undefined' ) {
					for ( let i = 0; i < 45; i ++ ) {
						render();
					}
				}

                // event listeners 

				window.addEventListener( 'resize', onWindowResize(camera, renderer, composer) );
				
				let portrait = window.matchMedia("(orientation: portrait)");

				portrait.addEventListener("change", function(e) {
					onWindowResize(camera, renderer, composer)
				})
				
				//screen.orientation.addEventListener("change", onWindowResize(camera, renderer, composer));
                document.addEventListener( 'click', onClick );
                
				window.addEventListener( 'keydown', onKeyDown );
				window.addEventListener( 'keyup', onKeyUp );

				//createControls( camera );

				loadTitle(scene, render, camera);
				
				animate();
				
				loadData(scene, render, camera, dataArr);
			}

			export function animate() {
				const time = Date.now() * 0.00005;
				for ( let i = 1, l = objects.length; i < l; i ++ ) {
					if(typeof objects[i] === "object") {
						objects[i].position.y += Math.sin( i / 20 + time ) * 0.02 
                        objects[i].position.x += Math.sin( i / 30 + time ) * 0.02
						objects[i].position.z += Math.sin( i / 35 + time ) * 0.02
						//renderer.domElement.style.filter = `blur(${Math.sin(i/20 * time) * 20}px)`
						//addCreditsV2(objects, i, camera, scene, dataArr);
						
						//rayOrigin.x = objects[i].position.x, rayOrigin.y = objects[i].position.y, rayOrigin.z = objects[i].position.z;
						//console.log(rayOrigin);
						//const direction = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
						//direction.normalize();
						//camRaycaster.set(rayOrigin, direction);
						// let intersects = []
						// //console.log(direction.distanceTo(rayOrigin))
						// //console.log(objects[i].position.z - camera.position.z)
						// if ( (-10 < objects[i].position.z - camera.position.z) < -70) {
							
						// // 	intersects.push(objects[i]);
						// 	console.log("blop');
						// // 	//scene.attach( object );
						

						// }


					}
                }
				// console.log(zCam)
               	zCam = camera.position.z;

				requestAnimationFrame( animate );
				//getRaycast();
				
				controls.update();
				//console.log(camera.position.z)
                render();
				stats.update();
			}

			export function loadData (scene, render, camera, dataArr) {
				for ( let i = 1; i < dataArr.length; i ++ ) {
                    
                    const texture = new TextureLoader();
					const font = new FontLoader();

					font.load( 'fonts/helvetiker_regular.typeface.json', function (font) {
							const geometry = new TextGeometry(dataArr[i][2], {
								font: font,
								size: 16,
								height: 0,
								curveSegments: 12,
								bevelEnabled: false,
								bevelThickness: 0,
								bevelSize: 0,
								bevelOffset: 0,
								bevelSegments: 0
							} );
							const material = new THREE.MeshBasicMaterial( { color: 0x000 } );
							// const fontMesh = new THREE.Mesh( geometry, material );
					} );

                    texture.load(dataArr[i][0], function (texture) {
                        const geometry = new THREE.PlaneGeometry(texture.image.width, texture.image.height, 30, 30);
						//const texture1 = new THREE.MeshBasicMaterial({ map: texture });
						const uniforms = { texture1: { value: texture }};

						const material = new THREE.ShaderMaterial( { 
							uniforms: uniforms,
							vertexShader: document.getElementById('vertexShader').textContent,
							fragmentShader: document.getElementById('fragmentShader').textContent,
							wireframe: false 
						} );
						
                        const mesh = new THREE.Mesh( geometry, material );
							
						// if(i=1) {
						// 	mesh.position.x = ( Math.random() - 0.5 ) * window.innerWidth * 0.1;
					    // 	mesh.position.y = ( Math.random() - 0.5 ) * window.innerHeight * 0.1;
					    // 	mesh.position.z = 100 + ( Math.random() - 0.5 ) * 10;
						// }
                        mesh.position.x = ( Math.random() - 0.5 ) * window.innerWidth * 0.8;
					    mesh.position.y = ( Math.random() - 0.5 ) * window.innerHeight * 0.8;
					    mesh.position.z = 100 + ( Math.random() - 0.5 ) * 1000;
						
						
                        if(texture.image.width > 1500) {
                            mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.035 + Math.random() * 0.005;
                        } else if(600 < texture.image.width < 1500){
					        mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.065 + Math.random() * 0.05;
                        } else {
							mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.085 + Math.random() * 0.05;
						}
					    scene.add( mesh );
                        objects.push( mesh );
						
						addCredits(dataArr[i], mesh, camera, texture)
                
                    });
                    //texture.matrixAutoUpdate = false;
					
				}
			}

			
            export function onKeyDown( event ) {

				enableSelection = ( event.keyCode === 16 ) ? true : false;

			}

			export function onKeyUp() {

				enableSelection = false;

			}

			export function update() {
				
			}

            export function onClick( event ) {
                //console.log('click')
				event.preventDefault();
				

				if ( enableSelection === true ) {

					const draggableObjects = dragControls.getObjects();
					draggableObjects.length = 0;

					mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
					mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
                    
					raycaster.setFromCamera( mouse, camera );

					const intersections = raycaster.intersectObjects( objects, true );

					if ( intersections.length > 0 ) {
                        
						const object = intersections[ 0 ].object;
						
						scene.attach( object );
						

						dragControls.transformGroup = true;
						draggableObjects.push( group );

					}

				

					if ( group.children.length === 0 ) {

						dragControls.transformGroup = false;
						draggableObjects.push( ...objects );

					}

				}

				render();

			}

			export function createControls( camera ) {

				controls = new OrbitControls( camera, renderer.domElement );
				controls.enableRotate = false;
                controls.enablePan = true;
                controls.enableZoom = true;
				controls.zoomSpeed = 1;
				controls.panSpeed = 1;
                controls.maxDistance = 1850;
                controls.enableDamping = true;
                controls.dampingFactor = 0.0075;
				

				controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];

			}

			export function render() {

                let deltaTime = clock.getDelta();

                controls.update(deltaTime);

				if ( params.enable ) {
					
					composer.render();
				} else {
					renderer.render( scene );
					
				}

			}

			
			// export function getRaycast( ) {
			// 	rayOrigin.x = camera.position.x, rayOrigin.y = camera.position.y, rayOrigin.z = zCam - 400;
			// 	const geometry = new THREE.CircleGeometry( 5, 32 );
			// 	const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
			// 	const circle = new THREE.Mesh( geometry, material );
			// 	scene.add( circle )
			// 	circle.position.x = rayOrigin.x;
			// 	circle.position.y = rayOrigin.y;
			// 	circle.position.z = rayOrigin.z;
			// 	const direction = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
			// 	direction.normalize();

			// 	camRaycaster.set( rayOrigin, direction );
			// 	//console.log(zCam);
			// 	// calculate objects intersecting the picking ray
			// 	const intersects = camRaycaster.intersectObjects( scene.children );
				
			// 	if ( intersects.length > 0 ) {
                    
			// 		const object = intersects[ 0 ].object;

			// 		console.log(object);
			// 		object.material.set("0xFF0000")
			// 		scene.attach( object );

					

			// 	}
				

				
			// }
