# apollonian-gasket
SVG renderer for Apollonian gaskets, in Javascript

Apollonian gaskets are [a cool-looking family of fractals made up triples of mutually-tangent circles][1]. These fractals are specified by the curvatures of the first four circles. The gasket to be drawn can be changed in `src/main.js`. The largest circle has negative curvature because it encompasses all of the other circles.

## Running
```
gulp show-web
```
will create `dist/index.html` and open it in the default browser.

## Development
```
gulp watch-web
```
will rebuild `dist/index.html` whenever any Javascript file is modified.

[1]: https://en.wikipedia.org/wiki/Apollonian_gasket "Apollonian gasket"
