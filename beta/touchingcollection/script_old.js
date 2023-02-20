import * as THREE from 'three';


			import Stats from 'three/addons/libs/stats.module.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

            import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
			import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
			import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
			
			import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
            import { DragControls } from 'three/addons/controls/DragControls.js';
            
            import { GetData } from 'data/addons/get_data.js';
            import { TextureLoader } from 'three';
			import { FontLoader } from 'three/addons/loaders/FontLoader.js';
			import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

			

            let container, stats;
			let camera, scene;
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
                fogDensity: 0.001,
                fogNoiseSpeed: 50,
                fogNoiseFreq: .00012,
                fogNoiseImpact: .3
            }
            let data;
            let dataArr;
            let objects = [] 

			let reverse = false

            const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();
			//const frustumSize = 100;
            //document.addEventListener( 'mousemove', onDocumentMouseMove );
			
            getData();
            setTimeout(() => {
                init();
			    //createGUI();
			    animate();
            }, 500)

            function getData() {
                data = new GetData()
				//console.log(data)
                dataArr = data.GetDataArray();
            }

			function init() {
                container = document.createElement( 'div' ); 
                document.body.appendChild( container );

				const aspect = window.innerWidth / window.innerHeight;
				camera = new THREE.PerspectiveCamera( 60, aspect, 1, 1500 );
				camera.position.z = 200

				// world

				scene = new THREE.Scene();
				
                //console.log(dataArr)
                group = new THREE.Group();
                scene.add( group );

				 // renderer

				 renderer = new THREE.WebGLRenderer( { antialias: true } );
				 renderer.setPixelRatio( window.devicePixelRatio );
				 renderer.setSize( window.innerWidth, window.innerHeight );
				 document.body.appendChild( renderer.domElement );
                
				 // Data 

				for ( let i = 1; i < dataArr.length; i ++ ) {
                    
                    const texture = new TextureLoader();
					const font = new FontLoader();

					font.load( 'fonts/helvetiker_regular.typeface.json', function (font) {
							const geometry = new TextGeometry(dataArr[i][2], {
								font: font,
								size: 12,
								height: 0,
								curveSegments: 12,
								bevelEnabled: false,
								bevelThickness: 0,
								bevelSize: 0,
								bevelOffset: 0,
								bevelSegments: 0
							} );
							const material = new THREE.MeshBasicMaterial( { color: 0x000 } );
							const fontMesh = new THREE.Mesh( geometry, material );
					} );

                    texture.load(dataArr[i][0], function (texture) {
                        const geometry = new THREE.PlaneGeometry(texture.image.width, texture.image.height, 30, 30);
            
						const material = new THREE.MeshBasicMaterial( { 
							map: texture
							/*
							vertexShader: document.getElementById('vertexShader').textContent,
							fragmentShader: document.getElementById('fragmentShader').textContent,
						wireframe: false */} );
							
                        const mesh = new THREE.Mesh( geometry, material );
	
                        mesh.position.x = ( Math.random() - 0.5 ) * window.innerWidth * 2;
					    mesh.position.y = ( Math.random() - 0.5 ) * window.innerHeight * 2;
					    mesh.position.z = 100 + ( Math.random() - 0.5 ) * 1000;
						
                        if(texture.image.width > 1500) {
                            mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.045 + Math.random() * 0.02;
                        } else {
					        mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.065 + Math.random() * 0.02;
                        } 
					    scene.add( mesh );
                        objects.push( mesh );

						font.load( 'fonts/helvetiker_regular.typeface.json', function (font) {
							
							const credits = dataArr[i][2] + ", " + dataArr[i][1];
							const geometry = new TextGeometry(credits, {
								font: font,
								size: 36,
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
							fontMesh.visible = false;
						
						} );
                
                    });
                    //texture.matrixAutoUpdate = false;
					
				}

				// fog

				scene.background = new THREE.Color(fogParams.fogHorizonColor);
				scene.fog = new THREE.FogExp2(fogParams.fogHorizonColor, fogParams.fogDensity);

                

				stats = new Stats();
				document.body.appendChild( stats.dom );

                // drag controls
                dragControls = new DragControls( [ ... objects ], camera, renderer.domElement );
				dragControls.addEventListener( 'drag', render );
                //dragControls.addEventListener( 'hoveron', render );
                
				
				// postprocessing

				composer = new EffectComposer( renderer );
				composer.addPass( new RenderPass( scene, camera ) );

				afterimagePass = new AfterimagePass();
				composer.addPass( afterimagePass );

				bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
				bloomPass.threshold = params.bloomThreshold;
				bloomPass.strength = params.bloomStrength;
				bloomPass.radius = params.bloomRadius;
				bloomPass.exposure = params.exposure;
				composer.addPass( bloomPass )

				if ( typeof TESTING !== 'undefined' ) {
					for ( let i = 0; i < 45; i ++ ) {
						render();
					}
				}

                // event listeners 

				window.addEventListener( 'resize', onWindowResize );
                document.addEventListener( 'click', onClick );
                
				window.addEventListener( 'keydown', onKeyDown );
				window.addEventListener( 'keyup', onKeyUp );

				createControls( camera );

			}

			

            function onKeyDown( event ) {

				enableSelection = ( event.keyCode === 16 ) ? true : false;

			}

			function onKeyUp() {

				enableSelection = false;

			}

            function onClick( event ) {
                //console.log('click')
				event.preventDefault();
				TitleFade();

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

						// if {

						// 	//object.material.emissive.set( 0xaaaaaa );
						// 	group.attach( object );

						// }

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

			function createGUI() {

			const gui = new GUI( { name: 'Damp setting' } );
			gui.add( afterimagePass.uniforms[ 'damp' ], 'value', 0, 2 ).step( 0.00001 );
			gui.add( params, 'enable' );

			}

			function createControls( camera ) {

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


			function onWindowResize() {

				const aspect = window.innerWidth / window.innerHeight;

				camera.aspect = aspect;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );
				composer.setSize( window.innerWidth, window.innerHeight );
				//controls.handleResize();
			}

			function animate() {
				const time = Date.now() * 0.00005;
				for ( let i = 1, l = scene.children.length; i < l; i ++ ) {
					if(typeof scene.children[i] === "object") {
						scene.children[i].position.y += Math.sin( i / 20 + time ) * 0.02 
                        scene.children[i].position.x += Math.sin( i / 30 + time ) * 0.02
						scene.children[i].position.z += Math.sin( i / 35 + time ) * 0.02
						//renderer.domElement.style.filter = `blur(${Math.sin(i/20 * time) * 20}px)`
						
					}
                }

               

				requestAnimationFrame( animate );
                        
				controls.update();
                render();
				stats.update();
			}

			function render() {

                let deltaTime = clock.getDelta();

                controls.update(deltaTime);

				if ( params.enable ) {
					
					composer.render();
				} else {
					renderer.render( scene, camera );
				}

			}

