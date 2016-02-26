window.scope = window.scope || {};
(function(scope) {
  var controller;

  window.controller = controller = new Leap.Controller({
    background: true
  });

  controller
  .use('handHold', {})
  .use('handEntry', {})
  .use('riggedHand', {
    parent: scope.scene,
    camera: scope.camera,
    scale: 0.5,
    offset: new THREE.Vector3(0,500,-500),
    positionScale: 2
  });

  controller.connect();

  controller.on('frame', function(frame) {
    var hand, handMesh, offsetDown, offsetForward, pos;
    if (!frame.hands[0]) {
      return;
    }
    hand = frame.hands[0];
    handMesh = hand.data('riggedHand.mesh');

    pos = Leap.vec3.clone(hand.palmPosition);
    //offsetDown = Leap.vec3.clone(hand.palmNormal);
    //Leap.vec3.multiply(offsetDown, offsetDown, [30, 30, 30]);
    //Leap.vec3.add(pos, pos, offsetDown);
    //offsetForward = Leap.vec3.clone(hand.direction);
    //Leap.vec3.multiply(offsetForward, offsetForward, [30, 30, 30]);
    //Leap.vec3.add(pos, pos, offsetForward);

    handMesh.scenePosition(hand.indexFinger.tipPosition, scope.leapPosition);

    if (hand.pinchStrength > 0.5) {
      scope.pinch = true;
    }
  });

})(window.scope);
