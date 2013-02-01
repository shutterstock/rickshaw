Rickshaw.namespace('Rickshaw.Graph.Axis.Y.Selector');

Rickshaw.Graph.Axis.Y.Selector = function(args) {

    var self = this;
    var berthRate = 0.10;

    this.initialise = function()
    {
        if(!args.graph)
        {
            throw {
                name: "No graph exception",
                message: "You must associate this component with a graph."
            };
        }

        if(!args.element)
        {
            throw {
                name: "No element exception",
                message: "You must specify an element (ideally a div) that will contain component."
            };
        }

        //Set defaults for any arguments not specified
        this.graph = args.graph;
        this.labelHeight = args.labelHeight || 25;
        this.unit = args.unit || "";
        this.color = args.color || "black";
        this.textColor = args.textColor || "white";
        this.lineOpacity = args.lineOpacity || 0.9;
        this.lineDashArray = args.lineDashArray || ('1,0');
		this.labelDecimalPlaces = (typeof args.labelDecimalPlaces != 'undefined' ? args.labelDecimalPlaces : 2);

        this.lineY = 0;
        this.labelY = -1 * (this.labelHeight / 2);
        this.labelTextYOffset = args.labelTextYOffset || 6;

        this.onDragComplete = args.onDragComplete || emptyFunction;
        this.onDragStart = args.onDragStart || emptyFunction;

        if(args.element)
        {
            this.element = args.element;
            this.vis = d3.select(args.element)
                .append("svg:svg")
                .attr("class", "rickshaw_graph y_axis_selector_container");

            this.element = this.vis[0][0];
        }

        this.graph.onUpdate(function () {
            self.render();
        });
    };

    this.setSize = function(args) {

        args = args || {};

        if (!this.element) return;

        if (typeof window !== 'undefined') {

            var style = window.getComputedStyle(this.element.parentNode, null);
            var elementWidth = parseInt(style.getPropertyValue('width'));

            if (!args.auto) {
                var elementHeight = parseInt(style.getPropertyValue('height'));
            }
        }

        this.width = args.width || elementWidth || this.graph.width * berthRate;
        this.height = (elementHeight || this.graph.height) + (this.labelHeight / 2);

        this.vis
            .attr('width', this.width)
            .attr('height', this.height * (1 + berthRate));

        this.berth = this.height * berthRate;
        this.element.style.top = -1 * this.berth + 'px';
    };

    this.render = function(){

        if (self.graph.height !== self._renderHeight)
        {
            self.setSize({ auto: true });
        }

        if(self.element)
        {
            self.vis.selectAll("*").remove();
        }

        this.labelValue = self.graph.y.invert(self.lineY);

        var line = buildSelectorLine();

        var label = buildSelectorLabel();

        var text = buildSelectorLabelText()

        buildAndAttachSelectionDrag(label, line, text);

        self._renderHeight = self.graph.height;
    };

    function buildSelectorLine() {
        return self.graph.vis
            .append("svg:line")
            .attr("x1", 0)
            .attr("y1", self.lineY)
            .attr("x2", self.graph.width)
            .attr("y2", self.lineY)
            .attr("class", "y_selector")
            .attr("opacity", self.lineOpacity)
            .style("stroke", self.color)
            .style("stroke-width", "1")
            .style("stroke-dasharray", self.lineDashArray);
    }

    function buildSelectorLabel() {
        return self.vis
            .append("svg:rect")
            .attr("x", 0)
            .attr("y", self.labelY)
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("width", self.width)
            .attr("height", "25")
            .attr("transform", "translate(0," + self.berth + ")")
            .attr("class", "y-selector-label")
            .attr("fill", self.color)
            .style("cursor", "move");
    }

    function buildSelectorLabelText() {
        return self.vis
            .append("text")
            .text(buildLabel(round(self.labelValue, self.labelDecimalPlaces), self.unit))
            .attr("x", 5)
            .attr("y", self.lineY + self.labelTextYOffset)
            .attr("transform", "translate(0," + self.berth + ")")
            .attr("fill", self.textColor)
            .style("cursor", "move");
    }

    function buildAndAttachSelectionDrag(label, line, text)
    {
        var drag = d3.behavior.drag()
            .on("dragstart", function ()
            {
                var currentValue = self.graph.y.invert(self.lineY);
                self.onDragStart(currentValue);
            })
            .on("drag", function (d, i)
            {
                var delta = d3.event.dy;
                var newLineY = self.lineY + delta;

                if (newLineY >= 0 && newLineY <= self.graph.height)
                {
                    self.labelY += delta;

                    label.attr("y", self.labelY);

                    self.lineY += delta;
                    line.attr("y1", self.lineY);
                    line.attr("y2", self.lineY);

                    text.attr("y", self.lineY + self.labelTextYOffset);
                    self.labelValue = self.graph.y.invert(newLineY);

                    var selectorValue = round(self.labelValue, self.labelDecimalPlaces);
                    text.text(buildLabel(selectorValue, self.unit));
                }
            })
            .on("dragend", function ()
            {
                var newValue = self.graph.y.invert(self.lineY);
                self.onDragComplete(newValue);
            });

        label.call(drag);
        text.call(drag);
    }

    function buildLabel(value, unit)
    {
        return value + unit;
    }

    function round(value, decimalPlaces)
    {
        var number = Math.pow(10, decimalPlaces);
        return Math.round(value * number) / number;
    }

    function emptyFunction() {}

    this.initialise();
};