Rickshaw.namespace('Rickshaw.Graph.RangeSelector');
Rickshaw.Graph.RangeSelector = Rickshaw.Class.create({
    initialize: function(args) {
        var graph = this.graph = args.graph;
        this.build();
        graph.onUpdate(function() {
            this.update();
        }.bind(this));
    },
    build: function() {
        var graph = this.graph,
            position = this.position = {},
            selectionBox = this.selectionBox = $('<div class="rickshaw_range_selector"></div>'),
            selectionControl = this.selectionControl = false,
            parent = $('svg', graph.element);
        selectionBox.prependTo($(graph.element));
       
        var clearSelection = function() {
                selectionBox.css({
                    'transition': 'opacity 0.2s ease-out',
                    'opacity': '0'
                });
                setTimeout(function() {
                    selectionBox.css({
                        'width': 0,
                        'height': 0,
                        'top': 0,
                        'left': 0
                    });
                }, 200);
                parent.css({
                   'pointer-events' : 'auto' 
                });
            },
            selectionDraw = function(startPointX) {
                if (selectionControl === true) {
                    parent.css({
                        'pointer-events' : 'none'
                    }); 
                }
                graph.element.addEventListener('mousemove', function(e) {
                    if (selectionControl === true) {
                        position.x = e.offsetX | e.layerX;
                        position.deltaX = Math.round(Math.max(position.x, startPointX) - Math.min(position.x, startPointX));
                        position.minX = Math.min(position.x, startPointX);
                        position.maxX = position.minX + position.deltaX;

                        selectionBox.css({
                            'transition': 'none',
                            'opacity': '1',
                            'width': position.deltaX,
                            'height': '100%',
                            'left': position.minX
                        });
                    } else {
                        return false;
                    }
                }, false);
            };

        graph.element.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            if (e.button !== 0) {
                return;
            }
            var startPointX = e.layerX;
            selectionBox.css({
                'left': e.layerX
            });
            selectionControl = true;
            selectionDraw(startPointX);
        }, true);

        window.addEventListener('mouseup', function() {
            if (!selectionControl | position.deltaX < 20 | position.xMax - position.xMin < 200) {
                selectionControl = false;
                clearSelection();
                return false;
            }
            selectionControl = false;
            $(function() {
                position.xMin = Math.round(graph.x.invert(position.minX));
                position.xMax = Math.round(graph.x.invert(position.maxX));
                graph.update();
            });
            clearSelection();
            graph.update();
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
    },
    update: function() {
        var graph = this.graph,
            position = this.position;
        graph.window.xMin = position.xMin;
        graph.window.xMax = position.xMax;

        if (graph.window.xMin === null) {
            position.xMin = graph.dataDomain()[0];
        }

        if (graph.window.xMax === null) {
            position.xMax = graph.dataDomain()[1];
        }

        position.xMin = graph.window.xMin;
        position.xMax = graph.window.xMax;
    }
});

