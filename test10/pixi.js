console.clear();

var stage = new PIXI.Container();
var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
renderer.backgroundColor = 0xFFFFFF;

document.body.appendChild(renderer.view);

/*////////////////////////////////////////*/

var container = new PIXI.Container();
container.position.x = (renderer.width/2);
container.position.y = renderer.height/2;
stage.addChild(container);


/*////////////////////////////////////////*/

var originalVertices = [],
    mesh;


var texture = new PIXI.Texture.fromImage('../img/img1.jpg');

texture.on('update',function(){
  
  mesh = new PIXI.mesh.Plane( this, 20, 20 );
  mesh.width = this.width; //renderer.width * 0.35;
  mesh.height = this.height;//renderer.width * 0.5;
  container.addChild(mesh);//, 0);
  mesh.pivot.x = mesh.width * 0.4;
  mesh.pivot.y = mesh.height * 0.3;
  
  originalVertices = mesh.vertices.slice(0);
  
  animate();
});

/*////////////////////////////////////////*/

var count = 0;


function animate() {
  requestAnimationFrame(animate);

  count += 0.15;
  
  if ( mesh && mesh.vertices ) { 
    
    for (let i = 0; i < mesh.vertices.length; i++) {
      mesh.vertices[i] = originalVertices[i] + (3 * Math.cos(count + i * 0.15));
    }
  }

  renderer.render(stage);
}