var Snap = require('snapsvg');
var draw = require('./draw');

// Only executed our code once the DOM is ready.
window.onload = function() {
  var s = Snap('#canvas');
  // draw.draw_gasket(s, -10, 18, 23, 27);
  // draw.draw_gasket(s, -3, 5, 8, 8);
  // draw.draw_gasket(s, -6, 11, 14, 15);
  draw.draw_gasket(s, -15, 28, 33, 40);
}
