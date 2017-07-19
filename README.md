[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]

# Rickshaw

Rickshaw is a JavaScript toolkit for creating interactive time series graphs, developed at [Shutterstock](http://www.shutterstock.com)

## Getting Started

Getting started with a simple graph is straightforward.  Here's the gist:

```javascript
var graph = new Rickshaw.Graph( {
  element: document.querySelector('#graph'),
  series: [
    {
      color: 'steelblue',
      data: [ { x: 0, y: 23}, { x: 1, y: 15 }, { x: 2, y: 79 } ]
    }, {
      color: 'lightblue',
      data: [ { x: 0, y: 30}, { x: 1, y: 20 }, { x: 2, y: 64 } ]
    }
  ]
} );

graph.render();
```
See the [overview](http://code.shutterstock.com/rickshaw/), [tutorial](http://shutterstock.github.com/rickshaw/tutorial/introduction.html), and [examples](http://shutterstock.github.com/rickshaw/examples/) for more.

## Rickshaw.Graph 

A Rickshaw graph.  Send an `element` reference, `series` data, and optionally other properties to the constructor before calling `render()` to point the graph.  A listing of properties follows.  Send these as arguments to the constructor, and optionally set them later on already-instantiated graphs with a call to `configure()`

##### element

A reference to an HTML element that should hold the graph. 

##### series

Array of objects containing series data to plot.  Each object should contain `data` at a minimum, a sorted array of objects each with x and y properties.  Optionally send a `name` and `color` as well.  Some renderers and extensions may also support additional keys.

##### renderer

A string containing the name of the renderer to be used.  Options include `area`, `stack`, `bar`, `line`, and `scatterplot`.  Defaults to `line`. Also see the `multi` meta renderer in order to support different renderers per series. 

##### width

Width of the graph in pixels.  Falls back to the width of the `element`, or defaults to 400 if the element has no width.

##### height

Height of the graph in pixels.  Falls back to the height of the `element`, or defaults to 250 if the element has no height.

##### min

Lower value on the Y-axis, or `auto` for the lowest value in the series.  Defaults to 0.

##### max

Highest value on the Y-axis.  Defaults to the highest value in the series.

##### padding

An object containing any of `top`, `right`, `bottom`, and `left` properties specifying a padding percentage around the extrema of the data in the graph.  Defaults to 0.01 on top for 1% padding, and 0 on other sides. Padding on the bottom only applies when the `yMin` is either negative or `auto`.

##### interpolation

Line smoothing / interpolation method (see [D3 docs](https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-line_interpolate)); notable options:

  * `linear`: straight lines between points
  * `step-after`: square steps from point to point
  * `cardinal`: smooth curves via cardinal splines (default)
  * `basis`: smooth curves via B-splines

##### stack

Allows you to specify whether series should be stacked while in the context of stacking renderers (area, bar, etc).  Defaults to `stack: 'true'`. To unstack, `unstack: 'true'`.

### Methods

Once you have instantiated a graph, call methods below to get pixels on the screen, change configuration, and set callbacks.

##### render()

Draw or redraw the graph.

##### configure()

Set properties on an instantiated graph.  Specify any properties the constructor accepts, including `width` and `height` and `renderer`.  Call `render()` to redraw the graph and reflect newly-configured properties.

##### onUpdate(f)

Add a callback to run when the graph is rendered


## Extensions

Once you have a basic graph, extensions let you add functionality.  See the [overview](http://code.shutterstock.com/rickshaw/) and [examples](http://shutterstock.github.com/rickshaw/examples/) listing for more.

* __Rickshaw.Graph.Legend__ - add a basic legend

* __Rickshaw.Graph.HoverDetail__ - show details on hover

* __Rickshaw.Graph.JSONP__ - get data via a JSONP request

* __Rickshaw.Graph.Annotate__ - add x-axis annotations

* __Rickshaw.Graph.RangeSlider__ - dynamically zoom on the x-axis with a slider

* __Rickshaw.Graph.RangeSlider.Preview__ - pan and zoom via graphical preview of entire data set

* __Rickshaw.Graph.Axis.Time__ - add an x-axis and grid lines with time labels

* __Rickshaw.Graph.Axis.X__ - add an x-axis and grid lines with arbitrary labels

* __Rickshaw.Graph.Axis.Y__ - add a y-axis and grid lines

* __Rickshaw.Graph.Axis.Y.Scaled__ - add a y-axis with an alternate scale

* __Rickshaw.Graph.Behavior.Series.Highlight__ - highlight series on legend hover

* __Rickshaw.Graph.Behavior.Series.Order__ - reorder series in the stack with drag-and-drop

* __Rickshaw.Graph.Behavior.Series.Toggle__ - toggle series on and off through the legend


## Rickshaw.Color.Palette

Rickshaw comes with a few color schemes. Instantiate a palette and specify a scheme name, and then call color() on the palette to get each next color.

```javascript
var palette = new Rickshaw.Color.Palette( { scheme: 'spectrum2001' } );
    
palette.color() // => first color in the palette
palette.color() // => next color in the palette...
```

Optionally, to palette.color() can take a numeric argument to specify which color from the palette should be used (zero-indexed).  This can be helpful when assigning a color to series of a plot with particular meaning:

```javascript
var palette = new Rickshaw.Color.Palette( { scheme: 'colorwheel' } );
    
palette.color(0) // => first color in the palette - red in this example
palette.color(2) // => third color in the palette - light blue
```

#### Color Schemes

  * classic9
  * colorwheel
  * cool
  * munin
  * spectrum14
  * spectrum2000
  * spectrum2001

#### Interpolation

For graphs with more series than palettes have colors, specify an `interpolatedStopCount` to the palette constructor.

## Rickshaw and Cross-Browser Support

This library works in modern browsers and Internet Explorer 9+.

Rickshaw relies on the HTMLElement#classList API, which isn't natively supported in Internet Explorer 9.  Rickshaw adds support by including a shim which implements the classList API by extending the HTMLElement prototype.  You can disable this behavior if you like, by setting `RICKSHAW_NO_COMPAT` to a true value before including the library. 


## Dependencies

Rickshaw relies on the fantastic [D3 visualization library](http://mbostock.github.com/d3/) to do lots of the heavy lifting for stacking and rendering to SVG.

Some extensions require [jQuery](http://jquery.com) and [jQuery UI](http://jqueryui.com), but for drawing some basic graphs you'll be okay without.

Rickshaw uses [jsdom](https://github.com/tmpvar/jsdom) to run unit tests in Node to be able to do SVG manipulation. As of the jsdom 7.0.0 release, jsdom requires Node.js 4 or newer [jsdom changelog](https://github.com/tmpvar/jsdom/blob/master/Changelog.md#700). If you want to run the tests on your machine, and you don't have access to a version of node >= 4.0, you can `npm install jsdom@3`  so that you can run the tests using the [3.x branch of jsdom](https://github.com/tmpvar/jsdom/tree/3.x).

## Building

For building, we need [Node](http://nodejs.org) and [npm](http://npmjs.org).  Running `make` should get you going with any luck.

After doing a build you can run the tests with the command: `npm test`

If you'd like to do your own minification, you will need to give a hint to the minifier to leave variables named `$super` named `$super`.  For example, with uglify on the command line:

```
$ uglify-js --reserved-names "$super" rickshaw.js > rickshaw.min.js
```

Or a sample configuration with `grunt-contrib-uglify`: 

```javascript
uglify: {
  options: {
    mangle: { except: ["$super"] }
  }
}
```

## Contributing

Pull requests are always welcome!  Please follow a few guidelines:

- Please don't include updated versions of `rickshaw.js` and `rickshaw.min.js`.  Just changes to the source files will suffice.
- Add a unit test or two to cover the proposed changes
- Do as the Romans do and stick with existing whitespace and formatting conventions (i.e., tabs instead of spaces, etc)
- Consider adding a simple example under `examples/` that demonstrates any new functionality

## Authors

This library was developed by David Chester, Douglas Hunter, and Silas Sewell at [Shutterstock](http://www.shutterstock.com)


## License

Copyright (C) 2011-2013 by Shutterstock Images, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[npm-image]: https://img.shields.io/npm/v/rickshaw.svg?style=flat-square
[npm-url]: https://npmjs.org/package/rickshaw
[travis-image]: https://travis-ci.org/shutterstock/rickshaw.svg?branch=master
[travis-url]: https://travis-ci.org/shutterstock/rickshaw
[coverage-image]: https://coveralls.io/repos/github/shutterstock/rickshaw/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/shutterstock/rickshaw
