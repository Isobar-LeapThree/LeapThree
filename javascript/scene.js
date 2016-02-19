/*
  This demo is to experiment towards a system of connecting
  3D items by using leap motion controls.

  In interface.js we can gather information about the leap position.
  Using handMesh.scenePosition() we translate leaps coordinates to
  Three JS.

  Interaction is currently clunky. We have not found a reliable way
  for a leap hand to interact with Three objects. Currently, a ThreeJS
  ball tracks the movement of the leap hand. This ball is then tested
  for collisions in the scene. The performance seems to be poor.

  There is one other proof of concept started in here. A 3D matrix is
  positioned in the scene. As the leap hand moves, we can find the closest
  block in this matrix to the leap hand. If this system is robust enough
  we can know where blocks live in the matrix, where positions are open
  to place new ones.

*/

// Generated by CoffeeScript 1.7.1
(function() {
  var geometry, mainLight, lightVisualizer, material, render, renderer;
  // leapBall follows leap hand position to detect collisions
  // billboard is a polygon for debugging
  var leapBall, billboard;

  var dropables = [];
  var pickupables = [];
  var canPickup = true;
  var ballCollision = false;
  var cubeCollision = false;

  // Start the ball away from everything
  var leapBallHome = new THREE.Vector3(-4, .125, -4);

  var cubeUnit = 1;
  var snapMatrix = new Matrix3D(10);
  var positionMatrix = new Matrix3D(10)
  var matrixOffset = {x: -5, y: 0, z:-5}
  populatePositions(positionMatrix, 1);
  shiftPositions(positionMatrix, matrixOffset);

  var wireMatrix = new Matrix3D(10);


  var colors = {
    white: 0xffffff,
    magenta: 0xff0bf6,
    blue: 0x17e1ff,
    yellow: 0xffec17,
    red: 0xff0042,
    green: 0x2cff16,
    purple: 0x7200ff
  };

  window.scope = {
    x: 0,
    y: 0,
    color: 0x0000ff,
    mainLightposition: new THREE.Vector3(1, 10, 1),
    cubePosition: new THREE.Vector3(-3, .5, 3),
    pickupInit: false,
    grabActive: false,
    leapPosition: new THREE.Vector3(-4, .125, -4),
    mtx: positionMatrix
  };

  window.scene = new THREE.Scene();

  window.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  window.camera.position.set(-5, 5, 10);

  var axes = new THREE.AxisHelper(5);
  scene.add(axes);

  var origin = new THREE.Vector3(0, 0, 0);
  window.camera.lookAt(origin);

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xEEEEEE, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;

  document.body.appendChild(renderer.domElement);

  // FLOOR
  var noiseSize = 256;
  var size = noiseSize * noiseSize;
  var data = new Uint8Array( 4 * size );
  for ( var i = 0; i < size * 4; i ++ ) {
      data[ i ] = Math.random() * 255 | 0;
  }
  var dt = new THREE.DataTexture( data, noiseSize, noiseSize, THREE.RGBAFormat );
  dt.wrapS = THREE.RepeatWrapping;
  dt.wrapT = THREE.RepeatWrapping;
  dt.needsUpdate = true;
  dt.repeat.set( 4, 4 );


  var floorMaterial = new THREE.MeshBasicMaterial( { map: dt, side: THREE.DoubleSide } );
  var floorGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -0.5;
  floor.rotation.x = Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);


  leapBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.2),
    new THREE.MeshLambertMaterial({color: colors.white, wireframe: true})
  );
  leapBall.castShadow = false;
  leapBall.receiveShadow = false;

  leapBall.position = scope.leapPosition;

  scene.add(leapBall);

  // Object Blocks
  var ob1 = make_block({color: colors.white});
  ob1.position.set(2, .5, 2);
  scene.add(ob1);

  var ob2 = make_block({color: colors.white});
  ob2.position.set(-2, .5, 2);
  scene.add(ob2);

  pickupables.push(ob1, ob2);

  billboard = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, .25),
    new THREE.MeshLambertMaterial({color: colors.white})
  );
  billboard.position.set(0, 3, -4);
  scene.add(billboard);

  // Drop target blocks
  var t1 = make_block({color: colors.green});
  t1.position.set(2, .5, 0);
  scene.add(t1);

  t2 = make_block({color: colors.yellow});
  t2.position.set(-2, .5, 0);
  scene.add(t2);

  dropables.push(t1, t2);

  //camera.position.fromArray([0, 3, 10]);

  //camera.lookAt(new THREE.Vector3(0, 0, 0));

  mainLight = new THREE.DirectionalLight(0xffffff, 3.5, 10);
  mainLight.castShadow = true;
  mainLight.position = scope.mainLightposition;

  scene.add(mainLight);

  scope.spotLight = new THREE.SpotLight(0xFFFFFF);
  scope.spotLight.position.set( 200, 60, -10);
  scope.spotLight.castShadow = true;

  //scene.add(scope.spotLight);

  buildSnapGrid(positionMatrix, wireMatrix);

  //wireMatrix.itemAt(0, 3, 0).material.visible = true;

  var lastCube = false;
  render = function() {

    //var originPoint = block.position.clone();
    var originPoint = leapBall.position.clone();
    //ballCollision = false;
    var block_col = false;
    var cube_col = false;

    if(scope.pickupInit && canPickup) {
    /* Collide with dropables
      for (var vertexIndex = 0; vertexIndex < leapBall.geometry.vertices.length; vertexIndex++)
      {
        var localVertex = leapBall.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4( leapBall.matrix );
        var directionVector = globalVertex.sub( leapBall.position );

        var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects( collisionTargets );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
          block_col = true;
          ballCollision = collisionResults[0];
        }
      }
      */

      for (var vertexIndex = 0; vertexIndex < leapBall.geometry.vertices.length; vertexIndex++)
      {
        var localVertex = leapBall.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4( leapBall.matrix );
        var directionVector = globalVertex.sub( leapBall.position );

        var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects( pickupables );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
          block_col = true;
          // Put ball somewhere
          leapBall.position = leapBallHome

          ballCollision = collisionResults[0];
          ballCollision.object.position = scope.leapPosition;
          canPickup = false;
        }
      }

    }

    // Look for collisions between target and object blocks
    if(scope.pickupInit && ballCollision) {
      var currentCarry = ballCollision.object;
      var carryPoint = currentCarry.position.clone();
      for (var vertexIndex = 0; vertexIndex < currentCarry.geometry.vertices.length; vertexIndex++)
      {
        var localVertex = currentCarry.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4( currentCarry.matrix );
        var directionVector = globalVertex.sub( currentCarry.position );

        var ray = new THREE.Raycaster( carryPoint, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects( dropables );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
          //block_col = true;
          // Put ball somewhere
          //leapBall.position = leapBallHome

          cube_col = true;

          cubeCollision = collisionResults[0];

          //ballCollision = collisionResults[0];
          //ballCollision.object.position = scope.leapPosition;
        }
      }
    }


    if(block_col) {
      billboard.material.color.setHex(colors.red);
      //block.position = targetBlock.position;
    } else {
      billboard.material.color.setHex(colors.white);
      if(scope.pickupInit) billboard.material.color.setHex(colors.blue);
      if(scope.pickupActive) billboard.material.color.setHex(colors.purple);
      //scope.canCarryBlock = true;
    }

    if(scope.grabActive) {
      billboard.material.color.setHex(colors.green);
    }

    if(cube_col) {
      //billboard.material.color.setHex(colors.yellow);
    } else {
      //billboard.material.color.setHex(colors.white);
    }


    // Drop cube
    if(ballCollision && !scope.grabActive) {
      console.log('Matrix=', ballCollision.object.matrix);
      var collisionPos = ballCollision.object.position.clone();
      var plusOne = collisionPos.add( new THREE.Vector3(0, 1, 0) );
      //block.position.set(plusOne.x, plusOne.y, plusOne.z);
      ballCollision.object.position = scope.leapPosition.clone();
      ballCollision.object.position.setY(0.5);
      //blockAttached = true;
    }



    if(cubeCollision && ballCollision && !scope.grabActive) {
      console.log('Connect Cubes=', cubeCollision.object.matrix);
      var targetPos = cubeCollision.object.position.clone();
      var plusOne = targetPos.add( new THREE.Vector3(0, 1, 0) );
      ballCollision.object.position.set(plusOne.x, plusOne.y, plusOne.z);

      cubeCollision = false;
      ballCollision = false;
      //ballCollision.object.position = scope.leapPosition.clone();
      //ballCollision.object.position.setY(0.5);
      //blockAttached = true;
    }

    if(!scope.grabActive) {
      ballCollision = false;
      cubeCollision = false;
      leapBall.position = leapBallHome;
      //scope.leapPosition = leapBallHome;
      setTimeout(function(){
        leapBall.position = scope.leapPosition;
        canPickup = true;
      }, 1000);
    }

    if(wireMatrix) {
      // wireMatrix.itemAt(0, 3, 0).material.visible = true;
      //MAtrix moved but acceptable bounds need to be account for
      if(lastCube) {
        //lastCube.material.visible = false;
        lastCube = null;
      }
      var nearestCords = {
                          x: Math.round(scope.leapPosition.x),
                          y: Math.round(scope.leapPosition.y),
                          z: Math.round(scope.leapPosition.z)
                        };
      //console.log("[COORD]", nearestCords);

      lastCube = wireMatrix.itemAt(nearestCords.x - matrixOffset.x,
                                   nearestCords.y - matrixOffset.y,
                                   nearestCords.z - matrixOffset.z);
      if(lastCube) lastCube.material.visible = true;
      if(lastCube) lastCube.material.color = colors.green;
    }



    renderer.render(scene, camera);
    return requestAnimationFrame(render);
  };

  render();

  function constrain(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function make_block(config) {

    var b = new THREE.Mesh(
      new THREE.BoxGeometry(cubeUnit, cubeUnit, cubeUnit),
      new THREE.MeshLambertMaterial(config)
    );

    b.castShadow = true;
    b.receiveShadow = true;

    return b;
  }

  function make_wire_block() {

    var b = new THREE.Mesh(
      new THREE.BoxGeometry(cubeUnit, cubeUnit, cubeUnit),
      new THREE.MeshLambertMaterial({color: colors.red, wireframe: true})
    );
    b.castShadow = false;
    b.receiveShadow = false;

    return b;
  }

  // Position Matrix must be populated
  function buildSnapGrid(matrixPostions, matrixStorage) {
    if(! matrixPostions.itemAt(0,0,0).hasOwnProperty('x')) throw new Error('Postions for snap grid not available');

    for(var x = 0; x < matrixPostions.units; x++) {

      for(var y = 0; y < matrixPostions.units; y++) {

        for(var z = 0; z < matrixPostions.units; z++) {
          var wire = make_wire_block();
          wire.position.set(x, y, z);
          //wire.material.visible = false;
          if(matrixStorage) matrixStorage.itemAt(x, y, z, wire);
          scene.add(wire);
          //matrix.itemAt(x, y, z, {x: x * cubeSize, y: y * cubeSize, z: z * cubeSize});
        }
      }

    }

  }

  function populatePositions(matrix, cubeSize) {

    for(var x = 0; x < matrix.units; x++) {

      for(var y = 0; y < matrix.units; y++) {

        for(var z = 0; z < matrix.units; z++) {

          matrix.itemAt(x, y, z, {x: x * cubeSize, y: y * cubeSize, z: z * cubeSize});
        }
      }

    }
  }

  function shiftPositions(matrix, offset) {

    for(var x = 0; x < matrix.units; x++) {

      for(var y = 0; y < matrix.units; y++) {

        for(var z = 0; z < matrix.units; z++) {
          var shift = matrix.itemAt(x, y, z);
          shift.x += offset.x;
          shift.y += offset.y;
          shift.z += offset.z;
          matrix.itemAt(x, y, z, shift);
        }
      }

    }
  }

}).call(this);



