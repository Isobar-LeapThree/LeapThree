/**
 * @author mr.doob / http://mrdoob.com/
 */

var Cuboid = function (units, width, height, depth) {

  THREE.Geometry.call(this);

  var scope = this,
  width_max = (width * units) - (units * .5),
  width_min = -units * .5,

  height_max = (height * units) - (units * .5),
  height_min = -units * .5,

  depth_max = (depth * units) - (units * .5),
  depth_min = -units * .5;

  v( width_max, height_max, depth_min );
  v( width_max, height_min, depth_min );
  v( width_min, height_min, depth_min );
  v( width_min, height_max, depth_min );
  v( width_max, height_max, depth_max );
  v( width_max, height_min, depth_max );
  v( width_min, height_min, depth_max );
  v( width_min, height_max, depth_max );

  /*
  height_half = height / 2 * units,
  depth_half = depth / 2 * units;

  v( width_max,  height_half, -depth_half );
  v( width_max, -height_half, -depth_half );
  v( width_min, -height_half, -depth_half );
  v( width_min,  height_half, -depth_half );
  v( width_max,  height_half,  depth_half );
  v( width_max, -height_half,  depth_half );
  v( width_min, -height_half,  depth_half );
  v( width_min,  height_half,  depth_half );
  */


  f4( 0, 1, 2, 3 );
  f4( 4, 7, 6, 5 );
  f4( 0, 4, 5, 1 );
  f4( 1, 5, 6, 2 );
  f4( 2, 6, 7, 3 );
  f4( 4, 0, 3, 7 );

  function v(x, y, z) {

    scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );
  }

  function f4(a, b, c, d) {

    scope.faces.push( new THREE.Face4( a, b, c, d ) );
  }

  this.computeCentroids();
  this.computeNormals();

}

Cuboid.prototype = new THREE.Geometry();
Cuboid.prototype.constructor = Cube;
