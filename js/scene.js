window.scope = window.scope || {};
(function(scope){
  var container;
  var camera, scene, renderer;
  var plane, cannon, cannonLine;

  var mouse, raycaster, isShiftDown, rotationControls = false;
  var mouse3D, isMouseDown = false, onMouseDownPosition,
  radious = 1200, theta = 30, onMouseDownTheta = 45, phi = 30, onMouseDownPhi = 60;


  var rollOverMesh, rollOverMaterial, guideguideMesh, guideMaterial;

  var colors = {
    YELLOW: 0xffea00,
    GREEN: 0x03c20c,
    BLUE: 0x0018ff,
    RED: 0xff0000,
    MAGENTA: 0xff08f6,
    PURPLE: 0x7e00ff,
    CYAN: 0x00ffea,
    ORANGE: 0xff6600
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

    Physijs.scripts.worker = 'js/lib/physijs_worker.js';
    scene = new Physijs.Scene();
    // scene = new THREE.Scene();

    var axes = new THREE.AxisHelper(200);
    scene.add(axes);

    // roll-over helpers

    var rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
    rollOverMaterial = new THREE.MeshBasicMaterial( { color: brushColor, opacity: 0.5, transparent: true } );
    rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    scene.add( rollOverMesh );

    var guideGeo = new THREE.BoxGeometry( 50, 50, 50 );
    guideMaterial = new THREE.MeshBasicMaterial( { color: brushColor, opacity: 0.5, transparent: true } );
    guideMesh = new THREE.Mesh( rollOverGeo, guideMaterial );
    guideMesh.position.set(25, 25, 25);
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

    var geometry = new THREE.PlaneGeometry( 1000, 1000 );
    geometry.rotateX( - Math.PI / 2 );

    plane = new Physijs.PlaneMesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
    scene.add( plane );

    objects.push( plane );

    var floorGeo = new THREE.BoxGeometry(1000, 1000, 20);
    floorGeo.rotateX( - Math.PI / 2 );
    var floor = new Physijs.BoxMesh( floorGeo, new THREE.MeshBasicMaterial( { visible: false } ), 0 );
    floor.position.set(0, -10, 0);
    scene.add(floor);

    objects.push( floor );

    var cannonGeo = new THREE.CylinderGeometry(25, 25, 100, 20);
    cannonGeo.applyMatrix( new THREE.Matrix4().makeTranslation(0, 50, 0) );
    cannon = new THREE.Mesh(cannonGeo, new THREE.MeshLambertMaterial( { color: colors.YELLOW } ) );
    cannon.position.set( 0, 0, 500);

    scene.add(cannon);

    var cannonLineGeo = new THREE.Geometry();
    cannonLineGeo.vertices.push(new THREE.Vector3(0,0,0), cannon.position);
    cannonLine = new THREE.Line( cannonLineGeo, new THREE.LineBasicMaterial( { color: colors.RED } ) );
    scene.add(cannonLine);


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

        var voxel = new Physijs.BoxMesh( cubeGeometry, new THREE.MeshLambertMaterial( { color: brushColor, overdraw: 0.5 } ), 100 );
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

      // Numbers 1-7
      case 49: setBrushColor( colors.GREEN ); break;
      case 50: setBrushColor( colors.YELLOW ); break;
      case 51: setBrushColor( colors.BLUE ); break;
      case 52: setBrushColor( colors.RED ); break;
      case 53: setBrushColor( colors.MAGENTA ); break;
      case 54: setBrushColor( colors.CYAN ); break;
      case 55: setBrushColor( colors.PURPLE ); break;
      case 56: setBrushColor( colors.ORANGE ); break;

      // Shift
      case 16: isShiftDown = true; break;

      // Space
      case 32: dropBlock(); break;
      // Z
      case 90: shootBlock(); break;

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
    scene.simulate();
    renderer.render( scene, camera );
    //requestAnimationFrame(render);
  }

  function setBrushColor( hex ) {

    brushColor = hex;
    rollOverMesh.material = guideMesh.material = new THREE.MeshBasicMaterial( { color: brushColor, opacity: 0.5, transparent: true } );
    render();
  }

  function dropBlock() {
    // Only do this if the hand is visible
    var voxel = new Physijs.BoxMesh( cubeGeometry, new THREE.MeshBasicMaterial( { color: brushColor, overdraw: 0.5 } ), 100 );
    voxel.position.copy( scope.leapPosition );
    voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
    scene.add( voxel );

    output('boxout', vectorToText(voxel.position));

    objects.push( voxel );
  }

  var timer, cannonBall;

  function shootBlock() {
    var point = cannon.position.clone();
    cannonLine.geometry.vertices[0] = point;
    cannonLine.geometry.vertices[1] = scope.leapPosition;
    cannonLine.geometry.verticesNeedUpdate = true;

    var ballGeo = new THREE.SphereGeometry( 20, 32, 32 );

    if(cannonBall) {
      scene.remove(cannonBall)
      cannonBall = null;
    }

    cannonBall = new Physijs.SphereMesh( ballGeo, new THREE.MeshLambertMaterial({color:brushColor}), 10);
    cannonBall.position.set( point.x, point.y, point.z );
    scene.add(cannonBall);
    //var cannonForce =
    objects.push(cannonBall);
    //var forcePos = cannon.position.clone().add(scope.leapPosition.clone());
    var forcePos = scope.leapPosition.clone();
    forcePos.z = 500 - forcePos.z;
    forcePos.z *= -1
    forcePos.multiply(new THREE.Vector3(1, 1, -1));

    var ratioV = new THREE.Vector3( 0, 0, 0 );
    ratioV.z = forcePos.z / forcePos.y;
    ratioV.x = forcePos.x / forcePos.y;
    ratioV.y = forcePos.y / forcePos.z;
    //forcePos.z *= -1;
    //forcePos.y *= Math.PI * .5;
    output('dirout', vectorToText( ratioV ) );
    var appliedForce = ratioV.multiplyScalar(100000);
    ratioV.z *= -1;
    //cannonBall.applyCentralImpulse( appliedForce );
    timer = setInterval(function(){
      cannonBall.applyCentralForce( appliedForce );
    }, 1000/60);
    setTimeout(function(){
      if(timer) clearInterval(timer);
    }, 100);
    setTimeout(function(){

      if(cannonBall) {
        scene.remove(cannonBall);
        cannonBall = null;
      }

    }, 3000);

  }

  function renderFromLeap() {

    //guideMesh.position.copy( scope.leapPosition );
    //guideMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

      var intersect = intersects[ 0 ];

      //scope.leapPosition.y = 0;
      guideMesh.geometry = new THREE.BoxGeometry(50, scope.leapPosition.y, 50);
      // var guideGeo = new THREE.BoxGeometry( 50, 50, 50 );
      guideMaterial = new THREE.MeshBasicMaterial( { color: brushColor, opacity: 0.5, transparent: true } );
      //scope.leapPosition.y = 0;
      guideMesh.position.copy( scope.leapPosition ).add( intersect.face.normal );
      //guideMesh.position
      var box = new THREE.Box3().setFromObject( guideMesh );
      //console.log( box.min, box.max, box.size() );

      guideMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
      guideMesh.position.y = box.size().y * .5;
      //guideMesh.position.x = scope.leapPosition.x;
      //guideMesh.position.z = scope.leapPosition.z;
    }



    // Leap collision
    /*
    var vector = scope.leapPosition.clone().unproject( camera );
    var direction = new THREE.Vector3( 0, 0, -1 ).transformDirection( camera.matrixWorld );
    raycaster.set( vector, direction );
    var l_intersects = raycaster.intersectObjects( objects );

    if ( l_intersects.length > 0 ) {
      //console.log('LEAP COLLISION');
    }
*/
    output('leapoutput', vectorToText(scope.leapPosition));
    if(scope.leapPosition) {
      output('leapoutput', vectorToText(scope.leapPosition));
      cannon.lookAt(scope.leapPosition);
      cannon.rotation.x *= Math.PI / 2;
      cannon.rotation.z *= -1;
    }
    if(scope.pointDirection) {
      output('dirout', directionToAngle(scope.pointDirection));
      //cannon.geometry.rotation(scope.pointDirection[0], scope.pointDirection[1], scope.pointDirection[2])
      //cannon.geometry.rotateY(scope.pointDirection[1]);
      //cannon.rotation.x = scope.pointDirection[1] + Math.PI / 2;
      //cannon.rotation.z = scope.pointDirection[0];
    }
    render();
  }

  function output(elId, text) {
    document.getElementById(elId).innerHTML = text;
  }

  function vectorToText(vector) {
    return "x: " + Math.floor(vector.x) + ", y: " + Math.floor(vector.y) + ", z: " + Math.floor(vector.z);
  }

  function directionToAngle(dir) {
    if(!dir) return "";
    var x = dir[0];
    var y = dir[1];
    var z = dir[2];
    return "x: " + Math.floor(x * (180 / Math.PI) ) + ", y: " + Math.floor(y * (180 / Math.PI) ) + ", z: " + Math.floor(z * (180 / Math.PI) );
  }

  scope.scene = scene;
  scope.camera = camera;
  scope.save = save;
  scope.renderFromLeap = renderFromLeap;

})(window.scope);