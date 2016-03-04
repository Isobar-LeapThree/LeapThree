window.scope = window.scope || {};
(function(scope) {

  scope.initLeap = function(scene, camera, renderer) {

    window.controller = controller = new Leap.Controller;
    //window.controls = new THREE.TrackballControls(camera);

    window.scene = scene;
    window.camera = camera;
    window.renderer = renderer;

    widgets = new LeapWidgets(scene);
    widgets.initRiggedHand(scope);
    //widgets.initLeapHand();
    //widgets.initComboHand(scope);

    //widgets.initVirtualHand();

    document.addEventListener( 'keydown', onDocumentKeyDown, false );

    function onDocumentKeyDown( event ) {

      switch( event.keyCode ) {
        //Q
        case 81 :
          widgets.cancelHand();
          widgets.initLeapHand()
        break;
        //W
        case 87 :
          widgets.cancelHand();
          widgets.initRiggedHand(scope);
          break;
        default:
          console.log('[KEYDOWN] uncaught:', event.keyCode);
        break;

      }

    }
  };


})(window.scope);
