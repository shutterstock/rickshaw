Rickshaw.namespace('Rickshaw.Graph.HoverDetail.Multi');

Rickshaw.Graph.HoverDetail.Multi = Rickshaw.Class.create({

	initialize: function(args) {

		var graph = this.graph = args.graph;

		this.option = args.option;

		this.xFormatter = function(x) {
			return new Date( x * 1000 ).toUTCString();
		};

		this.yFormatter = function(y) {
			return y.toFixed(2);
		};

		var element = this.element = document.createElement('div');
		element.className = 'detail';

		this.visible = true;
		graph.element.appendChild(element);

		this.lastEvent = null;
		this._addListeners();

		this.onShow = args.onShow;
		this.onHide = args.onHide;
		this.onRender = args.onRender;

		this.formatter = this.formatter;
	},

	formatter: function(series, x, y, formattedX, formattedY) {
		return series.name + ':&nbsp;' + formattedY;
	},

	update: function(e) {
		var hoverDetail = this;
		var graph = hoverDetail.graph;

		e = e || hoverDetail.lastEvent;
		if (!e) return;
		hoverDetail.lastEvent = e;
		if (e.target.nodeName != 'path' && e.target.nodeName != 'svg') return;
		var eventX = e.offsetX || e.layerX;
		var eventY = e.offsetY || e.layerY;

		var origin = hoverDetail.getStatus();
		var target = hoverDetail.targetIndex(e);
		var dataIndex = target.index;

		var defaultRenderer = graph.defaultRenderer || 'stack';
		var seriesGroup = {};
		var rendererOrder = ['stack', 'area', 'line', 'scatterplot', 'bar'];

		graph.order.forEach(function(order){
			var index = rendererOrder.indexOf(order);
			if (index >= 0) {
				rendererOrder.splice(index, 1);
				rendererOrder.push(order);
			}
		});

		graph.series.forEach(function(series){
			var rendererName = defaultRenderer;
			if (series.disabled) return;
			if (series.hasOwnProperty('renderer')){
				rendererName = series.renderer;
			}
			if (!seriesGroup.hasOwnProperty(rendererName)){
				seriesGroup[rendererName] = 
					{series: [], element: null};
			}
			seriesGroup[rendererName].series.push(series);
		});

		var element = hoverDetail.element;
		var option  = hoverDetail.option;
		element.innerHTML = '';
		rendererOrder.forEach(function(rendererName){
			if(!seriesGroup.hasOwnProperty(rendererName))
				return;
			if(target.renderer !== rendererName)
				return;
			var series   = seriesGroup[rendererName];
			graph.series = series.series;
			graph.series.active = function() { return graph.series.filter( function(s) { return !s.disabled } ); };

			var stackedData = graph.stackData();
			graph.discoverRange();

			hoverDetail.setParam(option[rendererName]);

			if (!stackedData[0][dataIndex]) 
				return;
			var domainX = stackedData[0][dataIndex].x;
			var formattedXValue = hoverDetail.xFormatter(domainX);
			var graphX = graph.x(domainX);
			var order = 0;

			var detail = graph.series.active()
				.map( function(s) { return { order: order++, series: s, name: s.name, value: s.stack[dataIndex] } } );

			var activeItem;

			var sortFn = function(a, b) {
				return (a.value.y0 + a.value.y) - (b.value.y0 + b.value.y);
			};

			var domainMouseY = graph.y.magnitude.invert(graph.element.offsetHeight - eventY);

			detail.sort(sortFn).forEach( function(d) {

				d.formattedYValue = (hoverDetail.yFormatter.constructor == Array) ?
					hoverDetail.yFormatter[detail.indexOf(d)](d.value.y) :
					hoverDetail.yFormatter(d.value.y);

				d.graphX = graphX;
				d.graphY = graph.y(d.value.y0 + d.value.y);
		
				if (domainMouseY > d.value.y0 && domainMouseY < d.value.y0 + d.value.y && !activeItem) {
					activeItem = d;
					d.active = true;
				}

			}, hoverDetail );

			element.style.left = graph.x(domainX) + 'px';

			if (hoverDetail.visible) {
				hoverDetail.render( {
					detail: detail,
					domainX: domainX,
					formattedXValue: formattedXValue,
					mouseX: eventX,
					mouseY: eventY
				} );
			}
		});
		hoverDetail.putStatus(origin);
	},

	targetIndex: function(e){
		var target = {index:0, renderer:'stack'};

		e = e || this.lastEvent;
		if (!e) return;
		this.lastEvent = e;

		if (e.target.nodeName != 'path' && e.target.nodeName != 'svg') return;

		var hoverDetail = this;
		var graph = hoverDetail.graph;

		var eventX = e.offsetX || e.layerX;
		var eventY = e.offsetY || e.layerY;

		var domainX = graph.x.invert(eventX);
		var stackedData = graph.stackedData;

		var topSeriesData = stackedData.slice(-1).shift();

		var domainIndexScale = d3.scale.linear()
			.domain([topSeriesData[0].x, topSeriesData.slice(-1).shift().x])
			.range([0, topSeriesData.length]);

		var approximateIndex = Math.floor(domainIndexScale(domainX));
		var dataIndex = approximateIndex || 0;

		for (var i = approximateIndex; i < stackedData[0].length - 1;) {

			if (!stackedData[0][i] || !stackedData[0][i + 1]) {
				break;
			}

			if (stackedData[0][i].x <= domainX && stackedData[0][i + 1].x > domainX) {
				dataIndex = i;
				break;
			}
			if (stackedData[0][i + 1] < domainX) { i++ } else { i-- }
		}
		target.index = dataIndex;

		if (!stackedData[0][dataIndex]) 
			return target;
		var domainX = stackedData[0][dataIndex].x;
		var formattedXValue = this.xFormatter(domainX);
		var graphX = graph.x(domainX);
		var order = 0;

		var detail = graph.series.active()
			.map( function(s) { return { order: order++, series: s, name: s.name, value: s.stack[dataIndex] } } );

		var activeItem;

		var sortFn = function(a, b) {
			return (a.value.y0 + a.value.y) - (b.value.y0 + b.value.y);
		};

		var domainMouseY = graph.y.magnitude.invert(graph.element.offsetHeight - eventY);

		detail.sort(sortFn).forEach( function(d) {

			d.formattedYValue = (this.yFormatter.constructor == Array) ?
				this.yFormatter[detail.indexOf(d)](d.value.y) :
				this.yFormatter(d.value.y);

			d.graphX = graphX;
			d.graphY = graph.y(d.value.y0 + d.value.y);

			if (domainMouseY > d.value.y0 && domainMouseY < d.value.y0 + d.value.y && !activeItem) {
				activeItem = d;
				d.active = true;
			}

		}, this );
		
		if (activeItem) {
			target.renderer = activeItem.series.renderer;
		}

		return target; 
	},

	hide: function() {
		this.visible = false;
		this.element.classList.add('inactive');

		if (typeof this.onHide == 'function') {
			this.onHide();
		}
	},

	show: function() {
		this.visible = true;
		this.element.classList.remove('inactive');

		if (typeof this.onShow == 'function') {
			this.onShow();
		}
	},

	render: function(args) {
		var element = this.element;

		var detail = args.detail;
		var domainX = args.domainX;

		var mouseX = args.mouseX;
		var mouseY = args.mouseY;

		var formattedXValue = args.formattedXValue;

		var xLabel = document.createElement('div');
		xLabel.className = 'x_label';
		xLabel.innerHTML = formattedXValue;
		element.appendChild(xLabel);

		detail.forEach( function(d) {

			var item = document.createElement('div');
			item.className = 'item';
			item.innerHTML = this.formatter(d.series, domainX, d.value.y, formattedXValue, d.formattedYValue);
			item.style.top = this.graph.y(d.value.y0 + d.value.y) + 'px';

			element.appendChild(item);

			var dot = document.createElement('div');
			dot.className = 'dot';
			dot.style.top = item.style.top;
			dot.style.borderColor = d.series.color;

			element.appendChild(dot);

			if (d.active) {
				item.className = 'item active';
				dot.className = 'dot active';
			}

		}, this );

		this.show();

		if (typeof this.onRender == 'function') {
			this.onRender(args);
		}
	},

	_addListeners: function() {

		this.graph.element.addEventListener(
			'mousemove',
			function(e) {
				this.visible = true;
				this.update(e)
			}.bind(this),
			false
		);

		this.graph.onUpdate( function() { this.update() }.bind(this) );

		this.graph.element.addEventListener(
			'mouseout',
			function(e) {
				if (e.relatedTarget && !(e.relatedTarget.compareDocumentPosition(this.graph.element) & Node.DOCUMENT_POSITION_CONTAINS)) {
					this.hide();
				}
			 }.bind(this),
			false
		);
	},

	getStatus: function() {
	  var graph=this.graph;
		var origin_renderer = graph.renderer;
		var origin_series = graph.series;
		var origin_vis = graph.vis;
		var origin_stackedData = graph.stackedData;
		var origin_x = graph.x;
		var origin_y = graph.y;

		return {
			renderer:    origin_renderer,
			series:      origin_series,
			vis:     origin_vis,
			stackedData: origin_stackedData,
			x: origin_x,
			y: origin_y
		};
	},

	putStatus: function(status) {
	  var graph=this.graph;
		if (status.hasOwnProperty('renderer')) 
			graph.renderer = status['renderer'];
		if (status.hasOwnProperty('series')) 
			graph.series = status['series'];
		if (status.hasOwnProperty('vis')) 
			graph.vis = status['vis'];
		if (status.hasOwnProperty('stackedData')) 
			graph.stackedData = status['stackedData'];
		if (status.hasOwnProperty('x')) 
			graph.x = status['x'];
		if (status.hasOwnProperty('y')) 
			graph.y = status['y'];
	},

	setParam: function (param) {
		if (param) {
			this.onShow = param.onShow;
			this.onHide = param.onHide;
			this.onRender = param.onRender;
			this.xFormatter = param.xFormatter || function(x) {
				return new Date( x * 1000 ).toUTCString();
			};
			this.yFormatter = param.yFormatter || function(y) {
				return y.toFixed(2);
			};
			this.formatter = param.formatter || this.formatter;
		} else {
			this.onShow = this.onHide = this.onRender = null;
			this.xFormatter = function(x) {
				return new Date( x * 1000 ).toUTCString();
			};
			this.yFormatter = function(y) {
				return y.toFixed(2);
			};
			this.formatter = this.formatter;
		}
	}
});

