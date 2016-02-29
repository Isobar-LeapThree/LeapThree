window.scope = window.scope || {};
(function(scope) {

  scope.initLeap = function(scene, camera, renderer) {

    window.controller = controller = new Leap.Controller;
    //window.controls = new THREE.TrackballControls(camera);

    scene.addEventListener('update', function() {
      scene.simulate( undefined, 2 );
    });
    scene.setGravity({x:0,y:10,z:0});
    window.scene = scene;
    window.camera = camera;
    window.renderer = renderer;

    widgets = new LeapWidgets(scene);
    widgets.initRiggedHand(scope);

    var decreaseButton = widgets.createButton("Decrease", new THREE.Vector3(-100, 200, -110), new THREE.Vector3(100, 70, 30));
    var increaseButton = widgets.createButton("Increase", new THREE.Vector3(100, 200, -110), new THREE.Vector3(100, 70, 30));

    /*
    controller
      .use('handHold')
      .use('handEntry')
      .use('riggedHand', {
      parent: scene,
      renderer: renderer,
      scale: 1,
      positionScale: 2,
      helper: true,
      offset: new THREE.Vector3(0, 0, 0),
      renderFn: function(thing) {
        renderer.render(scene, camera);
        return;
      },
      camera: camera,
      boneColors: function(boneMesh, leapHand) {
        if ((boneMesh.name.indexOf('Finger_0') === 0) || (boneMesh.name.indexOf('Finger_1') === 0)) {
          return {
            hue: 0.6,
            saturation: leapHand.pinchStrength
          };
        }
      }
    }).on('frame', function(frame){
      var hand, handMesh, offsetDown, offsetForward, pos;
      if (!frame.hands[0]) {
        return;
      }
      hand = frame.hands[0];
      handMesh = hand.data('riggedHand.mesh');

      //pos = Leap.vec3.clone(hand.palmPosition);
      //offsetDown = Leap.vec3.clone(hand.palmNormal);
      //Leap.vec3.multiply(offsetDown, offsetDown, [30, 30, 30]);
      //Leap.vec3.add(pos, pos, offsetDown);
      //offsetForward = Leap.vec3.clone(hand.direction);
      //Leap.vec3.multiply(offsetForward, offsetForward, [30, 30, 30]);
      //Leap.vec3.add(pos, pos, offsetForward);
      //scope.lastCollision = false;

      //handMesh.scenePosition(pos, scope.light1position);
      //if(scope.activeBlock)
      handMesh.scenePosition(hand.indexFinger.tipPosition, scope.leapPosition);
      scope.renderFromLeap();
    }).connect();
    */
  };


})(window.scope);
