var Snap = require('snapsvg');

function curvature_to_radius(r0, c0, c) {
  return r0 * Math.abs(c0) / c;
}

// These formulas are from
// https://ckrao.wordpress.com/2014/04/25/three-and-four-tangent-circles/. The
// coordiates given assume that the two circles and their tangent
// points are at specific coordinates.

function tangent_circle_center_internal(t, r0, r1, r2) {
  var x = r2 * (r0 + r1) / (r0 - r1);
  var y = 2*Math.sqrt(r0*r1*r2*(r0-r1-r2)) / (r0-r1);

  // determine rotation from tangent point t, which is in a coordinate
  // system where the left corner of the circle is (0,0).
  // Snap.angle(1,1,1,0,0,0)
  // Snap.angle(0.5,1,0.5,0,0,0)
  // Snap.angle(1,-1,1,0,0,0)
  var angle = Snap.angle(t[0],t[1],0,0);
  var rotx = Snap.cos(angle)*x - Snap.sin(angle)*x;
  var roty = Snap.sin(angle)*y + Snap.cos(angle)*y;

  // left corner of the circle is still at (0,0), but the tangent
  // circle's point has been rotated relative to the tangent point
  // coordinates.
  console.log(t);
  console.log(angle);
  return [rotx, roty];
}

function tangent_circle_center_external() {

}

function make_circle_unfilled(c) {
  c.attr({
    fill: "white",
    stroke: "black",
    strokeWidth: 2
  });
}

function apply_offset(offsetx, offsety, x, y) {

}

exports.draw_gasket = function(s, cv0, cv1, cv2, cv3) {
  var margin = 10;
  var height = s.asPX('height') - 2*margin;
  var width = s.asPX('width') - 2*margin;

  var offsetx = margin;
  var offsety = margin;

  // draw circle with negative curvature. It should take up most of
  // the canvas. It is the containig circle.
  var cr0 = height/2;
  var cx0 = width/2;
  var cy0 = height/2;
  var c0 = s.circle(cx0+offsetx, cy0+offsety, cr0);
  make_circle_unfilled(c0);

  var cr1 = curvature_to_radius(cr0, cv0, cv1);
  var cx1 = cx0;
  var cy1 = cy0-cr0+cr1;
  var c1 = s.circle(cx1+offsetx, cy1+offsety, cr1);
  make_circle_unfilled(c1);

  var cr2 = curvature_to_radius(cr0, cv0, cv2);

  var tp12 = [cx0,0];
  tp12[1] -= cy0;

  var xy2 = tangent_circle_center_internal(tp12, cr0, cr1, cr2);
  var cx2 = xy2[0];
  var cy2 = xy2[1];
  var c2 = s.circle(cx2+offsetx, cy2+offsety, cr2);
  make_circle_unfilled(c2);
};
