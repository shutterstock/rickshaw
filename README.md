# Rickshaw

Rickshaw is a JavaScript toolkit for creating interactive time series graphs, developed at [Shutterstock](http://www.shutterstock.com)

## Getting Started

Getting started with a simple graph is straightforward.  Here's the gist:

    var graph = new Rickshaw.Graph( {
      element: document.querySelector('#graph'),
      series: [
        {
          color: 'steelblue',
          data: [ { x: 0, y: 23}, { x: 1, y: 15 }, { x: 2, y: 79 } ],
        }, {
          color: 'lightblue',
          data: [ { x: 0, y: 30}, { x: 1, y: 20 }, { x: 2, y: 64 } ],
        }
      ]
    } );

    graph.render();

See the [tutorial](http://shutterstock.github.com/rickshaw/tutorial/introduction.html) and [examples](http://shutterstock.github.com/rickshaw/examples/) for more.

## Rickshaw.Graph 

### properties

* _element_: a reference to an HTML element

* _series_: an array of objects each with the following properties

  * _name_: a name meant for humans
  * _color_: a CSS color
  * _data_: an array of objects, each with x and y properties

* _renderer_: renderer name, like `stack` or `line`

* _width_: width of the graph in pixels

* _height_: height of graph in pixels

* _min_: Lower value on the Y-axis, or `auto` for the lowest value in the series.  Defaults to 0.

* _max_: Highest value on the Y-axis.  Defaults to the highest value in the series.

* _interpolation_: optional line smoothing / interpolation method (see [D3 docs](https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-line_interpolate)); notable options:

  * _linear_: straight lines between points
  * _step-after_: square steps from point to point
  * _cardinal_: smooth curves via cardinal splines (default)
  * _basis_: smooth curves via B-splines

### methods

* _render()_: paint the graph

* _setRenderer()_: set renderer to stack or line

* _onUpdate(f)_: add a callback to run when the graph is rendered


## Rickshaw Extensions

Once you have a basic graph, extensions let you add functionality.  See the [examples](http://shutterstock.github.com/rickshaw/examples/) listing for more.
 
* __Rickshaw.Graph.Legend__ - add a basic legend

* __Rickshaw.Graph.HoverDetail__ - show details on hover

* __Rickshaw.Graph.JSONP__ - get data via a JSONP request

* __Rickshaw.Graph.Annotate__ - add x-axis annotations

* __Rickshaw.Graph.RangeSlider__ - dynamically zoom on the x-axis with a slider

* __Rickshaw.Graph.Axis.Time__ - add x-axis time labels

* __Rickshaw.Graph.Behavior.Series.Highlight__ - highlight series on legend hover

* __Rickshaw.Graph.Behavior.Series.Order__ - reorder series in the stack with drag-and-drop

* __Rickshaw.Graph.Behavior.Series.Toggle__ - toggle series on and off through the legend


## Rickshaw.Color.Palette

Rickshaw comes with a few color schemes. Instantiate a palette and specify a scheme name, and then call color() on the palette to get each next color.

    var palette = new Rickshaw.Color.Palette( { scheme: 'spectrum2001' } );
    
    palette.color() // => first color in the palette
    palette.color() // => next color in the palette...

Available color schemes:

  * classic9
  * colorwheel
  * cool
  * munin
  * spectrum14
  * spectrum2000
  * spectrum2001


## Rickshaw and Cross-Browser Support

This library works in modern browsers and Internet Explorer 9.

Rickshaw relies on the HTMLElement#classList API, which isn't natively supported in Internet Explorer 9.  Rickshaw adds support by including a shim which implements the classList API by extending the HTMLElement prototype.  You can disable this behavior if you like, by setting `RICKSHAW_NO_COMPAT` to a true value before including the library. 


## Dependencies & Building

Rickshaw relies on the fantastic [D3 visualization library](http://mbostock.github.com/d3/) to do lots of the heavy lifting for stacking and rendering to SVG.

Some extensions require [jQuery](http://jquery.com) and [jQuery UI](http://jqueryui.com), but for drawing some basic graphs you'll be okay without.

For building, we need [Node](http://nodejs.org) and [npm](http://npmjs.org).  Running 'make' should get you going with any luck.

## Authors

This library was developed by David Chester, Douglas Hunter, and Silas Sewell at [Shutterstock](http://www.shutterstock.com)


## License

Copyright (C) 2011 by Shutterstock Images, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

