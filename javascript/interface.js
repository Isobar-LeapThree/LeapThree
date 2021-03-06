// Generated by CoffeeScript 1.7.1
(function() {
  var controller;


  window.controller = controller = new Leap.Controller({
    background: true
  });

  controller.use('riggedHand', {
    parent: window.scene,
    camera: window.camera,
    scale: 0.25,
    positionScale: 2,
    offset: new THREE.Vector3(0, -2, 0),
    renderFn: function() {},
    boneColors: function(boneMesh, leapHand) {
      return {
        hue: 0.6,
        saturation: 0.2,
        lightness: 0.8
      };
    }
  });

  controller.connect();

  controller.on('frame', function(frame) {
    var hand, handMesh, offsetDown, offsetForward, pos;
    if (!frame.hands[0]) {
      return;
    }
    hand = frame.hands[0];
    handMesh = hand.data('riggedHand.mesh');
    if (hand.pinchStrength > 0.5) {
      pos = Leap.vec3.clone(hand.palmPosition);
      offsetDown = Leap.vec3.clone(hand.palmNormal);
      Leap.vec3.multiply(offsetDown, offsetDown, [30, 30, 30]);
      Leap.vec3.add(pos, pos, offsetDown);
      offsetForward = Leap.vec3.clone(hand.direction);
      Leap.vec3.multiply(offsetForward, offsetForward, [30, 30, 30]);
      Leap.vec3.add(pos, pos, offsetForward);
      //scope.lastCollision = false;

      scope.pickupInit = true;
      scope.grabActive = true;
      //handMesh.scenePosition(pos, scope.light1position);
      //if(scope.activeBlock)
      handMesh.scenePosition(hand.indexFinger.tipPosition, scope.leapPosition);
      //handMesh.scenePosition(hand.indexFinger.tipPosition, scope.cubePosition);
    } else {
      scope.grabActive = false;
    }
  });

}).call(this);
