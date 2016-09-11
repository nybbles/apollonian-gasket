var Snap = require('snapsvg');
var math = require('mathjs');

// https://en.wikipedia.org/wiki/Descartes%27_theorem
function tangent_curvature(cv0, cv1, cv2) {
  var a = cv0 + cv1 + cv2;
  var b = 2*Math.sqrt((cv0*cv1) + (cv1*cv2) + (cv0*cv2));
  return [a+b, a-b];
}

// https://en.wikipedia.org/wiki/Descartes%27_theorem#Complex_Descartes_theorem
function tangent_circle_center_descartes(
  cv0, cv1, cv2, cv3, // curvatures
  z0, z1, z2 // centers
) {
  // express centers as complex numbers
  var cz0 = math.complex(z0[0],z0[1]);
  var cz1 = math.complex(z1[0],z1[1]);
  var cz2 = math.complex(z2[0],z2[1]);

  // do the thing
  var a = math.multiply(cz0,cv0);
  a = math.add(a, math.multiply(cz1,cv1));
  a = math.add(a, math.multiply(cz2,cv2));

  var b = math.multiply(cz1,math.multiply(cz0,cv0*cv1));
  b = math.add(b, math.multiply(cz2,math.multiply(cz1,cv1*cv2)));
  b = math.add(b, math.multiply(cz2,math.multiply(cz0,cv0*cv2)));
  b = math.multiply(math.sqrt(b),2);

  var cz3 = [math.add(a,b), math.add(a,math.multiply(b,-1))];
  cz3[0] = math.multiply(cz3[0], 1/cv3);
  cz3[1] = math.multiply(cz3[1], 1/cv3);

  // change back into 2D vectors
  var z3 = [];
  z3[0] = [cz3[0].re,cz3[0].im];
  z3[1] = [cz3[1].re,cz3[1].im];

  return z3;
}

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

function select_tangent_circle_solution(
  z3s, // candidate solutions
  z2, z1, // centers
  cr3, cr2, cr1 // radii
) {
  var result;
  var tol = 1e-5;
  for (var i = 0; i < 2; ++i) {
    var z3 = z3s[i];

    var delta = math.norm(math.subtract(z3,z2));
    if (math.abs(delta - cr3 - cr2) > tol)  {
      continue;
    }
    delta = math.norm(math.subtract(z3,z1));
    if (math.abs(delta - cr3 - cr1) > tol)  {
      continue;
    }

    result = z3;
    break;
  }

  return result;
}

function run_draw_queue(s, offset, draw_queue, refcv, refcr, n_circles_drawn) {
  while (draw_queue.length > 0) {
    var triple = draw_queue.pop();

    var cv0 = triple[0].cv;
    var cv1 = triple[1].cv;
    var cv2 = triple[2].cv;

    var z0 = triple[0].z;
    var z1 = triple[1].z;
    var z2 = triple[2].z;

    // compute next circle's curvature TODO: This returns two
    // solutions. Need to figure out how to use them. Use the first
    // one for now.
    var cvs = tangent_curvature(cv0, cv1, cv2);
    var cv3;
    if (cvs[1] > 0) {
      cv3 = cvs[1];
    } else {
      cv3 = cvs[0];
    }
    // var cv3 = cvs[1];
    // var cv3 = math.max(cvs[0], cvs[1]);
    console.log(cv3);
    var cr3 = curvature_to_radius(refcr, refcv, cv3);
    var z3s = tangent_circle_center_descartes(
      cv0, cv1, cv2, cv3,
      z0, z1, z2
    );
    // console.log(z3s);
    var z3 = select_tangent_circle_solution(
      z3s, z2, z1,
      cr3,
      curvature_to_radius(refcr, refcv, cv2),
      curvature_to_radius(refcr, refcv, cv1)
    );
    console.log(z3);

    // add triples generated from next circle into draw queue
    draw_queue.push([
      {cv:cv1, z:z1},
      {cv:cv2, z:z2},
      {cv:cv3, z:z3},
    ]);

    // draw next circle
    var c3 = s.circle(z3[0]+offset[0], z3[1]+offset[1], cr3);
    make_circle_unfilled(c3);

    /*
    console.log(cv3);
    console.log(cr3);
    console.log(z3);
     */

    n_circles_drawn++;
    if (n_circles_drawn > 10) {
      break;
    }
  }
}

exports.draw_gasket = function(s, cv0, cv1, cv2, cv3) {
  var margin = 10;
  var height = s.asPX('height') - 2*margin;
  var width = s.asPX('width') - 2*margin;

  var offset = [margin, margin];

  // draw circle with negative curvature. It should take up most of
  // the canvas. It is the containig circle.
  var cr0 = height/2;
  var z0 = [width/2, height/2];
  var c0 = s.circle(z0[0]+offset[0], z0[1]+offset[1], cr0);
  // make_circle_unfilled(c0);

  var lims = math.add(z0, -cr0);

  // draw next circle c1
  var cr1 = curvature_to_radius(cr0, cv0, cv1);
  var z1 = [z0[0],lims[1]+cr1];
  var c1 = s.circle(z1[0]+offset[0], z1[1]+offset[1], cr1);
  make_circle_unfilled(c1);

  // draw next circle c2
  var cr2 = curvature_to_radius(cr0, cv0, cv2);
  var z2 = math.add(
    lims,
    tangent_circle_center_internal(90, cr0, cr1, cr2)
  );
  var c2 = s.circle(z2[0]+offset[0], z2[1]+offset[1], cr2);
  make_circle_unfilled(c2);

  var draw_queue = [];

  // insert first triple of circles into draw queue
  draw_queue.push([
    {cv:cv0, z:z0},
    {cv:cv1, z:z1},
    {cv:cv2, z:z2},
  ]);

  var n_circles_drawn = 3;
  run_draw_queue(s, offset, draw_queue, cv0, cr0, n_circles_drawn);
};
