Rickshaw.namespace('Rickshaw.Graph.RangeSelector');

Rickshaw.Graph.RangeSelector = Rickshaw.Class.create({
    initialize: function(args) {
// Falta Definir un listener para el evento onUpdate
        var element = this.element = args.element;
        var graph = this.graph = args.graph;
        var position = this.position = {};
        var selectionBox = this.selectionBox = $('<div class="rickshaw_range_selector"></div>');
        var loader = $('<div class="rickshaw_range_selector_loader"></div>');
        selectionBox.insertBefore(graph.element);
        loader.insertBefore(graph.element);
        this.build();
        this._addListeners();
        graph.onUpdate(function() {
            this.update();
        }.bind(this));
    },
    _addListeners: function() {
        var graph = this.graph;
        var position = this.position;
        var selectionBox = this.selectionBox;
        var selectionControl;
        var selectionDraw = function(startPointX) {
            graph.element.addEventListener('mousemove', function(event) {
                if (selectionControl == true) {
                    event.stopPropagation();
                    var deltaX;
                    position.x = event.layerX;
                    deltaX = Math.max(position.x, startPointX) - Math.min(position.x, startPointX);
                    position.minX = Math.min(position.x, startPointX);
                    position.maxX = position.minX + deltaX;

                    selectionBox.css({
                        'transition':'none',
                        'opacity':'1',
                        'width': deltaX,
                        'height': '100%',
                        'left': position.minX,
                        'top': '0'
                    });
                } else {
                    return false;
                }
            }, false);
        };

        graph.element.addEventListener('mousedown', function(event) {
            event.stopPropagation();
            var startPointX = event.layerX;
            selectionBox.css({
                'left': event.layerX, 
                'width': 0});
            selectionControl = true;
            selectionDraw(startPointX);
        }, true);
        window.addEventListener('mouseup', function(event) {
            selectionControl = false;
            position.coordMinX = Math.round(graph.x.invert(position.minX));
            position.coordMaxX = Math.round(graph.x.invert(position.maxX));
            selectionBox.css({
                'transition':'opacity 0.2s ease-out',
                'opacity':'0'
            });
        }, false);
        
    },
    build: function() {
        var graph = this.graph;
        var position = this.position;

        $(function() {
            graph.window.xMin = position.coordMinX;
            graph.window.xMax = position.coordMaxX;

            graph.update();

            // if we're at an extreme, stick there
            if (graph.dataDomain()[0] == position.coordMinX) {
                graph.window.xMin = undefined;
            }
            if (graph.dataDomain()[1] == position.coordMaxX) {
                graph.window.xMax = undefined;
            }
            
        });

    },
    update: function() {
        var graph = this.graph;
        var position = this.position;
        
        graph.window.xMin = position.coordMinX;
        graph.window.xMax = position.coordMaxX;
        
        if (graph.window.xMin == null) {
            position.coordMinX = graph.dataDomain()[0];
        }
        
        if (graph.window.xMax == null) {
            position.coordMaxX = graph.dataDomain()[1];
        }

    }
});

