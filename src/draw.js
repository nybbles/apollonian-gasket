var Snap = require('snapsvg');

function curvature_to_radius(r0, c0, c) {
  return r0 * Math.abs(c0) / c;
}

// These formulas are from
// https://ckrao.wordpress.com/2014/04/25/three-and-four-tangent-circles/. The
// coordiates given assume that the two circles and their tangent
// points are at specific coordinates.

function tangent_circle_center_internal(angle, r0, r1, r2) {
  var x = r2 * (r0 + r1) / (r0 - r1);
  var y = 2*Math.sqrt(r0*r1*r2*(r0-r1-r2)) / (r0-r1);

  // translate to rotation coordinate system
  x -= r0;

  // rotate
  var rotx = Snap.cos(angle)*x - Snap.sin(angle)*y;
  var roty = Snap.sin(angle)*x + Snap.cos(angle)*y;

  // translate back to our coordinate system
  rotx += r0;
  roty += r0;

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

  var xlim = cx0-cr0;
  var ylim = cy0-cr0;

  var cr1 = curvature_to_radius(cr0, cv0, cv1);
  var cx1 = cx0;
  var cy1 = ylim+cr1;
  var c1 = s.circle(cx1+offsetx, cy1+offsety, cr1);
  make_circle_unfilled(c1);

  var cr2 = curvature_to_radius(cr0, cv0, cv2);

  var xy2 = tangent_circle_center_internal(90, cr0, cr1, cr2);

  var cx2 = xlim+xy2[0];
  var cy2 = ylim+xy2[1];

  var c2 = s.circle(cx2+offsetx, cy2+offsety, cr2);
  make_circle_unfilled(c2);
};
