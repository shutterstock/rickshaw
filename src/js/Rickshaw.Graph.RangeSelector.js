Rickshaw.namespace('Rickshaw.Graph.RangeSelector');
Rickshaw.Graph.RangeSelector = Rickshaw.Class.create({
    initialize: function(args) {
        var graph = this.graph = args.graph,
            onZoom = this.onZoom = args.onZoom,
            xMin = this.xMin = args.xMin,
            xMax = this.xMax = args.xMax,
            position = this.position = {},
            selectionBox = this.selectionBox = document.createElement('div'),
            selectionControl = this.selectionControl = false,
            parent = this.parent = graph.element.getElementsByTagName('svg')[0];

        this.build(xMin,xMax);
    },
    build: function(xMin,xMax) {
        var self = this,
            graph = this.graph,
            position = this.position,
            selectionBox = this.selectionBox ,
            selectionControl = this.selectionControl,
            parent = this.parent;

        console.log(domain);

        selectionBox.setAttribute('class','rickshaw_range_selector');
        graph.element.appendChild(selectionBox);

        if (xMin !== undefined && xMin !== '') {
            position.xMin = xMin;
        } else {
            position.xMin = graph.dataDomain()[0];
        }

        if (xMax !== undefined && xMax !== '') {
            position.xMax = xMax;
        } else {
            position.xMax = graph.dataDomain()[1];
        }

        parent.oncontextmenu = function(e){
            e.preventDefault();
        };


        var selectionDraw, startDrawing, finishDrawing;
        selectionDraw = function (startPointX) {
            if (selectionControl === true) {
                parent.style.pointerEvents = 'none';
            }
            graph.element.style.cursor = 'crosshair';
            graph.element.addEventListener('mousemove', function (e) {
                if (selectionControl === true) {
                    position.x = e.offsetX | e.offsetX;
                    position.x = e.offsetX;
                    position.deltaX = Math.round(Math.max(position.x, startPointX) - Math.min(position.x, startPointX));
                    position.minX = Math.min(position.x, startPointX);
                    position.maxX = position.minX + position.deltaX;

                    selectionBox.style.transition = 'none';
                    selectionBox.style.opacity = '1';
                    selectionBox.style.width = position.deltaX;
                    selectionBox.style.height = '100%';
                    selectionBox.style.left = position.minX;
                } else {
                    return false;
                }
            }, false);
        };
        startDrawing = function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (e.button === 0 | e.button === 1) {
                var startPointX = e.offsetX;
                selectionBox.style.left = e.offsetX;
                selectionControl = true;
                selectionDraw(startPointX);
            } else if (e.button === 2 | e.button === 3) {
                e.preventDefault();
                position.xMin = graph.dataDomain()[0];
                position.xMax = graph.dataDomain()[1];
                e.position = position;
                self.onZoom(e);
                graph.update();
                self.clearSelection();
                graph.update();
            } else {
                return;
            }
        };
        finishDrawing = function (e) {
            if (!selectionControl | position.deltaX < 20) {
                selectionControl = false;
                self.clearSelection();
                return false;
            }
            selectionControl = false;
            var start = graph.x.invert(position.minX),
                end = graph.x.invert(position.maxX);
            // todo - this is working when the difference between the start and end timestamps is 1 millisecond at least
            console.log(start+','+end);
            if (end < start+1000) {
                self.clearSelection();
                return;
            } else {
                position.xMin = start;
                position.xMax = end;
                e.position = position;
                self.onZoom(e);
                graph.update(position.xMin, position.xMax);
                self.clearSelection();
                graph.update(position.xMin, position.xMax);
            }
        };

        graph.element.addEventListener('mousedown', function(e) {
           startDrawing(e);
        }, true);

        graph.element.addEventListener('mouseup', function(e) {
            finishDrawing(e);
        }, false);

        graph.element.addEventListener('mouseleave', function(e) {
            // todo - change this, maybe clear selection on mouseleave or something else.
            self.clearSelection();
            finishDrawing(e);
        }, false);

        graph.window.xMin = position.xMin;
        graph.window.xMax = position.xMax;

        graph.onUpdate(function() {
            this.update(position.xMin,position.xMax);
        }.bind(this));
    },
    clearSelection: function () {
        var selectionBox = this.selectionBox,
            selectionControl = this.selectionControl,
            parent = this.parent,
            graph = this.graph;

        selectionBox.style.transition = 'opacity 0.2s ease-out';
        selectionBox.style.opacity = 0;
        setTimeout(function () {
            selectionBox.style.width = 0;
            selectionBox.style.height = 0;
            selectionBox.style.top = 0;
            selectionBox.style.left = 0;
        }, 200);
        parent.style.pointerEvents = 'auto';
        graph.element.style.cursor = 'auto';
    },
    update: function (xMin,xMax) {
        var graph = this.graph;
        var position = this.position;
        graph.window.xMin = xMin;
        graph.window.xMax = xMax;

        if (graph.window.xMin === null) {
            position.xMin = graph.dataDomain()[0];
        }

        if (graph.window.xMax === null) {
            position.xMax = graph.dataDomain()[1];
        }

        position.xMin = graph.window.xMin;
        position.xMax = graph.window.xMax;
    },
    zoomTo : function (xMin,xMax) {
        var graph = this.graph,
            position = this.position,
            e = {
                type : 'zoomToCall'
            };
        position.xMin = xMin;
        position.xMax = xMax;
        e.position = position;
        this.onZoom(e);
        graph.update(xMin,xMax);
        this.clearSelection();
        graph.update(xMin,xMax);
    }
});

