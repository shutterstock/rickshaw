var RenderControls = function(args) {

	var $ = jQuery;

	this.initialize = function() {

		this.element = args.element;
		this.graph = args.graph;
		this.settings = this.serialize();

		this.inputs = {
			renderer: this.element.elements.renderer,
			interpolation: this.element.elements.interpolation,
			offset: this.element.elements.offset
		};

		this.element.addEventListener('change', function(e) {

			this.settings = this.serialize();

			if (e.target.name == 'renderer') {
				this.setDefaultOffset(e.target.value);
			}

			this.syncOptions();
			this.settings = this.serialize();

			var config = {
				renderer: this.settings.renderer,
				interpolation: this.settings.interpolation
			};

			if (this.settings.offset == 'value') {
				config.unstack = true;
				config.offset = 'zero';
			} else if (this.settings.offset == 'expand') {
				config.unstack = false;
				config.offset = this.settings.offset;
			} else {
				config.unstack = false;
				config.offset = this.settings.offset;
			}

			this.graph.configure(config);
			this.graph.render();

		}.bind(this), false);
	}

	this.serialize = function() {

		var values = {};
		var pairs = $(this.element).serializeArray();

		pairs.forEach( function(pair) {
			values[pair.name] = pair.value;
		} );

		return values;
	};

	this.syncOptions = function() {

		var options = this.rendererOptions[this.settings.renderer];

		Array.prototype.forEach.call(this.inputs.interpolation, function(input) {

			if (options.interpolation) {
				input.disabled = false;
				input.parentNode.classList.remove('disabled');
			} else {
				input.disabled = true;
				input.parentNode.classList.add('disabled');
			}
		});

		Array.prototype.forEach.call(this.inputs.offset, function(input) {

			if (options.offset.filter( function(o) { return o == input.value } ).length) {
				input.disabled = false;
				input.parentNode.classList.remove('disabled');

			} else {
				input.disabled = true;
				input.parentNode.classList.add('disabled');
			}

		}.bind(this));

	};

	this.setDefaultOffset = function(renderer) {

		var options = this.rendererOptions[renderer];

		if (options.defaults && options.defaults.offset) {

			Array.prototype.forEach.call(this.inputs.offset, function(input) {
				if (input.value == options.defaults.offset) {
					input.checked = true;
				} else {
					input.checked = false;
				}

			}.bind(this));
		}
	};

	this.rendererOptions = {

		area: {
			interpolation: true,
			offset: ['zero', 'wiggle', 'expand', 'value'],
			defaults: { offset: 'zero' }
		},
		line: {
			interpolation: true,
			offset: ['expand', 'value'],
			defaults: { offset: 'value' }
		},
		bar: {
			interpolation: false,
			offset: ['zero', 'wiggle', 'expand', 'value'],
			defaults: { offset: 'zero' }
		},
		scatterplot: {
			interpolation: false,
			offset: ['value'],
			defaults: { offset: 'value' }
		}
	};

	this.initialize();
};

