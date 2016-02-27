window.scope = window.scope || {};
(function(scope){
  var container;
  var camera, scene, renderer;
  var plane;

  var mouse, raycaster, isShiftDown, rotationControls = false;
  var mouse3D, isMouseDown = false, onMouseDownPosition,
  radious = 900, theta = 45, onMouseDownTheta = 45, phi = 60, onMouseDownPhi = 60;


  var rollOverMesh, rollOverMaterial, guideguideMesh, guideMaterial;

  var colors = {
    YELLOW: 0xffea00,
    GREEN: 0x03c20c,
    BLUE: 0x0018ff,
    RED: 0xff0000
  };

  var brushColor = colors.GREEN;
  var cubeGeometry = new THREE.BoxGeometry( 50, 50, 50 );
  var cubeMaterial = new THREE.MeshLambertMaterial( { color: brushColor, overdraw: 0.5 } );

  scope.leapPosition = new THREE.Vector3(0,0,0);

  var objects = [];


  init();
  render();
  scope.initLeap(scene, camera, renderer);

  function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.x = radious * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
    camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
    camera.position.z = radious * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
    camera.lookAt( new THREE.Vector3() );

    scene = new THREE.Scene();

    var axes = new THREE.AxisHelper(200);
    scene.add(axes);

    // roll-over helpers

    var rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
    rollOverMaterial = new THREE.MeshBasicMaterial( { color: colors.RED, opacity: 0.5, transparent: true } );
    rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    scene.add( rollOverMesh );

    var guideGeo = new THREE.BoxGeometry( 50, 50, 50 );
    guideMaterial = new THREE.MeshBasicMaterial( { color: colors.BLUE, wireframe: true } );
    guideMesh = new THREE.Mesh( rollOverGeo, guideMaterial );
    scene.add( guideMesh );

    // Scene movement

    onMouseDownPosition = new THREE.Vector2();

    // Grid

    var size = 500, step = 50;

    var geometry = new THREE.Geometry();

    for ( var i = - size; i <= size; i += step ) {

      geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
      geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

      geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
      geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

    }

    var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );

    var line = new THREE.LineSegments( geometry, material );
    scene.add( line );

    //

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    var geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
    geometry.rotateX( - Math.PI / 2 );

    plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
    scene.add( plane );

    objects.push( plane );

    var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    // Lights

    var ambientLight = new THREE.AmbientLight( 0x606060 );
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    scene.add( directionalLight );

    var directionalLight = new THREE.DirectionalLight( 0x808080 );
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    scene.add( directionalLight );

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild(renderer.domElement);


    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'keyup', onDocumentKeyUp, false );
    //document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );

    //

    window.addEventListener( 'resize', onWindowResize, false );

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

  }

  function onDocumentMouseMove( event ) {

    event.preventDefault();

    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    if( isMouseDown && rotationControls ) {

      theta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.5 ) + onMouseDownTheta;
      phi = ( ( event.clientY - onMouseDownPosition.y ) * 0.5 ) + onMouseDownPhi;

      phi = Math.min( 180, Math.max( 0, phi ) );

      camera.position.x = radious * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
      camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
      camera.position.z = radious * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
      camera.updateMatrix();
      //camera.lookAt(0,0,0);
    }

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

      var intersect = intersects[ 0 ];

      rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
      rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

      //guideMesh.position.x = scope.leapPosition.x;
      //guideMesh.position.z = scope.leapPosition.z;


    }

    render();

  }

  function onDocumentMouseDown( event ) {

    event.preventDefault();

    isMouseDown = true;

    onMouseDownTheta = theta;
    onMouseDownPhi = phi;
    onMouseDownPosition.x = event.clientX;
    onMouseDownPosition.y = event.clientY;

    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

      var intersect = intersects[ 0 ];

      if ( isShiftDown ) {

        if ( intersect.object != plane ) {

          scene.remove( intersect.object );

          objects.splice( objects.indexOf( intersect.object ), 1 );

        }

      } else {

        var voxel = new THREE.Mesh( cubeGeometry, new THREE.MeshLambertMaterial( { color: brushColor, overdraw: 0.5 } ) );
        voxel.position.copy( intersect.point ).add( intersect.face.normal );
        voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
        scene.add( voxel );

        output('boxout', vectorToText(voxel.position));

        objects.push( voxel );

      }

      render();

    }

  }

  function onDocumentMouseUp( event ) {

    event.preventDefault();

    isMouseDown = false;

    onMouseDownPosition.x = event.clientX - onMouseDownPosition.x;
    onMouseDownPosition.y = event.clientY - onMouseDownPosition.y;
  }

  function onDocumentKeyDown( event ) {

    switch( event.keyCode ) {

      case 49: setBrushColor( colors.RED ); break;
      case 50: setBrushColor( colors.YELLOW ); break;
      case 51: setBrushColor( colors.BLUE ); break;
      case 52: setBrushColor( colors.GREEN ); break;

      case 16: isShiftDown = true; break;

    }

  }

  function onDocumentKeyUp( event ) {

    switch( event.keyCode ) {

      case 16: isShiftDown = false; break;

    }
  }

  function save() {

    window.open( renderer.domElement.toDataURL('image/png'), 'mywindow' );
    return false;

  }

  function render() {
    renderer.render( scene, camera );
    //requestAnimationFrame(render);
  }

  function setBrushColor( hex ) {

    brushColor = hex;
    render();
  }

  function renderFromLeap() {

    //guideMesh.position.copy( scope.leapPosition );
    //guideMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

      var intersect = intersects[ 0 ];

      scope.leapPosition.y = 0;
      guideMesh.position.copy( scope.leapPosition ).add( intersect.face.normal );
      guideMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

      //guideMesh.position.x = scope.leapPosition.x;
      //guideMesh.position.z = scope.leapPosition.z;


    }

    output('leapoutput', vectorToText(scope.leapPosition));
  }

  function output(elId, text) {
    document.getElementById(elId).innerHTML = text;
  }

  function vectorToText(vector) {
    return "x: " + Math.floor(vector.x) + ", y: " + Math.floor(vector.y) + ", z: " + Math.floor(vector.z);
  }

  scope.scene = scene;
  scope.camera = camera;
  scope.save = save;
  scope.renderFromLeap = renderFromLeap;

})(window.scope);