window.scope = window.scope || {};
(function(scope) {
  var riggedHandPlugin;



  scope.initLeap = function(scene, camera, renderer) {
    Leap.loop({
      hand: function(hand){

        var handMesh = hand.data('riggedHand.mesh');

        var screenPosition = handMesh.screenPosition(
          hand.palmPosition,
          riggedHandPlugin.camera
        );

      }
    })
    .use('riggedHand', {
      parent: scene,
      camera: camera,
      scale: .25,
      renderer: renderer,
      renderFn: function() {
        renderer.render(scene, camera);
      }
    })
    .use('handEntry')
    .on('handLost', function(hand){})
    .on('frame', function(frame){

    });

    riggedHandPlugin = Leap.loopController.plugins.riggedHand;
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