function Matrix3D(units) {

  var makeZ = function(len, posX, posY) {
    var z = [];
    for(var i = 0; i < len; i++) {
      z[i] = 'x' + posX + 'y' + posY + 'z' + i;
    }
    return z;
  };

  var makeY = function(len, posX) {
    var y = [];
    for(var i = 0; i < len; i++) {
      y[i] = makeZ(len, posX, i);
    }
    return y;
  };

  var makeX = function(len) {
    var x = [];
    for(var i = 0; i < len; i++) {
      x[i] = makeY(len, i);
    }
    return x
  }

  this.units = units;

  this.matrix = makeX(this.units);

  this.itemAt = function(x, y, z, val) {
    //if(x > this.units || x < 0) throw new Error("Value exceedes X bounds:", x);
    //if(y > this.units || y < 0) throw new Error("Value exceedes Y bounds:", y);
    //if(z > this.units || z < 0) throw new Error("Value exceedes Z bounds:", z);
    if((x > this.units || x < 0) || (x > this.units || x < 0) || (z > this.units || z < 0)) {
      console.log("Matrix3D.itemAt() - Value exceedes bounds:", x, y, z);
      return null;
    }
    //if(x > this.units || x < 0) console.log("Value exceedes X bounds:", x);
    //if(y > this.units || y < 0) console.log("Value exceedes Y bounds:", y);
    //if(z > this.units || z < 0) console.log("Value exceedes Z bounds:", z);

    if(val) this.matrix[x][y][z] = val;
    return this.matrix[x][y][z];
  };

  this.getMatrix = function() {
    return matrix;
  }

  return this;
}
