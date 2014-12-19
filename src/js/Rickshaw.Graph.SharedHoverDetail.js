Rickshaw.namespace('Rickshaw.Graph.SharedHoverDetail');

Rickshaw.Graph.SharedHoverDetail = Rickshaw.Class.create({

    initialize: function (args) {

        this.graphs = args.graphs;
        this.labelRender = args.labelRender;
        this.mouseMove = args.mouseMove;

        var self = this;

        _.each(this.graphs, function (graph) {

            var mouseMove = function (e) {
                this.lastGraph = graph;
                this.mousePositionX = e.offsetX;
                this.mousePositionY = e.offsetY;

                var x = this.getXValue(self.lastGraph, this.mousePositionX, this.mousePositionY);

                this.update(x);

                self.mouseMove(e.pageX, e.pageY);

            }.bind(self);

            var mouseOut = function (e) {
                var elem = graph.element;
                if(e.pageX >= $(elem).position().left && e.pageX <= ($(elem).position().left + $(elem).width()) && e.pageY >= $(elem).position().top && e.pageY <= $(elem).position().top + $(elem).height()){
                    mouseMove(e);
                    return;
                }

                this.mousePositionX = undefined;
                this.mousePositionY = undefined;

                if (e.relatedTarget && !(e.relatedTarget.compareDocumentPosition(graph.element) & Node.DOCUMENT_POSITION_CONTAINS)) {
                    this.hide();
                }
            }.bind(self);

            graph.element.addEventListener(
                'mousemove', mouseMove, false
            );

            graph.element.addEventListener(
                'mouseout',
                mouseOut,
                false
            );

            graph.onUpdate(function () {
                if (self.lastGraph !== graph) {
                    return;
                }

                var x = self.getXValue(self.lastGraph, self.mousePositionX, self.mousePositionY);
                self.update(x);
            });

            var line = document.createElement('div');
            line.className = 'detail hoverLine';
            graph.element.appendChild(line);

            $(line).hide();

        });
    },

    update: function (domainX) {
        this.render(domainX);
    },

    render: function (domainX) {
        if (domainX === this.lastDomainX) {
            return;
        }

        this.lastDomainX = domainX;

        if (!domainX || domainX <= 0) {
            this.hide();
            return;
        }

        _.each(this.graphs, function (graph) {
            var line = $(graph.element).find('.hoverLine');
            graph.discoverRange();
            var left = graph.x(domainX) + 'px';
            line.css({left: left}).show();
        });

        this.labelRender(domainX);
    },

    hide: function () {
        this.labelRender();
        _.each(this.graphs, function (graph) {
            $(graph.element).find('.hoverLine').hide();
        });
    },

    getXValue: function (graph, eventX, eventY) {
        var j = 0;
        var nearestPoint;

        graph.series.active().forEach(function (series) {

            var data = graph.stackedData[j++];

            if (!data.length)
                return;

            var domainX = graph.x.invert(eventX);

            var domainIndexScale = d3.scale.linear()
                .domain([data[0].x, data.slice(-1)[0].x])
                .range([0, data.length - 1]);

            var approximateIndex = Math.round(domainIndexScale(domainX));
            if (approximateIndex == data.length - 1) approximateIndex--;

            var dataIndex = Math.min(approximateIndex || 0, data.length - 1);

            for (var i = approximateIndex; i < data.length - 1;) {

                if (!data[i] || !data[i + 1]) break;

                if (data[i].x <= domainX && data[i + 1].x > domainX) {
                    dataIndex = Math.abs(domainX - data[i].x) < Math.abs(domainX - data[i + 1].x) ? i : i + 1;
                    break;
                }

                if (data[i + 1].x <= domainX) {
                    i++;
                } else {
                    i--;
                }
            }

            if (dataIndex < 0) dataIndex = 0;
            var value = data[dataIndex];

            var distance = Math.sqrt(
                Math.pow(Math.abs(graph.x(value.x) - eventX), 2) +
                Math.pow(Math.abs(graph.y(value.y + value.y0) - eventY), 2)
            );

            var point = {
                value: value,
                distance: distance
            };

            if (!nearestPoint || distance < nearestPoint.distance) {
                nearestPoint = point;
            }
        });

        if (!nearestPoint) return;
        return nearestPoint.value.x;
    }

});