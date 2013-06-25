Rickshaw.namespace('Rickshaw.Graph.RangeSelector');
Rickshaw.Graph.RangeSelector = Rickshaw.Class.create({
    initialize: function(args) {
        var graph = this.graph = args.graph;
        var position = this.position = {
            xMin : this.graph.dataDomain()[0],
            xMax : this.graph.dataDomain()[1]
        };
        var selectionBox = this.selectionBox = $('<div class="rickshaw_range_selector"></div>');
        var selectionControl = false;
        selectionBox.prependTo($(graph.element));
//        this._addListeners();
        this.build();
        graph.onUpdate(function() { this.update() }.bind(this));
    },
    build: function() {
        console.log('build was called');
        var graph = this.graph;
        var position = this.position;
        var position = this.position;
        var selectionBox = this.selectionBox;
        var parent = graph.element.childNodes[1];
        

        position.xMin = graph.dataDomain()[0];
        position.xMax = graph.dataDomain()[1];

        graph.update();
        console.log('wtf');
//          if we're at an extreme, stick there
        if (graph.dataDomain()[0] == position.xMin) {
            graph.window.xMin = undefined;
        }
        if (graph.dataDomain()[1] == position.xMax) {
            graph.window.xMax = undefined;
        }

        graph.window.xMin = position.xMin;
        graph.window.xMax = position.xMax;
        

    },
    _addListeners: function() {
        var graph = this.graph;
        var position = this.position;
        var selectionBox = this.selectionBox;
        var parent = graph.element.childNodes[1];
        var selectionDraw = function(startPointX) {
            parent.style.pointerEvents = selectionControl == true ?'none':'';
            graph.element.addEventListener('mousemove', function(e) {
                if (selectionControl == true) {
                    var deltaX;
                    position.x = e.offsetX | e.layerX;
                    deltaX = Math.round(Math.max(position.x, startPointX) - Math.min(position.x, startPointX));
                    position.minX = Math.min(position.x, startPointX);
                    position.maxX = position.minX + deltaX;

                    selectionBox.css({
                        'transition': 'none',
                        'opacity': '1',
                        'width': deltaX,
                        'height': '100%',
                        'left': position.minX
                    });
                } else {
                    return false;
                }
                ;
            }, false);

        };

        graph.element.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            if(e.button !== 0) {
                return ;
            }
            var startPointX = e.layerX;
            selectionBox.css({
                'left': e.layerX
            });
            selectionControl = true;
            selectionDraw(startPointX);
        }, true);

        window.addEventListener('mouseup', function(e) {
            selectionControl = false;
            position.xMin = Math.round(graph.x.invert(position.minX));
            position.xMax = Math.round(graph.x.invert(position.maxX));
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
            graph.update();
        }, false);

    },
    update: function() {
        var graph = this.graph;
        var position = this.position;
        console.log(position);
        graph.window.xMin = position.xMin;
        graph.window.xMax = position.xMax;

        if (graph.window.xMin == null) {
            position.xMin = graph.dataDomain()[0];
        }

        if (graph.window.xMax == null) {
            position.xMax = graph.dataDomain()[1];
        }

        position.xMin = graph.window.xMin;
        position.xMax = graph.window.xMax;
        console.log(['update was called and should show:',position]);
    }
});

