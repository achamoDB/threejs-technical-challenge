
// main container //
var container = document.querySelector("#container");

// stats.js singleton //
var stats;

// global variables //
var scene, renderer, camera, textMesh;

// general configuration //

const worldWidth = 1024, worldDepth = 1024;

// camera speed //
const speed = 1000;

// text speed //
const textSpeed = 2000;

// text initial position //
const textInitialPosition = -5500;


// init scene //
var init = function() {

	// Perspective camera //
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );

	// scene //
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x404040 );

	// generate vertices heights using Perlin Noise implementation //
	var data = generateHeight( worldWidth, worldDepth );

	var geometry = new THREE.PlaneBufferGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
	geometry.rotateX( - Math.PI / 2 );

	// assign plane vertices heights //
	var vertices = geometry.attributes.position.array;
	for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
		vertices[ j + 1 ] = data[ i ] * 5;
	}

	// basic texture //
	var texture = new THREE.TextureLoader().load('textures/grass_texture233_1024.jpg')
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(32, 32);

	// terrain mesh //
	var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
	scene.add( mesh );

	// camera position //
	var maxHeight = data.reduce(function(m, v) { return Math.max(m, v) }, 0) * 5;
	camera.position.z += (worldDepth/2*10)*0.8;
	camera.position.y = maxHeight * 1.5;
	camera.rotation.x -= Math.PI/8;

	// renderer //
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.innerHTML = "";

	container.appendChild( renderer.domElement );

	// stats //
	stats = new Stats();
	container.appendChild( stats.dom );

	window.addEventListener( 'resize', onWindowResize, false );

}

// resize //
var onWindowResize = function() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

// Heights generation using Perlin Noise (js/ImprovedNoise.js) //
var generateHeight = function( width, height ) {

	var size = width * height, data = new Uint8Array( size );
	var perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;

	for ( var j = 0; j < 4; j ++ ) {

		for ( var i = 0; i < size; i ++ ) {

			var x = i % width, y = ~~ ( i / width );
			data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

		}

		quality *= 5;

	}

	return data;

}

// create text object and add to scene //
var addText = function() {

	// text initialization resources //

	var fontloader = new THREE.FontLoader();
	fontloader.load('fonts/droid_sans_bold.typeface.json', function(f) {
		font = f;
	})

	// text function //

	return function() {
		var textGeo = new THREE.TextGeometry( "The End", { font: font, size: 200 });
		textMesh = new THREE.Mesh(textGeo, new THREE.MeshBasicMaterial( { color: 0xffffff } ))

		var textHeight = camera.position.y/1.5*1.2;

		// position to rotate text //
		textMesh.position.set(0, textHeight, textInitialPosition);
		textMesh.scale.set(2, 2, 2);
		textMesh.lookAt(camera.position);

		// initial position //
		textMesh.position.set(-1000, textHeight, 0);

		scene.add(textMesh);
	}

}();

// animation loop //
var animate = function() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

// render scene //
var render = function() {

	// render initialization resources //

	var clock = new THREE.Clock();

	var moveForward = 0;
	var moveCount = 5; // 5 clicks to end //

	var moveTextTo = 0;

	container.addEventListener("click", function() {
		if (!moveForward && moveCount>0) {
			moveForward = 1; // 1 second movement //
			moveCount--;
		}
	});

	// render function //

	return function() {

		var delta = clock.getDelta();

		// camera movement //
		if (moveForward) {
			var thismove = Math.min(delta, moveForward);
			camera.position.z -= thismove * speed;
			moveForward = Math.max(moveForward - delta, 0);
			if (!moveForward && !moveCount) { // last move detected //
				addText();
				moveTextTo = textInitialPosition;
			}
		}

		// text movement //
		if (moveTextTo) {
			textMesh.position.z -= delta * textSpeed;
			if (textMesh.position.z <= moveTextTo) moveTextTo = 0;
		}

		renderer.render( scene, camera );		
	}

}();

// main //
var main = function() {

	init();

	animate();	

}

// let's go!! //
main();
