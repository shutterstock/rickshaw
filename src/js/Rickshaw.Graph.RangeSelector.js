Rickshaw.namespace('Rickshaw.Graph.RangeSelector');
Rickshaw.Graph.RangeSelector = Rickshaw.Class.create({
    initialize: function(args) {
        var graph = this.graph = args.graph,
            onZoom = this.onZoom = args.onZoom,
            xMin = this.xMin = args.xMin,
            xMax = this.xMax = args.xMax;
        this.build(xMin,xMax);
    },
    build: function(xMin,xMax) {
        var self = this,
            graph = this.graph,
            position = this.position = {},
            selectionBox = this.selectionBox = document.createElement('div'),
            selectionControl = this.selectionControl = false,
            i = 0,
            parent = graph.element.getElementsByTagName('svg')[0];
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


        var clearSelection = function() {
                selectionBox.style.transition = 'opacity 0.2s ease-out';
                selectionBox.style.opacity = 0;
                setTimeout(function() {
                    selectionBox.style.width = 0;
                    selectionBox.style.height = 0;
                    selectionBox.style.top = 0;
                    selectionBox.style.left = 0;
                }, 200);
                parent.style.pointerEvents = 'auto'; 
                graph.element.style.cursor = 'auto';
            },
            selectionDraw = function(startPointX) {
                if (selectionControl === true) {
                    parent.style.pointerEvents = 'none';
                }
                graph.element.style.cursor = 'crosshair';
                graph.element.addEventListener('mousemove', function(e) {
                    if (selectionControl === true) {
                        position.x = e.offsetX | e.layerX;
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
            },
            startDrawing = function(e) {
                e.stopPropagation();
                e.preventDefault();
                if (e.button === 0 | e.button === 1) {
                    var startPointX = e.layerX;
                    selectionBox.style.left = e.layerX;
                    selectionControl = true;
                    selectionDraw(startPointX);
                }else if(e.button === 2 | e.button === 3){
                    e.preventDefault();
                    position.xMin = graph.dataDomain()[0];
                    position.xMax = graph.dataDomain()[1];
                    e.position = position;
                    self.onZoom(e);
                    graph.update();
                    clearSelection();
                    graph.update();
                }else{
                    return;
                }
            },
            finishDrawing = function (e) {

                if (!selectionControl | position.deltaX < 40 | position.xMax - position.xMin < 1000) {
                    selectionControl = false;
                    clearSelection();
                    return false;
                }
                selectionControl = false;
                position.xMin = Math.round(graph.x.invert(position.minX));
                position.xMax = Math.round(graph.x.invert(position.maxX));
                e.position = position;
                self.onZoom(e);
                graph.update(position.xMin,position.xMax);
                clearSelection();
                graph.update(position.xMin,position.xMax);
            };

        graph.element.addEventListener('mousedown', function(e) {
           startDrawing(e);
        }, true);

        graph.element.addEventListener('mouseup', function(e) {
            finishDrawing(e);
        }, false);

        graph.element.addEventListener('mouseleave', function(e) {
            finishDrawing(e);
        }, false);

//          if we're at an extreme, stick there
        if (graph.dataDomain()[0] === position.xMin) {
            graph.window.xMin = undefined;
        }
        if (graph.dataDomain()[1] === position.xMax) {
            graph.window.xMax = undefined;
        }

        graph.window.xMin = position.xMin;
        graph.window.xMax = position.xMax;

        graph.onUpdate(function() {
            this.update(position.xMin,position.xMax);
        }.bind(this));
    },
    update: function(xMin,xMax) {
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

        return position;
    }
});

