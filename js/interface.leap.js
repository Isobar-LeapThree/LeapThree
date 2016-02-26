window.scope = window.scope || {};
(function(scope) {
  var riggedHandPlugin;



  scope.initLeap = function(scene, camera, renderer) {
    /*
    Leap.loop({
      hand: function(hand){

        var handMesh = hand.data('riggedHand.mesh');

        var screenPosition = handMesh.screenPosition(
          hand.palmPosition,
          riggedHandPlugin.camera
        );

      }
    }).use('handHold').use('transform', {
      position: new THREE.Vector3(0, 0, 0),
      scale: 2
    })
    .use('riggedHand', {
      parent: scene,
      camera: camera,
      scale: 1,
      renderer: renderer,
      renderFn: function() {
        renderer.render(scene, camera);
      }
    }).connect();

    riggedHandPlugin = Leap.loopController.plugins.riggedHand;
    */
    window.controller = controller = new Leap.Controller;
    //window.controls = new THREE.TrackballControls(camera);

    controller.use('handHold').use('transform', {
      position: new THREE.Vector3(0, 0, 0),
    }).use('handEntry').use('screenPosition').use('riggedHand', {
      parent: scene,
      renderer: renderer,
      scale: 1,
      positionScale: 1,
      helper: true,
      offset: new THREE.Vector3(0, 0, 0),
      renderFn: function() {
        renderer.render(scene, camera);
        return;
      },

      camera: camera,
      boneLabels: function(boneMesh, leapHand) {
        if (boneMesh.name.indexOf('Finger_03') === 0) {
          return leapHand.pinchStrength;
        }
      },
      boneColors: function(boneMesh, leapHand) {
        if ((boneMesh.name.indexOf('Finger_0') === 0) || (boneMesh.name.indexOf('Finger_1') === 0)) {
          return {
            hue: 0.6,
            saturation: leapHand.pinchStrength
          };
        }
      },
      checkWebGL: true
    }).connect();
  };

  /*
  controller.use('riggedHand', {
    parent: window.scene,
    camera: window.camera,
    scale: 1,
    positionScale: 1,
    offset: new THREE.Vector3(0, -2, 0),
    renderFn: function() {},
    boneColors: function(boneMesh, leapHand) {
      return {
        hue: 0.6,
        saturation: 0.2,
        lightness: 0.8
      };
    }
  });*/

})(window.scope);
