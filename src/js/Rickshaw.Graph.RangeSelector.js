Rickshaw.namespace('Rickshaw.Graph.RangeSelector');
Rickshaw.Graph.RangeSelector = Rickshaw.Class.create({
    initialize: function (args) {
        var graph = this.graph = args.graph,
            onZoom = this.onZoom = args.onZoom,
            start = this.start = args.start,
            end = this.end = args.end,
            position = this.position = {},
            selectionBox = this.selectionBox = document.createElement('div'),
            selectionControl = this.selectionControl = false,
            parent = this.parent = graph.element.getElementsByTagName('svg')[0],
            tDomain = this.tDomain = [];

        for (var i=0; i < graph.stackedData.length; i+=1) {
            for (var j=0; j < graph.stackedData[i].length; j+=1) {
                tDomain.push(graph.stackedData[i][j].x);
            }
        }

        this.build(start, end);
    },
    build: function (start, end) {
        var self = this,
            graph = this.graph,
            position = this.position,
            selectionBox = this.selectionBox ,
            selectionControl = this.selectionControl,
            parent = this.parent,
            tDomain = this.tDomain;

        selectionBox.setAttribute('class', 'rickshaw_range_selector');
        graph.element.appendChild(selectionBox);

        if (start !== undefined && start !== '') {
            position.xMin = start;
        } else {
            position.xMin = graph.dataDomain()[0];
        }

        if (end !== undefined && end !== '') {
            position.xMax = end;
        } else {
            position.xMax = graph.dataDomain()[1];
        }

        parent.oncontextmenu = function (e) {
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
                graph.update(position.xMin,position.xMax);
                self.clearSelection();
                graph.update(position.xMin,position.xMax);
            } else {
                return;
            }
        };
        finishDrawing = function (e) {
            if (!selectionControl | position.deltaX < 10) {
                selectionControl = false;
                self.clearSelection();
                return false;
            }
            selectionControl = false;
            var start = graph.x.invert(position.minX),
                end = graph.x.invert(position.maxX);
            // todo - this is working when the difference between the start and end timestamps is 1 millisecond at least
            console.log(start + ',' + end);

            position.xMin = start;
            position.xMax = end;
            e.position = position;
            self.onZoom(e);
            graph.update(position.xMin, position.xMax);
            self.clearSelection();
            graph.update(position.xMin, position.xMax);

        };

        graph.element.addEventListener('mousedown', function (e) {
            startDrawing(e);
        }, true);

        graph.element.addEventListener('mouseup', function (e) {
            finishDrawing(e);
        }, false);

        graph.element.addEventListener('mouseleave', function (e) {
            // todo - change this, maybe clear selection on mouseleave or something else.
            self.clearSelection();
            finishDrawing(e);
        }, false);

        graph.window.xMin = position.xMin;
        graph.window.xMax = position.xMax;

        graph.onUpdate(function () {
            this.update(position.xMin, position.xMax);
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
    update: function (start, end) {
        var graph = this.graph,
            position = this.position,
            tDomain = this.tDomain;

        var getNearest = function (timestamp) {
            var nearest = null;
            var bestDistanceFound = Number.MAX_VALUE;
            for ( var i=0; i < tDomain.length; i+=1) {
                if (tDomain[i] === timestamp){
                    return tDomain[i];
                } else {
                    var d = Math.abs(timestamp - tDomain[i]);
                    if (d < bestDistanceFound) {
                        bestDistanceFound = d;
                        nearest = tDomain[i];
                    }
                }
            }
            console.log(nearest);
            return nearest;
        }

        var starting = getNearest(start);
        var ending = getNearest(end);

        if (starting === ending) {
            return;
        } else {
            graph.window.xMin = starting;
            graph.window.xMax = ending;

            if (graph.window.xMin === null) {
                position.xMin = graph.dataDomain()[0];
            }

            if (graph.window.xMax === null) {
                position.xMax = graph.dataDomain()[1];
            }

            position.xMin = graph.window.xMin;
            position.xMax = graph.window.xMax;
        }
    },
    zoomTo: function (start, end) {
        var graph = this.graph,
            position = this.position,
            e = {
                type: 'zoomToCall'
            };
        position.xMin = start;
        position.xMax = end;
        e.position = position;
        this.onZoom(e);
        graph.update(start, end);
        this.clearSelection();
        graph.update(start, end);
    }
});

